const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const { connectDB } = require("./config/db");

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running successfully!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});