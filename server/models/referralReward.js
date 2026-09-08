const mongoose = require("mongoose");

const referralRewardSchema = new mongoose.Schema(
  {
    // Investor A - jisko reward milega
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Investor B - jisne referral use karke investment ki
    referredInvestor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // B ne jo referral code use kiya tha
    referralCode: {
      type: String,
      required: true,
    },

    // Gift snapshot
    giftName: {
      type: String,
      required: true,
    },

    giftDescription: {
      type: String,
      default: "",
    },

    // Jis investment ki wajah se reward eligible hua
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
      required: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },

    // ================= STATUS =================

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    // ================= GIFT STATUS =================

    giftStatus: {
      type: String,
      enum: [
        "not_issued",
        "issued",
      ],
      default: "not_issued",
    },

    // ================= ADMIN =================

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    issuedAt: {
      type: Date,
      default: null,
    },

    // Optional: agar admin gift/voucher code enter kare
    giftCode: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Ek referred investor se ek hi referral reward
referralRewardSchema.index(
  {
    referredInvestor: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "ReferralReward",
  referralRewardSchema
);