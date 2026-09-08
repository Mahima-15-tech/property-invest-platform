const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },

    // ================= SHARES =================

    shares: {
      type: Number,
      required: true,
    },

    pricePerShare: {
      type: Number,
    },

    // Property ka purchase cycle snapshot
    // 5 ya 10
    shareBuyingCycle: {
      type: Number,
      enum: [5, 10],
      default: 10,
    },

    // Fixed rule
    // 10 shares = 1 stakeholder
    stakeholderUnit: {
      type: Number,
      default: 10,
    },

    // Example:
    // 10 shares = 1 stakeholder
    // 15 shares = 1.5 stakeholder
    // 20 shares = 2 stakeholders
    stakeholderCount: {
      type: Number,
      default: 0,
    },

    // ================= AMOUNT =================

    amount: {
      type: Number,
    },

    discount: {
      type: Number,
      default: 0,
    },

    finalAmount: {
      type: Number,
    },

    ownershipPercent: {
      type: Number,
    },
    
    isFullOwner: {
      type: Boolean,
      default: false,
    },
    
    fullOwnershipDate: {
      type: Date,
    },

    notes: {
      type: String,
      default: "",
    },

    manualInvestorName: {
      type: String,
      default: "",
    },

    // ================= LOCK-IN =================

    // Default 2 years
    lockInYears: {
      type: Number,
      default: 2,
    },

    // Investment/purchase start date
    lockInStartDate: {
      type: Date,
    },

    // Start date + 2 years
    eligibleExitDate: {
      type: Date,
    },


// ================= STATUS =================

status: {
  type: String,

  enum: [
    "pending",
    "payment_done",
    "approved",
    "rejected",
    "exited",
  ],

  default: "pending",
},

// ================= PAYMENT =================

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
  enum: ["Bank Transfer", "UPI" , "Cash"],
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

// ================= APPROVAL SNAPSHOT =================

// Admin-approved shares
approvedShares: {
  type: Number,
},

// Automatically calculated from approvedShares
approvedAmount: {
  type: Number,
},
    // ================= REQUEST =================

    requestedShares: {
      type: Number,
    },

    requestedAmount: {
      type: Number,
    },

    method: {
      type: String,
      default: "Bank Transfer",
    },

    // ================= BROKER REFERRAL =================

referredByBroker: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

brokerReferralCode: {
  type: String,
  default: "",
},

    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);