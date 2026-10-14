const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ======================================================
// DYNAMIC CLOUDINARY STORAGE
// ======================================================

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    let resourceType = "auto";

    // VIDEO
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    }

    // PDF / CSV
   // PDF / CSV / APK
else if (
  file.mimetype === "application/pdf" ||
  file.mimetype === "text/csv" ||
  file.mimetype === "application/vnd.android.package-archive" ||
  file.originalname.toLowerCase().endsWith(".pdf") ||
  file.originalname.toLowerCase().endsWith(".csv") ||
  file.originalname.toLowerCase().endsWith(".apk")
) {
  resourceType = "raw";
}

    return {
      folder: req.uploadFolder || "properties",
      resource_type: resourceType,
    };
  },
});


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB
  },

  fileFilter: (req, file, cb) => {
    console.log("========== FILE ==========");
    console.log("Field:", file.fieldname);
    console.log("Name :", file.originalname);
    console.log("Mime :", file.mimetype);
    console.log("Ext  :", path.extname(file.originalname));

    const allowedExtensions =
  /\.(jpg|jpeg|png|webp|svg|mp4|webm|mov|avi|pdf|csv|apk)$/i;

  const isApk =
  file.originalname.toLowerCase().endsWith(".apk") &&
  [
    "application/vnd.android.package-archive",
    "application/octet-stream",
  ].includes(file.mimetype);

    const extName = allowedExtensions.test(
      path.extname(file.originalname).toLowerCase()
    );

    const isImage =
      file.mimetype.startsWith("image/");

    const isVideo =
      file.mimetype.startsWith("video/");

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
      isCsv,
    });

    if (
      (isImage || isVideo || isPdf || isCsv || isApk) &&
      extName
    ) {
      return cb(null, true);
    }

    console.log(
      "❌ Rejected:",
      file.originalname
    );

    cb(
      new Error(
        "Only images, videos, PDFs, CSVs and APK files are allowed"
      )
    );
  },
});

// ======================================================
// KYC DOCUMENT UPLOAD
// ======================================================

const uploadKycFile = upload.single("document");
// ======================================================
// CONTACT REQUEST MULTIPLE DOCUMENTS
// ======================================================

const uploadContactDocuments = (req, res, next) => {
  upload.array("documents", 10)(req, res, (err) => {
    if (err) {
      console.error("CONTACT DOCUMENT UPLOAD ERROR:", err);

      return res.status(400).json({
        success: false,
        message: err.message || "Document upload failed",
      });
    }

    next();
  });
};

// ======================================================
// PROPERTY UPLOADS
// ======================================================

const uploadFields = (req, res, next) => {
  upload.fields([
    {
      name: "images",
      maxCount: 20,
    },
    {
      name: "documents",
      maxCount: 20,
    },
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "brochure",
      maxCount: 1,
    },
  ])(req, res, (err) => {
    if (err) {
      console.error(
        "❌ MULTER / CLOUDINARY UPLOAD ERROR:",
        err
      );

      return res.status(400).json({
        message: "File upload failed",
        error: err.message || err,
      });
    }

    next();
  });
};

// ======================================================
// GENERAL SINGLE DOCUMENT
// ======================================================

const uploadSingle =
  upload.single("document");

// ======================================================
// PAYMENT QR CODE
// ======================================================

const uploadPaymentQR = (req, res, next) => {
  req.uploadFolder = "payment-settings";

  return upload.single("qrCode")(
    req,
    res,
    (err) => {
      if (err) {
        console.error(
          "❌ PAYMENT QR UPLOAD ERROR:",
          err
        );

        return res.status(400).json({
          message: "QR code upload failed",
          error: err.message || err,
        });
      }

      next();
    }
  );
};

// ======================================================
// OWNERSHIP PAYMENT PROOF
// ======================================================

const uploadOwnershipPayment = (
  req,
  res,
  next
) => {
  req.uploadFolder = "ownership-payments";

  return upload.single("file")(
    req,
    res,
    next
  );
};

// ======================================================
// BROKER DOCUMENT
// ======================================================

const uploadBrokerDoc = (
  req,
  res,
  next
) => {
  req.uploadFolder = "brokers";

  return upload.single("file")(
    req,
    res,
    next
  );
};

// ======================================================
// BLOG COVER IMAGE
// ======================================================

const uploadBlogImage = (
  req,
  res,
  next
) => {
  req.uploadFolder = "blogs";

  return upload.single("coverImage")(
    req,
    res,
    (err) => {
      if (err) {
        console.error(
          "❌ BLOG IMAGE UPLOAD ERROR:",
          err
        );

        return res.status(400).json({
          message: "Blog image upload failed",
          error: err.message || err,
        });
      }

      next();
    }
  );
};

// ======================================================
// ADMIN KYC DOCUMENTS
// ======================================================

const uploadKycDocuments = (req, res, next) => {
  req.uploadFolder = "kyc-documents";

  upload.fields([
    { name: "panFile", maxCount: 1 },
    { name: "aadhaarFile", maxCount: 1 },
    { name: "cancelCheque", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error("KYC DOCUMENT UPLOAD ERROR:", err);

      return res.status(400).json({
        success: false,
        message: err.message || "KYC document upload failed",
      });
    }

    // Multer should have parsed the multipart form
    req.body = req.body || {};

    next();
  });
};

// ======================================================
// ANDROID APK UPLOAD
// ======================================================

const uploadApk = (req, res, next) => {
  req.uploadFolder = "mobile-app";

  console.log("APK upload middleware reached");
  console.log("Multer limit:", upload.limits?.fileSize);

  upload.single("apk")(req, res, (err) => {
    if (err) {
      console.error("APK UPLOAD ERROR:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);

      return res.status(400).json({
        success: false,
        message: err.message || "APK upload failed",
        code: err.code || null,
      });
    }

    console.log("Multer upload complete");
    console.log("Uploaded file:", req.file?.originalname);
    console.log("Uploaded file size:", req.file?.size);

    next();
  });
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  uploadFields,
  uploadSingle,
  uploadBrokerDoc,
  uploadOwnershipPayment,
  uploadPaymentQR,
  uploadBlogImage,
  uploadKycFile,
  uploadContactDocuments,
  uploadKycDocuments,
  uploadApk,
};