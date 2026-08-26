const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware");

const profileController = require("../controllers/profileController");

router.get("/profile", protect, profileController.getProfile);

module.exports = router;