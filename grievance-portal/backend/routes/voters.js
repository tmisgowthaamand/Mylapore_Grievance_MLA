import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

// Get the voter_db.ass_25 collection directly
function getVoterCollection() {
  const voterDb = mongoose.connection.client.db('voter_db')
  return voterDb.collection('ass_25')
}

// Search voters by name, EPIC, or house number
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'name', page = 1, limit = 20 } = req.query
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Search query must be at least 2 characters' })
    }

    const col = getVoterCollection()
    const skip = (parseInt(page) - 1) * parseInt(limit)
    let filter = {}

    if (type === 'epic') {
      filter = { EPIC_NO: q.trim().toUpperCase() }
    } else if (type === 'name') {
      filter = { VOTER_NAME: { $regex: q.trim(), $options: 'i' } }
    } else if (type === 'house') {
      filter = { HOUSE_NO: q.trim() }
    }

    const [voters, total] = await Promise.all([
      col.find(filter).skip(skip).limit(parseInt(limit)).toArray(),
      col.countDocuments(filter)
    ])

    res.json({
      success: true,
      voters,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Get voter by EPIC number (exact match)
router.get('/epic/:epic', async (req, res) => {
  try {
    const col = getVoterCollection()
    const voter = await col.findOne({ EPIC_NO: req.params.epic.toUpperCase() })
    if (!voter) {
      return res.status(404).json({ success: false, error: 'Voter not found' })
    }
    res.json({ success: true, voter })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Get total voter count
router.get('/stats', async (req, res) => {
  try {
    const col = getVoterCollection()
    const [total, male, female] = await Promise.all([
      col.countDocuments(),
      col.countDocuments({ GENDER: 'Male' }),
      col.countDocuments({ GENDER: 'Female' })
    ])
    res.json({ success: true, total, male, female })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
