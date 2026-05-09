import { initDB, db } from '../db.js';

async function removeUser() {
  await initDB();
  try {
    const success = await db.deleteUser('8903162114');
    if (success) {
      console.log('✅ User 8903162114 removed successfully.');
    } else {
      console.log('⚠️ User 8903162114 not found.');
    }
  } catch (err) {
    console.error('Error removing user:', err);
  }
  process.exit(0);
}

removeUser();
