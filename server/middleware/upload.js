const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 🔥 COMMON STORAGE (dynamic folder)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = "auto";

    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    }

    return {
      folder: req.uploadFolder || "properties", // 🔥 dynamic folder
      resource_type: resourceType,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image") ||
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("video")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images, videos & PDFs allowed"), false);
    }
  },
});

// ✅ PROPERTY (unchanged)
const uploadFields = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "documents", maxCount: 5 },
  { name: "video", maxCount: 1 },
  { name: "brochure", maxCount: 1 },
]);

// ✅ PROPERTY single (existing)
const uploadSingle = upload.single("document");

// ✅ 🔥 NEW FOR BROKER
const uploadBrokerDoc = (req, res, next) => {
  req.uploadFolder = "brokers"; // 🔥 separate folder
  return upload.single("file")(req, res, next);
};

module.exports = {
  uploadFields,
  uploadSingle,
  uploadBrokerDoc, // 🔥 export this
};