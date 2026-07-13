const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },

  shares: Number,

  pricePerShare: Number, // 🔥 add
  amount: Number, // total before discount

  discount: {
    type: Number,
    default: 0,
  },

  finalAmount: Number, // after discount

  ownershipPercent: Number, // 🔥 add

  status: {
    type: String,
    enum: ["pending", "payment_done", "approved", "rejected"],
    default: "pending",
  },
  
  method: {
    type: String,
    default: "Bank Transfer",
  },

}, { timestamps: true });

module.exports = mongoose.model("Investment", investmentSchema);