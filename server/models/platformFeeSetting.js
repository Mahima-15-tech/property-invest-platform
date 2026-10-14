const mongoose = require("mongoose");

const platformFeeSettingSchema = new mongoose.Schema(
  {
    platformFeeRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PlatformFeeSetting",
  platformFeeSettingSchema
);