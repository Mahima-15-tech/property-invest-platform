const User = require("../models/user");
const Investment = require("../models/investment");

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
  const user = await User.findById(req.user.id);

  res.json({
    kycStatus: user.kycStatus,
    document: user.kycDocument,
  });
};


<<<<<<< HEAD
// 🔥 GET ALL INVESTORS (ADMIN)
exports.getAllInvestors = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ role: "investor" });

    const investors = await User.find({ role: "investor" })
  .sort({ createdAt: -1 }) // 🔥 NEW FIRST
  .skip(skip)
  .limit(limit);

    const data = await Promise.all(
      investors.map(async (inv) => {
        const investments = await Investment.find({
          userId: inv._id,
        });

        const totalInvested = investments.reduce(
          (sum, i) => sum + i.amount,
          0
        );

        const properties = new Set(
          investments.map((i) => i.propertyId.toString())
        );

        const avgROI = investments.length
          ? (10 + Math.random() * 5).toFixed(1) + "%"
          : "0%";

        return {
          _id: inv._id,
          name: inv.name,
          email: inv.email,
          kycStatus: inv.kycStatus,
          totalInvested: `₹${totalInvested}`,
          properties: properties.size,
          avgROI,
          joinDate: inv.createdAt,
        };
      })
    );

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
=======
// GET ALL INVESTORS (ADMIN)
exports.getAllInvestors = async (req, res) => {
  try {

    const investments = await Investment.find()
      .populate("userId")
      .populate("propertyId");

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
        });
      }

      const user = map.get(id);

      user.totalInvested += inv.amount;
      user.properties.add(inv.propertyId?._id.toString());
    }

    const data = [...map.values()].map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      kycStatus: u.kycStatus,
      totalInvested: `₹${u.totalInvested}`,
      properties: u.properties.size,
      avgROI: "12%",
      joinDate: u.joinDate,
    }));

    res.json({
      data,
      totalPages: 1,
      currentPage: 1,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
>>>>>>> backup-local
  }
};

exports.updateKycStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findById(req.params.id);

    user.kycStatus = status;

    await user.save();

    res.json({
      message: `KYC ${status}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvestorDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const investments = await Investment.find({
      userId: req.params.id,
    }).populate("propertyId");

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

<<<<<<< HEAD


exports.exportInvestorsPDF = async (req, res) => {
  try {
    const investors = await User.find({ role: "investor" });

    const doc = new PDFDocument({ margin: 40, size: "A4" });
=======
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
>>>>>>> backup-local

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=investors.pdf"
    );

    doc.pipe(res);

<<<<<<< HEAD
    // 🔥 HEADER (Premium)
=======
    // Header
>>>>>>> backup-local
    doc
      .rect(0, 0, doc.page.width, 70)
      .fill("#0f172a");

    doc
<<<<<<< HEAD
      .fillColor("#fff")
      .fontSize(18)
      .text("RealEstateHub - Investor Report", 40, 25);

    doc.moveDown(3);

    for (let inv of investors) {
      const investments = await Investment.find({
        userId: inv._id,
      }).populate("propertyId");

      const totalInvested = investments.reduce(
        (sum, i) => sum + i.amount,
        0
      );

      const properties = new Set(
        investments.map((i) => i.propertyId?._id.toString())
      );

      const avgROI = investments.length
        ? (10 + Math.random() * 5).toFixed(1) + "%"
        : "0%";

      // 🔥 CARD STYLE
      doc
        .roundedRect(40, doc.y, 520, 100)
        .fill("#f8fafc");

      doc
        .fillColor("#000")
        .fontSize(12)
        .text(`Name: ${inv.name}`, 50, doc.y + 10)
        .text(`Email: ${inv.email}`)
        .text(`KYC: ${inv.kycStatus}`)
        .text(`Total Invested: ₹${totalInvested}`)
        .text(`Properties: ${properties.size}`)
        .text(`ROI: ${avgROI}`);

      doc.moveDown(2);

      // 🔥 Investments list
      doc
        .fontSize(11)
        .fillColor("#334155")
        .text("Investments:");

      investments.forEach((item) => {
        doc.text(
          `• ${item.propertyId?.name || "Property"} - ₹${item.amount}`
        );
      });

      doc.moveDown(2);

      // 🔥 PAGE BREAK (premium feel)
      if (doc.y > 700) {
        doc.addPage();
      }
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
=======
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
>>>>>>> backup-local
  }
};


exports.getUsersList = async (req, res) => {
  const users = await User.find().select("_id name");
  res.json(users);
};


exports.toggleWatchlist = async (req, res) => {
  const user = await User.findById(req.user.id);
  const { propertyId } = req.body;

  // ✅ null values hata do (important)
  user.watchlist = user.watchlist.filter(Boolean);

  const index = user.watchlist.findIndex(
    (id) => id && id.toString() === propertyId
  );

  if (index > -1) {
    user.watchlist.splice(index, 1); // remove
  } else {
    user.watchlist.push(propertyId); // add
  }

  await user.save();

  res.json({ message: "Watchlist updated" });
};

exports.getWatchlist = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("watchlist");

  const data = user.watchlist
    .filter(Boolean) // ✅ null safe
    .map(p => ({
      id: p._id,
      name: p.name,
      location: `${p.location?.city}, ${p.location?.state}`, 
      image: p.media?.images?.[0],
      roi: p.roi,
    }));

  res.json(data);
};