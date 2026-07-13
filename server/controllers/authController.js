const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.sendOtp = async (req, res) => {
  const { phone, role, name } = req.body;

  let user = await User.findOne({ phone });


  if (!user) {
    user = await User.create({
      phone,
      name,
      role: role || "investor",
    });
  } else {

    user.role = role || user.role;
  }

  const otp = "123456";

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  await user.save();

  res.json({ message: "OTP sent", otp });
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp, role } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  // ✅ safe
if (role && user.role !== role)  {
    return res.status(400).json({
      message: `Invalid login type`,
    });
  }

  if (!user.otp) {
    return res.status(400).json({
      message: "OTP not requested",
    });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  // 🔥 CHECK: pehle se verified tha ya nahi
  const isNewUser = !user.isVerified;

  user.isVerified = true;
  user.otp = null;

  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: isNewUser
      ? "Signup successful"
      : "Login successful",
    token,
    user,
    type: isNewUser ? "signup" : "login",
    isNewUser: isNewUser,
    role: user.role,
  });
};


  const jwt = require("jsonwebtoken");


  exports.applyReferral = async (req, res) => {
    try {
      const { referralCode } = req.body;
  
      const user = await User.findById(req.user.id);
  
      if (user.referredBy) {
        return res.status(400).json({
          message: "Referral already applied",
        });
      }
  
      const broker = await User.findOne({ referralCode });
  
      if (!broker) {
        return res.status(400).json({
          message: "Invalid referral code",
        });
      }
  
      user.referredBy = broker._id;
      await user.save();
  
      res.json({
        message: "Referral applied successfully",
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  exports.resendOtp = async (req, res) => {
    const { phone, referralCode } = req.body; // 🔥 ADD THIS
  
    const user = await User.findOne({ phone });
  
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
  
    const otp = "123456";
  
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
  
    // 🔥 referral fix
    if (!user.referredBy && referralCode) {
      const broker = await User.findOne({ referralCode });
      if (broker) user.referredBy = broker._id;
    }
  
    await user.save();
  
    res.json({ message: "OTP resent", otp });
  };