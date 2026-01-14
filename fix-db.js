
const knex = require('knex');

const db = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'funiture-lc'
  }
});

async function fixDb() {
  try {
    console.log('Altering carts table...');
    await db.raw('ALTER TABLE carts MODIFY session_id VARCHAR(255)');
    console.log('✅ carts table updated');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDb();
