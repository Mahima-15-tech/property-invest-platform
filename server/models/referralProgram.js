const mongoose = require("mongoose");

const referralProgramSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },

    giftName: {
      type: String,
      required: true,
      default: "Gift Voucher",
      trim: true,
    },

    giftDescription: {
      type: String,
      default: "",
      trim: true,
    },

    eligibility: {
      type: String,
      enum: ["investment_successful"],
      default: "investment_successful",
    },

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
  "ReferralProgram",
  referralProgramSchema
);