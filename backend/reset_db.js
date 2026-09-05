require("dotenv").config();
const { Pool } = require("pg");

const pgURI = process.env.DATABASE_URL || process.env.POSTGRES_URI;
const pool = new Pool({ connectionString: pgURI });

async function resetDB() {
  try {
    console.log("Dropping existing users table...");
    await pool.query("DROP TABLE IF EXISTS users;");
    
    console.log("Creating new users table with the correct schema...");
    const createUsersTable = `
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createUsersTable);
    console.log("Schema updated successfully!");
  } catch (err) {
    console.error("Error resetting schema:", err);
  } finally {
    pool.end();
  }
}

resetDB();
