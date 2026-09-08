const mongoose = require("mongoose");

const ownershipRequestSchema = new mongoose.Schema(
  {
    // ==========================================
    // BUYER / INVESTOR
    // ==========================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // PROPERTY
    // ==========================================

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    // ==========================================
    // BUYER'S EXISTING INVESTMENT
    // ==========================================

    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
      required: true,
    },

    // ==========================================
    // CURRENT OWNERSHIP
    // ==========================================

    currentShares: {
      type: Number,
      required: true,
      default: 0,
    },

    currentOwnershipPercent: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // TARGET / ADDITIONAL SHARES
    // ==========================================

    requestedShares: {
      type: Number,
      required: true,
      default: 0,
    },

    totalSharesAfterTransfer: {
      type: Number,
      default: 0,
    },

    targetOwnershipPercent: {
      type: Number,
      default: 100,
    },

    // ==========================================
    // SHARE PRICE / PAYMENT
    // ==========================================

    pricePerShare: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    // ==========================================
    // ADMIN SHARE ASSIGNMENT
    // ==========================================

    /*
      Example:

      Buyer A wants 80 shares.

      Investor B -> 40 shares
      Investor C -> 40 shares

      allocations = [
        {
          investmentId: B investment,
          userId: B user,
          shares: 40,
          amount: 40000
        },
        {
          investmentId: C investment,
          userId: C user,
          shares: 40,
          amount: 40000
        }
      ]
    */

    assignments: [
      {
        investmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Investment",
        },

        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        shares: {
          type: Number,
          default: 0,
        },

        pricePerShare: {
          type: Number,
          default: 0,
        },

        amount: {
          type: Number,
          default: 0,
        },
      },
    ],

    assignedShares: {
      type: Number,
      default: 0,
    },

    assignmentCompletedAt: {
      type: Date,
    },

    assignmentCompletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ==========================================
    // REQUEST STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "pending",
        "assignment_pending",
        "payment_pending",
        "payment_submitted",
        "payment_verified",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    // ==========================================
    // PAYMENT
    // ==========================================

    paymentStatus: {
      type: String,
      enum: [
        "not_paid",
        "payment_submitted",
        "verified",
        "rejected",
      ],
      default: "not_paid",
    },

    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "UPI"],
      default: "Bank Transfer",
    },

    paymentReference: {
      type: String,
      default: "",
    },

    paymentProof: {
      type: String,
      default: "",
    },

    paymentSubmittedAt: {
      type: Date,
    },

    paymentVerifiedAt: {
      type: Date,
    },

    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ==========================================
    // ADMIN APPROVAL
    // ==========================================

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejectedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "OwnershipRequest",
  ownershipRequestSchema
);