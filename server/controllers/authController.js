const User = require("../models/user");
const jwt = require("jsonwebtoken");


// ================= SEND OTP =================

exports.sendOtp = async (req, res) => {
  try {
    const { email, role, name, mode } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!mode || !["signup", "login"].includes(mode)) {
      return res.status(400).json({
        message: "Valid mode is required: signup or login",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    const otp = "123456";

    // ================= SIGNUP =================
    if (mode === "signup") {

      if (user) {
        return res.status(400).json({
          message: "User already exists. Please login.",
        });
      }

      user = await User.create({
        email: normalizedEmail,
        name: name || "",
        role: role || "investor",
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      });
    }

    // ================= LOGIN =================
    if (mode === "login") {

      if (!user) {
        return res.status(400).json({
          message: "User not found. Please signup first.",
        });
      }

      if (role && user.role !== role) {
        return res.status(400).json({
          message: "Invalid login type",
        });
      }

      user.otp = otp;
      user.otpExpiry = Date.now() + 5 * 60 * 1000;

      await user.save();
    }

    res.json({
      message: "OTP generated successfully",
      otp,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


// ================= VERIFY OTP =================

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (role && user.role !== role) {
      return res.status(400).json({
        message: "Invalid login type",
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        message: "OTP not requested",
      });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const isNewUser = !user.isVerified;

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: isNewUser
        ? "Signup successful"
        : "Login successful",

      token,
      user,
      type: isNewUser ? "signup" : "login",
      isNewUser,
      role: user.role,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


// ================= RESEND OTP =================

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const otp = "123456";

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    res.json({
      message: "OTP generated successfully",
      otp,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


// ================= APPLY REFERRAL =================

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
    res.status(500).json({
      error: error.message,
    });
  }
};