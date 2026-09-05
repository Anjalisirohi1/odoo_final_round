const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const checkRules = async () => {
  try {
    const rulesRes = await pool.query("SELECT * FROM discount_rules");
    console.log(`Found ${rulesRes.rows.length} discount rules in DB.`);
    
    const latestQuote = await pool.query("SELECT id, status, subtotal, discount_amount FROM quotations ORDER BY created_at DESC LIMIT 1");
    if(latestQuote.rows.length) {
      console.log("Latest quote:", latestQuote.rows[0]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
};

checkRules();
