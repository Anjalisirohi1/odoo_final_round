const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const queries = [
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers' AND table_schema = 'public' ORDER BY ordinal_position`,
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND table_schema = 'public' ORDER BY ordinal_position`,
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'quotations' AND table_schema = 'public' ORDER BY ordinal_position`,
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'quotation_items' AND table_schema = 'public' ORDER BY ordinal_position`,
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'approval_history' AND table_schema = 'public' ORDER BY ordinal_position`,
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public' ORDER BY ordinal_position`,
];

const names = ['customers','products','quotations','quotation_items','approval_history','users'];

Promise.all(queries.map(q => pool.query(q))).then(results => {
  results.forEach((r, i) => {
    console.log(`\n=== ${names[i]} ===`);
    r.rows.forEach(row => console.log(`  ${row.column_name} (${row.data_type})`));
  });
  pool.end();
}).catch(e => { console.error(e.message); pool.end(); });
