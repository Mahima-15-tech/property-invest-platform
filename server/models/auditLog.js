const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: String,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    details: String,

    type: {
      type: String,
      enum: ["create", "approval", "transaction", "security", "update"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);