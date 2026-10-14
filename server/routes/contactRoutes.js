const express = require("express");
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getMyContacts,
  resolveContact,
} = require("../controllers/contactController");

const auth = require("../middleware/authmiddleware");
const isAdmin = require("../middleware/roleMiddleware");

const {
  uploadContactDocuments,
} = require("../middleware/upload");

// USER ROUTES
router.post(
  "/",
  auth,
  uploadContactDocuments,
  createContact
);

router.get("/my", auth, getMyContacts);

// ADMIN ROUTES
router.get("/", auth, isAdmin("admin"), getAllContacts);

router.put(
  "/:id/resolve",
  auth,
  isAdmin("admin"),
  resolveContact
);

module.exports = router;