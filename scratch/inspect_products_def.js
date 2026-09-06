require('dotenv').config({ path: './backend/.env' });
const { pool } = require('./backend/src/config/db');

async function inspectTable() {
  try {
    const res = await pool.query(`
      SELECT column_name, is_generated, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);
    console.log('PRODUCTS COLUMNS:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

inspectTable();
