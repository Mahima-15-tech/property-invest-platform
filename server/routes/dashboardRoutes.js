const express = require("express");
const router = express.Router();

const {
  getDashboard,
} = require("../controllers/dashboardController");

// Agar tumhare project mein auth middleware hai
// to yahan apna existing auth middleware laga sakti ho.

router.get("/", getDashboard);

module.exports = router;