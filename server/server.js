// 🔥 dotenv sabse pehle
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// routes
const authRoutes = require("./routes/authRoutes");
console.log("AUTH ROUTES =", typeof authRoutes);
const brokerRoutes = require("./routes/brokerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const leadRoutes = require("./routes/leadRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const kycRoutes = require("./routes/kycRoutes");
const paymentRoutes = require("./routes/paymentroute");
const contactRoutes = require("./routes/contactRoutes");

// 🔥 DB connect
connectDB();

const app = express();

// 🔥 middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "https://property-invest-platform.vercel.app",
    "https://property-invest-gamma.vercel.app",
    "https://property-frontend-pi.vercel.app",
  ],
  credentials: true
}));


app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// 🔥 routes
app.use("/api/auth", authRoutes);
app.use("/api/brokers", brokerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", auditLogRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);

// test route
app.get("/test", (req, res) => {
  res.send("Working");
});

// 🔥 start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});