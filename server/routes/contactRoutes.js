const express = require("express");
const router = express.Router();
const { createContact, getAllContacts } = require("../controllers/contactController");
const auth = require("../middleware/authmiddleware");
const isAdmin = require("../middleware/roleMiddleware");


router.post("/", createContact);
router.get("/", auth, isAdmin, getAllContacts);

module.exports = router;