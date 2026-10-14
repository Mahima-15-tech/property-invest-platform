const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");

router.get("/latest-apk", admin.getLatestApk);

module.exports = router;