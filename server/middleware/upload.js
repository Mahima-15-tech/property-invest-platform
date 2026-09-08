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
    else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".pdf") ||
      file.originalname.toLowerCase().endsWith(".csv")
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
    fileSize: 200 * 1024 * 1024,
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
      (isImage || isVideo || isPdf || isCsv) &&
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
        "Only images, videos, PDFs and CSV files are allowed"
      )
    );
  },
});

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
// EXPORTS
// ======================================================

module.exports = {
  uploadFields,
  uploadSingle,
  uploadBrokerDoc,
  uploadOwnershipPayment,
  uploadPaymentQR,
  uploadBlogImage,
};