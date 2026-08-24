const express = require("express");
const router = express.Router();

const portfolio = require("../controllers/portfolioController");
const protect = require("../middleware/authmiddleware");

router.get("/", protect, portfolio.getPortfolio);

router.get("/returns", protect, portfolio.getReturnHistory);
router.post("/create-payments", protect, portfolio.createPayment);
router.get("/payments", protect, portfolio.getPaymentHistory);
router.get("/documents", protect, portfolio.getDocuments);
router.post("/exit", protect, portfolio.createExitRequest);
router.get("/exits", protect, portfolio.getExitRequests);
router.get("/completed", protect, portfolio.getCompletedInvestments);

module.exports = router;