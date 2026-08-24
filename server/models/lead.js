const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },

  name: String,
  email: String,
  phone: String,
  message: String,

  status: {
    type: String,
    enum: ["new", "contacted", "closed"],
    default: "new",
  }

}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);