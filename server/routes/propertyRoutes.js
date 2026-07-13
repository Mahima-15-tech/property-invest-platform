const express = require("express");
const router = express.Router();

const property = require("../controllers/propertyController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");
const { uploadFields } = require("../middleware/upload");

// router.post("/", protect, authorize("admin"), property.createProperty);
router.post(
  "/create",
  protect,
  authorize("admin"),
  uploadFields, 
  property.createProperty
);

router.get("/list", protect, property.getPropertiesList);

router.get("/explore", property.exploreProperties);
router.get("/featured", property.getFeaturedProperties);
router.get("/related/:id", property.getRelatedProperties); 

router.get("/", property.getAllProperties);

router.get("/:id", property.getPropertyById);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadFields,
  property.updateProperty
);
router.delete("/:id", protect, authorize("admin"), property.deleteProperty);

module.exports = router;