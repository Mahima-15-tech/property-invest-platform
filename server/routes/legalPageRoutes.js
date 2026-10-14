const express = require("express");
const router = express.Router();

const legalPageController = require("../controllers/legalPageController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// Admin: get all pages
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  legalPageController.getAdminLegalPages
);

// Admin: update, save draft or publish
router.put(
  "/admin/:slug",
  protect,
  authorize("admin"),
  legalPageController.updateLegalPage
);

// Public: only published page
router.get(
  "/:slug",
  legalPageController.getPublicLegalPage
);

module.exports = router;