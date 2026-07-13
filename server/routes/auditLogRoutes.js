const express = require("express");
const router = express.Router();

const audit = require("../controllers/auditLogController");
const protect = require("../middleware/authmiddleware");

// 🔥 GET
router.get("/audit-logs", protect, audit.getAuditLogs);

// 🔥 CREATE (optional)
router.post("/audit-logs", protect, audit.createAuditLog);

module.exports = router;