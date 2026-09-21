const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// =====================================================
// GMAIL SMTP TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// =====================================================
// GENERATE 6 DIGIT OTP
// =====================================================

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// =====================================================
// SEND OTP EMAIL
// =====================================================

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Pronex World" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Pronex World - Email Verification OTP",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        color: #333;
      ">

        <h2 style="margin-bottom: 10px;">
          Email Verification
        </h2>

        <p>
          Your OTP for verification is:
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 25px 0;
          padding: 15px;
          background: #f5f5f5;
          text-align: center;
          border-radius: 8px;
        ">
          ${otp}
        </div>

        <p>
          This OTP is valid for
          <strong>5 minutes</strong>.
        </p>

        <p>
          If you did not request this OTP,
          please ignore this email.
        </p>

      </div>
    `,
  });
};

// =====================================================
// INVESTOR REFERRAL CODE
// =====================================================

const generateReferralCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code =
      "REF" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    exists = await User.exists({
      referralCode: code,
      role: "investor",
    });
  }

  return code;
};

// =====================================================
// SEND OTP
// =====================================================

exports.sendOtp = async (req, res) => {
  try {
    const {
      email,
      role,
      name,
      mode,
      referralCode,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (
      !mode ||
      !["signup", "login"].includes(mode)
    ) {
      return res.status(400).json({
        message:
          "Valid mode is required: signup or login",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // =================================================
    // GENERATE REAL OTP
    // =================================================

    const otp = generateOtp();

    // =================================================
    // SIGNUP
    // =================================================

    if (mode === "signup") {

      if (user) {
        return res.status(400).json({
          message:
            "User already exists. Please login.",
        });
      }

      // ===============================================
      // REFERRAL
      // ===============================================

      let referredBy = null;
      let referralCodeUsed = null;

      if (
        role === "investor" &&
        referralCode
      ) {

        const referrer =
          await User.findOne({
            referralCode:
              referralCode
                .trim()
                .toUpperCase(),

            role: "investor",
          });

        if (!referrer) {
          return res.status(400).json({
            message:
              "Invalid referral code",
          });
        }

        // Prevent self referral
        referredBy =
          referrer._id;

        referralCodeUsed =
          referrer.referralCode;
      }

      // ===============================================
      // GENERATE INVESTOR REFERRAL CODE
      // ===============================================

      const newReferralCode =
        role === "investor"
          ? await generateReferralCode()
          : undefined;

      // ===============================================
      // CREATE USER
      // ===============================================

      user = await User.create({
        email: normalizedEmail,

        name: name || "",

        role: role || "investor",

        referralCode:
          newReferralCode,

        referredBy,

        referralCodeUsed,

        otp,

        otpExpiry:
          Date.now() +
          5 * 60 * 1000,
      });

      // ===============================================
      // SEND REAL OTP EMAIL
      // ===============================================

      await sendOtpEmail(
        normalizedEmail,
        otp
      );
    }

    // =================================================
    // LOGIN
    // =================================================

    if (mode === "login") {

      if (!user) {
        return res.status(400).json({
          message:
            "User not found. Please signup first.",
        });
      }

      if (
        role &&
        user.role !== role
      ) {
        return res.status(400).json({
          message:
            "Invalid login type",
        });
      }

      // ===============================================
      // GENERATE NEW OTP
      // ===============================================

      user.otp = otp;

      user.otpExpiry =
        Date.now() +
        5 * 60 * 1000;

      await user.save();

      // ===============================================
      // SEND REAL OTP EMAIL
      // ===============================================

      await sendOtpEmail(
        normalizedEmail,
        otp
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      message:
        "OTP sent successfully to your email",
    });

  } catch (error) {

    console.error(
      "SEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

// =====================================================
// VERIFY OTP
// =====================================================

exports.verifyOtp = async (req, res) => {
  try {

    const {
      email,
      otp,
      role,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(400).json({
        message:
          "User not found",
      });
    }

    // =================================================
    // ROLE CHECK
    // =================================================

    if (
      role &&
      user.role !== role
    ) {
      return res.status(400).json({
        message:
          "Invalid login type",
      });
    }

    // =================================================
    // OTP EXISTS
    // =================================================

    if (!user.otp) {
      return res.status(400).json({
        message:
          "OTP not requested",
      });
    }

    // =================================================
    // OTP MATCH
    // =================================================

    if (
      user.otp !==
      otp.toString()
    ) {
      return res.status(400).json({
        message:
          "Invalid OTP",
      });
    }

    // =================================================
    // OTP EXPIRY
    // =================================================

    if (
      !user.otpExpiry ||
      user.otpExpiry < Date.now()
    ) {
      return res.status(400).json({
        message:
          "OTP expired",
      });
    }

    // =================================================
    // NEW USER CHECK
    // =================================================

    const isNewUser =
      !user.isVerified;

    // =================================================
    // VERIFY USER
    // =================================================

    user.isVerified = true;

    user.otp = null;

    user.otpExpiry = null;

    await user.save();

    // =================================================
    // JWT TOKEN
    // =================================================

    const token =
      jwt.sign(
        {
          id: user._id,
          role: user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({

      message: isNewUser
        ? "Signup successful"
        : "Login successful",

      token,

      user,

      type: isNewUser
        ? "signup"
        : "login",

      isNewUser,

      role: user.role,
    });

  } catch (error) {

    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

// =====================================================
// RESEND OTP
// =====================================================

exports.resendOtp = async (
  req,
  res
) => {

  try {

    const { email } =
      req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!email) {
      return res.status(400).json({
        message:
          "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(400).json({
        message:
          "User not found",
      });
    }

    // =================================================
    // GENERATE NEW OTP
    // =================================================

    const otp =
      generateOtp();

    user.otp = otp;

    user.otpExpiry =
      Date.now() +
      5 * 60 * 1000;

    await user.save();

    // =================================================
    // SEND EMAIL
    // =================================================

    await sendOtpEmail(
      normalizedEmail,
      otp
    );

    return res.json({
      message:
        "OTP resent successfully",
    });

  } catch (error) {

    console.error(
      "RESEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

// =====================================================
// APPLY REFERRAL
// =====================================================

exports.applyReferral = async (
  req,
  res
) => {

  try {

    const {
      referralCode,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!referralCode) {
      return res.status(400).json({
        message:
          "Referral code is required",
      });
    }

    // =================================================
    // CURRENT USER
    // =================================================

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    // =================================================
    // INVESTOR CHECK
    // =================================================

    if (
      user.role !== "investor"
    ) {
      return res.status(403).json({
        message:
          "Referral is only available for investors",
      });
    }

    // =================================================
    // ALREADY APPLIED
    // =================================================

    if (user.referredBy) {
      return res.status(400).json({
        message:
          "Referral already applied",
      });
    }

    // =================================================
    // FIND REFERRER
    // =================================================

    const referrer =
      await User.findOne({
        referralCode:
          referralCode
            .trim()
            .toUpperCase(),

        role: "investor",
      });

    if (!referrer) {
      return res.status(400).json({
        message:
          "Invalid referral code",
      });
    }

    // =================================================
    // SELF REFERRAL PROTECTION
    // =================================================

    if (
      referrer._id.toString() ===
      user._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot use your own referral code",
      });
    }

    // =================================================
    // APPLY REFERRAL
    // =================================================

    user.referredBy =
      referrer._id;

    user.referralCodeUsed =
      referrer.referralCode;

    await user.save();

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      message:
        "Referral applied successfully",

      referredBy: {
        id: referrer._id,
        name: referrer.name,
      },
    });

  } catch (error) {

    console.error(
      "APPLY REFERRAL ERROR:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};