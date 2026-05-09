import { Router } from 'express'
import mongoose from 'mongoose'
import { db } from '../db.js'
import { otpService } from '../services/otpService.js'

const router = Router()

// Helper: lookup voter from electoral roll by phone
async function lookupVoterByPhone(phone) {
  try {
    const voterDb = mongoose.connection.client.db('voter_db')
    const col = voterDb.collection('ass_25')
    const voter = await col.findOne({ MOBILE_NUMBER: phone })
    return voter
  } catch {
    return null
  }
}

// ─── STEP 1: Check phone & send OTP ───
// Returns { isNew, voterInfo } so frontend can display EPIC info
router.post('/check-phone', async (req, res) => {
  try {
    const phone = (req.body.phone || '').replace(/[^0-9]/g, '')
    if (phone.length < 10) {
      return res.status(400).json({ success: false, error: 'Enter a valid 10-digit mobile number' })
    }

    const user = await db.getUser(phone)
    const isNew = !user

    // Lookup in electoral roll
    const voter = await lookupVoterByPhone(phone)

    // Generate & send OTP via 2factor.in
    const otpResponse = await otpService.sendOTP(phone)
    if (!otpResponse.success) {
      return res.status(500).json({ success: false, error: 'Failed to send OTP via SMS Gateway' })
    }

    res.json({
      success: true,
      isNew,
      userName: user ? user.name : null,
      voterInfo: voter ? {
        name: voter.VOTER_NAME,
        epic: voter.EPIC_NO,
        gender: voter.GENDER,
        houseNo: voter.HOUSE_NO,
        assemblyName: voter.ASSEMBLY_NAME
      } : null
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── LOGIN VIA EPIC NO ───
// Allows registered users to login directly using only their EPIC number
router.post('/login-epic', async (req, res) => {
  try {
    const { epic } = req.body
    if (!epic || epic.trim() === '') {
      return res.status(400).json({ success: false, error: 'Enter a valid EPIC number' })
    }

    const user = await db.getUser(epic.trim().toUpperCase())
    if (!user) {
      return res.status(404).json({ success: false, error: 'EPIC number not registered. Please register first.' })
    }

    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})
router.post('/verify-otp', async (req, res) => {
  try {
    const phone = (req.body.phone || '').replace(/[^0-9]/g, '')
    const otp = req.body.otp
    const valid = await otpService.verifyOTP(phone, otp)

    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP' })
    }

    const user = await db.getUser(phone)

    if (user) {
      // Returning user — login directly
      return res.json({ success: true, isNew: false, user })
    }

    // New user — OTP verified but need name
    res.json({ success: true, isNew: true, phone })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── STEP 3: Complete registration (new users only) ───
router.post('/complete-register', async (req, res) => {
  try {
    const { phone, name, epic } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' })
    }
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '')

    const user = await db.createUser({
      name: name.trim(),
      phone: cleanPhone,
      epic: epic ? epic.trim().toUpperCase() : null,
      area: 'Mylapore',
      type: 'new'
    })

    res.json({
      success: true,
      user,
      memberNumber: user.memberNumber || db.getMemberCount()
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── Legacy endpoints (backwards compat) ───
router.post('/verify-epic', async (req, res) => {
  const { epic } = req.body
  if (!epic || epic.length < 6) return res.status(400).json({ success: false, error: 'Invalid EPIC' })
  res.json({ success: true, message: 'EPIC accepted' })
})

router.post('/send-otp', async (req, res) => {
  const phone = (req.body.phone || '').replace(/[^0-9]/g, '')
  if (phone.length < 10) return res.status(400).json({ success: false, error: 'Invalid phone' })
  const otpResponse = await otpService.sendOTP(phone)
  if (!otpResponse.success) {
    return res.status(500).json({ success: false, error: 'Failed to send OTP' })
  }
  res.json({ success: true, message: 'OTP Sent successfully' })
})

router.post('/register', async (req, res) => {
  const { name, phone } = req.body
  if (!name || !phone) return res.status(400).json({ success: false, error: 'Name & phone required' })
  const user = await db.createUser({ name, phone: phone.replace(/[^0-9]/g, ''), epic: req.body.epic || null, area: req.body.area || 'Mylapore', type: 'new' })
  res.json({ success: true, user, memberNumber: user.memberNumber || db.getMemberCount() })
})

export default router
