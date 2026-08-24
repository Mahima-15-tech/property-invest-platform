const AuditLog = require("../models/auditLog");

// 🔥 GET ALL LOGS
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 CREATE LOG (optional manual)
exports.createAuditLog = async (req, res) => {
  try {
    const { action, details, type } = req.body;

    const log = await AuditLog.create({
      action,
      details,
      type,
      user: req.user.id,
    });

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};