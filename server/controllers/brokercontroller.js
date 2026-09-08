const User = require("../models/user");
const Commission = require("../models/commission");
const Investment = require("../models/investment");
const jwt = require("jsonwebtoken");

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

    // Checkbox validation
    if (confirm1 !== "true" || confirm2 !== "true") {
      return res.status(400).json({
        success: false,
        message: "Please accept terms and confirm details",
      });
    }

    // Required fields validation
    if (!name || !email || !mobile || !pan) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing",
      });
    }

    // Duplicate check
    const existing = await User.findOne({
      $or: [{ email }, { phone: mobile }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Broker already exists",
      });
    }

    // Generate broker referral code
    const referralCode =
      "BRK" + Math.floor(100000 + Math.random() * 900000);

    // Create broker
    const broker = await User.create({
      name,
      email,
      phone: mobile,
      role: "broker",
      pan,
      rera,
      referralCode,
      isApproved: true,

      // Default commission rate
      commissionRate: 10,

      kycDocument: req.file?.path || null,
    });

    // Create token
    const token = jwt.sign(
      {
        id: broker._id,
        role: broker.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Application submitted",
      broker,
      token,
    });
  } catch (err) {
    console.error("REGISTER BROKER ERROR:", err);

    res.status(500).json({
      success: false,
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
      .populate("propertyId", "name");

    res.json(commissions);
  } catch (err) {
    console.error("GET BROKER COMMISSION ERROR:", err);

    res.status(500).json({
      error: err.message,
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

          commissionRate: `${Number(
            broker.commissionRate || 0
          )}%`,

          status: broker.isApproved
            ? "active"
            : "pending",

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

exports.getTotalConverted = async (
  req,
  res
) => {
  try {
    const brokerId = req.user.id;

    // -------------------------------------------------
    // Get approved broker-referred investments
    // -------------------------------------------------

    const investments =
      await Investment.find({
        referredByBroker: brokerId,
        status: "approved",
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
        });

    // -------------------------------------------------
    // Unique converted investors
    // -------------------------------------------------

    const convertedInvestorIds =
      new Set();

    const data = [];

    investments.forEach((inv) => {
      if (!inv.userId) return;
    
      console.log("CONVERTED USER:", inv.userId);
      console.log("USER EMAIL:", inv.userId?.email);
    
      const investorId = inv.userId._id.toString();
    
      if (convertedInvestorIds.has(investorId)) {
        return;
      }
    
      convertedInvestorIds.add(investorId);
    
      data.push({
        name: inv.userId.name || "N/A",
    
        email: inv.userId.email || "N/A",
    
        property: inv.propertyId?.name || "N/A",
    
        amount:
          inv.finalAmount ||
          inv.approvedAmount ||
          inv.amount ||
          0,
    
        date: inv.createdAt,
    
        status: "Completed",
      });
    });
    res.json(data);

  } catch (err) {
    console.error(
      "GET TOTAL CONVERTED ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};


