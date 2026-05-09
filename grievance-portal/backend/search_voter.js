import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

async function search() {
  await mongoose.connect(process.env.MONGODB_URI)
  const voterDb = mongoose.connection.client.db('voter_db')
  const col = voterDb.collection('ass_25')
  
  const results = await col.find({ VOTER_NAME: /CHITRA/i }).limit(10).toArray()
  console.log('--- VOTER DB RESULTS ---')
  console.log(JSON.stringify(results, null, 2))
  console.log('--- END ---')
  process.exit(0)
}

search()
