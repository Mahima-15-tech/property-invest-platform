const User = require("../models/user");
const bcrypt = require("bcrypt");
const Commission = require("../models/commission");
const Investment = require("../models/investment");
const jwt = require("jsonwebtoken");

exports.registerBroker = async (req, res) => {
  try {
    const { name, email, mobile, pan, rera, confirm1, confirm2 } = req.body;

// ✅ checkbox validation
if (confirm1 !== "true" || confirm2 !== "true") {
  return res.status(400).json({
    success: false,
    message: "Please accept terms and confirm details",
  });
}
    // ✅ validation
    if (!name || !email || !mobile || !pan) {
      return res.status(400).json({
        success: false,
        message: "All required fields missing",
      });
    }
    

    // ✅ duplicate check
    const existing = await User.findOne({
      $or: [{ email }, { phone: mobile }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Broker already exists",
      });
    }

    

    // ✅ referral code
    const referralCode =
      "BRK" + Math.floor(100000 + Math.random() * 900000);

   // ✅ CREATE BROKER FIRST
const broker = await User.create({
  name,
  email,
  phone: mobile,
  role: "broker",
  pan,
  rera,
  referralCode,
  isApproved: true,
  commissionRate: 10,
  kycDocument: req.file?.path || null,
});

// ✅ THEN CREATE TOKEN
const token = jwt.sign(
  { id: broker._id, role: broker.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// ✅ RESPONSE
res.json({
  success: true,
  message: "Application submitted",
  broker,
  token,
});

    

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrokerCommission = async (req, res) => {
  const commissions = await Commission.find({
    brokerId: req.user.id,
  }).populate("userId propertyId");

  res.json(commissions);
};

exports.getAllBrokers = async (req, res) => {
  try {
    const COMMISSION_RATE = 10;

    const brokers = await User.find({ role: "broker" });

    const data = await Promise.all(
      brokers.map(async (broker) => {

        // referrals
        const referrals = await User.countDocuments({
          referredBy: broker._id,
        });

        // referred users
        const referredUsers = await User.find({
          referredBy: broker._id,
        }).distinct("_id");

        // investments
        const investments = await Investment.find({
          userId: { $in: referredUsers },
          status: "approved", 
        });

        // commissions
        const commissions = await Commission.find({
          brokerId: broker._id,
        });

        const totalCommission = commissions.reduce(
          (sum, c) => sum + c.commissionAmount,
          0
        );

        return {
          _id: broker._id,
          name: broker.name,
          referrals,
          conversions: investments.length,
          earnings: totalCommission,
          commissionRate: `${broker.commissionRate}%`, // sirf display
          status: broker.isApproved ? "active" : "pending",
        };
      })
    );

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCommissionBreakdown = async (req, res) => {
  try {
    const commissions = await Commission.find();

    let sale = 0;
    let referral = 0;
    let performance = 0;

    commissions.forEach((c) => {
      if (c.type === "sale") sale += c.commissionAmount;
      if (c.type === "referral") referral += c.commissionAmount;
      if (c.type === "performance") performance += c.commissionAmount;
    });

    const total = sale + referral + performance;

    res.json({
      total,
      sale,
      referral,
      performance,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /broker/dashboard
exports.getBrokerDashboard = async (req, res) => {
  try {
    const brokerId = req.user.id;

    // 🟢 1. Total referrals
    const referrals = await User.countDocuments({
      referredBy: brokerId,
    });

    // 🟢 2. Referred users list
    const referredUsers = await User.find({
      referredBy: brokerId,
    }).distinct("_id");

    // 🟢 3. Investments (NO status filter ❗)
    const investments = await Investment.find({
      userId: { $in: referredUsers },
      status: "approved", 
    });

    // 🟢 4. Total Investment (safe fallback)
    const totalInvestment = investments.reduce(
      (sum, inv) => sum + (inv.finalAmount || inv.amount || 0),
      0
    );

    // 🟢 5. Conversions (unique investors count)
    const uniqueInvestors = new Set(
      investments.map((inv) => inv.userId.toString())
    );
    
    const conversions = uniqueInvestors.size;

    // 🟢 6. Commissions
    const commissions = await Commission.find({
      brokerId,
    });

    let paid = 0;
    let pending = 0;

    commissions.forEach((c) => {
      if (c.status === "paid") {
        paid += c.commissionAmount;
      } else {
        pending += c.commissionAmount;
      }
    });

    // 🟢 7. Final response
    res.json({
      referrals,
      conversions,
      totalInvestment,
      totalEarnings: paid + pending,
      pendingCommission: pending,
      paidCommission: paid,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getBrokerProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    name: user.name,
    referralCode: user.referralCode,

    // 🔥 FIX THIS
    shareLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`
  });
};

exports.getReferredInvestors = async (req, res) => {
  try {
    const brokerId = req.user.id;

    // 🟢 1. Find users referred by broker
    const users = await User.find({ referredBy: brokerId });

    const userIds = users.map(u => u._id);

    // 🟢 2. Get ONLY meaningful investments
    const investments = await Investment.find({
      userId: { $in: userIds },
      status: { $in: ["approved", "payment_done"] } // 🔥 IMPORTANT FILTER
    })
      .populate("userId", "name phone")
      .populate("propertyId", "name")
      .sort({ createdAt: -1 })
      .limit(10); // latest 10 only

    // 🟢 3. Format for UI
    const data = investments.map(inv => ({
      investorName: inv.userId?.name || "N/A",
      contact: inv.userId?.phone || "N/A",
      property: inv.propertyId?.name || "N/A",
      amount: inv.finalAmount || inv.amount || 0,
      date: inv.createdAt,

      // 🔥 STATUS MAPPING (VERY IMPORTANT)
      status:
        inv.status === "approved"
          ? "Completed"
          : inv.status === "payment_done"
          ? "In Process"
          : "Pending",
    }));

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getCommissionDetails = async (req, res) => {
  try {
    const brokerId = req.user.id;

    const commissions = await Commission.find({ brokerId })
      .populate("userId", "name")
      .populate("propertyId", "name")
      .sort({ createdAt: -1 });

    const data = commissions.map(c => ({
      property: c.propertyId?.name || "N/A",
      investor: c.userId?.name || "N/A",
      commission: c.commissionAmount,

      // 🔥 STATUS FIX
      status: c.status === "paid" ? "Paid" : "Pending",
    }));

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEarningsSummary = async (req, res) => {
  try {
    const brokerId = req.user.id;

    const commissions = await Commission.find({ brokerId });

    const now = new Date();

    // 🔥 filter current month + year
    const monthly = commissions.filter(c => {
      const d = new Date(c.createdAt);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });

    const total = monthly.reduce(
      (sum, c) => sum + c.commissionAmount,
      0
    );

    const target = 15000;

    // 🔥 safe percent
    const percent = Math.min((total / target) * 100, 100);

    // 🔥 dynamic payout date
    const nextPayoutDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      30
    );

    const formattedDate = nextPayoutDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    res.json({
      total,
      target,
      percent,
      nextPayout: formattedDate,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTotalReferrals = async (req, res) => {
  const brokerId = req.user.id;

  const users = await User.find({ referredBy: brokerId });

  const data = await Promise.all(
    users.map(async (u) => {
      const investment = await Investment.findOne({
        userId: u._id,
        status: "approved"
      });

      return {
        name: u.name,
        contact: u.phone,
        email: u.email,
        signupDate: u.createdAt,
        kycStatus: u.kycStatus,

        // 🔥 MAIN DIFFERENCE
        status: investment ? "Converted" : "Not Converted",
      };
    })
  );

  res.json(data);
};


exports.getTotalConverted = async (req, res) => {
  const brokerId = req.user.id;

  const users = await User.find({ referredBy: brokerId });

  const investments = await Investment.find({
    userId: { $in: users.map(u => u._id) },
    status: "approved", 
  })
    .populate("userId", "name phone")
    .populate("propertyId", "name")
    .sort({ createdAt: -1 });

  const data = investments.map(inv => ({
    name: inv.userId.name,
    contact: inv.userId.phone,
    property: inv.propertyId.name,
    amount: inv.finalAmount || inv.amount,
    date: inv.createdAt,
    status: "Completed",
  }));

  res.json(data);
};

// exports.sendOtp = async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     // 🔍 check user exist
//     const user = await User.findOne({ phone: mobile });

//     if (!user) {
//       return res.status(400).json({
//         message: "User not found. Please signup first",
//       });
//     }

//     // 🔢 generate OTP
//     const otp = Math.floor(1000 + Math.random() * 9000);

//     // 💾 save in DB
//     user.otp = otp;
//     user.otpExpiry = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     console.log("OTP:", otp); // testing

//     res.json({ message: "OTP sent successfully" });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;

//     const user = await User.findOne({ phone: mobile });

//     if (!user || user.otp !== Number(otp)) {
//       return res.status(400).json({
//         message: "Invalid OTP",
//       });
//     }

//     if (user.otpExpiry < Date.now()) {
//       return res.status(400).json({
//         message: "OTP expired",
//       });
//     }

//     // 🔥 clear otp
//     user.otp = null;
//     user.otpExpiry = null;
//     await user.save();

//     // 🔥 create token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       token,
//       role: user.role,   // ⭐ VERY IMPORTANT
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };