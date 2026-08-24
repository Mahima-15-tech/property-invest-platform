const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // 🟢 BASIC INFO
  fullName: String,
  email: String,
  dob: Date,
  address: String,

  // 🟢 PAN
  panNumber: String, // 🔥 ADD
  panFile: String,
  panStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },

  // 🟢 AADHAAR
  aadhaarNumber: String, // 🔥 ADD
  aadhaarFile: String,
  aadhaarStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },

  // 🟢 NOMINEE 🔥 NEW
  nominee: {
    name: String,
    panNumber: String,
    aadhaarNumber: String,
    dob: Date,
  },

  // 🟢 BANK 🔥 NEW
  bank: {
    beneficiaryName: String,
    accountNumber: String,
    ifsc: String,
    branch: String,
    cancelCheque: String,
  },

  // 🟢 STEP TRACKING 🔥 IMPORTANT
  currentStep: {
    type: Number,
    default: 1,
  },

  // 🟢 FINAL STATUS
  status: {
    type: String,
    enum: ["draft", "submitted", "approved", "rejected"],
    default: "draft",
  },

}, { timestamps: true });

module.exports = mongoose.model("KYC", kycSchema);