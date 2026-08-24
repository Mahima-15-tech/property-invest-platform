const express = require("express");
const router = express.Router();

const kyc = require("../controllers/kycController");
const protect = require("../middleware/authmiddleware");
const { uploadSingle } = require("../middleware/upload");

router.post("/basic", protect, kyc.saveBasicInfo);
router.post("/pan", protect, uploadSingle, kyc.uploadPan);
router.post("/aadhaar", protect, uploadSingle, kyc.uploadAadhaar);
router.post("/nominee", protect, kyc.saveNominee); 
router.post("/bank", protect, uploadSingle, kyc.saveBank); 
router.get("/", protect, kyc.getKyc);
router.post("/submit", protect, kyc.submitKyc);


module.exports = router;