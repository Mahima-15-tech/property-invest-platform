  const mongoose = require("mongoose");
  const userSchema = new mongoose.Schema({
    name: String,
  
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  
    password: {
      type: String,
      select: false,
    },
  
    phone: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["admin", "investor", "broker"],
      default: "investor",
    },
  
    // 🔥 ADD THESE
    pan: String,
    rera: String,
  
    isVerified: { type: Boolean, default: false },
  
    otp: String,
    otpExpiry: Date,
  
    kycDocument: String,
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  
    lastOtpSent: Date,
    // ================= INVESTOR REFERRAL =================

referralCode: {
  type: String,
  unique: true,
  sparse: true,
},

referredBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

referralCodeUsed: {
  type: String,
  default: null,
},
    isApproved: {
      type: Boolean,
      default: false,
    },
  
    commissionRate: {
      type: Number,
      default: 10,
    },
  
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
  }, { timestamps: true });

  module.exports = mongoose.model("User", userSchema);