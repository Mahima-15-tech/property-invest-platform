const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({
  brokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },

  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },

  
  type: {
    type: String,
    enum: ["sale", "referral", "performance"],
  },

  
  amount: Number,
  commissionAmount: Number,

}, { timestamps: true });

module.exports = mongoose.model("Commission", commissionSchema);