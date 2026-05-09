import { initDB, db } from '../db.js';

async function testCreateUser() {
  await initDB();
  try {
    await db.createUser({
      name: 'Test',
      phone: '919999999999',
      epic: 'TNA123',
      email: 'test@example.com',
      gender: 'Male',
      type: 'manual',
      area: 'Mylapore'
    });
    console.log('✅ User created successfully.');
  } catch (err) {
    console.error('Error creating user:', err);
  }
  process.exit(0);
}

testCreateUser();
