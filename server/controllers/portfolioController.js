const Investment = require("../models/investment");
const Property = require("../models/property");
const Return = require("../models/return");
const Payment = require("../models/payment");
const Exit = require("../models/exit");

exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    // ==========================================
    // GET ALL USER INVESTMENTS
    // ==========================================

    const allInvestments = await Investment.find({
      userId,
    })
      .populate("propertyId")
      .sort({ createdAt: -1 });

    // ==========================================
    // VALID INVESTMENTS
    // ==========================================

    const validInvestments =
      allInvestments.filter(
        (inv) => inv.propertyId
      );

    // ==========================================
    // APPROVED INVESTMENTS
    // Only these count in portfolio summary
    // ==========================================

    const approvedInvestments =
      validInvestments.filter(
        (inv) =>
          inv.status === "approved"
      );

    // ==========================================
    // PENDING / UNDER REVIEW
    // ==========================================

    const pendingInvestments =
      validInvestments.filter(
        (inv) =>
          inv.status !== "approved" &&
          inv.status !== "rejected"
      );

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalShares = 0;
    let totalRental = 0;

    // ==========================================
    // ACTIVE / APPROVED INVESTMENTS
    // ==========================================

    const items =
      approvedInvestments.map((inv) => {

        const p = inv.propertyId;

        const priceNow =
          p.currentPricePerShare ||
          p.pricePerShare ||
          0;

        const invested =
          inv.amount ||
          inv.shares *
            (
              inv.pricePerShare ||
              p.pricePerShare ||
              0
            );

        const currentValue =
          inv.shares * priceNow;

        const profit =
          currentValue - invested;

        const ownership =
          p.totalShares
            ? (
                inv.shares /
                p.totalShares
              ) * 100
            : 0;

        const rentalYield =
          p.rentalYield || 0;

        const rentalIncome =
          (
            invested *
            rentalYield
          ) / 100;

        totalInvested += invested;
        totalCurrentValue += currentValue;
        totalShares += inv.shares;
        totalRental += rentalIncome;

        return {
          investmentId: inv._id,
          propertyId: p._id,

          propertyName:
            p.name,

          location:
            p.location?.city || "",

          state:
            p.location?.state || "",

          image:
            p.media?.images?.[0] ||
            null,

          type:
            p.type || "Property",

          totalValue:
            p.totalValue || 0,

          sharePrice:
            priceNow,

          lockInYears:
            p.lockInYears ?? 2,

          totalShares:
            p.totalShares || 0,

          enableFullOwnership:
            p.enableFullOwnership ?? false,

          shares:
            inv.shares,

          invested,

          currentValue,

          roi:
            p.roi || 0,

          ownership:
            Number(
              ownership.toFixed(1)
            ),

          profit,

          rentalYield,

          incomeReceived:
            rentalIncome,

          documents:
            p.media?.documents || [],

          // STATUS
          status:
            inv.status,

          paymentStatus:
            inv.paymentStatus,

          createdAt:
            inv.createdAt,
        };
      });

    // ==========================================
    // PENDING INVESTMENTS
    // ==========================================

    const pendingItems =
      pendingInvestments.map((inv) => {

        const p = inv.propertyId;

        const amount =
          inv.amount ||
          inv.requestedAmount ||
          (
            (inv.shares ||
              inv.requestedShares ||
              0) *
            (
              inv.pricePerShare ||
              p.pricePerShare ||
              0
            )
          );

        return {
          investmentId:
            inv._id,

          propertyId:
            p._id,

          propertyName:
            p.name,

          location:
            p.location?.city || "",

          state:
            p.location?.state || "",

          image:
            p.media?.images?.[0] ||
            null,

          type:
            p.type || "Property",

          shares:
            inv.shares ||
            inv.requestedShares ||
            0,

          amount,

          sharePrice:
            inv.pricePerShare ||
            p.pricePerShare ||
            0,

          // IMPORTANT STATUS
          status:
            inv.status,

          paymentStatus:
            inv.paymentStatus,

          createdAt:
            inv.createdAt,
        };
      });

    // ==========================================
    // EXPECTED RETURN
    // ==========================================

    const expectedReturn =
      totalInvested
        ? approvedInvestments.reduce(
            (sum, inv) => {

              const roi =
                inv.propertyId?.roi || 0;

              const invested =
                inv.amount ||
                inv.shares *
                  (
                    inv.pricePerShare ||
                    inv.propertyId
                      ?.pricePerShare ||
                    0
                  );

              return (
                sum +
                (
                  invested *
                  roi
                ) / 100
              );
            },
            0
          ) / totalInvested
        : 0;

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.json({

      summary: {
        totalInvested,
        currentValue:
          totalCurrentValue,
        sharesOwned:
          totalShares,
        expectedReturn:
          Number(
            expectedReturn.toFixed(1)
          ),
        rentalIncome:
          totalRental,
      },

      // APPROVED INVESTMENTS
      investments:
        items,

      // PENDING INVESTMENTS
      pendingInvestments:
        pendingItems,
    });

  } catch (err) {

    console.error(
      "GET PORTFOLIO ERROR:",
      err
    );

    return res.status(500).json({
      error:
        err.message,
    });
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
  try {
    const userId = req.user.id;

    const payments = await Investment.find({
      userId,
    })
      .populate(
        "propertyId",
        "name location media pricePerShare"
      )
      .sort({ createdAt: -1 });

    const formattedPayments = payments.map((investment) => {

      const property = investment.propertyId;

      return {
        paymentId: investment._id,

        // ================= PROPERTY =================

        propertyId: property?._id || null,

        propertyName:
          property?.name || "Property",

        location:
          property?.location?.city || "",

        image:
          property?.media?.images?.[0] || null,


        // ================= PAYMENT =================

        amount:
          investment.amount ||
          investment.requestedAmount ||
          0,

        shares:
          investment.shares ||
          investment.requestedShares ||
          0,

        pricePerShare:
          investment.pricePerShare ||
          property?.pricePerShare ||
          0,


        // ================= STATUS =================

        investmentStatus:
          investment.status || "pending",

        paymentStatus:
          investment.paymentStatus || "pending",


        // ================= DATE =================

        date:
          investment.createdAt,


        // ================= MESSAGE =================

        message:
          `You paid ₹${
            (
              investment.amount ||
              investment.requestedAmount ||
              0
            ).toLocaleString("en-IN")
          } for ${
            investment.shares ||
            investment.requestedShares ||
            0
          } shares`,
      };
    });

    return res.status(200).json({
      success: true,
      payments: formattedPayments,
    });

  } catch (error) {

    console.error(
      "GET PAYMENT HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch payment history",
    });
  }
};

exports.getDocuments = async (req, res) => {
  const investments = await Investment.find({
    userId: req.user.id,
    status: "approved",
  }).populate("propertyId");

  const KYC = require("../models/kyc");
  const kyc = await KYC.findOne({ userId: req.user.id });

  const docs = [];

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
  try {
    const { investmentId, shares } = req.body;

    // ==========================================
    // 1. BASIC VALIDATION
    // ==========================================

    if (!investmentId || shares === undefined) {
      return res.status(400).json({
        message: "Investment ID and shares are required",
      });
    }

    const requestedShares = Number(shares);

    if (
      !Number.isInteger(requestedShares) ||
      requestedShares <= 0
    ) {
      return res.status(400).json({
        message: "Invalid share quantity",
      });
    }

    // ==========================================
    // 2. FIND INVESTMENT
    // ==========================================

    const investment = await Investment.findOne({
      _id: investmentId,
      userId: req.user.id,
      status: "approved",
    }).populate("propertyId");

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    const property = investment.propertyId;

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // ==========================================
    // 3. LOCK-IN CHECK
    // ==========================================

    let eligibleExitDate = investment.eligibleExitDate;

    // If eligibleExitDate doesn't exist,
    // calculate it from lockInStartDate / createdAt
    if (!eligibleExitDate) {
      const startDate =
        investment.lockInStartDate ||
        investment.createdAt;

      eligibleExitDate = new Date(startDate);

      eligibleExitDate.setFullYear(
        eligibleExitDate.getFullYear() +
          Number(investment.lockInYears || 2)
      );
    }

    const now = new Date();

    if (now < eligibleExitDate) {
      return res.status(400).json({
        message:
          "Investment is still under lock-in period",
        eligibleExitDate,
      });
    }

    // ==========================================
    // 4. CHECK OWNED SHARES
    // ==========================================

    const ownedShares = Number(investment.shares || 0);

    if (requestedShares > ownedShares) {
      return res.status(400).json({
        message:
          `You can exit maximum ${ownedShares} shares`,
      });
    }

    // ==========================================
    // 5. SHARE BUYING CYCLE
    // ==========================================

    const shareCycle =
      Number(
        investment.shareBuyingCycle ||
        property.shareBuyingCycle ||
        10
      );

    if (![5, 10].includes(shareCycle)) {
      return res.status(400).json({
        message: "Invalid share buying cycle",
      });
    }

    /*
      Cycle 10:
      10, 20, 30, 40...

      Cycle 5:
      5, 10, 15, 20...
    */

    if (
      shareCycle === 10 &&
      requestedShares % 10 !== 0
    ) {
      return res.status(400).json({
        message:
          "This property allows exits in multiples of 10 shares",
      });
    }

    if (
      shareCycle === 5 &&
      requestedShares % 5 !== 0
    ) {
      return res.status(400).json({
        message:
          "This property allows exits in multiples of 5 shares",
      });
    }

    // ==========================================
    // 6. PREVENT DUPLICATE PENDING REQUEST
    // ==========================================

    const pendingExit = await Exit.findOne({
      investmentId: investment._id,
      status: "pending",
    });

    if (pendingExit) {
      return res.status(400).json({
        message:
          "Exit request already pending for this investment",
      });
    }

    // ==========================================
    // 7. PRICE PER SHARE
    // ==========================================

    const pricePerShare =
      Number(
        investment.pricePerShare ||
        property.pricePerShare ||
        property.currentPricePerShare ||
        0
      );

    if (pricePerShare <= 0) {
      return res.status(400).json({
        message: "Invalid price per share",
      });
    }

    // ==========================================
    // 8. AUTOMATIC EXIT AMOUNT
    // ==========================================

    const exitAmount =
      requestedShares * pricePerShare;

    // ==========================================
    // 9. CREATE EXIT REQUEST
    // ==========================================

    const exit = await Exit.create({
      userId: req.user.id,

      investmentId: investment._id,

      propertyId: property._id,

      shares: requestedShares,

      amount: exitAmount,

      status: "pending",
    });

    // ==========================================
    // 10. RESPONSE
    // ==========================================

    return res.json({
      message:
        "Exit request submitted successfully",

      exit: {
        _id: exit._id,
        investmentId: exit.investmentId,
        propertyId: exit.propertyId,
        shares: exit.shares,
        amount: exit.amount,
        status: exit.status,
      },

      eligibleExitDate,
    });

  } catch (err) {
    console.error(
      "CREATE EXIT REQUEST ERROR:",
      err
    );

    return res.status(500).json({
      message:
        err.message ||
        "Failed to create exit request",
    });
  }
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