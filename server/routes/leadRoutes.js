const express = require("express");
const router = express.Router();

const lead = require("../controllers/leadController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// 👤 User inquiry
router.post("/", protect, lead.createLead);

// 👑 Admin view leads
router.get("/", protect, authorize("admin"), lead.getAllLeads);

// 👑 Update status
router.patch("/:id", protect, authorize("admin"), lead.updateLeadStatus);

module.exports = router;