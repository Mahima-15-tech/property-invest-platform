console.log("1");
const Investment = require("../models/investment");

console.log("2");
const Property = require("../models/property");

console.log("3");
const User = require("../models/user");

console.log("4");
const Commission = require("../models/commission");

console.log("5");
const Payment = require("../models/payment");


const PaymentSetting = require("../models/paymentSetting");
// ==========================================
// SHARE PURCHASE RULES
// ==========================================

const validateSharePurchase = (property, sharesNum) => {
  // Minimum 10 shares mandatory
  if (!Number.isInteger(sharesNum) || sharesNum < 10) {
    return {
      valid: false,
      message: "Minimum purchase is 10 shares",
    };
  }

  const shareCycle = Number(property.shareBuyingCycle) || 10;

  // Cycle 5:
  // 10, 15, 20, 25...
  if (shareCycle === 5 && (sharesNum - 10) % 5 !== 0) {
    return {
      valid: false,
      message:
        "This property allows 10 shares minimum, then purchases in 5-share increments",
    };
  }

  // Cycle 10:
  // 10, 20, 30...
  if (shareCycle === 10 && sharesNum % 10 !== 0) {
    return {
      valid: false,
      message:
        "This property allows purchases in 10-share increments",
    };
  }

  // Available shares
  if (sharesNum > property.availableShares) {
    return {
      valid: false,
      message: `Only ${property.availableShares} shares are currently available.`,
    };
  }

  return {
    valid: true,
    shareCycle,
  };
};


// ==========================================
// LOCK-IN CALCULATION
// ==========================================

const getLockInDetails = (property) => {
  const lockInYears = Number(property.lockInYears) || 2;

  const lockInStartDate = new Date();

  const eligibleExitDate = new Date(lockInStartDate);

  eligibleExitDate.setFullYear(
    eligibleExitDate.getFullYear() + lockInYears
  );

  return {
    lockInYears,
    lockInStartDate,
    eligibleExitDate,
  };
};

console.log("6");

exports.invest = async (req, res) => {
  try {
    const { propertyId, shares, method } = req.body;

    const user = await User.findById(req.user.id);
    const property = await Property.findById(propertyId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    const sharesNum = Number(shares);

    if (!sharesNum || isNaN(sharesNum)) {
      return res.status(400).json({
        message: "Invalid shares",
      });
    }

    // ==========================================
    // SHARE VALIDATION
    // ==========================================

    const validation = validateSharePurchase(
      property,
      sharesNum
    );

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    // ==========================================
    // AMOUNT
    // ==========================================

    const amount =
      sharesNum * Number(property.pricePerShare);

    // ==========================================
    // STAKEHOLDER CALCULATION
    // ==========================================

    const stakeholderUnit =
      Number(property.stakeholderUnit) || 10;

    const stakeholderCount =
      sharesNum / stakeholderUnit;

    // ==========================================
    // LOCK-IN CALCULATION
    // ==========================================

    const lockInDetails =
      getLockInDetails(property);

    // ==========================================
    // CREATE INVESTMENT
    // ==========================================

    const investment = await Investment.create({
      userId: user._id,

      propertyId,

      shares: sharesNum,

      amount,

      pricePerShare:
        property.pricePerShare,

      shareBuyingCycle:
        validation.shareCycle,

      stakeholderUnit,

      stakeholderCount,

      lockInYears:
        lockInDetails.lockInYears,

      lockInStartDate:
        lockInDetails.lockInStartDate,

      eligibleExitDate:
        lockInDetails.eligibleExitDate,

      method:
        method || "Bank Transfer",

      // No broker commission here.
      // Commission will be generated only
      // after admin approves the investment.

      status: "pending",
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.json({
      message: "Investment successful",
      investment,
    });

  } catch (error) {
    console.error(
      "INVEST ERROR:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getCheckoutData = async (req, res) => {
  try {
    const p = await Property.findById(req.params.propertyId);

    res.json({
      id: p._id,
      name: p.name,
    
      location: {
        city: p.location?.city,
        state: p.location?.state,
      },
    
      image: p.media?.images?.[0],
    
      // 🔥 IMPORTANT FIX
      sharePrice: p.pricePerShare,
      totalShares: p.totalShares,        // ✅ ADD THIS (must)
      sharesLeft: p.availableShares, 
          // frontend ke liye
          shareBuyingCycle: p.shareBuyingCycle || 10,
          stakeholderUnit: p.stakeholderUnit || 10,
          lockInYears: p.lockInYears || 2,
          companyReservedShares: p.companyReservedShares || 10,
          enableFullOwnership: p.enableFullOwnership || false,
      roi: p.roi,
      fundedPercent: p.soldPercent,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createInvestment = async (req, res) => {
  console.log("🔥 API HIT /createInvestment");
  console.log("👉 BODY:", req.body);

  try {
    const { propertyId, shares, referralCode } = req.body;

    // ==========================================
    // 1. FIND PROPERTY
    // ==========================================

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // ==========================================
    // 2. FIND USER
    // ==========================================

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // 3. KYC COMPLETION CHECK
    // ==========================================

    const KYC = require("../models/kyc");

    const kyc = await KYC.findOne({
      userId: req.user.id,
    });

    if (
      !kyc ||
      kyc.status === "draft" ||
      kyc.currentStep < 6
    ) {
      return res.status(400).json({
        message: "Please complete your KYC before investing",
        kycRequired: true,
      });
    }

    // ==========================================
    // 4. SHARES VALIDATION
    // ==========================================

    const sharesNum = Number(shares);

    if (!sharesNum || isNaN(sharesNum)) {
      return res.status(400).json({
        message: "Invalid shares",
      });
    }

    const validation = validateSharePurchase(
      property,
      sharesNum
    );

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.message,
      });
    }

    // ==========================================
    // 5. AMOUNT
    // ==========================================

    const amount =
      sharesNum * Number(property.pricePerShare);

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid investment amount",
      });
    }

    // ==========================================
    // 6. BROKER REFERRAL
    // ==========================================

    let broker = null;

    if (referralCode && referralCode.trim()) {
      const normalizedReferralCode =
        referralCode.trim().toUpperCase();

      broker = await User.findOne({
        referralCode: normalizedReferralCode,
        role: "broker",
        isApproved: true,
      });

      if (!broker) {
        return res.status(400).json({
          message: "Invalid broker referral code",
        });
      }

      console.log(
        "🤝 Broker referral found:",
        broker._id,
        broker.referralCode
      );
    }

    // ==========================================
    // IMPORTANT:
    // BROKER REFERRAL DOES NOT GIVE DISCOUNT
    // ==========================================

    const discount = 0;

    // Investor pays the complete investment amount.
    const finalAmount = amount;

    // IMPORTANT:
    // Do NOT set user.referredBy here.
    //
    // user.referredBy is reserved for the
    // existing Investor Referral + Gift system.
    //
    // Broker referral is stored directly
    // inside this investment.

    // ==========================================
    // 7. OWNERSHIP
    // ==========================================

    const ownershipPercent =
      property.totalShares
        ? (sharesNum / Number(property.totalShares)) * 100
        : 0;

    // ==========================================
    // 8. STAKEHOLDER
    // ==========================================

    const stakeholderUnit =
      Number(property.stakeholderUnit) || 10;

    const stakeholderCount =
      sharesNum / stakeholderUnit;

    // ==========================================
    // 9. LOCK-IN
    // ==========================================

    const lockInDetails =
      getLockInDetails(property);

    // ==========================================
    // 10. CREATE INVESTMENT
    // ==========================================

    const investment = await Investment.create({
      userId: req.user.id,

      propertyId,

      // ================= SHARES =================

      requestedShares: sharesNum,
      requestedAmount: amount,

      shares: sharesNum,
      amount,

      approvedShares: null,
      approvedAmount: null,

      pricePerShare:
        property.pricePerShare,

      shareBuyingCycle:
        validation.shareCycle,

      stakeholderUnit,

      stakeholderCount,

      // ================= LOCK-IN =================

      lockInYears:
        lockInDetails.lockInYears,

      lockInStartDate:
        lockInDetails.lockInStartDate,

      eligibleExitDate:
        lockInDetails.eligibleExitDate,

      // ================= BROKER REFERRAL =================

      referredByBroker:
        broker?._id || null,

      brokerReferralCode:
        broker?.referralCode || "",

      // ================= AMOUNT =================

      // Broker referral never gives discount.
      discount: 0,

      finalAmount: amount,

      // ================= OWNERSHIP =================

      ownershipPercent,

      // ================= PAYMENT =================

      paymentStatus: "not_paid",

      paymentMethod: "Bank Transfer",

      // ================= STATUS =================

      status: "pending",
    });

    console.log(
      "✅ INVESTMENT CREATED:",
      investment._id
    );

    console.log(
      "🤝 BROKER:",
      broker
        ? `${broker.name} (${broker.referralCode})`
        : "No broker referral"
    );

    // ==========================================
    // 11. RESPONSE
    // ==========================================

    return res.json({
      message: "Investment successful",

      investment,

      kycStatus:
        user.kycStatus || "pending",
    });

  } catch (err) {
    console.error(
      "CREATE INVESTMENT ERROR:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};


exports.markPaymentDone = async (req, res) => {
  const { investmentId } = req.body;

  const inv = await Investment.findById(investmentId);

  if (!inv) {
    return res.status(404).json({ message: "Investment not found" });
  }

  // ✅ status update
  inv.status = "payment_done";
  await inv.save();

  // ✅ 🔥 CREATE PAYMENT ENTRY (MOST IMPORTANT)
  await Payment.create({
    userId: inv.userId,
    propertyId: inv.propertyId,
    amount: inv.amount,
    status: "success",
    method: inv.method || "Bank Transfer",
  });

  res.json({
    message: "Payment done, waiting admin approval",
  });
};

exports.validateReferralCode = async (req, res) => {
  try {
    const { code } = req.body;

    // ==========================================
    // 1. CHECK CODE
    // ==========================================

    if (!code || !code.trim()) {
      return res.status(400).json({
        valid: false,
        message: "Broker referral code is required",
      });
    }

    // ==========================================
    // 2. NORMALIZE CODE
    // ==========================================

    const normalizedCode = code.trim().toUpperCase();

    // ==========================================
    // 3. FIND APPROVED BROKER
    // ==========================================

    const broker = await User.findOne({
      referralCode: normalizedCode,
      role: "broker",
      isApproved: true,
    });

    // ==========================================
    // 4. INVALID CODE
    // ==========================================

    if (!broker) {
      return res.status(400).json({
        valid: false,
        message: "Invalid broker referral code",
      });
    }

    // ==========================================
    // 5. VALID CODE
    // ==========================================

    return res.json({
      valid: true,
      message: "Valid broker referral code",
      brokerId: broker._id,
    });

  } catch (err) {
    console.error(
      "VALIDATE BROKER REFERRAL ERROR:",
      err
    );

    return res.status(500).json({
      valid: false,
      message: err.message,
    });
  }
};

exports.submitPaymentProof = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { paymentReference, paymentMethod } = req.body;

    // ==========================================
    // 1. FIND INVESTMENT
    // ==========================================

    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    // ==========================================
    // 2. CHECK USER OWNERSHIP
    // ==========================================

    if (investment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to update this investment",
      });
    }

    // ==========================================
    // 3. CHECK PAYMENT REFERENCE
    // ==========================================

    if (!paymentReference) {
      return res.status(400).json({
        message: "Payment reference / UTR is required",
      });
    }

    // ==========================================
    // 4. CHECK PAYMENT SCREENSHOT
    // ==========================================

    if (!req.file) {
      return res.status(400).json({
        message: "Payment screenshot is required",
      });
    }

    // ==========================================
    // 5. SAVE PAYMENT DETAILS
    // ==========================================

    investment.paymentReference = paymentReference;

    investment.paymentProof = req.file.path;

    investment.paymentMethod =
      paymentMethod || "Bank Transfer";

    investment.paymentStatus = "payment_submitted";

    investment.paymentSubmittedAt = new Date();

    // Investment waiting for admin verification
    investment.status = "payment_done";

    await investment.save();

    // ==========================================
    // 6. RESPONSE
    // ==========================================

    res.json({
      message: "Payment proof submitted successfully",
      investment,
    });

  } catch (error) {

    console.error(
      "SUBMIT PAYMENT PROOF ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { investmentId } = req.params;

    // ==========================================
    // 1. FIND INVESTMENT
    // ==========================================

    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found",
      });
    }

    // ==========================================
    // 2. PAYMENT MUST BE SUBMITTED
    // ==========================================

    if (investment.paymentStatus !== "payment_submitted") {
      return res.status(400).json({
        message: "Payment proof has not been submitted",
      });
    }

    // ==========================================
    // 3. FIND PROPERTY
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
    // 4. APPROVED SHARES
    // ==========================================

    const approvedShares = Number(
      investment.approvedShares ||
      investment.shares ||
      0
    );

    if (approvedShares <= 0) {
      return res.status(400).json({
        message: "Invalid investment shares",
      });
    }

    // ==========================================
    // 5. PROTECT COMPANY RESERVED SHARES
    // ==========================================

    const companyReservedShares = Number(
      property.companyReservedShares || 10
    );

    const currentAvailableShares = Number(
      property.availableShares || 0
    );

    // Normal investment can ONLY consume public shares.
    if (approvedShares > currentAvailableShares) {
      return res.status(400).json({
        message:
          "Not enough public shares available for this investment",
      });
    }

    // ==========================================
    // 6. CALCULATE APPROVED AMOUNT
    // ==========================================

    const approvedAmount = Number(
      investment.finalAmount ||
      investment.amount ||
      approvedShares * property.pricePerShare ||
      0
    );

    if (approvedAmount <= 0) {
      return res.status(400).json({
        message: "Invalid investment amount",
      });
    }

    // ==========================================
    // 7. VERIFY PAYMENT
    // ==========================================

    investment.paymentStatus = "verified";

    investment.paymentVerifiedAt = new Date();

    investment.paymentVerifiedBy = req.user.id;

    // ==========================================
    // 8. APPROVE INVESTMENT
    // ==========================================

    investment.status = "approved";

    investment.approvedShares = approvedShares;

    investment.approvedAmount = approvedAmount;

    // ==========================================
    // 9. OWNERSHIP
    // ==========================================

    const totalShares = Number(
      property.totalShares || 0
    );

    const ownershipPercent = totalShares
      ? (approvedShares / totalShares) * 100
      : 0;

    investment.ownershipPercent = Number(
      ownershipPercent.toFixed(4)
    );

    // ==========================================
    // 10. UPDATE PROPERTY SHARE ACCOUNTING
    // ==========================================

    property.availableShares =
      currentAvailableShares - approvedShares;

    property.soldShares =
      Number(property.soldShares || 0) +
      approvedShares;

    property.investedAmount =
      Number(property.investedAmount || 0) +
      approvedAmount;

    // IMPORTANT:
    // soldPercent is based on TOTAL property shares.

    property.soldPercent = totalShares
      ? Number(
          (
            (property.soldShares / totalShares) *
            100
          ).toFixed(2)
        )
      : 0;

    // ==========================================
    // 11. FUNDING STATUS
    // ==========================================

    if (property.availableShares <= 0) {
      property.availableShares = 0;

      property.status = "funded";

      property.soldPercent = 100;
    } else {
      property.status = "funding";
    }

    // ==========================================
    // 12. INVESTOR COUNT
    // ==========================================

    property.investors =
      await Investment.countDocuments({
        propertyId: property._id,
        status: "approved",
        shares: { $gt: 0 },
      });

    // ==========================================
    // 13. SAVE INVESTMENT + PROPERTY
    // ==========================================

    await investment.save();

    await property.save();

    // ==========================================
    // 14. BROKER COMMISSION
    // ==========================================

    if (investment.referredByBroker) {
      try {
        // Find broker
        const broker = await User.findById(
          investment.referredByBroker
        );

        if (broker) {
          // Check if commission already exists
          const existingCommission =
            await Commission.findOne({
              investmentId: investment._id,
            });

          if (!existingCommission) {
            // Broker commission rate
            const commissionRate = Number(
              broker.commissionRate || 0
            );

            // Commission calculation
            const commissionAmount = Number(
              (
                (approvedAmount * commissionRate) /
                100
              ).toFixed(2)
            );

            // Only create commission if amount > 0
            if (commissionAmount > 0) {
              await Commission.create({
                investmentId: investment._id,

                brokerId: broker._id,

                userId: investment.userId,

                propertyId: investment.propertyId,

                amount: approvedAmount,

                commissionAmount,

                type: "referral",

                status: "pending",
              });

              console.log(
                "💰 BROKER COMMISSION CREATED:",
                {
                  brokerId: broker._id,
                  investmentId: investment._id,
                  amount: approvedAmount,
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
        } else {
          console.log(
            "⚠️ Broker not found:",
            investment.referredByBroker
          );
        }
      } catch (commissionError) {
        console.error(
          "BROKER COMMISSION ERROR:",
          commissionError
        );
      }
    }

    // ==========================================
    // 15. RESPONSE
    // ==========================================

    return res.json({
      message:
        "Payment verified and investment approved",

      investment: {
        id: investment._id,

        shares: investment.shares,

        approvedShares:
          investment.approvedShares,

        amount: investment.amount,

        approvedAmount:
          investment.approvedAmount,

        ownershipPercent:
          investment.ownershipPercent,

        status:
          investment.status,

        paymentStatus:
          investment.paymentStatus,

        brokerReferralCode:
          investment.brokerReferralCode || "",
      },

      property: {
        totalShares:
          property.totalShares,

        companyReservedShares,

        availableShares:
          property.availableShares,

        soldShares:
          property.soldShares,

        soldPercent:
          property.soldPercent,

        investedAmount:
          property.investedAmount,

        investors:
          property.investors,

        status:
          property.status,
      },
    });

  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to verify payment",
    });
  }
};

// ==========================================
// GET PAYMENT SETTINGS FOR INVESTOR
// ==========================================

exports.getPaymentSettings = async (req, res) => {
  try {

    const settings =
      await PaymentSetting.findOne().select(
        "accountName accountNumber ifscCode bankName upiId qrCode"
      );

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Payment settings not configured",
      });
    }

    return res.json({
      success: true,
      settings,
    });

  } catch (error) {

    console.error(
      "GET INVESTOR PAYMENT SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};