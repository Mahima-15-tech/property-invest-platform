const User = require("../models/user");
const AuditLog = require("../models/auditLog");
const Investment = require("../models/investment");
const Exit = require("../models/exit");
const KYC = require("../models/kyc");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const ReferralProgram = require("../models/referralProgram");
const ReferralReward = require("../models/referralReward");
const PaymentSetting = require("../models/paymentSetting");
const Commission = require("../models/commission");const CommissionSetting = require(
  "../models/commissionSetting"
);

exports.adminLogin = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.trim() }).select("+password");

    if (!user || user.role !== "admin") {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    if (!password || !user.password) {
      return res.status(400).json({ message: "Password missing" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.approveBroker = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id);
  
      if (!user || user.role !== "broker") {
        return res.status(400).json({ message: "Invalid broker" });
      }
  
      user.isApproved = true;
      await user.save();
  
      res.json({ message: "Broker approved" });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.approveKyc = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      user.kycStatus = "approved";
      await user.save();
  
      const kyc = await KYC.findOneAndUpdate(
        { userId: id },
        {
          approvalStatus: "approved",
        },
        { new: true }
      );
  
      res.json({
        message: "KYC approved",
        status: kyc.status,
        approvalStatus: kyc.approvalStatus,
      });
  
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  
  
  exports.rejectKyc = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      // USER MODEL
      user.kycStatus = "rejected";
      await user.save();
  
      // KYC MODEL
      await KYC.findOneAndUpdate(
        { userId: id },
        { status: "rejected" }
      );
  
      res.json({
        message: "KYC rejected",
      });
  
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  



  const Property = require("../models/property");

  // ==========================================
// VERIFY PAYMENT
// ==========================================

exports.verifyInvestmentPayment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    // Payment proof submit hona chahiye
    if (investment.paymentStatus !== "payment_submitted") {
      return res.status(400).json({
        message: "Payment proof has not been submitted",
      });
    }

    investment.paymentStatus = "verified";

    investment.paymentVerifiedAt = new Date();

    investment.paymentVerifiedBy = req.user.id;

    await investment.save();

    res.json({
      message: "Payment verified successfully",
      investment,
    });

  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message: error.message || "Failed to verify payment",
    });
  }
};


// ==========================================
// REJECT PAYMENT
// ==========================================

exports.rejectInvestmentPayment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    if (investment.paymentStatus !== "payment_submitted") {
      return res.status(400).json({
        message: "No pending payment proof to reject",
      });
    }

    investment.paymentStatus = "rejected";

    // Investment bhi reject state mein rahega
    investment.status = "rejected";

    await investment.save();

    res.json({
      message: "Payment rejected successfully",
      investment,
    });

  } catch (error) {
    console.error(
      "REJECT PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message: error.message || "Failed to reject payment",
    });
  }
};

// ==========================================
// CREATE INVESTOR REFERRAL REWARD
// ==========================================

const createReferralReward = async (investment, user) => {
  try {
    // Sirf investor ke referral ke liye
    if (!user || user.role !== "investor") {
      return null;
    }

    // Agar user kisi Investor ke through refer nahi hua
    if (!user.referredBy) {
      return null;
    }

    // Referral program check
    const program = await ReferralProgram.findOne();

    if (!program || !program.enabled) {
      return null;
    }

    // Referrer bhi investor hona chahiye
    const referrer = await User.findOne({
      _id: user.referredBy,
      role: "investor",
    });

    if (!referrer) {
      return null;
    }

    // Duplicate reward protection
    const existingReward = await ReferralReward.findOne({
      referredInvestor: user._id,
    });

    if (existingReward) {
      return existingReward;
    }

    // Create reward
    const reward = await ReferralReward.create({
      referrer: referrer._id,

      referredInvestor: user._id,

      referralCode:
        user.referralCodeUsed ||
        referrer.referralCode,

      giftName: program.giftName,

      giftDescription:
        program.giftDescription || "",

      investmentId: investment._id,

      propertyId: investment.propertyId,

      status: "pending",

      giftStatus: "not_issued",
    });

    return reward;

  } catch (error) {
    console.error(
      "CREATE REFERRAL REWARD ERROR:",
      error
    );

    return null;
  }
};

exports.approveInvestment = async (req, res) => {
  try {
    // ==========================================
    // 1. FIND INVESTMENT
    // ==========================================

    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    // ==========================================
    // 2. ALREADY APPROVED CHECK
    // ==========================================

    if (investment.status === "approved") {
      return res.status(400).json({
        message: "Investment already approved",
      });
    }

    // ==========================================
    // 3. PAYMENT PROOF CHECK
    // ==========================================

    if (investment.paymentStatus !== "verified") {
      return res.status(400).json({
        message:
          "Payment must be verified before approving investment",
      });
    }

    // ==========================================
    // 4. GET ADMIN APPROVED SHARES
    // ==========================================

    const { shares } = req.body;

    const approvedShares =
      shares !== undefined
        ? Number(shares)
        : Number(
            investment.requestedShares ||
              investment.shares
          );

    // ==========================================
    // 5. FIND PROPERTY
    // ==========================================

    const property = await Property.findById(
      investment.propertyId
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // ==========================================
    // 6. SHARE BUYING CYCLE
    // ==========================================

    const shareCycle =
      Number(
        property.shareBuyingCycle ||
          investment.shareBuyingCycle ||
          10
      );

    if (![5, 10].includes(shareCycle)) {
      return res.status(400).json({
        message: "Invalid share buying cycle",
      });
    }

    // ==========================================
    // 7. VALIDATE APPROVED SHARES
    // ==========================================

    if (
      !Number.isInteger(approvedShares) ||
      approvedShares <= 0
    ) {
      return res.status(400).json({
        message: "Invalid approved share quantity",
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
      approvedShares % 10 !== 0
    ) {
      return res.status(400).json({
        message:
          "This property allows purchases in multiples of 10 shares",
      });
    }

    if (
      shareCycle === 5 &&
      approvedShares % 5 !== 0
    ) {
      return res.status(400).json({
        message:
          "This property allows purchases in multiples of 5 shares",
      });
    }

    // ==========================================
    // 8. CHECK AVAILABLE SHARES
    // ==========================================

    const availableShares =
      Number(property.availableShares || 0);

    if (approvedShares > availableShares) {
      return res.status(400).json({
        message:
          `Only ${availableShares} shares available`,
      });
    }

    // ==========================================
    // 9. FIND USER
    // ==========================================

    const user = await User.findById(
      investment.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // 10. PRICE PER SHARE
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
    // 11. CALCULATE APPROVED AMOUNT
    // ==========================================

    const approvedAmount =
      approvedShares * pricePerShare;

    // ==========================================
    // 12. UPDATE INVESTMENT SHARES & AMOUNT
    // ==========================================

    investment.approvedShares =
      approvedShares;

    investment.approvedAmount =
      approvedAmount;

    investment.shares =
      approvedShares;

    investment.amount =
      approvedAmount;

    investment.pricePerShare =
      pricePerShare;

    // ==========================================
    // 13. SAVE SHARE BUYING CYCLE
    // ==========================================

    investment.shareBuyingCycle =
      shareCycle;

    // ==========================================
    // 14. STAKEHOLDER UNIT
    // ==========================================

    const stakeholderUnit =
      Number(
        investment.stakeholderUnit ||
          property.stakeholderUnit ||
          10
      );

    investment.stakeholderUnit =
      stakeholderUnit;

    // ==========================================
    // 15. STAKEHOLDER COUNT
    // ==========================================

    investment.stakeholderCount =
      approvedShares / stakeholderUnit;

    // ==========================================
    // 16. OWNERSHIP %
    // ==========================================

    investment.ownershipPercent =
      property.totalShares > 0
        ? Number(
            (
              (approvedShares /
                property.totalShares) *
              100
            ).toFixed(4)
          )
        : 0;

    // ==========================================
    // 17. LOCK-IN PERIOD
    // ==========================================

    /*
      Lock-in starts when investment is approved.

      Default:
      2 Years

      Example:

      Approval Date:
      31 Aug 2026

      Eligible Exit:
      31 Aug 2028
    */

    const lockInStartDate = new Date();

    const lockInYears =
      Number(investment.lockInYears || 2);

    const eligibleExitDate =
      new Date(lockInStartDate);

    eligibleExitDate.setFullYear(
      eligibleExitDate.getFullYear() +
        lockInYears
    );

    investment.lockInYears =
      lockInYears;

    investment.lockInStartDate =
      lockInStartDate;

    investment.eligibleExitDate =
      eligibleExitDate;

    // ==========================================
    // 18. INVESTMENT APPROVED
    // ==========================================

    investment.status = "approved";

    investment.canEdit = false;

    // ==========================================
    // 19. UPDATE PROPERTY
    // ==========================================

    property.availableShares =
      availableShares - approvedShares;

    property.soldShares =
      Number(property.soldShares || 0) +
      approvedShares;

    property.investedAmount =
      Number(property.investedAmount || 0) +
      approvedAmount;

    // ==========================================
    // 20. RECALCULATE INVESTOR COUNT
    // ==========================================

    property.investors =
      await Investment.countDocuments({
        propertyId: property._id,
        status: "approved",
        shares: { $gt: 0 },
      });

    // ==========================================
    // 21. SOLD PERCENT
    // ==========================================

    property.soldPercent =
      property.totalShares > 0
        ? Number(
            (
              (property.soldShares /
                property.totalShares) *
              100
            ).toFixed(2)
          )
        : 0;

    // ==========================================
    // 22. PROPERTY STATUS
    // ==========================================

    if (property.availableShares <= 0) {
      property.availableShares = 0;
      property.status = "funded";
    } else {
      property.status = "funding";
    }

    // ==========================================
// 23. SAVE BOTH
// ==========================================
// ==========================================
// 23. SAVE BOTH
// ==========================================

await investment.save();
await property.save();


// ==========================================
// 24. CREATE BROKER COMMISSION
// ==========================================

// ==========================================
// 24. CREATE BROKER COMMISSION
// ==========================================

if (investment.referredByBroker) {
  try {

    // Find broker
    const broker = await User.findById(
      investment.referredByBroker
    );

    if (broker) {

      // Prevent duplicate commission
      const existingCommission =
        await Commission.findOne({
          investmentId: investment._id,
        });

      if (!existingCommission) {

        // ==========================================
        // GET GLOBAL COMMISSION RATE
        // ==========================================

        let commissionSettings =
          await CommissionSetting.findOne();

        // First time default setting
        if (!commissionSettings) {
          commissionSettings =
            await CommissionSetting.create({
              commissionRate: 10,
              updatedBy: req.user.id,
            });
        }

        const commissionRate =
          Number(
            commissionSettings.commissionRate || 0
          );

        // ==========================================
        // CALCULATE COMMISSION
        // ==========================================

        const commissionAmount =
          Number(
            (
              (approvedAmount * commissionRate) /
              100
            ).toFixed(2)
          );

        if (commissionAmount > 0) {

          await Commission.create({

            investmentId:
              investment._id,

            brokerId:
              broker._id,

            userId:
              investment.userId,

            propertyId:
              investment.propertyId,

            amount:
              approvedAmount,

            commissionAmount,

            // Optional but recommended
            commissionRate,

            type:
              "referral",

            status:
              "pending",
          });

          console.log(
            "💰 GLOBAL BROKER COMMISSION CREATED:",
            {
              brokerId: broker._id,
              investmentId: investment._id,
              approvedAmount,
              commissionRate,
              commissionAmount,
            }
          );

        }

      } else {

        console.log(
          "ℹ️ Commission already exists for investment:",
          investment._id
        );
      }

    }

  } catch (commissionError) {

    console.error(
      "BROKER COMMISSION ERROR:",
      commissionError
    );
  }
}


// ==========================================
// 25. CREATE INVESTOR REFERRAL REWARD
// ==========================================

const referralReward =
  await createReferralReward(
    investment,
    user
  );

// ==========================================
// 25. RESPONSE
// ==========================================

    // ==========================================
    // 24. RESPONSE
    // ==========================================

    return res.json({
      message:
        "Investment approved successfully",

      investment: {
        id: investment._id,

        shares:
          investment.shares,

        approvedShares:
          investment.approvedShares,

        amount:
          investment.amount,

        approvedAmount:
          investment.approvedAmount,

        pricePerShare:
          investment.pricePerShare,

        shareBuyingCycle:
          investment.shareBuyingCycle,

        stakeholderCount:
          investment.stakeholderCount,

        ownershipPercent:
          investment.ownershipPercent,

        lockInStartDate:
          investment.lockInStartDate,

        eligibleExitDate:
          investment.eligibleExitDate,

        status:
          investment.status,
      },

      property: {
        availableShares:
          property.availableShares,

        soldShares:
          property.soldShares,

        investedAmount:
          property.investedAmount,

        soldPercent:
          property.soldPercent,

        investors:
          property.investors,

        status:
          property.status,
      },
    });

  } catch (error) {
    console.error(
      "APPROVE INVESTMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to approve investment",
    });
  }
};

  exports.rejectInvestment = async (req, res) => {
    try {
      const investment = await Investment.findById(req.params.id);
  
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
  
      investment.status = "rejected";
      await investment.save();
  
      res.json({ message: "Investment rejected" });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.getAllExitRequests = async (req, res) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Number(req.query.limit) || 10, 50);
  
      const skip = (page - 1) * limit;
  
      const [exits, total] = await Promise.all([
        Exit.find()
          .populate("userId", "name email")
          .populate(
            "propertyId",
            "name pricePerShare currentPricePerShare shareBuyingCycle totalShares"
          )
          .populate(
            "investmentId",
            "shares amount roi duration canEdit pricePerShare shareBuyingCycle stakeholderUnit"
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
  
        Exit.countDocuments(),
      ]);
  
      res.json({
        data: exits,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
  
    } catch (err) {
      console.error("GET EXIT REQUESTS ERROR:", err);
  
      res.status(500).json({
        message: err.message,
      });
    }
  };

  exports.approveExit = async (req, res) => {
    try {
      // ==========================================
      // 1. FIND EXIT REQUEST
      // ==========================================
  
      const exit = await Exit.findById(req.params.id);
  
      if (!exit) {
        return res.status(404).json({
          message: "Exit not found",
        });
      }
  
      // ==========================================
      // 2. CHECK EXIT STATUS
      // ==========================================
  
      if (exit.status !== "pending") {
        return res.status(400).json({
          message: "Exit request already processed",
        });
      }
  
      // ==========================================
      // 3. FIND INVESTMENT
      // ==========================================
  
      const investment = await Investment.findById(
        exit.investmentId
      );
  
      if (!investment) {
        return res.status(404).json({
          message: "Investment not found",
        });
      }
  
      // ==========================================
      // 4. FIND PROPERTY
      // ==========================================
  
      const property = await Property.findById(
        exit.propertyId
      );
  
      if (!property) {
        return res.status(404).json({
          message: "Property not found",
        });
      }
  
      // ==========================================
      // 5. INVESTMENT MUST BE APPROVED
      // ==========================================
  
      if (investment.status !== "approved") {
        return res.status(400).json({
          message:
            "Only approved investments can be exited",
        });
      }
  
      // ==========================================
      // 6. LOCK-IN CHECK
      // ==========================================
  
      let eligibleExitDate =
        investment.eligibleExitDate;
  
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
      // 7. EXIT SHARES VALIDATION
      // ==========================================
  
      const exitShares = Number(exit.shares);
  
      if (
        !Number.isInteger(exitShares) ||
        exitShares <= 0
      ) {
        return res.status(400).json({
          message: "Invalid exit share quantity",
        });
      }
  
      // ==========================================
      // 8. CANNOT EXIT MORE THAN OWNED
      // ==========================================
  
      const ownedShares =
        Number(investment.shares || 0);
  
      if (exitShares > ownedShares) {
        return res.status(400).json({
          message:
            `Investor only owns ${ownedShares} shares`,
        });
      }
  
      // ==========================================
      // 9. SHARE BUYING CYCLE
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
  
      // Cycle 10
      // 10,20,30,40...
  
      if (
        shareCycle === 10 &&
        exitShares % 10 !== 0
      ) {
        return res.status(400).json({
          message:
            "This property allows exits in multiples of 10 shares",
        });
      }
  
      // Cycle 5
      // 5,10,15,20...
  
      if (
        shareCycle === 5 &&
        exitShares % 5 !== 0
      ) {
        return res.status(400).json({
          message:
            "This property allows exits in multiples of 5 shares",
        });
      }
  
      // ==========================================
      // 10. PRICE PER SHARE
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
      // 11. RECALCULATE EXIT AMOUNT
      // ==========================================
  
      const exitAmount =
        exitShares * pricePerShare;
  
      // ==========================================
      // 12. UPDATE EXIT AMOUNT
      // ==========================================
  
      exit.shares = exitShares;
      exit.amount = exitAmount;
  
      // ==========================================
      // 13. UPDATE INVESTMENT
      // ==========================================
  
      const remainingShares =
        ownedShares - exitShares;
  
      const currentInvestmentAmount =
        Number(investment.amount || 0);
  
      const remainingAmount = Math.max(
        0,
        currentInvestmentAmount - exitAmount
      );
  
      investment.shares =
        remainingShares;
  
      investment.amount =
        remainingAmount;
  
      // ==========================================
      // 14. STAKEHOLDER COUNT
      // ==========================================
  
      const stakeholderUnit =
        Number(
          investment.stakeholderUnit ||
          property.stakeholderUnit ||
          10
        );
  
      investment.stakeholderCount =
        stakeholderUnit > 0
          ? remainingShares / stakeholderUnit
          : 0;
  
      // ==========================================
      // 15. OWNERSHIP %
      // ==========================================
  
      investment.ownershipPercent =
        property.totalShares > 0
          ? Number(
              (
                (remainingShares /
                  property.totalShares) *
                100
              ).toFixed(4)
            )
          : 0;
  
      // ==========================================
      // 16. FULL EXIT
      // ==========================================
  
      if (remainingShares === 0) {
        investment.shares = 0;
        investment.amount = 0;
        investment.stakeholderCount = 0;
        investment.ownershipPercent = 0;
        investment.status = "exited";
      }
  
      await investment.save();
  
      // ==========================================
      // 17. UPDATE PROPERTY
      // ==========================================
  
      const currentSoldShares =
        Number(property.soldShares || 0);
  
      const currentAvailableShares =
        Number(property.availableShares || 0);
  
      const currentInvestedAmount =
        Number(property.investedAmount || 0);
  
      property.soldShares = Math.max(
        0,
        currentSoldShares - exitShares
      );
  
      property.availableShares =
        currentAvailableShares + exitShares;
  
      property.investedAmount = Math.max(
        0,
        currentInvestedAmount - exitAmount
      );
  
      // ==========================================
      // 18. PROPERTY SHARE SAFETY
      // ==========================================
  
      if (
        property.totalShares &&
        property.availableShares >
          property.totalShares
      ) {
        property.availableShares =
          property.totalShares;
      }
  
      // ==========================================
      // 19. RECALCULATE INVESTORS
      // ==========================================
  
      property.investors =
        await Investment.countDocuments({
          propertyId: property._id,
          status: "approved",
          shares: { $gt: 0 },
        });
  
      // ==========================================
      // 20. SOLD PERCENT
      // ==========================================
  
      property.soldPercent =
        property.totalShares > 0
          ? Number(
              (
                (property.soldShares /
                  property.totalShares) *
                100
              ).toFixed(2)
            )
          : 0;
  
      // ==========================================
      // 21. PROPERTY STATUS
      // ==========================================
  
      if (
        property.availableShares >=
        property.totalShares
      ) {
        property.availableShares =
          property.totalShares;
  
        property.soldShares = 0;
  
        property.soldPercent = 0;
  
        property.status = "available";
  
      } else if (
        property.availableShares <= 0
      ) {
        property.availableShares = 0;
  
        property.status = "funded";
  
      } else {
        property.status = "funding";
      }
  
      await property.save();
  
      // ==========================================
      // 22. APPROVE EXIT
      // ==========================================
  
      exit.status = "approved";
  
      exit.approvedBy = req.user.id;
  
      exit.processedBy = req.user.id;
  
      exit.approvedAt = new Date();
  
      await exit.save();
  
      // ==========================================
      // 23. RESPONSE
      // ==========================================
  
      return res.json({
        message:
          "Exit approved successfully",
  
        exit: {
          id: exit._id,
          shares: exit.shares,
          amount: exit.amount,
          status: exit.status,
        },
  
        investment: {
          id: investment._id,
          remainingShares:
            investment.shares,
          remainingAmount:
            investment.amount,
          ownershipPercent:
            investment.ownershipPercent,
          stakeholderCount:
            investment.stakeholderCount,
          status:
            investment.status,
        },
  
        property: {
          availableShares:
            property.availableShares,
          soldShares:
            property.soldShares,
          investedAmount:
            property.investedAmount,
          soldPercent:
            property.soldPercent,
          investors:
            property.investors,
          status:
            property.status,
        },
      });
  
    } catch (err) {
      console.error(
        "APPROVE EXIT ERROR:",
        err
      );
  
      return res.status(500).json({
        message:
          err.message ||
          "Failed to approve exit",
      });
    }
  };

      exports.rejectExit=async(req,res)=>{

        const exit=await Exit.findById(req.params.id);
        
        if(!exit){
        
        return res.status(404).json({
        message:"Exit not found"
        });
        
        }
        
        exit.status="rejected";
        
        await exit.save();
        
        res.json({
        message:"Exit rejected"
        });
        
        }


        exports.getAllUsers = async (req, res) => {
          try {
        
            const users = await User.find({
              role: "investor"
            }).sort({ createdAt: -1 });
        
            const data = [];
        
            for (const user of users) {
        
              const investment = await Investment.findOne({
                userId: user._id,
              });
        
              // jisne investment ki hai usko skip karo
              if (investment) continue;
        
              data.push({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                kycStatus: user.kycStatus,
                joinDate: user.createdAt,
              });
        
            }
        
            res.json(data);
        
          } catch (err) {
            res.status(500).json({
              error: err.message,
            });
          }
        };

        exports.updateInvestment = async (req, res) => {
          try {
            const investment = await Investment.findById(req.params.id);
        
            if (!investment) {
              return res.status(404).json({
                message: "Investment not found",
              });
            }
        
        
            const {
              shares,
              amount,
              roi,
              duration,
            } = req.body;
        
            if (shares !== undefined) {
              investment.shares = Number(shares);
          }
          
          if (amount !== undefined) {
              investment.amount = Number(amount);
          }
            if (roi !== undefined) investment.roi = roi;
            if (duration !== undefined) investment.duration = duration;
        
            await investment.save();

            await Exit.findOneAndUpdate(
              {
                  investmentId: investment._id,
              },
              {
                  shares: investment.shares,
                  amount: investment.amount,
              }
          );
        
            res.json({
              message: "Investment updated successfully",
              investment,
            });
        
          } catch (err) {
            res.status(500).json({
              error: err.message,
            });
          }
        };

        exports.updateExit = async (req, res) => {
          try {
            const { shares } = req.body;
        
            const exit = await Exit.findById(req.params.id);
        
            if (!exit) {
              return res.status(404).json({
                message: "Exit not found",
              });
            }
        
            // Sirf pending exit edit ho sakta hai
            if (exit.status !== "pending") {
              return res.status(400).json({
                message: "Only pending exit requests can be edited",
              });
            }
        
            const investment = await Investment.findById(exit.investmentId);
        
            if (!investment) {
              return res.status(404).json({
                message: "Investment not found",
              });
            }
        
            const property = await Property.findById(exit.propertyId);
        
            if (!property) {
              return res.status(404).json({
                message: "Property not found",
              });
            }
        
            const newShares = Number(shares);
        
            // =========================
            // BASIC VALIDATION
            // =========================
        
            if (!Number.isInteger(newShares) || newShares <= 0) {
              return res.status(400).json({
                message: "Invalid share quantity",
              });
            }
        
            // =========================
            // OWNED SHARES CHECK
            // =========================
        
            if (newShares > investment.shares) {
              return res.status(400).json({
                message: `Investor only owns ${investment.shares} shares`,
              });
            }
        
            // =========================
            // SHARE BUYING CYCLE
            // =========================
        
            const shareCycle =
              Number(
                property.shareBuyingCycle ||
                investment.shareBuyingCycle ||
                10
              );
        
            if (![5, 10].includes(shareCycle)) {
              return res.status(400).json({
                message: "Invalid share buying cycle",
              });
            }
        
            // 10 cycle:
            // 10, 20, 30, 40...
        
            if (shareCycle === 10 && newShares % 10 !== 0) {
              return res.status(400).json({
                message:
                  "This property allows exits in multiples of 10 shares",
              });
            }
        
            // 5 cycle:
            // 5, 10, 15, 20, 25...
        
            if (shareCycle === 5 && newShares % 5 !== 0) {
              return res.status(400).json({
                message:
                  "This property allows exits in multiples of 5 shares",
              });
            }
        
            // =========================
            // PRICE
            // =========================
        
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
        
            // =========================
            // AUTO CALCULATE AMOUNT
            // =========================
        
            const amount = newShares * pricePerShare;
        
            // =========================
            // UPDATE EXIT
            // =========================
        
            exit.shares = newShares;
            exit.amount = amount;
        
            await exit.save();
        
            res.json({
              message: "Exit updated successfully",
              exit,
            });
        
          } catch (err) {
            console.error("UPDATE EXIT ERROR:", err);
        
            res.status(500).json({
              error: err.message,
            });
          }
        };

 // ==========================================
// REFERRAL PROGRAM - GET CONFIGURATION
// ==========================================

exports.getReferralProgram = async (req, res) => {
  try {
    let program = await ReferralProgram.findOne();

    // Agar first time hai to default configuration create karo
    if (!program) {
      program = await ReferralProgram.create({
        enabled: true,
        giftName: "Gift Voucher",
        giftDescription: "",
        eligibility: "investment_successful",
        updatedBy: req.user.id,
      });
    }

    res.json({
      success: true,
      program,
    });

  } catch (error) {
    console.error("GET REFERRAL PROGRAM ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// REFERRAL PROGRAM - UPDATE CONFIGURATION
// ==========================================

exports.updateReferralProgram = async (req, res) => {
  try {
    const {
      enabled,
      giftName,
      giftDescription,
    } = req.body;

    let program = await ReferralProgram.findOne();

    if (!program) {
      program = new ReferralProgram();
    }

    // Only update fields that are provided
    if (enabled !== undefined) {
      program.enabled =
        enabled === true ||
        enabled === "true";
    }

    if (giftName !== undefined) {
      if (!giftName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Gift name is required",
        });
      }

      program.giftName = giftName.trim();
    }

    if (giftDescription !== undefined) {
      program.giftDescription =
        giftDescription.trim();
    }

    program.eligibility =
      "investment_successful";

    program.updatedBy = req.user.id;

    await program.save();

    res.json({
      success: true,
      message: "Referral program updated successfully",
      program,
    });

  } catch (error) {
    console.error(
      "UPDATE REFERRAL PROGRAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};       

// ==========================================
// GET ALL REFERRAL REWARDS
// ==========================================

exports.getReferralRewards = async (req, res) => {
  try {
    const rewards = await ReferralReward.find()
      .populate("referrer", "name email referralCode")
      .populate("referredInvestor", "name email")
      .populate("investmentId", "shares amount approvedAmount status")
      .populate("propertyId", "name")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      rewards,
    });

  } catch (error) {
    console.error(
      "GET REFERRAL REWARDS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// APPROVE REFERRAL REWARD
// ==========================================

exports.approveReferralReward = async (req, res) => {
  try {
    const reward = await ReferralReward.findById(
      req.params.id
    );

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Referral reward not found",
      });
    }

    // Already processed
    if (reward.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This referral reward has already been processed",
      });
    }

    reward.status = "approved";

    reward.approvedBy = req.user.id;

    reward.approvedAt = new Date();

    await reward.save();

    res.json({
      success: true,
      message: "Referral reward approved successfully",
      reward,
    });

  } catch (error) {
    console.error(
      "APPROVE REFERRAL REWARD ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// REJECT REFERRAL REWARD
// ==========================================

exports.rejectReferralReward = async (req, res) => {
  try {
    const reward = await ReferralReward.findById(
      req.params.id
    );

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Referral reward not found",
      });
    }

    if (reward.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This referral reward has already been processed",
      });
    }

    reward.status = "rejected";

    await reward.save();

    res.json({
      success: true,
      message: "Referral reward rejected successfully",
      reward,
    });

  } catch (error) {
    console.error(
      "REJECT REFERRAL REWARD ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ISSUE REFERRAL GIFT
// ==========================================

exports.issueReferralGift = async (req, res) => {
  try {
    const { giftCode } = req.body;

    const reward = await ReferralReward.findById(
      req.params.id
    );

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Referral reward not found",
      });
    }

    // Reward must be approved first
    if (reward.status !== "approved") {
      return res.status(400).json({
        success: false,
        message:
          "Referral reward must be approved before issuing gift",
      });
    }

    // Already issued
    if (reward.giftStatus === "issued") {
      return res.status(400).json({
        success: false,
        message: "Gift has already been issued",
      });
    }

    reward.giftStatus = "issued";

    reward.issuedAt = new Date();

    if (giftCode !== undefined) {
      reward.giftCode = giftCode.trim();
    }

    await reward.save();

    res.json({
      success: true,
      message: "Gift issued successfully",
      reward,
    });

  } catch (error) {
    console.error(
      "ISSUE REFERRAL GIFT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// PAYMENT SETTINGS - GET
// ==========================================

exports.getPaymentSettings = async (req, res) => {
  try {
    let settings = await PaymentSetting.findOne();

    // First time configuration
    if (!settings) {
      settings = await PaymentSetting.create({
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        upiId: "",
        qrCode: "",
        updatedBy: req.user.id,
      });
    }

    return res.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error(
      "GET PAYMENT SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// PAYMENT SETTINGS - UPDATE
// ==========================================

exports.updatePaymentSettings = async (req, res) => {
  try {
    const {
      accountName,
      accountNumber,
      ifscCode,
      bankName,
      upiId,
    } = req.body;

    let settings = await PaymentSetting.findOne();

    // First time configuration
    if (!settings) {
      settings = new PaymentSetting();
    }

    // =========================
    // BANK DETAILS
    // =========================

    if (accountName !== undefined) {
      settings.accountName = accountName.trim();
    }

    if (accountNumber !== undefined) {
      settings.accountNumber =
        accountNumber.trim();
    }

    if (ifscCode !== undefined) {
      settings.ifscCode =
        ifscCode.trim().toUpperCase();
    }

    if (bankName !== undefined) {
      settings.bankName =
        bankName.trim();
    }

    // =========================
    // UPI
    // =========================

    if (upiId !== undefined) {
      settings.upiId =
        upiId.trim();
    }

    // =========================
    // QR CODE
    // =========================

    if (req.file) {
      settings.qrCode = req.file.path;
    }

    // =========================
    // UPDATED BY
    // =========================

    settings.updatedBy = req.user.id;

    await settings.save();

    return res.json({
      success: true,
      message:
        "Payment settings updated successfully",
      settings,
    });

  } catch (error) {
    console.error(
      "UPDATE PAYMENT SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET GLOBAL COMMISSION SETTINGS
// ==========================================

exports.getCommissionSettings = async (req, res) => {
  try {
    let settings =
      await CommissionSetting.findOne();

    // First time default commission create
    if (!settings) {
      settings =
        await CommissionSetting.create({
          commissionRate: 10,
          updatedBy: req.user.id,
        });
    }

    return res.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error(
      "GET COMMISSION SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE GLOBAL COMMISSION SETTINGS
// ==========================================

exports.updateCommissionSettings = async (
  req,
  res
) => {
  try {
    const { commissionRate } = req.body;

    const rate = Number(commissionRate);

    if (
      !Number.isFinite(rate) ||
      rate < 0 ||
      rate > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Commission rate must be between 0 and 100",
      });
    }

    let settings =
      await CommissionSetting.findOne();

    if (!settings) {
      settings = new CommissionSetting();
    }

    settings.commissionRate = rate;

    settings.updatedBy = req.user.id;

    await settings.save();

    return res.json({
      success: true,
      message:
        "Global commission rate updated successfully",
      settings,
    });

  } catch (error) {
    console.error(
      "UPDATE COMMISSION SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changeAdminEmail = async (req, res) => {
  try {
    const { email, currentPassword } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!email || !currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and current password are required",
      });
    }

    // ==========================================
    // GET ADMIN WITH PASSWORD
    // ==========================================

    const admin = await User.findById(req.user.id)
      .select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ==========================================
    // SECURITY CHECK
    // ==========================================

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // ==========================================
    // VERIFY CURRENT PASSWORD
    // ==========================================

    const isMatch = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // ==========================================
    // CHECK DUPLICATE EMAIL
    // ==========================================

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: admin._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already in use",
      });
    }

    // ==========================================
    // UPDATE EMAIL
    // ==========================================

    admin.email = normalizedEmail;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      email: admin.email,
    });

  } catch (error) {
    console.error(
      "CHANGE ADMIN EMAIL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to change email",
    });
  }
};



// ==========================================
// CHANGE ADMIN PASSWORD
// ==========================================
exports.changeAdminPassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Get admin WITH password
    const admin = await User.findById(req.user.id)
      .select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Security check
    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    admin.password = hashedPassword;

    await admin.save();

    return res.json({
      success: true,
      message: "Admin password changed successfully",
    });

  } catch (error) {
    console.error(
      "CHANGE ADMIN PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};


// ==========================================
// ADMIN FORGOT PASSWORD - DUMMY OTP
// ==========================================

exports.adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find admin
    const admin = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found with this email",
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP valid for 10 minutes
    admin.otp = otp;
    admin.otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    admin.lastOtpSent = new Date();

    await admin.save();

    // TEMPORARY - console me OTP dikhega
    console.log("=================================");
    console.log("ADMIN PASSWORD RESET OTP:", otp);
    console.log("EMAIL:", admin.email);
    console.log("=================================");

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",

      // ⚠️ TEMPORARY ONLY
      // Production me isko remove kar dena
      otp,
    });

  } catch (error) {
    console.error(
      "ADMIN FORGOT PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate OTP",
    });
  }
};

// ==========================================
// VERIFY ADMIN RESET OTP
// ==========================================

exports.verifyAdminResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const admin = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !admin.otpExpiry ||
      admin.otpExpiry < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error(
      "VERIFY ADMIN OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// ==========================================
// RESET ADMIN PASSWORD
// ==========================================

exports.resetAdminPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !email ||
      !otp ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const admin = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    }).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify OTP again for security
    if (admin.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !admin.otpExpiry ||
      admin.otpExpiry < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Hash new password
    admin.password = await bcrypt.hash(
      newPassword,
      10
    );

    // OTP clear
    admin.otp = undefined;
    admin.otpExpiry = undefined;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login.",
    });

  } catch (error) {
    console.error(
      "RESET ADMIN PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};