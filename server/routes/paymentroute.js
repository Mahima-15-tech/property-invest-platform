const express = require("express");
const router = express.Router();

const {
  capturePayment,
  razorpayWebhook,
  verifyPayment,
} = require("../controllers/payment");

console.log("ROUTE FILE RUNNING");

router.post("/capturePayment", capturePayment);
router.post("/verifyPayment", verifyPayment);

// ⚠️ webhook ke liye raw middleware sahi hai
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// ✅ IMPORTANT
module.exports = router;