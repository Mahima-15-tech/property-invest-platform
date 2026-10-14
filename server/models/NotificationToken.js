const mongoose = require("mongoose");

const notificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "NotificationToken",
  notificationTokenSchema
);