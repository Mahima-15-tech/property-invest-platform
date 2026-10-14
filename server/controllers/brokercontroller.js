const User = require("../models/user");
const Commission = require("../models/commission");
const Investment = require("../models/investment");
const jwt = require("jsonwebtoken");
const CommissionSetting = require("../models/commissionSetting");

// =====================================================
// REGISTER BROKER
// =====================================================



exports.registerBroker = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      pan,
      rera,
      confirm1,
      confirm2,
    } = req.body;

    if (confirm1 !== "true" || confirm2 !== "true") {
      return res.status(400).json({
        success: false,
        message: "Please accept terms and confirm details",
      });
    }

    if (!name || !email || !mobile || !pan) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile and PAN are required",
      });
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = String(mobile).replace(/\D/g, "");

    // Validate Indian 10-digit mobile number.
    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    // Email must be unique across investors and brokers.
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please use another email.",
      });
    }

    // Mobile must be unique across every account that has a phone.
    // Normalize stored values to handle spaces and punctuation.
    const usersWithPhone = await User.find({
      phone: { $exists: true, $nin: [null, ""] },
    }).select("phone");

    const duplicatePhone = usersWithPhone.some((existingUser) => {
      const existingMobile = String(existingUser.phone).replace(/\D/g, "");
      return existingMobile === normalizedMobile;
    });

    if (duplicatePhone) {
      return res.status(400).json({
        success: false,
        message: "This mobile number is already registered. Please use another number.",
      });
    }

    const referralCode =
      "BRK" + Math.floor(100000 + Math.random() * 900000);

    // Create broker account as pending.
    const broker = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedMobile,
      role: "broker",
      pan: pan.trim(),
      rera: rera || "",
      referralCode,
      isApproved: false,
      commissionRate: 10,
      kycDocument: req.file?.path || null,
    });

    const token = jwt.sign(
      {
        id: broker._id.toString(),
        role: broker.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message:
        "Broker application submitted successfully. Your account is pending admin approval.",
    
      token,
    
      broker: {
        _id: broker._id,
        name: broker.name,
        email: broker.email,
        phone: broker.phone,
        role: broker.role,
        isApproved: broker.isApproved,
      },
    });
  } catch (err) {
    console.error("REGISTER BROKER ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This email or mobile number is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Broker registration failed",
      error: err.message,
    });
  }
};




// =====================================================
// GET BROKER COMMISSION
// =====================================================

exports.getBrokerCommission = async (req, res) => {
  try {
    const commissions = await Commission.find({
      brokerId: req.user.id,
    })
      .populate("userId", "name phone email")
      .populate("propertyId");

    res.json(commissions);
  } catch (err) {
    console.error("GET BROKER COMMISSION ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};


exports.approveBroker = async (req, res) => {
  try {
    const { id } = req.params;

    const broker = await User.findOne({
      _id: id,
      role: "broker",
    });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker not found",
      });
    }

    if (broker.isApproved) {
      return res.status(200).json({
        success: true,
        message: "Broker is already approved",
        broker: {
          _id: broker._id,
          isApproved: broker.isApproved,
        },
      });
    }

    broker.isApproved = true;
    await broker.save();

    return res.status(200).json({
      success: true,
      message: "Broker approved successfully",
      broker: {
        _id: broker._id,
        name: broker.name,
        email: broker.email,
        isApproved: broker.isApproved,
      },
    });
  } catch (error) {
    console.error("APPROVE BROKER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve broker",
    });
  }
};


// =====================================================
// GET ALL BROKERS - ADMIN
// =====================================================

exports.getAllBrokers = async (req, res) => {
  try {
    const brokers = await User.find({
      role: "broker",
    }).sort({ createdAt: -1 });
    
    // Get the global commission rate from admin settings
    const commissionSetting = await CommissionSetting.findOne();
    
    const globalCommissionRate = Number(
      commissionSetting?.commissionRate ?? 10
    );
    
    const data = await Promise.all(
      brokers.map(async (broker) => {

        // -------------------------------------------------
        // Broker referred investments
        // IMPORTANT:
        // Broker referral is stored on Investment
        // NOT User.referredBy
        // -------------------------------------------------

        const referredInvestments = await Investment.find({
          referredByBroker: broker._id,
        }).select("userId status");

        // Unique referred investors
        const referredInvestorIds = [
          ...new Set(
            referredInvestments.map((inv) =>
              inv.userId?.toString()
            )
          ),
        ];

        // Total unique referrals
        const referrals = referredInvestorIds.length;

        // -------------------------------------------------
        // Approved investments
        // -------------------------------------------------

        const approvedInvestments =
          referredInvestments.filter(
            (inv) => inv.status === "approved"
          );

        // Unique converted investors
        const convertedInvestorIds = [
          ...new Set(
            approvedInvestments.map((inv) =>
              inv.userId?.toString()
            )
          ),
        ];

        const conversions = convertedInvestorIds.length;

        // -------------------------------------------------
        // Commissions
        // -------------------------------------------------

        const commissions = await Commission.find({
          brokerId: broker._id,
        });

        const totalCommission = commissions.reduce(
          (sum, c) =>
            sum + Number(c.commissionAmount || 0),
          0
        );

        return {
          _id: broker._id,
          name: broker.name,

          referrals,

          conversions,

          earnings: totalCommission,

          commissionRate: `${globalCommissionRate}%`,

          status: broker.isApproved
            ? "active"
            : "pending",

            paymentStatus: broker.paymentStatus || "pending",
paymentUpdatedAt: broker.paymentUpdatedAt || null,

            createdAt: broker.createdAt,
        };
        
      })
    );

    res.json(data);
  } catch (err) {
    console.error("GET ALL BROKERS ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};


// =====================================================
// COMMISSION BREAKDOWN - ADMIN
// =====================================================

exports.getCommissionBreakdown = async (req, res) => {
  try {
    const commissions = await Commission.find();

    let sale = 0;
    let referral = 0;
    let performance = 0;

    commissions.forEach((c) => {
      const amount = Number(
        c.commissionAmount || 0
      );

      if (c.type === "sale") {
        sale += amount;
      }

      if (c.type === "referral") {
        referral += amount;
      }

      if (c.type === "performance") {
        performance += amount;
      }
    });

    const total =
      sale +
      referral +
      performance;

    res.json({
      total,
      sale,
      referral,
      performance,
    });
  } catch (err) {
    console.error(
      "GET COMMISSION BREAKDOWN ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};


// =====================================================
// BROKER DASHBOARD
// =====================================================

exports.getBrokerDashboard = async (req, res) => {
  try {
    const brokerId = req.user.id;

    // -------------------------------------------------
    // Get all investments referred by this broker
    // -------------------------------------------------

    const referredInvestments =
      await Investment.find({
        referredByBroker: brokerId,
      });

    // -------------------------------------------------
    // Unique referred investors
    // -------------------------------------------------

    const referredInvestorIds = [
      ...new Set(
        referredInvestments
          .map((inv) => inv.userId?.toString())
          .filter(Boolean)
      ),
    ];

    const referrals =
      referredInvestorIds.length;

    // -------------------------------------------------
    // Approved investments
    // -------------------------------------------------

    const approvedInvestments =
      referredInvestments.filter(
        (inv) => inv.status === "approved"
      );

    // -------------------------------------------------
    // Unique converted investors
    // -------------------------------------------------

    const convertedInvestorIds = [
      ...new Set(
        approvedInvestments
          .map((inv) => inv.userId?.toString())
          .filter(Boolean)
      ),
    ];

    const conversions =
      convertedInvestorIds.length;

    // -------------------------------------------------
    // Total investment from approved investments
    // -------------------------------------------------

    const totalInvestment =
      approvedInvestments.reduce(
        (sum, inv) =>
          sum +
          Number(
            inv.finalAmount ||
            inv.approvedAmount ||
            inv.amount ||
            0
          ),
        0
      );

    // -------------------------------------------------
    // Broker commissions
    // -------------------------------------------------

    const commissions =
      await Commission.find({
        brokerId,
      });

    let paid = 0;
    let pending = 0;

    commissions.forEach((c) => {
      const amount = Number(
        c.commissionAmount || 0
      );

      if (c.status === "paid") {
        paid += amount;
      } else {
        pending += amount;
      }
    });

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    res.json({
      referrals,

      conversions,

      totalInvestment,

      totalEarnings:
        paid + pending,

      pendingCommission:
        pending,

      paidCommission:
        paid,
    });
  } catch (err) {
    console.error(
      "GET BROKER DASHBOARD ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};


// =====================================================
// BROKER PROFILE
// =====================================================

exports.getBrokerProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "Broker not found",
      });
    }

    res.json({
      name: user.name,

      referralCode:
        user.referralCode,

      shareLink:
        `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
    });
  } catch (err) {
    console.error(
      "GET BROKER PROFILE ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};


// =====================================================
// RECENT REFERRED INVESTORS
// =====================================================

exports.getReferredInvestors = async (
  req,
  res
) => {
  try {
    const brokerId = req.user.id;

    // -------------------------------------------------
    // Get investments directly referred by broker
    // -------------------------------------------------

    const investments =
      await Investment.find({
        referredByBroker: brokerId,

        status: {
          $in: [
            "approved",
            "payment_done",
          ],
        },
      })
        .populate(
          "userId",
          "name email"
        )
        .populate(
          "propertyId",
          "name"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10);

    // -------------------------------------------------
    // Format response
    // -------------------------------------------------

    const data = investments.map(
      (inv) => ({
        investorName:
          inv.userId?.name ||
          "N/A",

          email: inv.userId.email || "N/A",

        property:
          inv.propertyId?.name ||
          "N/A",

        amount:
          inv.finalAmount ||
          inv.approvedAmount ||
          inv.amount ||
          0,

        date:
          inv.createdAt,

        status:
          inv.status === "approved"
            ? "Completed"
            : inv.status === "payment_done"
            ? "In Process"
            : "Pending",
      })
    );

    res.json(data);
  } catch (err) {
    console.error(
      "GET REFERRED INVESTORS ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};

// =====================================================
// UPDATE BROKER PAYMENT STATUS - ADMIN
// =====================================================

exports.updateBrokerPaymentStatus = async (req, res) => {
  try {
    const { brokerId } = req.params;
    const { paymentStatus } = req.body;

    if (!["pending", "paid"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment status must be pending or paid",
      });
    }

    const broker = await User.findOneAndUpdate(
      { _id: brokerId, role: "broker" },
      {
        $set: {
          paymentStatus,
          paymentUpdatedAt:
            paymentStatus === "paid" ? new Date() : null,
        },
      },
      { new: true, runValidators: true }
    ).select("name email paymentStatus paymentUpdatedAt");

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker not found",
      });
    }

    // Get global commission rate from admin settings
const commissionSetting = await CommissionSetting.findOne();

const globalCommissionRate = Number(
  commissionSetting?.commissionRate ?? 10
);

    // Sync commission status with broker payout status
    await Commission.updateMany(
      { brokerId: broker._id },
      { $set: { status: paymentStatus } }
    );

    return res.status(200).json({
      success: true,
      message: "Broker and commission payment status updated successfully",
      broker,
    });
  } catch (error) {
    console.error("UPDATE BROKER PAYMENT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update broker payment status",
      error: error.message,
    });
  }
};



exports.updateCommissionStatus = async (req, res) => {
  try {
    const { commissionId } = req.params;
    const { status } = req.body;

    const normalizedStatus = String(status || "").toLowerCase();

    if (!["pending", "paid"].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending or paid",
      });
    }

    const commission = await Commission.findById(commissionId);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    if (normalizedStatus === "paid") {
      if (commission.status !== "paid") {
        commission.paidAt = new Date();
      }

      commission.status = "paid";
    } else {
      commission.status = "pending";
      commission.paidAt = null;
    }

    if (commission.schema.path("paidBy")) {
      commission.paidBy =
        normalizedStatus === "paid" ? req.user.id : null;
    }

    await commission.save();

    return res.status(200).json({
      success: true,
      message: `Commission marked as ${normalizedStatus}`,
      commission,
    });
  } catch (error) {
    console.error("UPDATE COMMISSION STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update commission",
    });
  }
};


// =====================================================
// COMMISSION DETAILS
// =====================================================

exports.getCommissionDetails = async (
  req,
  res
) => {
  try {
    const brokerId = req.user.id;

    const commissions =
      await Commission.find({
        brokerId,
      })
        .populate(
          "userId",
          "name"
        )
        .populate(
          "propertyId",
          "name"
        )
        .sort({
          createdAt: -1,
        });

    const data =
      commissions.map((c) => ({
        property:
          c.propertyId?.name ||
          "N/A",

        investor:
          c.userId?.name ||
          "N/A",

        commission:
          Number(
            c.commissionAmount || 0
          ),

        status:
          c.status === "paid"
            ? "Paid"
            : "Pending",
      }));

    res.json(data);
  } catch (err) {
    console.error(
      "GET COMMISSION DETAILS ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};


// =====================================================
// EARNINGS SUMMARY
// =====================================================

exports.getEarningsSummary = async (
  req,
  res
) => {
  try {
    const brokerId = req.user.id;

    const commissions =
      await Commission.find({
        brokerId,
      });

    const now = new Date();

    // Current month + year
    const monthly =
      commissions.filter((c) => {
        const d = new Date(
          c.createdAt
        );

        return (
          d.getMonth() ===
            now.getMonth() &&
          d.getFullYear() ===
            now.getFullYear()
        );
      });

    const total =
      monthly.reduce(
        (sum, c) =>
          sum +
          Number(
            c.commissionAmount || 0
          ),
        0
      );

    const target = 15000;

    const percent =
      target > 0
        ? Math.min(
            (total / target) * 100,
            100
          )
        : 0;

    const nextPayoutDate =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        30
      );

    const formattedDate =
      nextPayoutDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    res.json({
      total,
      target,
      percent,
      nextPayout:
        formattedDate,
    });
  } catch (err) {
    console.error(
      "GET EARNINGS SUMMARY ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};


// =====================================================
// TOTAL REFERRALS
// =====================================================

exports.getTotalReferrals = async (
  req,
  res
) => {
  try {
    const brokerId = req.user.id;

    // -------------------------------------------------
    // Get all investments referred by broker
    // -------------------------------------------------

    const investments =
      await Investment.find({
        referredByBroker: brokerId,
      })
        .populate(
          "userId",
          "name phone email createdAt kycStatus"
        )
        .sort({
          createdAt: -1,
        });

    // -------------------------------------------------
    // Unique investors
    // -------------------------------------------------

    const investorMap =
      new Map();

    investments.forEach((inv) => {
      if (!inv.userId) return;

      const userId =
        inv.userId._id.toString();

      if (!investorMap.has(userId)) {
        investorMap.set(
          userId,
          {
            user: inv.userId,
            hasApprovedInvestment:
              inv.status ===
              "approved",
          }
        );
      } else if (
        inv.status === "approved"
      ) {
        investorMap.get(
          userId
        ).hasApprovedInvestment = true;
      }
    });

    const data =
      Array.from(
        investorMap.values()
      ).map(
        ({
          user,
          hasApprovedInvestment,
        }) => ({
          name:
            user.name ||
            "N/A",

          contact:
            user.phone ||
            "N/A",

          email:
            user.email ||
            "N/A",

          signupDate:
            user.createdAt,

          kycStatus:
            user.kycStatus,

          status:
            hasApprovedInvestment
              ? "Converted"
              : "Not Converted",
        })
      );

    res.json(data);
  } catch (err) {
    console.error(
      "GET TOTAL REFERRALS ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};


// =====================================================
// TOTAL CONVERTED
// =====================================================


exports.getTotalConverted = async (req, res) => {
  try {
    const brokerId = req.user.id;

    const investments = await Investment.find({
      referredByBroker: brokerId,
      status: "approved",
    })
      .populate("userId", "name email phone")
      .populate("propertyId")
      .sort({ createdAt: -1 })
      .lean();

    const data = investments
      .filter((inv) => inv.userId && inv.propertyId)
      .map((inv) => {
        const property = inv.propertyId;

        return {
          investmentId: inv._id,

          investor: {
            id: inv.userId._id,
            name: inv.userId.name || "N/A",
            email: inv.userId.email || "N/A",
            phone: inv.userId.phone || "N/A",
          },

          property: {
            id: property._id,
            name: property.name || "N/A",
            location: property.location || {},
            image: property.media?.images?.[0] || "",
            pricePerShare:
              inv.pricePerShare ?? property.pricePerShare ?? 0,
            totalShares: property.totalShares ?? 0,
            propertyStatus: property.status || "N/A",
          },

          shares: inv.approvedShares ?? inv.shares ?? 0,

          amount:
            inv.approvedAmount ??
            inv.finalAmount ??
            inv.amount ??
            0,

          ownershipPercent: inv.ownershipPercent ?? 0,
          stakeholderCount: inv.stakeholderCount ?? 0,

          date: inv.paymentVerifiedAt || inv.createdAt,
          status: "Completed",
        };
      });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("GET TOTAL CONVERTED ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch converted investments",
    });
  }
};


// =====================================================
// GET PARTICULAR BROKER - ADMIN
// =====================================================




exports.getBrokerById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get broker details
    const broker = await User.findOne({
      _id: id,
      role: "broker",
    }).select("-password -otp -otpExpiry");

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker not found",
      });
    }

    // 2. Get global commission rate from admin settings
    const commissionSetting = await CommissionSetting.findOne();

    const globalCommissionRate = Number(
      commissionSetting?.commissionRate ?? 10
    );

    // 3. Get all investments referred by this broker
    const referredInvestments = await Investment.find({
      referredByBroker: broker._id,
    })
      .populate("userId", "name email phone kycStatus createdAt")
      .populate("propertyId")
      .sort({ createdAt: -1 });

    // 4. Group investments by unique investor
    const investorMap = new Map();

    referredInvestments.forEach((investment) => {
      if (!investment.userId) return;

      const investorId = investment.userId._id.toString();

      if (!investorMap.has(investorId)) {
        investorMap.set(investorId, {
          user: investment.userId,
          investments: [],
          converted: false,
        });
      }

      const investor = investorMap.get(investorId);

      investor.investments.push(investment);

      if (investment.status === "approved") {
        investor.converted = true;
      }
    });

    // 5. Prepare referred investors
    const referredInvestors = Array.from(investorMap.values()).map(
      ({ user, investments, converted }) => {
        const approvedInvestments = investments.filter(
          (investment) => investment.status === "approved"
        );

        const totalInvestment = approvedInvestments.reduce(
          (sum, investment) =>
            sum +
            Number(
              investment.finalAmount ||
                investment.approvedAmount ||
                investment.amount ||
                0
            ),
          0
        );

        return {
          _id: user._id,
          name: user.name || "N/A",
          email: user.email || "N/A",
          phone: user.phone || "N/A",
          kycStatus: user.kycStatus || "pending",
          signupDate: user.createdAt,
          totalInvestment,
          investmentCount: investments.length,
          status: converted ? "Converted" : "Not Converted",
        };
      }
    );

    // 6. Fetch commission history with property details
    const commissions = await Commission.find({
      brokerId: broker._id,
    })
      .populate("userId", "name email phone")
      .populate("propertyId")
      .sort({ createdAt: -1 });

    // 7. Commission summary
    let totalCommission = 0;
    let paidCommission = 0;
    let pendingCommission = 0;

    commissions.forEach((commission) => {
      const amount = Number(commission.commissionAmount || 0);

      totalCommission += amount;

      if (commission.status === "paid") {
        paidCommission += amount;
      } else {
        pendingCommission += amount;
      }
    });

    // 8. Investment summary
    const approvedInvestments = referredInvestments.filter(
      (investment) => investment.status === "approved"
    );

    const totalInvestment = approvedInvestments.reduce(
      (sum, investment) =>
        sum +
        Number(
          investment.finalAmount ||
            investment.approvedAmount ||
            investment.amount ||
            0
        ),
      0
    );

    const totalReferrals = referredInvestors.length;

    const totalConversions = referredInvestors.filter(
      (investor) => investor.status === "Converted"
    ).length;

    const conversionRate =
      totalReferrals > 0
        ? Number(((totalConversions / totalReferrals) * 100).toFixed(1))
        : 0;

    // 9. Format commission history
    const commissionData = commissions.map((commission) => {
      const property = commission.propertyId;

      // Support different property image field structures
      const images = property
        ? property.media?.images ||
          property.images ||
          (property.image ? [property.image] : [])
        : [];

      // Support object or string location
      const location = property?.location || {};

      return {
        _id: commission._id,

        investor: commission.userId?.name || "N/A",
        investorEmail: commission.userId?.email || "N/A",

        property:
          property?.name ||
          property?.title ||
          property?.propertyName ||
          "N/A",

        propertyDetails: property
          ? {
              _id: property._id,

              name:
                property.name ||
                property.title ||
                property.propertyName ||
                "N/A",

              title: property.title || "",
              description: property.description || "",

              location,
              address: property.address || "",

              city:
                property.city ||
                (typeof location === "object" ? location.city : "") ||
                "",

              state:
                property.state ||
                (typeof location === "object" ? location.state : "") ||
                "",

              status: property.status || "",
              paidAt: commission.paidAt || null,
              price: property.price ?? null,
              pricePerShare: property.pricePerShare ?? null,
              totalShares: property.totalShares ?? null,

              images,
            }
          : null,

        amount: Number(commission.commissionAmount || 0),

        type: commission.type || "N/A",

        status: commission.status === "paid" ? "Paid" : "Pending",

        date: commission.createdAt,
      };
    });

    // 10. Send final response
    return res.status(200).json({
      success: true,

      broker: {
        _id: broker._id,
        name: broker.name,
        email: broker.email,
        phone: broker.phone,

        pan: broker.pan,
        rera: broker.rera,
        
        referralCode: broker.referralCode,

        // Use global commission rate from admin settings
        commissionRate: globalCommissionRate,

        isApproved: broker.isApproved,
        status: broker.isApproved ? "active" : "pending",

        kycDocument: broker.kycDocument || null,

        createdAt: broker.createdAt,
        updatedAt: broker.updatedAt,
      },

      summary: {
        totalReferrals,
        totalConversions,
        conversionRate,
        totalInvestment,
        totalCommission,
        paidCommission,
        pendingCommission,
      },

      referredInvestors,

      commissions: commissionData,
    });
  } catch (err) {
    console.error("GET BROKER BY ID ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.markCommissionPaid = async (req, res) => {
  try {
    const { commissionId } = req.params;

    const commission = await Commission.findById(commissionId);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    if (commission.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Commission is already paid",
      });
    }

    commission.status = "paid";

    // Add these only if your Commission schema supports them
    if (commission.schema.path("paidAt")) {
      commission.set("paidAt", new Date());
    }

    if (commission.schema.path("paidBy")) {
      commission.set("paidBy", req.user.id);
    }

    await commission.save();

    return res.status(200).json({
      success: true,
      message: "Commission marked as paid",
      commission,
    });
  } catch (error) {
    console.error("MARK COMMISSION PAID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update commission",
    });
  }
};
