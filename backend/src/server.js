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
const productRoutes = require("./routes/productRoutes");
const productVariantRoutes = require("./routes/productvariantRoutes");
const priceListRoutes = require("./routes/priceListRoutes");
// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/productvariants", productVariantRoutes);
app.use("/api/price-lists", priceListRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running successfully!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});