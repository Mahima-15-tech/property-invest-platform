const User = require("../models/user");
const AuditLog = require("../models/auditLog");
const Investment = require("../models/investment");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


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

    


    const { id } = req.params;
  
    const user = await User.findById(id);
  
    user.kycStatus = "approved";
    await user.save();

    await AuditLog.create({
      action: "KYC Approved",
      user: req.user.id,
      details: user.name, // ✅ now correct
      type: "approval",
    });
  
    res.json({ message: "KYC approved" });
  };
  
  exports.rejectKyc = async (req, res) => {
    const { id } = req.params;
  
    const user = await User.findById(id);
  
    user.kycStatus = "rejected";
    await user.save();
  
    res.json({ message: "KYC rejected" });
  };


  const Property = require("../models/property");


  exports.approveInvestment = async (req, res) => {
    const investment = await Investment.findById(req.params.id);
    const property = await Property.findById(investment.propertyId);
  
    const user = await User.findById(investment.userId);
  
    // ❗ KYC check
    if (user.kycStatus !== "approved") {
      return res.status(400).json({
        message: "KYC not approved",
      });
    }
  
    // if (investment.status !== "payment_done") {
    //   return res.status(400).json({
    //     message: "Payment not done",
    //   });
    // }
  
    // ✅ allow approve directly (for now)
investment.status = "approved";
await investment.save();


    // 🔥 FINAL ACTION
    property.availableShares -= investment.shares;
    property.investedAmount += investment.amount;
    property.investors += 1;
  
    property.soldPercent =
      ((property.totalShares - property.availableShares) /
        property.totalShares) * 100;
  
    await property.save();
  
    investment.status = "approved";
    await investment.save();
  
    res.json({
      message: "Investment approved & shares allocated",
    });
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