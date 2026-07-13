const mongoose = require("mongoose");

const exitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Exit", exitSchema);