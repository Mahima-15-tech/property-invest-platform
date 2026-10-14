
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "broker") {
      return res.status(403).json({
        success: false,
        message: "Broker access only",
      });
    }

    const broker = await User.findById(req.user.id).select("role isApproved");

    if (!broker || !broker.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your broker account is pending admin approval",
        isApproved: false,
      });
    }

    next();
  } catch (error) {
    console.error("BROKER APPROVAL CHECK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify broker approval",
    });
  }
};
