import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: '' },
  epic: { type: String, default: '' },
  constituency: { type: String, default: 'Mylapore' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', userSchema)
