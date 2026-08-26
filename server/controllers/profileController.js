const User = require("../models/user");
const Investment = require("../models/investment");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // User details
    const user = await User.findById(userId).select(
      "name fullName email phone profileImage"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Approved investments only
    const investments = await Investment.find({
      userId,
      status: "approved",
    }).populate("propertyId");

    // Valid investments
    const validInvestments = investments.filter(
      (inv) => inv.propertyId
    );

    // Total shares
    const totalShares = validInvestments.reduce(
      (sum, inv) => sum + Number(inv.shares || 0),
      0
    );

    // Unique properties count
    const uniqueProperties = [
      ...new Set(
        validInvestments.map(
          (inv) => inv.propertyId._id.toString()
        )
      ),
    ];

    const totalProperties = uniqueProperties.length;

    // Weighted expected return
    let totalInvested = 0;
    let totalReturnAmount = 0;

    validInvestments.forEach((inv) => {
      const property = inv.propertyId;

      const invested =
        Number(inv.amount) ||
        Number(inv.shares) *
          Number(
            inv.pricePerShare ||
              property.pricePerShare ||
              0
          );

      const roi = Number(property.roi || 0);

      totalInvested += invested;
      totalReturnAmount += (invested * roi) / 100;
    });

    const expectedReturn =
      totalInvested > 0
        ? (totalReturnAmount / totalInvested) * 100
        : 0;

    res.json({
      profile: {
        name: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profileImage: user.profileImage || null,
      },

      stats: {
        properties: totalProperties,
        shares: totalShares,
        returns: Number(expectedReturn.toFixed(1)),
      },
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};