import { Router } from 'express'
import { db } from '../db.js'

const router = Router()

// Get public statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getStats()
    res.json({ success: true, stats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
