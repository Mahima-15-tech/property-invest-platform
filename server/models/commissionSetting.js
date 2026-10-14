  const mongoose = require("mongoose");

  const commissionSettingSchema = new mongoose.Schema(
    {
      commissionRate: {
        type: Number,
        default: 10,
        min: 0,
        max: 100,
      },
      paidAt: {
        type: Date,
        default: null,
      },

      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model(
    "CommissionSetting",
    commissionSettingSchema
  );