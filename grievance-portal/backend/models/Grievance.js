import mongoose from 'mongoose'

const grievanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String },
  userName: { type: String, default: 'Anonymous' },
  userPhone: { type: String, index: true },
  category: { type: String },
  subCategory: { type: String },
  location: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  message: { type: String },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Open', 'Responded', 'Resolved'], default: 'Open' },
  response: { type: String, default: '' },
  respondedAt: { type: String, default: '' },
  resolvedAt: { type: String, default: '' },
  submittedAt: { type: String },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Grievance', grievanceSchema)
