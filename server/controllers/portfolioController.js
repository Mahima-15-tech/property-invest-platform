const Investment = require("../models/investment");
const Property = require("../models/property");
const Return = require("../models/return");
const Payment = require("../models/payment");
const Exit = require("../models/exit");

exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const investments = await Investment.find({
      userId,
      status: "approved", 
    }).populate("propertyId");

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalShares = 0;
    let totalRental = 0;

<<<<<<< HEAD
    const items = investments.map((inv) => {
=======
    console.log("Investments:");

investments.forEach((inv) => {
  console.log({
    investmentId: inv._id,
    propertyId: inv.propertyId,
  });
});

    const validInvestments = investments.filter(inv => inv.propertyId);

    const items = validInvestments.map((inv) => {
>>>>>>> backup-local
      const p = inv.propertyId;

      const priceNow = p.currentPricePerShare || p.pricePerShare || 0;

      const currentValue = inv.shares * priceNow;
      const invested = inv.amount || (inv.shares * (inv.pricePerShare || p.pricePerShare || 0));
      const profit = currentValue - invested;

      const ownership = p.totalShares
        ? (inv.shares / p.totalShares) * 100
        : 0;

<<<<<<< HEAD
=======
        console.log("========== PORTFOLIO DEBUG ==========");
console.log("Property:", p.name);
console.log("Shares Purchased:", inv.shares);
console.log("Total Shares:", p.totalShares);
console.log("Ownership:", ownership);
console.log("=====================================");

>>>>>>> backup-local
      const rentalYield = p.rentalYield || 0;
      const rentalIncome = (invested * rentalYield) / 100;

      totalInvested += invested;
      totalCurrentValue += currentValue;
      totalShares += inv.shares;
      totalRental += rentalIncome;

      return {
<<<<<<< HEAD
=======
        investmentId: inv._id,
>>>>>>> backup-local
        propertyId: p._id,
        propertyName: p.name,
        location: p.location?.city,
        shares: inv.shares,
        invested,
        currentValue,
        roi: p.roi || 0,
        ownership: Number(ownership.toFixed(1)),
        profit,
        rentalYield,
        incomeReceived: rentalIncome,
        image: p.media?.images?.[0] || null,
      
        documents: p.media?.documents || [], // ✅ ADD
      };
    });

    const expectedReturn = totalInvested
<<<<<<< HEAD
  ? investments.reduce((sum, inv) => {
=======
  ? validInvestments.reduce((sum, inv) => {
>>>>>>> backup-local
      const roi = inv.propertyId?.roi || 0;
      const invested =
        inv.amount ||
        inv.shares *
          (inv.pricePerShare || inv.propertyId?.pricePerShare || 0);

      return sum + (invested * roi) / 100;
    }, 0) / totalInvested
  : 0;

    res.json({
      summary: {
        totalInvested,
        currentValue: totalCurrentValue,
        sharesOwned: totalShares,
        expectedReturn: Number(expectedReturn.toFixed(1)),
        rentalIncome: totalRental,
      },
      investments: items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReturnHistory = async (req, res) => {
  const data = await Return.find({ userId: req.user.id })
    .populate("propertyId", "name")
    .sort({ date: -1 });

  res.json(data.map(r => ({
    property: r.propertyId.name,
    date: r.date,
    type: r.type === "rental"
      ? "Monthly Rental Distribution"
      : "Valuation Gain",
    amount: r.amount,
    status: r.status,
  })));
};

exports.createPayment = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;

    if (!propertyId || !amount) {
      return res.status(400).json({ message: "Missing data" });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      propertyId,
      amount,
      status: "success",
    });

    res.json({
      message: "Payment successful",
      payment,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  const payments = await Payment.find({ userId: req.user.id })
    .populate("propertyId", "name")
    .sort({ createdAt: -1 });

  res.json(
    payments.map(p => ({
      name: p.propertyId?.name,
      amount: p.amount,
      date: p.createdAt,
      status: p.status,
    }))
  );
};

exports.getDocuments = async (req, res) => {
  const investments = await Investment.find({
    userId: req.user.id,
    status: "approved",
  }).populate("propertyId");

  const KYC = require("../models/kyc");
  const kyc = await KYC.findOne({ userId: req.user.id });

  const docs = [];

<<<<<<< HEAD
  // 🔥 property docs
  investments.forEach(inv => {
    inv.propertyId.media?.documents?.forEach(doc => {
      docs.push({
        type: "property",
        property: inv.propertyId.name,
        name: doc.name,
        url: doc.url,
      });
    });
  });
=======
  //  property docs
  investments.forEach((inv) => {

    if (!inv.propertyId) return;

    inv.propertyId.media?.documents?.forEach((doc) => {

        docs.push({
            type: "property",
            property: inv.propertyId.name,
            name: doc.name,
            url: doc.url,
        });

    });

});
>>>>>>> backup-local

  // 🔥 KYC docs
  if (kyc) {
    if (kyc.panFile) {
      docs.push({
        type: "kyc",
        name: "PAN Card",
        url: kyc.panFile,
      });
    }

    if (kyc.aadhaarFile) {
      docs.push({
        type: "kyc",
        name: "Aadhaar",
        url: kyc.aadhaarFile,
      });
    }

    if (kyc.bank?.cancelCheque) {
      docs.push({
        type: "kyc",
        name: "Cancelled Cheque",
        url: kyc.bank.cancelCheque,
      });
    }
  }

  res.json({
    documents: docs,
    kycDetails: kyc
  });
};

exports.createExitRequest = async (req, res) => {
<<<<<<< HEAD
  const { propertyId } = req.body;

  const exit = await Exit.create({
    userId: req.user.id,
    propertyId,
  });

  res.json({
    message: "Exit request submitted",
    exit,
  });
=======
  try {
    const { investmentId, shares } = req.body;

    if (!investmentId || !shares) {
      return res.status(400).json({
        message: "Investment ID and shares are required",
      });
    }

    const investment = await Investment.findOne({
      _id: investmentId,
      userId: req.user.id,
      status: "approved",
    });

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    // User requested more shares than owned
    if (Number(shares) > investment.shares) {
      return res.status(400).json({
        message: "You cannot exit more shares than you own",
      });
    }

    if (Number(shares) <= 0) {
      return res.status(400).json({
        message: "Invalid share quantity",
      });
    }

    // Prevent duplicate pending request
    const pendingExit = await Exit.findOne({
      investmentId: investment._id,
      status: "pending",
    });

    if (pendingExit) {
      return res.status(400).json({
        message: "Exit request already pending for this investment",
      });
    }

    // Calculate amount according to investment price
    const pricePerShare = investment.amount / investment.shares;

    const exitAmount = Number(shares) * pricePerShare;

    const exit = await Exit.create({
      userId: req.user.id,

      investmentId: investment._id,

      propertyId: investment.propertyId,

      shares: Number(shares),

      amount: exitAmount,

      status: "pending",
    });

    res.json({
      message: "Exit request submitted successfully",
      exit,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
>>>>>>> backup-local
};

exports.getCompletedInvestments = async (req, res) => {
  const investments = await Investment.find({
    userId: req.user.id,
    status: "approved"
  }).populate("propertyId");

  res.json(investments);
};


exports.getExitRequests = async (req, res) => {
  const exits = await Exit.find({ userId: req.user.id })
    .populate("propertyId", "name")
    .sort({ createdAt: -1 });

  res.json(
    exits.map(e => ({
      property: e.propertyId?.name,
      status: e.status,
      date: e.createdAt,
    }))
  );
};