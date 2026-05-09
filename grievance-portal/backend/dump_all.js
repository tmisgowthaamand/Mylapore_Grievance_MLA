import { db, initDB } from './db.js'

async function dump() {
  await initDB()
  const grievances = await db.getAllGrievances()
  console.log('COUNT:', grievances.length)
  console.log(JSON.stringify(grievances, null, 2))
  process.exit(0)
}

dump()
