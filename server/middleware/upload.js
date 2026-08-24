const multer = require("multer");
<<<<<<< HEAD
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 🔥 COMMON STORAGE (dynamic folder)
=======
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 🔥 DYNAMIC STORAGE
>>>>>>> backup-local
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = "auto";

<<<<<<< HEAD
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
=======
    // Cloudinary video aur raw files (PDF/Docs) ke liye specific resource_type maangta hai
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    }else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".pdf") ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      resourceType = "raw";
>>>>>>> backup-local
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
<<<<<<< HEAD
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
=======
    fileSize: 200 * 1024 * 1024, // 200MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("========== FILE ==========");
    console.log("Field:", file.fieldname);
    console.log("Name :", file.originalname);
    console.log("Mime :", file.mimetype);
    console.log("Ext  :", path.extname(file.originalname));
  
    const allowedExtensions =
    /\.(jpg|jpeg|png|webp|svg|mp4|webm|mov|avi|pdf|csv)$/i;
  
    const extName = allowedExtensions.test(
      path.extname(file.originalname).toLowerCase()
    );
  
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/x-pdf" ||
      file.mimetype === "application/octet-stream";
      const isCsv =
  file.mimetype === "text/csv" ||
  file.originalname.toLowerCase().endsWith(".csv");
  
    console.log({
      extName,
      isImage,
      isVideo,
      isPdf,
    });
  
    if ((isImage || isVideo || isPdf || isCsv) && extName) {
      return cb(null, true);
    }
  
    console.log("❌ Rejected:", file.originalname);
  
    cb(new Error("Only images, videos & PDFs allowed"));
  }
>>>>>>> backup-local
});

// ✅ PROPERTY (unchanged)
const uploadFields = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "documents", maxCount: 5 },
  { name: "video", maxCount: 1 },
  { name: "brochure", maxCount: 1 },
]);

<<<<<<< HEAD
// ✅ PROPERTY single (existing)
const uploadSingle = upload.single("document");

// ✅ 🔥 NEW FOR BROKER
const uploadBrokerDoc = (req, res, next) => {
  req.uploadFolder = "brokers"; // 🔥 separate folder
=======
// ✅ PROPERTY single
const uploadSingle = upload.single("document");

// ✅ NEW FOR BROKER
const uploadBrokerDoc = (req, res, next) => {
  req.uploadFolder = "brokers";
>>>>>>> backup-local
  return upload.single("file")(req, res, next);
};

module.exports = {
  uploadFields,
  uploadSingle,
<<<<<<< HEAD
  uploadBrokerDoc, // 🔥 export this
=======
  uploadBrokerDoc,
>>>>>>> backup-local
};