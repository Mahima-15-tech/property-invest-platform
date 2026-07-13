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

console.log("6");
exports.invest = async (req, res) => {
  try {

    
    const { propertyId, shares, method } = req.body;

    const user = await User.findById(req.user.id);
    const property = await Property.findById(propertyId);

    const sharesNum = Number(shares);

    if (!sharesNum || isNaN(sharesNum)) {
      return res.status(400).json({
        message: "Invalid shares value",
      });
    }

    if (!property || !property.pricePerShare) {
      return res.status(400).json({
        message: "Property price missing",
      });
    }

   

    if (sharesNum > property.availableShares) {
      return res.status(400).json({
        message: "Not enough shares available",
      });
    }
    const amount = sharesNum * property.pricePerShare;

    const investment = await Investment.create({
      userId: user._id,
      propertyId,
      shares: sharesNum,
      amount,
      method: method || "Bank Transfer",
  status: "pending", 
    });

    

    // commission
    if (user.referredBy) {
      const broker = await User.findById(user.referredBy);
      const finalAmount = amount; 

      const totalCommission =
        (finalAmount * broker.commissionRate) / 100;
    
      // 🔥 split logic
      const sale = totalCommission * 0.7;
      const referral = totalCommission * 0.2;
      const performance = totalCommission * 0.1;
    
      await Commission.insertMany([
        {
          brokerId: broker._id,
          userId: user._id,
          propertyId,
          amount,
          commissionAmount: sale,
          type: "sale",
          status: "pending", 
        },
        {
          brokerId: broker._id,
          userId: user._id,
          propertyId,
          amount,
          commissionAmount: referral,
          type: "referral",
          status: "pending", 
        },
        {
          brokerId: broker._id,
          userId: user._id,
          propertyId,
          amount,
          commissionAmount: performance,
          type: "performance",
          status: "pending", 
        },
      ]);
    }

    res.json({
      message: "Investment successful",
      investment,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
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
      sharesLeft: p.availableShares,     // frontend ke liye
    
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
console.log("👉 propertyId:", req.body.propertyId);
  try {
    const { propertyId, shares, referralCode } = req.body;
   
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const sharesNum = Number(shares);
    if (!sharesNum || isNaN(sharesNum)) {
      return res.status(400).json({ message: "Invalid shares" });
    }

    if (sharesNum > property.availableShares) {
      return res.status(400).json({
        message: "Not enough shares available",
      });
    }

    const amount = sharesNum * property.pricePerShare;

    // 🔥 referral logic
    let discount = 0;
    let broker = null;

    if (referralCode) {
      broker = await User.findOne({
        referralCode,
        role: "broker",
        isApproved: true
      });

      if (!broker) {
        return res.status(400).json({
          message: "Invalid referral code",
        });
      }

      // ✅ correct 5%
      discount = amount * 0.05;
    }

    const finalAmount = amount - discount;

    // 🔥 set referredBy only once
    const user = await User.findById(req.user.id);
    if (broker && !user.referredBy) {
      user.referredBy = broker._id;
      await user.save();
    }

    const ownershipPercent =
      (sharesNum / property.totalShares) * 100;

    const investment = await Investment.create({
      userId: req.user.id,
      propertyId,
      shares: sharesNum,
      pricePerShare: property.pricePerShare,
      amount,
      discount,
      finalAmount,
      ownershipPercent,
    });

    // 🔥 property update
    property.availableShares -= sharesNum;
    property.investedAmount += finalAmount;
    property.investors += 1;

    property.soldPercent =
      ((property.totalShares - property.availableShares) /
        property.totalShares) * 100;

    await property.save();

    res.json({
      message: "Investment successful",
      investment,
      kycStatus: user.kycStatus || "pending"
    });


  } catch (err) {
    console.error("CREATE INVESTMENT ERROR");
    console.error(err);
    console.error(err.stack);
  
    res.status(500).json({
      message: err.message,
      stack: err.stack,
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

    const broker = await User.findOne({
      referralCode: code,
      role: "broker",
      isApproved: true
    });

    if (!broker) {
      return res.status(400).json({
        valid: false,
        message: "Invalid referral code"
      });
    }

    res.json({
      valid: true,
      message: "Valid referral code",
      discount: 5, // %
      brokerId: broker._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};