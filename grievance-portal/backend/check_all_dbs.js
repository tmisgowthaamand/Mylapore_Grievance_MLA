import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

async function check() {
  await mongoose.connect(process.env.MONGODB_URI)
  const admin = mongoose.connection.db.admin()
  const dbs = await admin.listDatabases()
  console.log('DATABASES:', dbs.databases.map(d => d.name))
  
  for (const dbInfo of dbs.databases) {
    const db = mongoose.connection.useDb(dbInfo.name)
    const collections = await db.db.listCollections().toArray()
    console.log(`DB: ${dbInfo.name}, COLLECTIONS:`, collections.map(c => c.name))
  }
  process.exit(0)
}

check()
