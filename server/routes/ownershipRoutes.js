const express = require("express");

const router = express.Router();

const ownership = require("../controllers/ownershipController");

const protect = require("../middleware/authmiddleware");

const authorize = require("../middleware/roleMiddleware");

const { uploadOwnershipPayment } = require("../middleware/upload");

// ======================================================
// INVESTOR ROUTES
// ======================================================

// Create 100% ownership request
router.post(
  "/request",
  protect,
  ownership.createOwnershipRequest
);

// Get logged-in investor's ownership requests
router.get(
  "/my-requests",
  protect,
  ownership.getMyOwnershipRequests
);

// Submit payment proof
router.post(
    "/:id/payment-proof",
    protect,
    uploadOwnershipPayment,
    ownership.submitOwnershipPaymentProof
  );


// ======================================================
// ADMIN ROUTES
// ======================================================

// Get all ownership requests
router.get(
  "/admin/requests",
  protect,
  authorize("admin"),
  ownership.getAllOwnershipRequests
);

// ======================================================
// ADMIN — ASSIGN SHARES
// ======================================================

router.put(
    "/admin/:id/assign-shares",
    protect,
    authorize("admin"),
    ownership.assignOwnershipShares
  );

  // ======================================================
// ADMIN — APPROVE OWNERSHIP REQUEST
// This only unlocks payment for the investor
// ======================================================

router.put(
  "/admin/:id/approve-request",
  protect,
  authorize("admin"),
  ownership.approveOwnershipRequest
);

// Verify ownership payment
router.put(
  "/admin/:id/verify-payment",
  protect,
  authorize("admin"),
  ownership.verifyOwnershipPayment
);

// Reject ownership payment
router.put(
  "/admin/:id/reject-payment",
  protect,
  authorize("admin"),
  ownership.rejectOwnershipPayment
);

// Approve 100% ownership transfer
router.put(
  "/admin/:id/approve",
  protect,
  authorize("admin"),
  ownership.approveOwnershipTransfer
);

// Reject ownership request
router.put(
  "/admin/:id/reject",
  protect,
  authorize("admin"),
  ownership.rejectOwnershipRequest
);

module.exports = router;