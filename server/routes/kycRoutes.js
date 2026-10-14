const express = require("express");
const router = express.Router();

const kyc = require("../controllers/kycController");
const protect = require("../middleware/authmiddleware");
const {
  uploadKycFile,
  uploadKycDocuments,
} = require("../middleware/upload");

router.post("/basic", protect, kyc.saveBasicInfo);
router.post("/pan", protect, uploadKycFile, kyc.uploadPan);
router.post("/aadhaar", protect, uploadKycFile, kyc.uploadAadhaar);
router.post("/nominee", protect, kyc.saveNominee); 
router.post("/bank", protect, uploadKycFile, kyc.saveBank); 
router.get("/", protect, kyc.getKyc);
router.post("/submit", protect, kyc.submitKyc);

router.put(
  "/investors/:id/kyc",
  protect,
  uploadKycDocuments,
  kyc.updateKycDetails
);




module.exports = router;