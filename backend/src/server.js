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
const discountRuleRoutes = require("./routes/discountRuleRoutes");
const quotationRoutes = require("./routes/quotationRoutes");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", productVariantRoutes);
app.use("/api/price-lists", priceListRoutes);
app.use("/api/discount-rules", discountRuleRoutes);
app.use("/api/quotations", quotationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running successfully!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});