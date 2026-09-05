const { Pool } = require("pg");
require("dotenv").config();

const pgURI = process.env.DATABASE_URL || process.env.POSTGRES_URI;

const pool = new Pool({
  connectionString: pgURI,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL successfully!");
    client.release();
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error.message || error);
    console.error("Please ensure PostgreSQL is running locally on port 5432 or update DATABASE_URL in backend/.env with your active PostgreSQL connection string.");
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
