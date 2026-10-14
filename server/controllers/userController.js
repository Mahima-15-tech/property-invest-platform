const User = require("../models/user");
const Investment = require("../models/investment");
const Property = require("../models/property");
const KYC = require("../models/kyc");
const Contact = require("../models/Contact");
exports.uploadKyc = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    user.kycDocument = req.file.path;
    user.kycStatus = "pending";

    await user.save();

    res.json({
      message: "KYC uploaded successfully, waiting for approval",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const kyc = await KYC.findOne({ userId: user._id });

    return res.status(200).json({
      success: true,
      kycStatus: user.kycStatus,
      document: user.kycDocument,

      // KYC rejection details
      rejectionType: kyc?.rejectionType || null,
      rejectionMessage: kyc?.rejectionMessage || "",

      // Additional KYC information
      status: kyc?.status || "draft",
      approvalStatus: kyc?.approvalStatus || "pending",
    });
  } catch (error) {
    console.error("GET KYC STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC status",
    });
  }
};



// GET ALL INVESTORS (ADMIN)
// GET ALL INVESTORS (ADMIN)
exports.getAllInvestors = async (req, res) => {
  try {
    // ==========================================
    // PAGINATION
    // ==========================================

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    // ==========================================
    // GET ALL INVESTMENTS
    // Latest investment of each investor
    // ==========================================

    const investments = await Investment.find()
      .populate("userId")
      .populate("propertyId")
      .sort({ createdAt: -1 });

    const map = new Map();

    for (const inv of investments) {
      if (!inv.userId) continue;

      const id = inv.userId._id.toString();

      if (!map.has(id)) {
        map.set(id, {
          _id: inv.userId._id,
          name: inv.userId.name,
          email: inv.userId.email,
          phone: inv.userId.phone,
          kycStatus: inv.userId.kycStatus,
          joinDate: inv.userId.createdAt,

          totalInvested: 0,
          properties: new Set(),

          // Latest investment date
          latestInvestmentDate: inv.createdAt,
        });
      }

      const user = map.get(id);

      // Total investment
      user.totalInvested += inv.amount || 0;

      // Unique properties
      if (inv.propertyId?._id) {
        user.properties.add(
          inv.propertyId._id.toString()
        );
      }

      // Since investments are already sorted newest first,
      // first investment encountered is the latest one.
      if (
        !user.latestInvestmentDate ||
        new Date(inv.createdAt) >
          new Date(user.latestInvestmentDate)
      ) {
        user.latestInvestmentDate = inv.createdAt;
      }
    }

    // ==========================================
    // SORT INVESTORS BY LATEST INVESTMENT
    // ==========================================

    const allInvestors = [...map.values()].sort(
      (a, b) =>
        new Date(b.latestInvestmentDate) -
        new Date(a.latestInvestmentDate)
    );

    // ==========================================
    // TOTAL INVESTORS
    // ==========================================

    const total = allInvestors.length;

    const totalPages = Math.ceil(total / limit);

    // ==========================================
    // PAGINATE
    // ==========================================

    const paginatedInvestors = allInvestors.slice(
      skip,
      skip + limit
    );

    // ==========================================
    // FORMAT RESPONSE
    // ==========================================

    const data = paginatedInvestors.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      kycStatus: u.kycStatus,

      totalInvested: `₹${u.totalInvested.toLocaleString(
        "en-IN"
      )}`,

      properties: u.properties.size,

      avgROI: "12%",

      joinDate: u.joinDate,

      // Frontend ko latest investment date bhi milegi
      latestInvestmentDate:
        u.latestInvestmentDate,
    }));

    // ==========================================
    // RESPONSE
    // ==========================================

    res.json({
      data,

      total,
      totalPages,
      currentPage: page,

      limit,
    });

  } catch (err) {
    console.error(
      "GET ALL INVESTORS ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.updateKycStatus = async (req, res) => {
  try {
    const {
      status,
      rejectionType,
      rejectionMessage,
    } = req.body;

    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid KYC status",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const kyc = await KYC.findOne({
      userId: user._id,
    });

    // Rejection requires a valid type and reason
    if (status === "rejected") {
      const allowedRejectionTypes = [
        "contact_bank",
        "full_kyc",
      ];

      if (!allowedRejectionTypes.includes(rejectionType)) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid rejection type",
        });
      }

      if (
        typeof rejectionMessage !== "string" ||
        !rejectionMessage.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      if (!kyc) {
        return res.status(404).json({
          success: false,
          message: "KYC record not found",
        });
      }

      kyc.rejectionType = rejectionType;
      kyc.rejectionMessage = rejectionMessage.trim();
    }

    user.kycStatus = status;

    if (kyc) {
      if (status === "approved") {
        kyc.status = "approved";
        kyc.approvalStatus = "approved";
        kyc.rejectionType = null;
        kyc.rejectionMessage = "";
      } else if (status === "rejected") {
        kyc.status = "rejected";
        kyc.approvalStatus = "rejected";
      } else if (status === "pending") {
        kyc.status = "submitted";
        kyc.approvalStatus = "pending";
        kyc.rejectionType = null;
        kyc.rejectionMessage = "";
      }

      await kyc.save();
    }

    await user.save();

    // Sync related KYC support requests after final approval
if (status === "approved") {
  await Contact.updateMany(
    {
      userId: user._id,
      type: { $in: ["contact_change", "bank_change"] },
      status: { $in: ["pending", "in_progress", "rejected"] },
    },
    {
      $set: {
        status: "resolved",
        adminRemark: "KYC details updated and approved successfully",
        resolvedBy: req.user.id,
        reviewedAt: new Date(),
        resolvedAt: new Date(),
      },
    }
  );
}

    return res.json({
      success: true,
      message: `KYC ${status}`,
      user,
      kyc,
    });
  } catch (error) {
    console.error("UPDATE KYC STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update KYC status",
    });
  }
};


exports.getInvestorDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const investments = await Investment.find({
      userId: req.params.id,
    })
      .populate("propertyId")
      .sort({ createdAt: -1 });

    const KYC = require("../models/kyc");

const kyc = await KYC.findOne({
  userId: req.params.id,
});

    // ✅ total invested
    const totalInvested = investments.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    // ✅ property count
    const uniqueProperties = new Set(
      investments.map((i) => i.propertyId?._id.toString())
    );

    // ⚡ dummy ROI
    const avgROI = investments.length
      ? (10 + Math.random() * 5).toFixed(1) + "%"
      : "0%";

    res.json({
      user: {
        ...user.toObject(),
        totalInvested: `₹${totalInvested}`,
        properties: uniqueProperties.size,
        avgROI,
      },
      investments,
      kyc,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const PDFDocument = require("pdfkit");

exports.exportInvestorsPDF = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate("userId")
      .populate("propertyId");

    // Group investments by user
    const map = new Map();

    investments.forEach((inv) => {
      if (!inv.userId) return;

      const id = inv.userId._id.toString();

      if (!map.has(id)) {
        map.set(id, {
          _id: inv.userId._id,
          name: inv.userId.name || "-",
          email: inv.userId.email || "-",
          phone: inv.userId.phone || "-",
          kycStatus: inv.userId.kycStatus || "pending",
          joinDate: inv.userId.createdAt,
          totalInvested: 0,
          properties: new Set(),
          investments: [],
        });
      }

      const user = map.get(id);

      user.totalInvested += inv.amount || 0;

      if (inv.propertyId) {
        user.properties.add(inv.propertyId._id.toString());
      }

      user.investments.push(inv);
    });

    const investors = [...map.values()];

    // PDF
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=investors.pdf"
    );

    doc.pipe(res);

    // Header
    doc
      .rect(0, 0, doc.page.width, 70)
      .fill("#0f172a");

    doc
      .fillColor("white")
      .fontSize(20)
      .text("Investor Report", 40, 25);

    doc.moveDown(3);

    investors.forEach((inv, index) => {
      if (index > 0 && doc.y > 650) {
        doc.addPage();
      }

      doc
        .fillColor("#000")
        .fontSize(15)
        .text(inv.name);

      doc.fontSize(11);

      doc.text(`Email : ${inv.email}`);
      doc.text(`Phone : ${inv.phone}`);
      doc.text(`KYC : ${inv.kycStatus}`);
      doc.text(`Total Investment : ₹${inv.totalInvested}`);
      doc.text(`Properties : ${inv.properties.size}`);

      const avgROI =
        inv.investments.length > 0
          ? (10 + Math.random() * 5).toFixed(1) + "%"
          : "0%";

      doc.text(`Average ROI : ${avgROI}`);

      doc.moveDown();

      doc.fontSize(12).fillColor("#1d4ed8").text("Investments");

      doc.fillColor("#000").fontSize(10);

      inv.investments.forEach((item) => {
        doc.text(
          `• ${item.propertyId?.name || "Property"} | Shares: ${
            item.shares
          } | ₹${item.amount}`
        );
      });

      doc.moveDown();

      doc
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .strokeColor("#d1d5db")
        .stroke();

      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error(err);

    if (!res.headersSent) {
      return res.status(500).json({
        error: err.message,
      });
    }
  }
};


exports.getUsersList = async (req, res) => {
  const users = await User.find().select("_id name");
  res.json(users);
};

exports.toggleWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const property = await Property.findOne({
      _id: propertyId,
      isDeleted: { $ne: true },
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }
    
    const alreadySaved = user.watchlist.some(
      (id) => id.toString() === propertyId
    );
    
    // Unpublished property ko nayi watchlist entry mein add na karein.
    // Existing saved property ko remove karne ki permission rahegi.
    if (!property.isPublished && !alreadySaved) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (alreadySaved) {
      user.watchlist = user.watchlist.filter(
        (id) => id.toString() !== propertyId
      );

      await user.save();

      return res.json({
        success: true,
        message: "Property removed from watchlist",
        action: "removed",
      });
    }

    user.watchlist.push(propertyId);
    await user.save();

    res.json({
      success: true,
      message: "Property added to watchlist",
      action: "added",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET USER WATCHLIST
exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
  .populate({
    path: "watchlist",
    match: {
      isPublished: true,
      isDeleted: { $ne: true },
    },
  });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user.watchlist,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// INVESTOR REFERRAL DETAILS
// ==========================================

exports.getMyReferralDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("name email role referralCode referredBy referralCodeUsed")
      .populate("referredBy", "name email referralCode");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "investor") {
      return res.status(403).json({
        success: false,
        message: "Referral program is available for investors only",
      });
    }

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

      const referralLink = user.referralCode
      ? `${frontendUrl}/signup?ref=${user.referralCode}`
      : null;

    res.json({
      success: true,
      referralCode: user.referralCode || null,
      referralLink,
      referredBy: user.referredBy || null,
    });
  } catch (error) {
    console.error("GET MY REFERRAL DETAILS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// INVESTOR REFERRAL REWARD HISTORY
// ==========================================

exports.getMyReferralRewards = async (req, res) => {
  try {
    const ReferralReward = require("../models/referralReward");

    const rewards = await ReferralReward.find({
      referrer: req.user.id,
    })
      .populate("referredInvestor", "name email")
      .populate("investmentId", "shares amount approvedAmount status")
      .populate("propertyId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      rewards,
    });
  } catch (error) {
    console.error("GET MY REFERRAL REWARDS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update investor phone number (Admin only)
exports.updateInvestorPhone = async (req, res) => {
  try {
    // Verify admin access
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update investor phone number",
      });
    }

    const { phone } = req.body;

    if (typeof phone !== "string" || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const investor = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { phone: phone.trim() } },
      { new: true, runValidators: true }
    ).select("name email phone");

    if (!investor) {
      return res.status(404).json({
        success: false,
        message: "Investor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      phone: investor.phone,
      user: investor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};