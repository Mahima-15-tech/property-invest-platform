// 🔥 dotenv sabse pehle
require("dotenv").config();

const crypto = require("crypto");
const { instance } = require("../config/razorpay");
const Payment = require("../models/payment");
// const Investment = require("../models/investment"); // agar use karna ho

// =======================
// ✅ CAPTURE PAYMENT
// =======================
const capturePayment = async (req, res) => {
  console.log("🔥 CAPTURE PAYMENT HIT");

  console.log("KEY =", process.env.RAZORPAY_KEY);
  console.log("SECRET =", process.env.RAZORPAY_SECRET);

  console.log("INSTANCE =", instance);

  console.log("BODY =", req.body);

  try {

    const options = {
      amount: Number(req.body.amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    console.log("OPTIONS =", options);

    const paymentResponse = await instance.orders.create(options);

    console.log("ORDER =", paymentResponse);

    return res.json({
      success: true,
      data: paymentResponse,
    });

  } catch (err) {

    console.log("❌ PAYMENT ERROR");
    console.log(err);
    console.log(err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// =======================
// ✅ VERIFY PAYMENT + SAVE
// =======================
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      propertyId,
      amount,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.json({
        success: false,
        message: "Payment Failed",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

      // 🔥 SAVE IN DB
      await Payment.create({
        userId: req.user?.id,
        propertyId,
        amount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "success",
        method: "Razorpay",
      });

      return res.json({
        success: true,
        message: "Payment Verified",
        razorpay_payment_id,
      });
    }

    return res.json({
      success: false,
      message: "Payment Failed",
    });

  } catch (err) {
    console.log("❌ VERIFY ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Network Error",
    });
  }
};

// =======================
// ✅ WEBHOOK
// =======================
const razorpayWebhook = async (req, res) => {
  console.log("webhook");

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const digest = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body) // ⚠️ raw body
      .digest("hex");

    if (signature !== digest) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body).event;

    if (event === "payment.captured") {
      const payment = JSON.parse(req.body).payload.payment.entity;

      console.log("💰 Payment Captured:", payment.amount / 100);
    }

    res.json({ ok: true });

  } catch (err) {
    console.log("❌ WEBHOOK ERROR:", err);
    res.status(500).json({ ok: false });
  }
};

// =======================
// EXPORT
// =======================
module.exports = {
  capturePayment,
  verifyPayment,
  razorpayWebhook,
};