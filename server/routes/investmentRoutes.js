const express = require("express");

const router = express.Router();

const invest = require("../controllers/investmentController");

const protect = require("../middleware/authmiddleware");

const { uploadSingle } = require("../middleware/upload");

console.log("Investment routes loaded");

router.post("/", protect, invest.invest);

router.get(
  "/checkout/:propertyId",
  invest.getCheckoutData
);

router.get(
  "/payment-settings",
  protect,
  invest.getPaymentSettings
);

router.post(
  "/create",
  protect,
  invest.createInvestment
);

router.post(
  "/validate-referral",
  invest.validateReferralCode
);

// PAYMENT PROOF
router.post(
  "/:investmentId/payment-proof",
  protect,
  uploadSingle,
  invest.submitPaymentProof
);

router.patch(
    "/:investmentId/verify-payment",
    protect,
    invest.verifyPayment
  );

  
module.exports = router;