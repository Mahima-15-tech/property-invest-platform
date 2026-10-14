const mongoose = require("mongoose");

const legalPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "privacy-policy",
        "terms-and-conditions",
        "refund-cancellation-policy",
        "shipping-delivery-policy",
        "grievance-officer",
        "cookie-policy",
        "account-data-deletion",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LegalPage", legalPageSchema);