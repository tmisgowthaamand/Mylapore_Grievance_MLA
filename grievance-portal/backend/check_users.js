import { db, initDB } from './db.js'
import UserModel from './models/User.js'

async function check() {
  await initDB()
  const users = await UserModel.find()
  console.log('--- ALL USERS ---')
  console.log(JSON.stringify(users, null, 2))
  console.log('--- END ---')
  process.exit(0)
}

check()
