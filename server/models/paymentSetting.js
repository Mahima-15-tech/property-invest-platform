const mongoose = require("mongoose");

const paymentSettingSchema = new mongoose.Schema(
  {
    // =========================
    // BANK DETAILS
    // =========================

    accountName: {
      type: String,
      default: "",
      trim: true,
    },

    accountNumber: {
      type: String,
      default: "",
      trim: true,
    },

    ifscCode: {
      type: String,
      default: "",
      trim: true,
    },

    bankName: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // UPI DETAILS
    // =========================

    upiId: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // QR CODE
    // =========================

    qrCode: {
      type: String,
      default: "",
    },

    // =========================
    // UPDATED BY
    // =========================

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PaymentSetting",
  paymentSettingSchema
);