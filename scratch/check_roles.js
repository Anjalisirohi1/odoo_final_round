require('dotenv').config({ path: './backend/.env' });
const { pool } = require('./backend/src/config/db');

async function checkRoles() {
  try {
    const res = await pool.query('SELECT * FROM roles;');
    console.log('Roles in DB:', res.rows);
    
    // Ensure ADMIN exists
    const adminCheck = res.rows.find(r => r.name === 'ADMIN');
    if (!adminCheck) {
      console.log('Inserting ADMIN role into DB...');
      await pool.query("INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT DO NOTHING;");
      const updatedRes = await pool.query('SELECT * FROM roles;');
      console.log('Updated Roles in DB:', updatedRes.rows);
    } else {
      console.log('ADMIN role is already present in DB!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkRoles();
