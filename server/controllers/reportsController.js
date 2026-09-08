const Investment = require("../models/investment");
const Property = require("../models/property");
const User = require("../models/user");
const Commission = require("../models/commission");

exports.getDashboardReport = async (req, res) => {
  try {
    const period = req.query.period || "6months";

    // =====================================================
    // DATE RANGE
    // =====================================================

    const now = new Date();

    const startDate = new Date(now);

    if (period === "1month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "3months") {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (period === "1year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // Default = 6 months
      startDate.setMonth(startDate.getMonth() - 6);
    }

    // =====================================================
    // BASE FILTERS
    // =====================================================

    const investmentDateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: now,
      },
    };

    const investorDateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: now,
      },
    };

    const propertyDateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: now,
      },
    };

    // =====================================================
    // SUMMARY
    // =====================================================

    const approvedInvestments =
      await Investment.find({
        status: "approved",
        ...investmentDateFilter,
      });

    const allInvestors =
      await User.countDocuments({
        role: "investor",
      });

    const newInvestors =
      await User.countDocuments({
        role: "investor",
        ...investorDateFilter,
      });

    const fundedProperties =
      await Property.countDocuments({
        isPublished: true,
        isDeleted: { $ne: true },
        status: "funded",
      });

    const activeProperties =
      await Property.countDocuments({
        isPublished: true,
        isDeleted: { $ne: true },
        status: "funding",
      });

    // =====================================================
    // INVESTMENT VOLUME
    // =====================================================

    const investmentVolume =
      approvedInvestments.reduce(
        (sum, investment) =>
          sum +
          Number(
            investment.approvedAmount ||
              investment.finalAmount ||
              investment.amount ||
              0
          ),
        0
      );

    // =====================================================
    // PLATFORM REVENUE
    // =====================================================

    const commissionAgg =
      await Commission.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: now,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: [
                  "$commissionAmount",
                  "$amount",
                ],
              },
            },
          },
        },
      ]);

    const totalRevenue =
      Number(
        commissionAgg[0]?.total || 0
      );

    // =====================================================
    // AVG ROI
    // =====================================================

    const roiAgg =
      await Property.aggregate([
        {
          $match: {
            isPublished: true,
            isDeleted: { $ne: true },
            roi: { $gte: 0 },
          },
        },
        {
          $group: {
            _id: null,
            avgROI: {
              $avg: "$roi",
            },
          },
        },
      ]);

    const avgROI = Number(
      roiAgg[0]?.avgROI || 0
    ).toFixed(1);

    // =====================================================
    // CONVERSION RATE
    // =====================================================

    const approvedInvestorIds =
      await Investment.distinct(
        "userId",
        {
          status: "approved",
          userId: { $ne: null },
        }
      );

    const conversionRate =
      allInvestors > 0
        ? Number(
            (
              (approvedInvestorIds.length /
                allInvestors) *
              100
            ).toFixed(2)
          )
        : 0;

    // =====================================================
    // MONTH RANGE
    // =====================================================

    const months = [];

    const cursor = new Date(startDate);

    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= now) {
      months.push({
        year: cursor.getFullYear(),
        month: cursor.getMonth() + 1,
        label: cursor.toLocaleString(
          "en-IN",
          { month: "short" }
        ),
      });

      cursor.setMonth(
        cursor.getMonth() + 1
      );
    }

    // =====================================================
    // REVENUE + INVESTMENT VOLUME
    // =====================================================

    const revenueAgg =
      await Investment.aggregate([
        {
          $match: {
            status: "approved",
            ...investmentDateFilter,
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },

            investmentVolume: {
              $sum: {
                $ifNull: [
                  "$approvedAmount",
                  {
                    $ifNull: [
                      "$finalAmount",
                      "$amount",
                    ],
                  },
                ],
              },
            },
          },
        },
      ]);

    const commissionMonthlyAgg =
      await Commission.aggregate([
        {
          $match: {
            ...investmentDateFilter,
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },

            revenue: {
              $sum: {
                $ifNull: [
                  "$commissionAmount",
                  "$amount",
                ],
              },
            },
          },
        },
      ]);

    const revenueMap = {};

    revenueAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;

      revenueMap[key] = {
        ...(revenueMap[key] || {}),
        investmentVolume:
          Number(
            item.investmentVolume || 0
          ),
      };
    });

    commissionMonthlyAgg.forEach(
      (item) => {
        const key = `${item._id.year}-${item._id.month}`;

        revenueMap[key] = {
          ...(revenueMap[key] || {}),
          revenue: Number(
            item.revenue || 0
          ),
        };
      }
    );

    const revenueData =
      months.map((item) => {
        const key = `${item.year}-${item.month}`;

        return {
          month: item.label,
          revenue:
            revenueMap[key]?.revenue || 0,
          investmentVolume:
            revenueMap[key]
              ?.investmentVolume || 0,
        };
      });

    // =====================================================
    // FUNDING ACTIVITY
    // =====================================================

    const fundingAgg =
      await Property.aggregate([
        {
          $match: {
            isPublished: true,
            isDeleted: { $ne: true },
            ...propertyDateFilter,
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },

            funded: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "funded",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            active: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "funding",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const fundingMap = {};

    fundingAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;

      fundingMap[key] = {
        funded:
          Number(item.funded || 0),
        active:
          Number(item.active || 0),
      };
    });

    const fundingData =
      months.map((item) => {
        const key = `${item.year}-${item.month}`;

        return {
          month: item.label,
          funded:
            fundingMap[key]?.funded || 0,
          active:
            fundingMap[key]?.active || 0,
        };
      });

    // =====================================================
    // INVESTOR + PROPERTY GROWTH
    // =====================================================

    const investorAgg =
      await User.aggregate([
        {
          $match: {
            role: "investor",
            ...investorDateFilter,
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },

            investors: {
              $sum: 1,
            },
          },
        },
      ]);

    const propertyAgg =
      await Property.aggregate([
        {
          $match: {
            isPublished: true,
            isDeleted: { $ne: true },
            ...propertyDateFilter,
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },

            properties: {
              $sum: 1,
            },
          },
        },
      ]);

    const growthMap = {};

    investorAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;

      growthMap[key] = {
        ...(growthMap[key] || {}),
        investors:
          Number(item.investors || 0),
      };
    });

    propertyAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;

      growthMap[key] = {
        ...(growthMap[key] || {}),
        properties:
          Number(item.properties || 0),
      };
    });

    const growthData =
      months.map((item) => {
        const key = `${item.year}-${item.month}`;

        return {
          month: item.label,
          investors:
            growthMap[key]?.investors || 0,
          properties:
            growthMap[key]?.properties || 0,
        };
      });

    // =====================================================
    // PROPERTY PERFORMANCE
    // =====================================================

    const propertyPerformance =
      await Property.find({
        isPublished: true,
        isDeleted: { $ne: true },
      })
        .sort({
          investedAmount: -1,
          createdAt: -1,
        })
        .limit(10)
        .select(
          "_id name totalValue investedAmount soldPercent investors roi status media"
        );

    const formattedPropertyPerformance =
      propertyPerformance.map(
        (property) => ({
          _id: property._id,
          name: property.name,

          totalValue:
            Number(
              property.totalValue || 0
            ),

          investedAmount:
            Number(
              property.investedAmount || 0
            ),

          fundedPercent:
            Number(
              property.soldPercent || 0
            ),

          investors:
            Number(
              property.investors || 0
            ),

          roi:
            Number(property.roi || 0),

          status:
            property.status,

          image:
            property.media?.images?.[0] ||
            "",
        })
      );

    // =====================================================
    // FINAL RESPONSE
    // =====================================================

    return res.json({
      success: true,

      period,

      summary: {
        totalRevenue,
        investmentVolume,
        fundedProperties,
        newInvestors,
        avgROI: Number(avgROI),
        activeProperties,
        totalInvestors: allInvestors,
        conversionRate,
      },

      revenueData,

      fundingData,

      growthData,

      propertyPerformance:
        formattedPropertyPerformance,
    });
  } catch (err) {
    console.error(
      "REPORTS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};