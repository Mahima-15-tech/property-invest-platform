const express = require("express");

const router = express.Router();

const property = require("../controllers/propertyController");

const protect = require("../middleware/authmiddleware");

const authorize = require("../middleware/roleMiddleware");

const { uploadFields } = require("../middleware/upload");


// ======================================================
// CREATE PROPERTY
// ======================================================

router.post(
  "/create",
  protect,
  authorize("admin"),
  uploadFields,
  property.createProperty
);


// ======================================================
// PROPERTY LIST
// ======================================================

router.get(
  "/list",
  protect,
  property.getPropertiesList
);


// ======================================================
// EXPLORE PROPERTIES
// ======================================================

router.get(
  "/explore",
  property.exploreProperties
);


// ======================================================
// FEATURED PROPERTIES
// ======================================================

router.get(
  "/featured",
  property.getFeaturedProperties
);


// ======================================================
// RELATED PROPERTIES
// ======================================================

router.get(
  "/related/:id",
  property.getRelatedProperties
);


// ======================================================
// ALL PROPERTIES
// ======================================================

router.get(
  "/",
  property.getAllProperties
);


// ======================================================
// NEARBY PROPERTIES
// ======================================================

router.get(
  "/nearby",
  property.getNearbyProperties
);


// ======================================================
// DELETED PROPERTIES
// ======================================================

router.get(
  "/deleted",
  property.getDeletedProperties
);


// ======================================================
// RESTORE PROPERTY
// ======================================================

router.patch(
  "/:id/restore",
  property.restoreProperty
);


// ======================================================
// GET SINGLE PROPERTY
// ======================================================

router.get(
  "/:id",
  property.getPropertyById
);


// ======================================================
// UPDATE PROPERTY
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadFields,
  property.updateProperty
);


// ======================================================
// TOGGLE FEATURED
// ======================================================

router.patch(
  "/:id/featured",
  protect,
  authorize("admin"),
  property.toggleFeatured
);


// ======================================================
// DELETE PROPERTY
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  property.deleteProperty
);


module.exports = router;