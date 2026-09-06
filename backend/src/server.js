const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

const { connectDB } = require("./config/db");

// Connect to database
connectDB();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const productVariantRoutes = require("./routes/productvariantRoutes");
const priceListRoutes = require("./routes/priceListRoutes");
const discountRuleRoutes = require("./routes/discountRuleRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const dealHealthRoutes = require("./routes/dealHealthRoutes");
const negotiationRoutes = require("./routes/negotiationRoutes");
const fulfillmentRoutes = require("./routes/fulfillmentRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", productVariantRoutes);
app.use("/api/price-lists", priceListRoutes);
app.use("/api/discount-rules", discountRuleRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/deal-health", dealHealthRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/fulfillments", fulfillmentRoutes);
app.use("/api/fulfillment", fulfillmentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/invoices", invoiceRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running successfully!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});