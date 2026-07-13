const Contact = require("../models/Contact");

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, type, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      type,
      message,
    });

    res.json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllContacts = async (req, res) => {
    try {
      const { search } = req.query;
  
      let filter = {};
  
      if (search) {
        filter = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { subject: { $regex: search, $options: "i" } },
          ],
        };
      }
  
      const contacts = await Contact.find(filter).sort({ createdAt: -1 });
  
      res.json({
        success: true,
        count: contacts.length,
        data: contacts,
      });
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };