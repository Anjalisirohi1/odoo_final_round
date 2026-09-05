const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const { Pool } = require("pg");

app.use(cors());
app.use(express.json());

const pgURI = process.env.DATABASE_URL || process.env.POSTGRES_URI;
const pool = new Pool({
  connectionString: pgURI,
});

if (pgURI) {
  pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => console.error("Failed to connect to PostgreSQL:", err.message));
} else {
  console.warn("PostgreSQL URI is missing in .env file.");
}

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running successfully!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});