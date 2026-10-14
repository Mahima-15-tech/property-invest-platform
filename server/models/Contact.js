const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    subject: {
      type: String,
    },

    type: {
      type: String,
      enum: [
        "contact_change",
        "bank_change",
        "other",
        "general",
      ],
      default: "general",
    },

    message: {
      type: String,
      required: true,
    },

    requestedChanges: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "resolved",
        "rejected",
      ],
      default: "pending",
    },

    adminRemark: {
      type: String,
      default: "",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    documents: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
        originalName: {
          type: String,
          default: "",
        },
        mimeType: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactSchema);