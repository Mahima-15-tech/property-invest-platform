const Investment = require("../models/investment");
const AuditLog = require("../models/auditLog");

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Investment.find()
      .populate("userId", "name email")
      .populate("propertyId", "name")
      .sort({ createdAt: -1 });

    const data = transactions.map((tx) => {
      let status = "Pending";

      switch (tx.status) {
        case "pending":
          status = "Pending";
          break;

        case "payment_done":
          status = "Payment Submitted";
          break;

        case "approved":
          status = "Completed";
          break;

        case "rejected":
          status = "Rejected";
          break;

        case "exited":
          status = "Exited";
          break;

        default:
          status = tx.status || "Pending";
      }

      return {
        mongoId: tx._id,

        investor:
          tx.manualInvestorName ||
          tx.userId?.name ||
          "Unknown Investor",

        investorEmail:
          tx.userId?.email || "",

        property:
          tx.propertyId?.name ||
          "Unknown Property",

        amount: Number(
          tx.approvedAmount ||
          tx.finalAmount ||
          tx.amount ||
          0
        ),

        date: new Date(
          tx.createdAt
        ).toLocaleDateString("en-IN"),

        time: new Date(
          tx.createdAt
        ).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),

        method:
          tx.paymentMethod ||
          tx.method ||
          "Bank Transfer",

        status,

        rawStatus: tx.status,

        paymentReference:
          tx.paymentReference || "",

        paymentProof:
          tx.paymentProof || "",

        shares: Number(
          tx.approvedShares ||
          tx.shares ||
          0
        ),

        notes: tx.notes || "",

        createdAt: tx.createdAt,
      };
    });

    res.json(data);
  } catch (err) {
    console.error(
      "GET TRANSACTIONS ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.createManualTransaction = async (req, res) => {
  try {
    const {
      investorName,
      propertyId,
      amount,
      method,
      notes,
    } = req.body;

    console.log(
      "MANUAL TRANSACTION BODY:",
      req.body
    );

    if (
      !investorName ||
      !investorName.trim() ||
      !propertyId ||
      !amount
    ) {
      return res.status(400).json({
        message:
          "Investor name, property and amount are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const tx = await Investment.create({
      userId: null,

      manualInvestorName: investorName.trim(),

      propertyId,

      amount: Number(amount),

      finalAmount: Number(amount),

      shares: 0,

      method: method || "Bank Transfer",

      paymentMethod: method || "Bank Transfer",

      notes: notes || "",

      status: "approved",

      paymentStatus: "verified",

      paymentVerifiedAt: new Date(),
    });

    await AuditLog.create({
      action: "Manual Transaction Added",
      user: req.user.id,
      details: `₹${Number(amount)} - ${investorName.trim()}`,
      type: "transaction",
    });

    return res.status(201).json({
      success: true,
      message: "Manual transaction added successfully",
      tx,
    });
  } catch (err) {
    console.error(
      "CREATE MANUAL TRANSACTION ERROR:",
      err
    );

    return res.status(500).json({
      error: err.message,
    });
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


 