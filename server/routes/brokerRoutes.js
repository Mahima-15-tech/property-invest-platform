const express = require("express");
const router = express.Router();

const broker = require("../controllers/brokercontroller");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");
const auth = require("../controllers/authController");
const { uploadBrokerDoc } = require("../middleware/upload");

// 🔥 REGISTER
router.post("/register",  uploadBrokerDoc, broker.registerBroker);


// 🔥 ADMIN
router.get("/all", protect, authorize("admin"), broker.getAllBrokers);
router.get("/breakdown", protect, authorize("admin"), broker.getCommissionBreakdown);

// 🔥 BROKER
router.get("/dashboard", protect, authorize("broker"), broker.getBrokerDashboard);
router.get("/profile", protect, authorize("broker"), broker.getBrokerProfile);
router.get("/referred-investors", protect, authorize("broker"), broker.getReferredInvestors);
router.get("/commissions", protect, authorize("broker"), broker.getCommissionDetails);
router.get("/earnings-summary", protect, authorize("broker"), broker.getEarningsSummary);
// 🔥 ADD THESE
router.get("/total-referrals", protect, authorize("broker"), broker.getTotalReferrals);
router.get("/total-converted", protect, authorize("broker"), broker.getTotalConverted);

module.exports = router;