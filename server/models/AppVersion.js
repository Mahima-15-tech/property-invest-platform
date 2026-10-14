const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      trim: true,
    },
    releaseNotes: {
      type: String,
      default: "",
    },
    apkUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AppVersion ||
  mongoose.model("AppVersion", appVersionSchema);