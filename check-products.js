
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

async function checkProducts() {
  try {
    const products = await db('products').select('id', 'name').limit(5);
    console.log('Products:', products);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProducts();
