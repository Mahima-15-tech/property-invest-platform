const Investment = require("../models/investment");
const Property = require("../models/property");
const User = require("../models/user");

exports.getDashboardReport = async (req, res) => {
  try {
    // 🔥 SUMMARY DATA
    const investments = await Investment.find({ status: "completed" });
    const properties = await Property.find();
    const investors = await User.find({ role: "investor" });

    const totalRevenue = investments.reduce((sum, i) => sum + i.amount, 0);

    const fundedProperties = properties.filter(
      (p) => p.availableShares === 0
    ).length;

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const newInvestors = investors.filter(
      (i) => i.createdAt >= last30Days
    ).length;

    const avgROI =
      properties.length > 0
        ? (
            properties.reduce((sum, p) => sum + (p.roi || 0), 0) /
            properties.length
          ).toFixed(1)
        : 0;

    // 🔥 MONTH NAMES
    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    // ============================
    // 📊 REVENUE (REAL)
    // ============================
    const revenueAgg = await Investment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
        },
      },
    ]);

    const revenueMap = {};
    revenueAgg.forEach((r) => {
      revenueMap[r._id] = r.revenue;
    });

    const revenueData = monthNames.map((m, i) => {
      const revenue = revenueMap[i + 1] || 0;
      return {
        month: m,
        revenue,
        target: Math.round(revenue * 0.9), // 🔥 simple target logic
      };
    });

    // ============================
    // 📊 FUNDING ACTIVITY
    // ============================
    const fundingAgg = await Property.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          funded: {
            $sum: {
              $cond: [{ $eq: ["$availableShares", 0] }, 1, 0],
            },
          },
          active: {
            $sum: {
              $cond: [{ $gt: ["$availableShares", 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    const fundingMap = {};
    fundingAgg.forEach((f) => {
      fundingMap[f._id] = {
        funded: f.funded,
        active: f.active,
      };
    });

    const fundingData = monthNames.map((m, i) => ({
      month: m,
      funded: fundingMap[i + 1]?.funded || 0,
      active: fundingMap[i + 1]?.active || 0,
    }));

    // ============================
    // 📊 PLATFORM GROWTH
    // ============================
    const investorAgg = await User.aggregate([
      { $match: { role: "investor" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          investors: { $sum: 1 },
        },
      },
    ]);

    const propertyAgg = await Property.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          properties: { $sum: 1 },
        },
      },
    ]);

    const growthMap = {};

    investorAgg.forEach((i) => {
      growthMap[i._id] = {
        investors: i.investors,
        properties: 0,
      };
    });

    propertyAgg.forEach((p) => {
      if (!growthMap[p._id]) {
        growthMap[p._id] = {
          investors: 0,
          properties: p.properties,
        };
      } else {
        growthMap[p._id].properties = p.properties;
      }
    });

    const growthData = monthNames.map((m, i) => ({
      month: m,
      investors: growthMap[i + 1]?.investors || 0,
      properties: growthMap[i + 1]?.properties || 0,
    }));

    // ============================
    // 🚀 FINAL RESPONSE
    // ============================
    res.json({
      summary: {
        totalRevenue,
        fundedProperties,
        newInvestors,
        avgROI,
      },
      revenueData,
      fundingData,
      growthData,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};