const express = require("express");
const router = express.Router();

const { getDashboardReport } = require("../controllers/reportsController");

// 🔥 REPORT API
router.get("/", getDashboardReport);

module.exports = router;