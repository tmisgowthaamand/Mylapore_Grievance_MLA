import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import UserModel from './models/User.js'
import GrievanceModel from './models/Grievance.js'
import OTPModel from './models/OTP.js'

// In-memory database for demo mode
const memDB = {
  users: [],
  grievances: [],
  otps: {},
  memberCount: 1247
}

let useDemo = false

export async function initDB() {
  // If MongoDB URI is set and demo mode is off, connect to MongoDB
  if (process.env.MONGODB_URI && process.env.USE_DEMO_MODE !== 'true') {
    try {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('   🍃 Connected to MongoDB Atlas')
      useDemo = false

      // Seed demo data if DB is empty
      const count = await GrievanceModel.countDocuments()
      if (count === 0) {
        console.log('   📦 Seeding demo grievances into MongoDB...')
        await GrievanceModel.insertMany([
          {
            id: 'MYL-2026-00840',
            userId: 'TNA4521890',
            userName: 'Venkat R.',
            userPhone: '9876543210',
            category: 'Infrastructure & Civic Works',
            subCategory: 'Pothole / Road Damage',
            location: 'Near Luz Corner, Mylapore',
            lat: 13.0339,
            lng: 80.2619,
            message: 'Large pothole near Luz junction causing accidents during rainy season',
            submittedAt: '06 May 2026',
            status: 'Responded',
            response: 'Issue forwarded to CMDA. Road repair scheduled for 15 May.',
            respondedAt: '07 May 2026'
          },
          {
            id: 'MYL-2026-00841',
            userId: '9876543210',
            userName: 'Ramesh Kumar',
            userPhone: '9876543210',
            category: 'Infrastructure & Civic Works',
            subCategory: 'No Street Lighting',
            location: 'R.A. Puram 2nd Street',
            lat: 13.0285,
            lng: 80.2590,
            message: 'Street lights not working for past 2 weeks, very dark at night',
            submittedAt: '07 May 2026',
            status: 'Open'
          },
          {
            id: 'MYL-2026-00842',
            userId: '8765432109',
            userName: 'Priya S.',
            userPhone: '8765432109',
            category: 'Infrastructure & Civic Works',
            subCategory: 'Drain Overflow / Sewage on Road',
            location: 'Abhiramapuram 3rd Cross Street',
            lat: 13.0312,
            lng: 80.2575,
            message: 'Drain overflowing since last week, causing bad smell and mosquito breeding',
            submittedAt: '08 May 2026',
            status: 'Open'
          }
        ])
        console.log('   ✅ 3 demo grievances seeded')
      }
      return
    } catch (err) {
      console.error('   ❌ MongoDB connection failed, falling back to demo mode:', err.message)
    }
  }

  // Fallback: in-memory demo mode
  useDemo = true
  console.log('   📦 Using in-memory database (demo mode)')
  memDB.grievances = [
    {
      id: 'MYL-2026-00840', userId: 'TNA4521890', userName: 'Venkat R.', userPhone: '9876543210',
      category: 'Infrastructure & Civic Works', subCategory: 'Pothole / Road Damage',
      location: 'Near Luz Corner, Mylapore', lat: 13.0339, lng: 80.2619,
      message: 'Large pothole near Luz junction causing accidents during rainy season',
      submittedAt: '06 May 2026', status: 'Responded',
      response: 'Issue forwarded to CMDA. Road repair scheduled for 15 May.', respondedAt: '07 May 2026'
    },
    {
      id: 'MYL-2026-00841', userId: '9876543210', userName: 'Ramesh Kumar', userPhone: '9876543210',
      category: 'Infrastructure & Civic Works', subCategory: 'No Street Lighting',
      location: 'R.A. Puram 2nd Street', lat: 13.0285, lng: 80.2590,
      message: 'Street lights not working for past 2 weeks, very dark at night',
      submittedAt: '07 May 2026', status: 'Open'
    },
    {
      id: 'MYL-2026-00842', userId: '8765432109', userName: 'Priya S.', userPhone: '8765432109',
      category: 'Infrastructure & Civic Works', subCategory: 'Drain Overflow / Sewage on Road',
      location: 'Abhiramapuram 3rd Cross Street', lat: 13.0312, lng: 80.2575,
      message: 'Drain overflowing since last week, causing bad smell and mosquito breeding',
      submittedAt: '08 May 2026', status: 'Open'
    }
  ]
}

// Database operations
export const db = {
  // ─── Users ───
  async createUser(userData) {
    if (useDemo) {
      memDB.users.push(userData)
      memDB.memberCount++
      return { ...userData, memberNumber: memDB.memberCount }
    }
    const user = await UserModel.findOneAndUpdate(
      { phone: userData.phone },
      { ...userData },
      { upsert: true, new: true }
    )
    const count = await UserModel.countDocuments()
    return { ...user.toObject(), memberNumber: 1247 + count }
  },

  async getUser(id) {
    if (useDemo) {
      return memDB.users.find(u => u.phone === id || u.epic === id) || null
    }
    const user = await UserModel.findOne({ $or: [{ phone: id }, { epic: id }] })
    return user ? user.toObject() : null
  },

  async findUserByPhone(phone) {
    if (useDemo) {
      return memDB.users.find(u => u.phone === phone) || null
    }
    const user = await UserModel.findOne({ phone })
    return user ? user.toObject() : null
  },

  async deleteUser(phone) {
    if (useDemo) {
      const idx = memDB.users.findIndex(u => u.phone === phone)
      if (idx !== -1) memDB.users.splice(idx, 1)
      return true
    }
    await UserModel.deleteOne({ phone })
    return true
  },

  // ─── OTP ───
  async saveOTP(phone, otp) {
    if (useDemo) {
      memDB.otps[phone] = { otp, expires: Date.now() + 300000 }
      return
    }
    await OTPModel.findOneAndUpdate(
      { phone },
      { otp, expires: Date.now() + 300000 },
      { upsert: true, new: true }
    )
  },

  async verifyOTP(phone, otp) {
    if (useDemo) {
      const stored = memDB.otps[phone]
      if (!stored) return false
      if (stored.expires < Date.now()) return false
      return stored.otp === otp
    }
    const stored = await OTPModel.findOne({ phone })
    if (!stored) return false
    if (stored.expires < Date.now()) return false
    return stored.otp === otp
  },

  // ─── Grievances ───
  async createGrievance(data) {
    if (useDemo) {
      const seq = memDB.grievances.length + 843
      const id = 'MYL-2026-' + String(seq).padStart(5, '0')
      const grievance = {
        ...data, id,
        submittedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Open', createdAt: new Date().toISOString()
      }
      memDB.grievances.push(grievance)
      return grievance
    }
    const total = await GrievanceModel.countDocuments()
    const seq = total + 843
    const id = 'MYL-2026-' + String(seq).padStart(5, '0')
    const grievance = await GrievanceModel.create({
      ...data, id,
      submittedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Open'
    })
    return grievance.toObject()
  },

  async getGrievance(id) {
    if (useDemo) {
      return memDB.grievances.find(g => g.id === id) || null
    }
    const g = await GrievanceModel.findOne({ id })
    return g ? g.toObject() : null
  },

  async getGrievancesByUser(userId) {
    if (useDemo) {
      return memDB.grievances.filter(g => g.userId === userId)
    }
    const docs = await GrievanceModel.find({ userId }).sort({ createdAt: -1 })
    return docs.map(d => d.toObject())
  },

  async getGrievancesByPhone(phone) {
    if (useDemo) {
      return memDB.grievances.filter(g => g.userPhone === phone || g.userId === phone)
    }
    const docs = await GrievanceModel.find({ 
      $or: [{ userPhone: phone }, { userId: phone }] 
    }).sort({ createdAt: -1 })
    return docs.map(d => d.toObject())
  },

  async getAllGrievances() {
    if (useDemo) {
      return memDB.grievances
    }
    const docs = await GrievanceModel.find().sort({ createdAt: -1 })
    return docs.map(d => d.toObject())
  },

  async updateGrievance(id, data) {
    if (useDemo) {
      const idx = memDB.grievances.findIndex(g => g.id === id)
      if (idx !== -1) {
        memDB.grievances[idx] = { ...memDB.grievances[idx], ...data }
        return memDB.grievances[idx]
      }
      return null
    }
    const g = await GrievanceModel.findOneAndUpdate({ id }, data, { new: true })
    return g ? g.toObject() : null
  },

  async getMemberCount() {
    if (useDemo) return memDB.memberCount
    const count = await UserModel.countDocuments()
    return 1247 + count
  },

  async getStats() {
    let total = 0
    let resolved = 0
    
    if (useDemo) {
      total = memDB.grievances.length + 1247
      resolved = memDB.grievances.filter(g => g.status === 'Resolved').length + 834
    } else {
      const dbTotal = await GrievanceModel.countDocuments()
      const dbResolved = await GrievanceModel.countDocuments({ status: 'Resolved' })
      total = 1247 + dbTotal
      resolved = 834 + dbResolved
    }

    return {
      totalReceived: total,
      totalResolved: resolved,
      avgResponseTime: '7 days',
      satisfaction: '14,500+'
    }
  }
}
