const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const User = require("../models/user");
const authmiddleware = require("../middleware/authmiddleware");
const protect = require("../middleware/authmiddleware");

router.post("/send-otp", auth.sendOtp);
router.post("/verify-otp", auth.verifyOtp);
router.post("/resend-otp", auth.resendOtp);
router.post("/apply-referral", protect, auth.applyReferral);

router.get("/me", authmiddleware, async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  });

module.exports = router;