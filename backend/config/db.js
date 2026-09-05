const { Pool } = require("pg");
require("dotenv").config();

const pgURI = process.env.DATABASE_URL || process.env.POSTGRES_URI;

const pool = new Pool({
  connectionString: pgURI,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
