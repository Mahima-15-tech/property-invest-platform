const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },

    amount: Number,

    // ✅ ADD THESE 👇
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    method: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);