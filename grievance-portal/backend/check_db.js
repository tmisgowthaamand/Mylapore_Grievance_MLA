import { db, initDB } from './db.js'

async function check() {
  await initDB()
  const grievances = await db.getAllGrievances()
  console.log('--- ALL GRIEVANCES ---')
  console.log(JSON.stringify(grievances, null, 2))
  console.log('--- END ---')
  process.exit(0)
}

check()
