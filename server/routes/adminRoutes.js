const express = require("express");
const router = express.Router();

const admin = require("../controllers/adminController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  uploadPaymentQR,
} = require("../middleware/upload");

router.post("/login", admin.adminLogin);

// ==========================================
// ADMIN FORGOT PASSWORD
// ==========================================

// Generate Dummy OTP
router.post(
  "/forgot-password",
  admin.adminForgotPassword
);

// Verify OTP
router.post(
  "/verify-reset-otp",
  admin.verifyAdminResetOtp
);

// Reset Password
router.post(
  "/reset-password",
  admin.resetAdminPassword
);

router.patch(
  "/approve-broker/:id",
  protect,
  authorize("admin"),
  admin.approveBroker
);

// ==========================
// REFERRAL PROGRAM
// ==========================

router.get(
  "/referral-program",
  protect,
  authorize("admin"),
  admin.getReferralProgram
);

router.put(
  "/referral-program",
  protect,
  authorize("admin"),
  admin.updateReferralProgram
);

router.patch(
  "/kyc/:id/approve",
  protect,
  authorize("admin"),
  admin.approveKyc
);

router.patch(
  "/kyc/:id/reject",
  protect,
  authorize("admin"),
  admin.rejectKyc
);

// ==========================
// PAYMENT SETTINGS
// ==========================

// Get current payment settings
router.get(
  "/payment-settings",
  protect,
  authorize("admin"),
  admin.getPaymentSettings
);

// Update payment settings + QR
router.put(
  "/payment-settings",
  protect,
  authorize("admin"),
  uploadPaymentQR,
  admin.updatePaymentSettings
);

// ==========================
// PAYMENT VERIFICATION
// ==========================

router.put(
  "/investments/:id/verify-payment",
  protect,
  authorize("admin"),
  admin.verifyInvestmentPayment
);

router.put(
  "/investments/:id/reject-payment",
  protect,
  authorize("admin"),
  admin.rejectInvestmentPayment
);

router.put(
  "/investments/:id/approve",
  protect,
  authorize("admin"),
  admin.approveInvestment
);

router.get(
  "/users",
  protect,
  authorize("admin"),
  admin.getAllUsers
);

router.put(
  "/investments/:id/reject",
  protect,
  authorize("admin"),
  admin.rejectInvestment
);

router.put(
  "/investments/:id",
  protect,
  authorize("admin"),
  admin.updateInvestment
);

router.put("/exits/:id", protect ,authorize("admin"), admin.updateExit);


// ==========================
// EXIT REQUEST ROUTES
// ==========================

// Get all exit requests
router.get(
  "/exit-requests",
  protect,
  authorize("admin"),
  admin.getAllExitRequests
);

// Approve exit request
router.put(
  "/exit-requests/:id/approve",
  protect,
  authorize("admin"),
  admin.approveExit
);

// Reject exit request
router.put(
  "/exit-requests/:id/reject",
  protect,
  authorize("admin"),
  admin.rejectExit
);

// ==========================
// REFERRAL REWARDS
// ==========================

router.get(
  "/referral-rewards",
  protect,
  authorize("admin"),
  admin.getReferralRewards
);

router.put(
  "/referral-rewards/:id/approve",
  protect,
  authorize("admin"),
  admin.approveReferralReward
);

router.put(
  "/referral-rewards/:id/reject",
  protect,
  authorize("admin"),
  admin.rejectReferralReward
);

router.put(
  "/referral-rewards/:id/issue",
  protect,
  authorize("admin"),
  admin.issueReferralGift
);

router.get(
  "/commission-settings",
  protect,
  authorize("admin"),
  admin.getCommissionSettings
);

router.put(
  "/commission-settings",
  protect,
  authorize("admin"),
  admin.updateCommissionSettings
);

// ==========================================
// ADMIN ACCOUNT SETTINGS
// ==========================================

router.put(
  "/change-email",
  protect,
  authorize("admin"),
  admin.changeAdminEmail
);

router.put(
  "/change-password",
  protect,
  authorize("admin"),
  admin.changeAdminPassword
);

module.exports = router;