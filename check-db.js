const knex = require('knex');
console.log('Knex required successfully');
try {
  const db = knex({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'funiture-lc'
    }
  });
  console.log('Knex initialized');
  db.raw('SELECT 1').then(() => {
    console.log('Database connected');
    process.exit(0);
  }).catch(e => {
    console.error('Connection failed:', e);
    process.exit(1);
  });
} catch(e) {
    console.error('Init failed:', e);
    process.exit(1);
}
