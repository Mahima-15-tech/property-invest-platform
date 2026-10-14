
const express = require("express");
const router = express.Router();

const invest = require("../controllers/investmentController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");
const { uploadSingle } = require("../middleware/upload");
const admin = require("../controllers/adminController");

console.log("Investment routes loaded");

// Create investment — authenticated user
router.post("/", protect, invest.invest);

// Checkout property details
router.get("/checkout/:propertyId", invest.getCheckoutData);

// Payment settings
router.get("/payment-settings", protect, invest.getPaymentSettings);

// Create investment request
router.post("/create", protect, invest.createInvestment);

// Validate broker referral code
router.post("/validate-referral", invest.validateReferralCode);

// Submit payment proof — investment owner checked in controller
router.post(
  "/:investmentId/payment-proof",
  protect,
  uploadSingle,
  invest.submitPaymentProof
);

// Verify payment — admin only
router.patch(
  "/:investmentId/verify-payment",
  protect,
  authorize("admin"),
  invest.verifyPayment
);

router.get(
  "/platform-fee-settings",
  protect,
  admin.getPlatformFeeSettings
);

module.exports = router;
