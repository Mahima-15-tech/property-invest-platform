const Property = require("../models/property");
const Investment = require("../models/investment");
const Payment = require("../models/payment");
const User = require("../models/user");
const KYC = require("../models/kyc");
const Commission = require("../models/commission");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

exports.getDashboard = async (req, res) => {
  try {
    // =====================================================
    // DATE HELPERS
    // =====================================================

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfSixMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    // =====================================================
    // 1. TOTAL ASSET VALUE
    // =====================================================

    const assetResult = await Property.aggregate([
      {
        $match: {
          isPublished: true,
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$totalValue", 0],
            },
          },
        },
      },
    ]);

    const totalAssetValue =
      assetResult[0]?.total || 0;

    // =====================================================
    // 2. ACTIVE FUNDING
    // =====================================================

    const activeFundingResult = await Property.aggregate([
      {
        $match: {
          isPublished: true,
          status: "funding",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$investedAmount", 0],
            },
          },
        },
      },
    ]);

    const activeFunding =
      activeFundingResult[0]?.total || 0;

   // =====================================================
// 3. CURRENT MONTH REVENUE
// =====================================================
// Revenue = approved investments this month
// Uses approvedAmount first, then finalAmount, then amount
// =====================================================

const revenueResult = await Investment.aggregate([
    {
      $match: {
        status: "approved",
        createdAt: {
          $gte: startOfMonth,
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
              "$approvedAmount",
              {
                $ifNull: [
                  "$finalAmount",
                  {
                    $ifNull: ["$amount", 0],
                  },
                ],
              },
            ],
          },
        },
      },
    },
  ]);
  
  const revenue =
    revenueResult[0]?.total || 0;

  

    // =====================================================
    // 4. TOTAL INVESTORS
    // =====================================================

    const totalInvestors =
      await User.countDocuments({
        role: "investor",
      });

    // =====================================================
    // 5. APPROVED INVESTORS
    // =====================================================

    const approvedInvestorIds =
      await Investment.distinct("userId", {
        status: "approved",
      });

    const approvedInvestors =
      approvedInvestorIds.length;

    // =====================================================
    // 6. TEMPORARY CONVERSION RATE
    // =====================================================

    const conversionRate =
      totalInvestors > 0
        ? Number(
            (
              (approvedInvestors /
                totalInvestors) *
              100
            ).toFixed(1)
          )
        : 0;

    // =====================================================
    // 7. PENDING KYC
    // =====================================================

    const pendingKyc =
      await KYC.countDocuments({
        approvalStatus: "pending",
      });

    // =====================================================
    // 8. BROKER PAYOUTS - CURRENT MONTH
    // =====================================================

    const brokerPayoutResult =
      await Commission.aggregate([
        {
          $match: {
            status: "paid",
            createdAt: {
              $gte: startOfMonth,
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
                  0,
                ],
              },
            },
          },
        },
      ]);

    const brokerPayouts =
      brokerPayoutResult[0]?.total || 0;

    // =====================================================
    // 9. MONTHLY REVENUE - LAST 6 MONTHS
    // =====================================================

    const monthlyRevenueRaw =
    await Investment.aggregate([
      {
        $match: {
          status: "approved",
          createdAt: {
            $gte: startOfSixMonthsAgo,
            $lte: now,
          },
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
                "$approvedAmount",
                {
                  $ifNull: [
                    "$finalAmount",
                    {
                      $ifNull: ["$amount", 0],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
  
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // =====================================================
    // FORMAT LAST 6 MONTHS
    // =====================================================

    const monthlyRevenue = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const found =
        monthlyRevenueRaw.find(
          (item) =>
            item._id.year === year &&
            item._id.month === month
        );

      monthlyRevenue.push({
        month: date.toLocaleString("en-IN", {
          month: "short",
        }),

        year,

        revenue:
          found?.revenue || 0,
      });
    }

    // =====================================================
// 10. TOP 5 ACTIVE FUNDING PROPERTIES
// =====================================================
// Highest investment first
// Latest property as tie breaker
// =====================================================

const activeFundingProperties =
await Property.find({
  isPublished: true,
  status: "funding",
})
  .sort({
    investedAmount: -1,
    createdAt: -1,
  })
  .limit(5)
  .select(
    "_id name location totalValue investedAmount soldPercent availableShares totalShares media status createdAt"
  );

const formattedFundingProperties =
activeFundingProperties.map((property) => ({
  _id: property._id,

  name: property.name,

  location: {
    city: property.location?.city || "",
    state: property.location?.state || "",
  },

  image:
    property.media?.images?.[0] || "",

  totalValue:
    Number(property.totalValue || 0),

  investedAmount:
    Number(property.investedAmount || 0),

  soldPercent:
    Number(property.soldPercent || 0),

  availableShares:
    Number(property.availableShares || 0),

  totalShares:
    Number(property.totalShares || 0),

  status: property.status,

  createdAt: property.createdAt,
}));

// =====================================================
// 11. RECENT ACTIVITY
// =====================================================
// Shows different platform activities
// Removes duplicate investment/payment activities
// Keeps latest activities first
// =====================================================

const [
    recentProperties,
    recentInvestments,
    recentPayments,
    recentKyc,
  ] = await Promise.all([
    // ---------------------------------------------------
    // PROPERTIES
    // ---------------------------------------------------
  
    Property.find({
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id name createdAt"),
  
    // ---------------------------------------------------
    // INVESTMENTS
    // ---------------------------------------------------
  
    Investment.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name")
      .populate("propertyId", "name")
      .select(
        "_id userId propertyId amount finalAmount approvedAmount status createdAt"
      ),
  
    // ---------------------------------------------------
    // PAYMENTS
    // ---------------------------------------------------
  
    Payment.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name")
      .populate("propertyId", "name")
      .select(
        "_id userId propertyId amount status createdAt"
      ),
  
    // ---------------------------------------------------
    // KYC
    // ---------------------------------------------------
  
    KYC.find({
      approvalStatus: {
        $in: ["pending", "approved", "rejected"],
      },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select(
        "_id userId approvalStatus updatedAt"
      )
      .populate("userId", "name"),
  ]);
  
  const activities = [];
  
  // =====================================================
  // HELPER
  // =====================================================
  
  const getId = (value) => {
    if (!value) return "";
    return value?._id?.toString?.() || value?.toString?.() || "";
  };
  
  const getInvestmentAmount = (investment) =>
    Number(
      investment.approvedAmount ||
        investment.finalAmount ||
        investment.amount ||
        0
    );
  
  // =====================================================
  // PROPERTY ACTIVITIES
  // =====================================================
  
  recentProperties.forEach((property) => {
    activities.push({
      id: `property-${property._id}`,
  
      type: "property",
  
      action: "New property listed",
  
      description: `${property.name} was added to the platform.`,
  
      time: property.createdAt,
  
      date: property.createdAt,
    });
  });
  
  // =====================================================
  // INVESTMENT ACTIVITIES
  // =====================================================
  
  recentInvestments.forEach((investment) => {
    const userName =
      investment.userId?.name || "An investor";
  
    const propertyName =
      investment.propertyId?.name || "a property";
  
    const amount = getInvestmentAmount(investment);
  
    let action = "Investment request";
  
    let description = `${userName} requested an investment of ₹${amount.toLocaleString(
      "en-IN"
    )} in ${propertyName}.`;
  
  
    // ---------------------------------------------------
    // PENDING
    // ---------------------------------------------------
  
    if (investment.status === "pending") {
      action = "Investment request";
  
      description = `${userName} requested an investment of ₹${amount.toLocaleString(
        "en-IN"
      )} in ${propertyName}.`;
    }
  
  
    // ---------------------------------------------------
    // PAYMENT DONE
    // ---------------------------------------------------
  
    if (investment.status === "payment_done") {
      action = "Payment submitted";
  
      description = `${userName} submitted payment of ₹${amount.toLocaleString(
        "en-IN"
      )} for ${propertyName}.`;
    }
  
  
    // ---------------------------------------------------
    // APPROVED
    // ---------------------------------------------------
  
    if (investment.status === "approved") {
      action = "Investment approved";
  
      description = `${userName}'s ₹${amount.toLocaleString(
        "en-IN"
      )} investment in ${propertyName} was approved.`;
    }
  
  
    // ---------------------------------------------------
    // REJECTED
    // ---------------------------------------------------
  
    if (investment.status === "rejected") {
      action = "Investment rejected";
  
      description = `${userName}'s ₹${amount.toLocaleString(
        "en-IN"
      )} investment in ${propertyName} was rejected.`;
    }
  
  
    // ---------------------------------------------------
    // EXITED
    // ---------------------------------------------------
  
    if (investment.status === "exited") {
      action = "Investment exited";
  
      description = `${userName} exited their investment in ${propertyName}.`;
    }
  
  
    activities.push({
      id: `investment-${investment._id}`,
  
      type: "investment",
  
      action,
  
      description,
  
      time: investment.createdAt,
  
      date: investment.createdAt,
  
      // Extra data used for duplicate detection
      userId: getId(investment.userId),
      propertyId: getId(investment.propertyId),
      amount,
      source: "investment",
    });
  });
  
  // =====================================================
  // PAYMENT ACTIVITIES
  // =====================================================
  
  recentPayments.forEach((payment) => {
    const userId = getId(payment.userId);
  
    const propertyId = getId(payment.propertyId);
  
    const amount = Number(payment.amount || 0);
  
    const paymentDate = new Date(payment.createdAt);
  
    // ---------------------------------------------------
    // If this payment belongs to an investment activity
    // created around the same time with same user/property/
  //  amount, don't show it again.
  // ---------------------------------------------------
  
    const belongsToInvestment =
      recentInvestments.some((investment) => {
        const investmentUserId =
          getId(investment.userId);
  
        const investmentPropertyId =
          getId(investment.propertyId);
  
        const investmentAmount =
          getInvestmentAmount(investment);
  
        const investmentDate =
          new Date(investment.createdAt);
  
        const timeDifference =
          Math.abs(
            paymentDate.getTime() -
              investmentDate.getTime()
          );
  
        // 30 minutes window
        const withinSameTransaction =
          timeDifference <= 30 * 60 * 1000;
  
        return (
          investmentUserId === userId &&
          investmentPropertyId === propertyId &&
          investmentAmount === amount &&
          withinSameTransaction
        );
      });
  
    // ---------------------------------------------------
    // Don't duplicate investment/payment
    // ---------------------------------------------------
  
    if (belongsToInvestment) {
      return;
    }
  
    const propertyName =
      payment.propertyId?.name || "property";
  
    let action = "Payment activity";
  
    if (payment.status === "success") {
      action = "Payment received";
    }
  
    if (payment.status === "failed") {
      action = "Payment failed";
    }
  
    if (payment.status === "pending") {
      action = "Payment pending";
    }
  
    activities.push({
      id: `payment-${payment._id}`,
  
      type: "payment",
  
      action,
  
      description: `₹${amount.toLocaleString(
        "en-IN"
      )} payment for ${propertyName}.`,
  
      time: payment.createdAt,
  
      date: payment.createdAt,
  
      source: "payment",
    });
  });
  
  // =====================================================
  // KYC ACTIVITIES
  // =====================================================
  
  recentKyc.forEach((kyc) => {
    const status =
      kyc.approvalStatus || "pending";
  
    let action = "KYC updated";
  
    if (status === "pending") {
      action = "KYC pending review";
    }
  
    if (status === "approved") {
      action = "KYC approved";
    }
  
    if (status === "rejected") {
      action = "KYC rejected";
    }
  
    activities.push({
      id: `kyc-${kyc._id}`,
  
      type: "kyc",
  
      action,
  
      description: `${
        kyc.userId?.name || "Investor"
      }'s KYC status is ${status}.`,
  
      time: kyc.updatedAt,
  
      date: kyc.updatedAt,
  
      source: "kyc",
    });
  });
  
  // =====================================================
  // REMOVE EXACT DUPLICATE ACTIVITIES
  // =====================================================
  
  const uniqueActivities = [];
  
  const seenActivities = new Set();
  
  activities.forEach((activity) => {
    let duplicateKey = "";
  
    // ---------------------------------------------------
    // Investment duplicate key
    // ---------------------------------------------------
  
    if (activity.source === "investment") {
      duplicateKey = [
        "investment",
        activity.userId,
        activity.propertyId,
        activity.amount,
        activity.action,
      ].join("|");
    }
  
    // ---------------------------------------------------
    // Property duplicate key
    // ---------------------------------------------------
  
    else if (activity.source === "property") {
      duplicateKey = [
        "property",
        activity.id,
      ].join("|");
    }
  
    // ---------------------------------------------------
    // Payment duplicate key
    // ---------------------------------------------------
  
    else if (activity.source === "payment") {
      duplicateKey = [
        "payment",
        activity.id,
      ].join("|");
    }
  
    // ---------------------------------------------------
    // KYC duplicate key
    // ---------------------------------------------------
  
    else if (activity.source === "kyc") {
      duplicateKey = [
        "kyc",
        activity.id,
      ].join("|");
    }
  
    // ---------------------------------------------------
    // Add only unique activity
    // ---------------------------------------------------
  
    if (!seenActivities.has(duplicateKey)) {
      seenActivities.add(duplicateKey);
      uniqueActivities.push(activity);
    }
  });
  
  // =====================================================
  // SORT BY LATEST
  // =====================================================
  
  uniqueActivities.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );
  
  // =====================================================
  // FINAL LATEST 5
  // =====================================================
  
  const recentActivity =
    uniqueActivities.slice(0, 5);

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.json({
      success: true,

      stats: {
        totalAssetValue,
        activeFunding,
        revenue,
        conversionRate,
        pendingKyc,
        brokerPayouts,

        totalInvestors,
        approvedInvestors,
      },

      monthlyRevenue,

      activeFundingProperties:
        formattedFundingProperties,

      recentActivity,
    });
  } catch (error) {
    console.error(
      "DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load dashboard",
    });
  }
};