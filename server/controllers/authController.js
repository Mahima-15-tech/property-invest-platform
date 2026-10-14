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


const isDummyOtpEnabled = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.ENABLE_DUMMY_OTP === "true";

const deliverOtpEmail = async (email, otp) => {
  try {
    await sendOtpEmail(email, otp);
    return true;
  } catch (error) {
    console.error("OTP EMAIL ERROR:", error.message);

    // Email failure is tolerated only during explicitly
    // enabled development testing.
    if (isDummyOtpEnabled()) {
      return false;
    }

    throw error;
  }
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
      phone,
      mode,
      referralCode,
    } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (!["signup", "login"].includes(mode)) {
      return res.status(400).json({
        message: "Valid mode is required: signup or login",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    console.log("LOGIN DEBUG:", {
      email: normalizedEmail,
      requestedRole: role,
      mode,
      foundUser: user
        ? {
            id: user._id,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
          }
        : null,
    });

    // Phone number is required for investor signup
if (mode === "signup") {
  const normalizedPhone = String(phone || "").trim();

  if (!normalizedPhone) {
    return res.status(400).json({
      message: "Phone number is required",
    });
  }

  if (!/^\+?[0-9]{10,15}$/.test(normalizedPhone)) {
    return res.status(400).json({
      message: "Please enter a valid phone number",
    });
  }
}

    // ================= SIGNUP =================
    if (mode === "signup") {
      if (user) {
        return res.status(400).json({
          message: "Email already registered. Please login.",
        });
      }

      // Investor signup only.
      // Brokers must use the separate broker registration API.
      if (role && role !== "investor") {
        return res.status(400).json({
          message: "Invalid signup role",
        });
      }

      let referredBy = null;
      let referralCodeUsed = null;

      // Validate investor referral code.
      if (referralCode) {
        const referrer = await User.findOne({
          referralCode: referralCode.trim().toUpperCase(),
          role: "investor",
        });

        if (!referrer) {
          return res.status(400).json({
            message: "Invalid referral code",
          });
        }

        referredBy = referrer._id;
        referralCodeUsed = referrer.referralCode;
      }

      const newReferralCode = await generateReferralCode();
      const otp = generateOtp();

      user = await User.create({
        name: name || "",
        email: normalizedEmail,
        phone: String(phone).trim(),
        role: "investor",
        referralCode: newReferralCode,
        referredBy,
        referralCodeUsed,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      });

      const emailSent = await deliverOtpEmail(normalizedEmail, otp);

      return res.status(200).json({
        message: emailSent
          ? "OTP sent successfully to your email"
          : "Email delivery failed in testing mode. Use test OTP 123456.",
        emailSent,
        ...(isDummyOtpEnabled() ? { testOtpEnabled: true } : {}),
      });
    }

    // ================= LOGIN =================
   // ================= LOGIN =================
if (mode === "login") {
  if (!user) {
    return res.status(400).json({
      message: "User not found. Please signup first.",
    });
  }

  if (user.role !== "broker" && user.role !== "investor") {
    return res.status(403).json({
      message: "This account type cannot login here.",
    });
  }

  if (role && user.role !== role) {
    return res.status(400).json({
      message: `This email is registered as ${user.role}. Please use the correct login page.`,
      registeredRole: user.role,
    });
  }

  // Pending brokers can receive OTP,
  // but cannot access protected dashboard APIs.
  const otp = generateOtp();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  await user.save();
  const emailSent = await deliverOtpEmail(normalizedEmail, otp);

return res.status(200).json({
  message: emailSent
    ? "OTP sent successfully to your email"
    : "Email delivery failed in testing mode. Use test OTP 123456.",
  emailSent,
  ...(isDummyOtpEnabled() ? { testOtpEnabled: true } : {}),
});
}

    return res.status(200).json({
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "This email is already registered",
      });
    }

    return res.status(500).json({
      message: "Unable to send OTP",
      error: error.message,
    });
  }
};



// =====================================================
// VERIFY OTP
// =====================================================


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const submittedOtp = String(otp).trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found. Please signup first.",
      });
    }

    // Role validation
    if (role && user.role !== role) {
      return res.status(400).json({
        message: "Invalid login type",
      });
    }

    // Enable dummy OTP only outside production
    const dummyOtpEnabled =
      process.env.NODE_ENV !== "production" &&
      process.env.ENABLE_DUMMY_OTP === "true";

    const isDummyOtp =
      dummyOtpEnabled && submittedOtp === "123456";
      console.log("DUMMY OTP DEBUG:", {
        nodeEnv: process.env.NODE_ENV,
        enableDummyOtp: process.env.ENABLE_DUMMY_OTP,
        dummyOtpEnabled,
        submittedOtp,
        isDummyOtp,
      });

    // Real OTP must exist unless a valid dummy OTP is used
    if (!isDummyOtp && (!user.otp || !user.otpExpiry)) {
      return res.status(400).json({
        message: "OTP not requested. Please request an OTP first.",
      });
    }

    // Validate expiry for real OTP
    if (
      !isDummyOtp &&
      new Date(user.otpExpiry).getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "OTP expired. Please request a new OTP.",
      });
    }

    // Validate real OTP OR accept enabled testing OTP
    if (!isDummyOtp && String(user.otp) !== submittedOtp) {
      return res.status(400).json({
        message: "Invalid OTP",
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

    return res.status(200).json({
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
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      message: "Unable to verify OTP",
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

    const emailSent = await deliverOtpEmail(normalizedEmail, otp);

    return res.json({
      message: emailSent
        ? "OTP resent successfully"
        : "Email delivery failed in testing mode. Use test OTP 123456.",
      emailSent,
      ...(isDummyOtpEnabled() ? { testOtpEnabled: true } : {}),
    });
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