import { db, initDB } from './db.js'

async function check() {
  await initDB()
  const grievances = await db.getAllGrievances()
  console.log('--- ALL GRIEVANCES ---')
  const chitraGrievances = grievances.filter(g => g.userName?.toUpperCase().includes('CHITRA'))
  console.log(JSON.stringify(chitraGrievances, null, 2))
  console.log('--- END ---')
  process.exit(0)
}

check()
