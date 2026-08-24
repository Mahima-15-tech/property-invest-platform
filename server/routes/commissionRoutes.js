const express = require("express");
const router = express.Router();

const broker = require("../controllers/brokercontroller");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get(
  "/",
  protect,
  authorize("broker"),
  broker.getBrokerCommission
);
// router.get("/commission-breakdown", getCommissionBreakdown);

module.exports = router;