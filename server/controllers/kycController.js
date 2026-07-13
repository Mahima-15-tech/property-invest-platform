const KYC = require("../models/kyc");
const User = require("../models/user");

exports.saveBasicInfo = async (req, res) => {
  const { fullName, email, dob, address } = req.body;

  let kyc = await KYC.findOne({ userId: req.user.id });

  if (!kyc) {
    kyc = await KYC.create({
      userId: req.user.id,
      fullName,
      email,
      dob,
      address,
      currentStep: 2, // 🔥 move to next step
    });
  } else {
    Object.assign(kyc, { fullName, email, dob, address, currentStep: 2 });
    await kyc.save();
  }

  res.json({ message: "Basic info saved", kyc });
};

exports.uploadPan = async (req, res) => {
  const { panNumber } = req.body;

  const kyc = await KYC.findOne({ userId: req.user.id });

  kyc.panNumber = panNumber;
  kyc.panFile = req.file?.path;
  kyc.panStatus = "verified";
  kyc.currentStep = 3;

  await kyc.save();

  res.json({ message: "PAN saved", kyc });
};

exports.uploadAadhaar = async (req, res) => {
  const { aadhaarNumber } = req.body;

  const kyc = await KYC.findOne({ userId: req.user.id });

  kyc.aadhaarNumber = aadhaarNumber;
  kyc.aadhaarFile = req.file?.path;
  kyc.aadhaarStatus = "verified";
  kyc.currentStep = 4;

  await kyc.save();

  res.json({ message: "Aadhaar saved", kyc });
};

exports.saveNominee = async (req, res) => {
  const { name, panNumber, aadhaarNumber, dob } = req.body;

  const kyc = await KYC.findOne({ userId: req.user.id });

  kyc.nominee = { name, panNumber, aadhaarNumber, dob };
  kyc.currentStep = 5;

  await kyc.save();

  res.json({ message: "Nominee saved", kyc });
};

exports.saveBank = async (req, res) => {
  const { beneficiaryName, accountNumber, ifsc, branch } = req.body;

  const kyc = await KYC.findOne({ userId: req.user.id });

  kyc.bank = {
    beneficiaryName,
    accountNumber,
    ifsc,
    branch,
    cancelCheque: req.file?.path,
  };

  kyc.currentStep = 6;

  await kyc.save();

  res.json({ message: "Bank details saved", kyc });
};


  exports.getKyc = async (req, res) => {
    const kyc = await KYC.findOne({ userId: req.user.id });
  
    res.json(kyc);
  };

  exports.submitKyc = async (req, res) => {
    const kyc = await KYC.findOne({ userId: req.user.id });
  
    kyc.status = "submitted";
  
    await kyc.save();
  
    await User.findByIdAndUpdate(req.user.id, {
      kycStatus: "pending",
    });
  
    res.json({ message: "KYC submitted successfully" });
  };