import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

async function check() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.useDb('voter_db')
  const collection = db.collection('ass_25')
  const voter = await collection.findOne({ $or: [{ phone: '8106811285' }, { mobile: '8106811285' }, { epic: 'RJE2202202' }] })
  console.log('VOTER INFO:', voter)
  process.exit(0)
}

check()
