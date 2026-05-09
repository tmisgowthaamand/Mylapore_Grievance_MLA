import { Router } from 'express'
import { db } from '../db.js'

const router = Router()

// Get all grievances (admin view)
router.get('/grievances', async (req, res) => {
  try {
    const grievances = await db.getAllGrievances()
    res.json({ success: true, grievances })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Respond to a grievance
router.post('/grievances/:id/respond', async (req, res) => {
  try {
    const { id } = req.params
    const { response } = req.body

    if (!response?.trim()) {
      return res.status(400).json({ success: false, error: 'Response text is required' })
    }

    const updated = await db.updateGrievance(id, {
      status: 'Responded',
      response: response.trim(),
      respondedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    })

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Grievance not found' })
    }

    res.json({ success: true, grievance: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Mark grievance as resolved
router.post('/grievances/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params
    const updated = await db.updateGrievance(id, {
      status: 'Resolved',
      resolvedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    })

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Grievance not found' })
    }

    res.json({ success: true, grievance: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
