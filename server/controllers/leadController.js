const Lead = require("../models/lead");

exports.createLead = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    const lead = await Lead.create({
      userId: req.user.id,
      propertyId,
      name,
      email,
      phone,
      message,
    });

    res.json({
      message: "Inquiry submitted successfully",
      lead,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllLeads = async (req, res) => {
    const leads = await Lead.find()
      .populate("userId", "name email")
      .populate("propertyId", "title");
  
    res.json(leads);
  };

  exports.updateLeadStatus = async (req, res) => {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
  
    res.json(lead);
  };