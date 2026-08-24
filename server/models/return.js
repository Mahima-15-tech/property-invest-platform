const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },

  type: {
    type: String,
    enum: ["rental", "valuation"],
  },

  amount: Number,

  status: {
    type: String,
    enum: ["processed", "pending"],
    default: "processed",
  },

  date: Date,
}, { timestamps: true });

module.exports = mongoose.model("Return", returnSchema);