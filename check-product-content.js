
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

async function checkProduct() {
  try {
    const product = await db('products').where('slug', 'sofa-hien-dai-e008-boc-da-cao-cap').first();
    console.log('Description:', product.description);
    console.log('Content:', product.content);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProduct();
