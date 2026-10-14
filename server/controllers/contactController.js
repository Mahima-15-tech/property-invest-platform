const Contact = require("../models/Contact");
const User = require("../models/user");
const KYC = require("../models/kyc");


exports.createContact = async (req, res) => {
  try {
    const {
      subject,
      type,
      message,
      requestedChanges,
    } = req.body;

    // Required field validation
    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Cloudinary files are uploaded by Multer middleware
    const documents = (req.files || []).map((file) => ({
      url: file.path,
      publicId: file.filename || "",
      originalName: file.originalname,
      mimeType: file.mimetype,
    }));

    const parsedChanges =
      typeof requestedChanges === "string"
        ? JSON.parse(requestedChanges || "{}")
        : requestedChanges || {};

    const contact = await Contact.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,

      subject: subject.trim(),
      type: type || "general",
      message: message.trim(),
      requestedChanges: parsedChanges,
      documents,

      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      data: contact,
    });
  } catch (err) {
    console.error("CREATE CONTACT ERROR:", err);

    return res.status(400).json({
      success: false,
      message:
        err instanceof SyntaxError
          ? "Invalid requestedChanges JSON"
          : err.message || "Unable to submit contact request",
    });
  }
};

exports.getMyContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.getAllContacts = async (req, res) => {
  try {
    const { search, status, type } = req.query;
    const filter = {};

    if (search?.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
      ];
    }

    if (status) filter.status = status;
    if (type) filter.type = type;

    const contacts = await Contact.find(filter)
      .populate("userId", "name email phone kycStatus")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = [
      ...new Set(
        contacts
          .map((contact) => contact.userId?._id?.toString())
          .filter(Boolean)
      ),
    ];

    const kycs = userIds.length
      ? await KYC.find({ userId: { $in: userIds } })
          .select(
            "userId status approvalStatus currentStep panFile aadhaarFile bank"
          )
          .lean()
      : [];

    const kycMap = new Map(
      kycs.map((kyc) => [kyc.userId.toString(), kyc])
    );

    const updatedContacts = contacts.map((contact) => {
      const userId = contact.userId?._id?.toString();
      const kyc = userId ? kycMap.get(userId) : null;

      let displayStatus = "not_submitted";

      if (
        contact.userId?.kycStatus === "approved" ||
        kyc?.status === "approved" ||
        kyc?.approvalStatus === "approved"
      ) {
        displayStatus = "approved";
      } else if (
        contact.userId?.kycStatus === "rejected" ||
        kyc?.status === "rejected" ||
        kyc?.approvalStatus === "rejected"
      ) {
        displayStatus = "rejected";
      } else if (
        contact.userId?.kycStatus === "pending" ||
        ["submitted", "draft", "pending"].includes(kyc?.status) ||
        kyc?.approvalStatus === "pending"
      ) {
        displayStatus = "pending";
      }

      return {
        ...contact,
        kyc: {
          exists: Boolean(kyc),
          status: kyc?.status || null,
          approvalStatus: kyc?.approvalStatus || null,
          currentStep: kyc?.currentStep || 1,
          displayStatus,
          panFile: kyc?.panFile || "",
          aadhaarFile: kyc?.aadhaarFile || "",
          bank: {
            ...(kyc?.bank || {}),
            cancelCheque: kyc?.bank?.cancelCheque || "",
          },
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: updatedContacts.length,
      data: updatedContacts,
    });
  } catch (error) {
    console.error("GET ALL CONTACTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch support requests",
    });
  }
};



exports.resolveContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminRemark, rejectionReason } = req.body;

    let updatedData = req.body.updatedData || {};

    if (typeof updatedData === "string") {
      try {
        updatedData = JSON.parse(updatedData || "{}");
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid updatedData JSON",
        });
      }
    }

    if (
      !updatedData ||
      typeof updatedData !== "object" ||
      Array.isArray(updatedData)
    ) {
      updatedData = {};
    }

    const ticket = await Contact.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const user = await User.findById(ticket.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (action === "in_progress") {
      ticket.status = "in_progress";
      ticket.adminRemark = adminRemark || "";
      ticket.resolvedBy = req.user.id;
      ticket.reviewedAt = new Date();

      await ticket.save();

      return res.json({
        success: true,
        message: "Request moved to in progress",
        data: ticket,
      });
    }

    if (action === "reject") {
      ticket.status = "rejected";
      ticket.rejectionReason = rejectionReason || "";
      ticket.adminRemark = adminRemark || rejectionReason || "";
      ticket.resolvedBy = req.user.id;
      ticket.reviewedAt = new Date();

      await ticket.save();

      return res.json({
        success: true,
        message: "Request rejected successfully",
        data: ticket,
      });
    }

    if (action !== "approve") {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    // Update contact details
    if (ticket.type === "contact_change") {
      if (updatedData.name !== undefined) {
        user.name = updatedData.name;
      }

      if (updatedData.phone !== undefined) {
        user.phone = updatedData.phone;
      }

      if (updatedData.email !== undefined) {
        user.email = String(updatedData.email).trim().toLowerCase();
      }

      await user.save();
    }

    // Update bank details and KYC documents
    if (ticket.type === "bank_change") {
      const kyc = await KYC.findOne({ userId: ticket.userId });

      if (!kyc) {
        return res.status(400).json({
          success: false,
          message: "User KYC record not found",
        });
      }

      const isKycApproved =
        user.kycStatus === "approved" ||
        kyc.status === "approved" ||
        kyc.approvalStatus === "approved";

      if (!isKycApproved) {
        return res.status(400).json({
          success: false,
          message: "KYC must be approved before bank details can be updated",
          kycStatus: user.kycStatus,
          approvalStatus: kyc.approvalStatus,
        });
      }

      if (!kyc.bank) {
        kyc.bank = {};
      }

      const bank = updatedData.bank || {};

      if (bank.beneficiaryName !== undefined) {
        kyc.bank.beneficiaryName = bank.beneficiaryName;
      }

      if (bank.accountNumber !== undefined) {
        kyc.bank.accountNumber = bank.accountNumber;
      }

      if (bank.ifsc !== undefined) {
        kyc.bank.ifsc = bank.ifsc;
      }

      if (bank.branch !== undefined) {
        kyc.bank.branch = bank.branch;
      }

      // Multer upload.fields() returns arrays grouped by field name.
      const files = req.files || {};

      if (files.panFile?.[0]?.path) {
        kyc.panFile = files.panFile[0].path;
      }

      if (files.aadhaarFile?.[0]?.path) {
        kyc.aadhaarFile = files.aadhaarFile[0].path;
      }

      if (files.cancelCheque?.[0]?.path) {
        kyc.bank.cancelCheque = files.cancelCheque[0].path;
      }

      await kyc.save();
    }

    ticket.status = "resolved";
    ticket.adminRemark = adminRemark || "";
    ticket.resolvedBy = req.user.id;
    ticket.reviewedAt = new Date();
    ticket.resolvedAt = new Date();

    await ticket.save();

    return res.json({
      success: true,
      message: "Request approved and updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("RESOLVE CONTACT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to resolve support request",
    });
  }
};
