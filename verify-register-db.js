
const knex = require('knex');
const bcrypt = require('bcryptjs');

const db = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'funiture-lc'
  }
});

async function testDB() {
  try {
    console.log('Testing DB connection...');
    await db.raw('SELECT 1');
    console.log('✅ DB Connected');

    console.log('Checking users table...');
    const exists = await db.schema.hasTable('users');
    if (!exists) {
      console.error('❌ users table missing');
      process.exit(1);
    }
    console.log('✅ users table exists');

    console.log('Testing User Insertion...');
    const email = `test_db_${Date.now()}@example.com`;
    const password = await bcrypt.hash('password123', 10);
    
    // Insert
    const [id] = await db('users').insert({
      name: 'DB Test User',
      email: email,
      password: password,
      phone: '0987654321',
      role: 'customer',
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log('✅ User inserted with ID:', id);

    // Verify
    const user = await db('users').where('id', id).first();
    if (user && user.email === email) {
      console.log('✅ User verification successful');
    } else {
      console.error('❌ User verification failed');
    }

    // Cleanup
    await db('users').where('id', id).delete();
    console.log('✅ Test user deleted');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDB();
