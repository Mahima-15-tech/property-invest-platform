const Investment = require("../models/investment");
const AuditLog = require("../models/auditLog");
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Investment.find()
      .populate("userId", "name")
      .populate("propertyId", "name")
      .sort({ createdAt: -1 });

    const data = transactions.map((tx) => ({
      id: `TX-${tx._id.toString().slice(-4)}`,
      mongoId: tx._id,
      investor: tx.userId?.name,
      property: tx.propertyId?.name,
      amount: `₹${tx.amount}`,
      date: new Date(tx.createdAt).toLocaleDateString(),
      time: new Date(tx.createdAt).toLocaleTimeString(),
      status: tx.status,
      method: tx.method,
    }));

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
      const { status } = req.body;
  
      const tx = await Investment.findById(req.params.id);
  
      if (!tx) {
        return res.status(404).json({ message: "Transaction not found" });
      }
  
      tx.status = status;
      await tx.save();

      await AuditLog.create({
        action: `Transaction ${status}`,
        user: req.user.id,
        details: `TX-${tx._id}`,
        type: "transaction",
      });
  
      res.json({
        message: `Transaction ${status}`,
        tx,
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  exports.createManualTransaction = async (req, res) => {
    try {
      const { userId, propertyId, amount, method } = req.body;
  
      // ✅ VALIDATION
      if (!userId || !propertyId || !amount) {
        return res.status(400).json({
          message: "All fields required",
        });
      }
  
      const tx = await Investment.create({
        userId,
        propertyId,
        amount: Number(amount),
        shares: 0,
        method: method || "Cash",
        status: "completed",
      });

      await AuditLog.create({
        action: "Manual Transaction Added",
        user: req.user.id,
        details: `₹${amount}`,
        type: "transaction",
      });
  
      res.json({
        message: "Manual transaction added",
        tx,
      });
  
    } catch (err) {
      console.log(err); // 🔥 IMPORTANT
      res.status(500).json({ error: err.message });
    }
  };