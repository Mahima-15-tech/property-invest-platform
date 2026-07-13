const express = require("express");
const router = express.Router();

const admin = require("../controllers/adminController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");


router.post("/login", admin.adminLogin);

router.patch(
  "/approve-broker/:id",
  protect,             
  authorize("admin"),   
  admin.approveBroker
);

router.patch(
  "/kyc/:id/approve",
  protect,
  authorize("admin"),
  admin.approveKyc
);

router.patch(
  "/kyc/:id/reject",
  protect,
  authorize("admin"),
  admin.rejectKyc
);

router.put(
  "/investments/:id/approve",
  protect,
  authorize("admin"),
  admin.approveInvestment
);

router.put(
  "/investments/:id/reject",
  protect,
  authorize("admin"),
  admin.rejectInvestment
);




module.exports = router;