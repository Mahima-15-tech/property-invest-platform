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
<<<<<<< HEAD
    enum: ["pending", "payment_done", "approved", "rejected"],
    default: "pending",
  },
=======
    enum:[
      "pending",
      "payment_done",
      "approved",
      "rejected",
      "exited"
      ],
    default: "pending",
  },

  requestedShares: {
    type: Number,
  },
  
  requestedAmount: {
    type: Number,
  },
>>>>>>> backup-local
  
  method: {
    type: String,
    default: "Bank Transfer",
  },

<<<<<<< HEAD
=======
  canEdit: {
    type: Boolean,
    default: false,
},

>>>>>>> backup-local
}, { timestamps: true });

module.exports = mongoose.model("Investment", investmentSchema);