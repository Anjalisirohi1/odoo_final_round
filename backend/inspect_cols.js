require('dotenv').config();
const { pool } = require('./src/config/db');

async function inspectCols() {
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

inspectCols();
