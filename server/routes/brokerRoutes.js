const express = require("express");
const router = express.Router();

const broker = require("../controllers/brokercontroller");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");
const auth = require("../controllers/authController");
const { uploadBrokerDoc } = require("../middleware/upload");
const approvedBroker = require("../middleware/approvedBrokerMiddleware");

// 🔥 REGISTER
router.post("/register",  uploadBrokerDoc, broker.registerBroker);


// 🔥 ADMIN
router.get("/all", protect, authorize("admin"), broker.getAllBrokers);
router.get("/breakdown", protect, authorize("admin"), broker.getCommissionBreakdown);
router.patch(
    "/:id/approve",
    protect,
    authorize("admin"),
    broker.approveBroker
  );

// 🔥 BROKER
router.get("/dashboard", protect, authorize("broker"),approvedBroker, broker.getBrokerDashboard);
router.get("/profile", protect, authorize("broker"),approvedBroker, broker.getBrokerProfile);
router.get("/referred-investors", protect, authorize("broker"),approvedBroker, broker.getReferredInvestors);
router.get("/commissions", protect, authorize("broker"),approvedBroker, broker.getCommissionDetails);
router.get("/earnings-summary", protect, authorize("broker"), approvedBroker, broker.getEarningsSummary);
// 🔥 ADD THESE
router.get("/total-referrals", protect, authorize("broker"),approvedBroker, broker.getTotalReferrals);
router.get("/total-converted", protect, authorize("broker"),approvedBroker, broker.getTotalConverted);

router.patch(
    "/:brokerId/payment-status",
    protect,
    authorize("admin"),
    broker.updateBrokerPaymentStatus
  );
  
  router.patch(
    "/commissions/:commissionId/status",
    protect,
    authorize("admin"),
    broker.updateCommissionStatus
  );

  router.patch(
    "/commissions/:commissionId/paid",
    protect,
    authorize("admin"),
    broker.markCommissionPaid
  );

router.get(
    "/:id",
    protect,
    authorize("admin"),
    broker.getBrokerById
  );

module.exports = router;