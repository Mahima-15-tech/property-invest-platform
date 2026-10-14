
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");

const {
  registerToken,
  sendNotificationToUser,
} = require("../controllers/notificationController");

router.post("/register-token", authMiddleware, registerToken);

// Test/send notification route
router.post("/send", authMiddleware, sendNotificationToUser);

module.exports = router;
