const express = require("express");
const router = express.Router();

const admin = require("../controllers/adminController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/login", admin.adminLogin);

router.patch(
  "/approve-broker/:id",
  protect,
  authorize("admin"),
  admin.approveBroker
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

module.exports = router;