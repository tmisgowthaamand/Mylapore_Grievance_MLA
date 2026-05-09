import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { db } from '../db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `grievance-${Date.now()}${ext}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB max

const router = Router()

// Create new grievance (with optional image)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { userId, userName, userPhone, category, subCategory, location, lat, lng, message } = req.body
    
    if (!category || !subCategory || !message) {
      return res.status(400).json({ success: false, error: 'Category, sub-category, and message are required' })
    }

    const grievance = await db.createGrievance({
      userId: userId || 'anonymous',
      userName: userName || 'Mylapore Resident',
      userPhone: userPhone || '',
      category,
      subCategory,
      location: location || 'Mylapore, Chennai',
      lat: lat ? parseFloat(lat) : 13.0339,
      lng: lng ? parseFloat(lng) : 80.2619,
      message,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    })

    res.json({ 
      success: true, 
      grievanceId: grievance.id,
      grievance
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Get grievances by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const grievances = await db.getGrievancesByUser(userId)
    res.json({ success: true, grievances })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Track grievance by ID
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params
    const grievance = await db.getGrievance(id)
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found' })
    }
    res.json({ success: true, grievance })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Search grievances by phone number
router.get('/by-phone/:phone', async (req, res) => {
  try {
    const phone = (req.params.phone || '').replace(/[^0-9]/g, '')
    if (phone.length < 10) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' })
    }
    const grievances = await db.getGrievancesByUser(phone)
    res.json({ success: true, grievances })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
