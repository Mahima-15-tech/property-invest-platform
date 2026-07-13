const express = require("express");
const router = express.Router();

const user = require("../controllers/userController");
const protect = require("../middleware/authmiddleware");
const { uploadSingle } = require("../middleware/upload");

router.post(
  "/kyc-upload",
  protect,
  uploadSingle, // ✅ correct
  user.uploadKyc
);

router.get("/kyc-status", protect, user.getKycStatus);
router.get("/investors", protect, user.getAllInvestors);
router.put("/kyc/:id", protect, user.updateKycStatus);
router.get("/investor/:id", protect, user.getInvestorDetails);
router.get("/investors/export", protect, user.exportInvestorsPDF);
router.get("/list", protect, user.getUsersList);
router.post("/watchlist", protect, user.toggleWatchlist);
router.get("/watchlist", protect, user.getWatchlist);

module.exports = router;