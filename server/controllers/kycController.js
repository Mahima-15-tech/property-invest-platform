  const KYC = require("../models/kyc");
  const User = require("../models/user");

  // =====================================================
  // SAVE BASIC INFORMATION
  // =====================================================
  exports.saveBasicInfo = async (req, res) => {
    try {
      const { fullName, email, dob, address } = req.body;

      if (!fullName || !email || !dob || !address) {
        return res.status(400).json({
          success: false,
          message: "Please provide all basic information",
        });
      }

      let kyc = await KYC.findOne({ userId: req.user.id });

      if (!kyc) {
        kyc = await KYC.create({
          userId: req.user.id,
          fullName,
          email: email.trim().toLowerCase(),
          dob,
          address,
          currentStep: 2,
        });
      } else {
        // Do not clear rejection details while editing.
        kyc.fullName = fullName;
        kyc.email = email.trim().toLowerCase();
        kyc.dob = dob;
        kyc.address = address;
        kyc.currentStep = Math.max(kyc.currentStep || 1, 2);

        await kyc.save();
      }

      return res.json({
        success: true,
        message: "Basic information saved successfully",
        kyc,
      });
    } catch (error) {
      console.error("SAVE BASIC INFO ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // =====================================================
  // UPLOAD PAN
  // =====================================================
  exports.uploadPan = async (req, res) => {
    try {
      const { panNumber } = req.body;

      const kyc = await KYC.findOne({ userId: req.user.id });

      if (!kyc) {
        return res.status(400).json({
          success: false,
          message: "Please complete basic information first",
        });
      }

      if (!panNumber || !panNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: "PAN number is required",
        });
      }

      if (!req.file && !kyc.panFile) {
        return res.status(400).json({
          success: false,
          message: "PAN document is required",
        });
      }

      kyc.panNumber = panNumber.trim().toUpperCase();

      if (req.file) {
        kyc.panFile = req.file.path;
      }

      // Do not mark a document verified merely because it was uploaded.
      kyc.panStatus = "pending";
      kyc.currentStep = Math.max(kyc.currentStep || 1, 3);

      await kyc.save();

      return res.json({
        success: true,
        message: "PAN details saved successfully",
        kyc,
      });
    } catch (error) {
      console.error("UPLOAD PAN ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // =====================================================
  // UPLOAD AADHAAR
  // =====================================================
  exports.uploadAadhaar = async (req, res) => {
    try {
      const { aadhaarNumber } = req.body;

      const kyc = await KYC.findOne({ userId: req.user.id });

      if (!kyc) {
        return res.status(400).json({
          success: false,
          message: "Please complete basic information first",
        });
      }

      if (!aadhaarNumber || !aadhaarNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: "Aadhaar number is required",
        });
      }

      if (!req.file && !kyc.aadhaarFile) {
        return res.status(400).json({
          success: false,
          message: "Aadhaar document is required",
        });
      }

      kyc.aadhaarNumber = aadhaarNumber.trim();

      if (req.file) {
        kyc.aadhaarFile = req.file.path;
      }

      kyc.aadhaarStatus = "pending";
      kyc.currentStep = Math.max(kyc.currentStep || 1, 4);

      await kyc.save();

      return res.json({
        success: true,
        message: "Aadhaar details saved successfully",
        kyc,
      });
    } catch (error) {
      console.error("UPLOAD AADHAAR ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // =====================================================
  // SAVE NOMINEE DETAILS
  // =====================================================
  exports.saveNominee = async (req, res) => {
    try {
      const { name, panNumber, aadhaarNumber, dob } = req.body;

      const kyc = await KYC.findOne({ userId: req.user.id });

      if (!kyc) {
        return res.status(400).json({
          success: false,
          message: "Please complete basic information first",
        });
      }

      if (!name || !panNumber || !aadhaarNumber || !dob) {
        return res.status(400).json({
          success: false,
          message: "Please provide all nominee details",
        });
      }

      kyc.nominee = {
        name: name.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        aadhaarNumber: aadhaarNumber.trim(),
        dob,
      };

      kyc.currentStep = Math.max(kyc.currentStep || 1, 5);

      await kyc.save();

      return res.json({
        success: true,
        message: "Nominee details saved successfully",
        kyc,
      });
    } catch (error) {
      console.error("SAVE NOMINEE ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // =====================================================
  // SAVE BANK DETAILS
  // =====================================================
  exports.saveBank = async (req, res) => {
    try {
      const { beneficiaryName, accountNumber, ifsc, branch } = req.body;

      const kyc = await KYC.findOne({ userId: req.user.id });

      if (!kyc) {
        return res.status(400).json({
          success: false,
          message: "Please complete basic information first",
        });
      }

      if (!beneficiaryName || !accountNumber || !ifsc || !branch) {
        return res.status(400).json({
          success: false,
          message: "Please provide all bank details",
        });
      }

      const existingCheque = kyc.bank?.cancelCheque;

      if (!req.file && !existingCheque) {
        return res.status(400).json({
          success: false,
          message: "Cancelled cheque document is required",
        });
      }

      kyc.bank = {
        beneficiaryName: beneficiaryName.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        branch: branch.trim(),
        cancelCheque: req.file?.path || existingCheque || "",
      };

      kyc.currentStep = Math.max(kyc.currentStep || 1, 6);

      await kyc.save();

      return res.json({
        success: true,
        message: "Bank details saved successfully",
        kyc,
      });
    } catch (error) {
      console.error("SAVE BANK ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // =====================================================
  // GET KYC
  // =====================================================
  exports.getKyc = async (req, res) => {
    try {
      const kyc = await KYC.findOne({ userId: req.user.id });

      return res.json(kyc);
    } catch (error) {
      console.error("GET KYC ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // =====================================================
  // SUBMIT / RESUBMIT KYC
  // =====================================================
  exports.submitKyc = async (req, res) => {
    try {
      const kyc = await KYC.findOne({ userId: req.user.id });

      if (!kyc) {
        return res.status(400).json({
          success: false,
          message: "Please complete KYC first",
        });
      }

      if (kyc.approvalStatus === "approved") {
        return res.status(400).json({
          success: false,
          message: "Your KYC is already approved",
        });
      }

      const missingFields = [];

      if (!kyc.fullName) missingFields.push("Full name");
      if (!kyc.email) missingFields.push("Email");
      if (!kyc.dob) missingFields.push("Date of birth");
      if (!kyc.address) missingFields.push("Address");

      if (!kyc.panNumber) missingFields.push("PAN number");
      if (!kyc.panFile) missingFields.push("PAN document");

      if (!kyc.aadhaarNumber) missingFields.push("Aadhaar number");
      if (!kyc.aadhaarFile) missingFields.push("Aadhaar document");

      if (!kyc.nominee?.name) missingFields.push("Nominee name");
      if (!kyc.nominee?.panNumber) {
        missingFields.push("Nominee PAN number");
      }
      if (!kyc.nominee?.aadhaarNumber) {
        missingFields.push("Nominee Aadhaar number");
      }
      if (!kyc.nominee?.dob) {
        missingFields.push("Nominee date of birth");
      }

      if (!kyc.bank?.beneficiaryName) {
        missingFields.push("Bank beneficiary name");
      }
      if (!kyc.bank?.accountNumber) {
        missingFields.push("Bank account number");
      }
      if (!kyc.bank?.ifsc) missingFields.push("Bank IFSC");
      if (!kyc.bank?.branch) missingFields.push("Bank branch");
      if (!kyc.bank?.cancelCheque) {
        missingFields.push("Cancelled cheque");
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Please complete all required KYC details",
          missingFields,
        });
      }

      // Successful submission: send KYC back for admin review.
      kyc.status = "submitted";
      kyc.approvalStatus = "pending";
      kyc.rejectionType = null;
      kyc.rejectionMessage = "";

      await kyc.save();

      await User.findByIdAndUpdate(
        req.user.id,
        { kycStatus: "pending" },
        { new: true }
      );

      return res.json({
        success: true,
        message: "KYC submitted successfully for review",
        status: kyc.status,
        approvalStatus: kyc.approvalStatus,
        kyc,
      });
    } catch (error) {
      console.error("SUBMIT KYC ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // =====================================================
  // ADMIN: UPDATE KYC DETAILS
  // =====================================================
  exports.updateKycDetails = async (req, res) => {
    try {
      console.log("========== KYC UPDATE REQUEST ==========");
console.log("URL:", req.originalUrl);
console.log("CONTENT TYPE:", req.headers["content-type"]);
console.log("BODY:", req.body);
console.log("FILES:", Object.keys(req.files || {}));
      const { id } = req.params;
  
      const parseObject = (value, fallback = {}) => {
        if (value === undefined || value === null || value === "") {
          return fallback;
        }
  
        if (typeof value === "object") return value;
  
        try {
          return JSON.parse(value);
        } catch {
          throw new Error("Invalid KYC form data");
        }
      };
  
      if (!req.body || typeof req.body !== "object") {
        console.error("KYC UPDATE: req.body missing", {
          contentType: req.headers["content-type"],
          files: Object.keys(req.files || {}),
        });
      
        return res.status(400).json({
          success: false,
          message:
            "KYC form data was not received. Check the upload middleware and request format.",
        });
      }
      
      const {
        fullName,
        email,
        phone,
        dob,
        address,
        panNumber,
        aadhaarNumber,
      } = req.body;
      
      const nominee = parseObject(req.body.nominee);
      const bank = parseObject(req.body.bank);
  
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      let kyc = await KYC.findOne({ userId: id });
  
      if (!kyc) {
        kyc = new KYC({ userId: id });
      }
  
      // Basic information
      if (fullName !== undefined) {
        kyc.fullName = fullName.trim();
      }
  
      if (email !== undefined) {
        kyc.email = email.trim().toLowerCase();
      }
  
      if (dob !== undefined) {
        kyc.dob = dob || null;
      }
  
      if (address !== undefined) {
        kyc.address = address;
      }
  
      // Identity information
      if (panNumber !== undefined) {
        kyc.panNumber = panNumber.trim().toUpperCase();
      }
  
      if (aadhaarNumber !== undefined) {
        kyc.aadhaarNumber = aadhaarNumber.trim();
      }
  
      // Nominee information
      if (req.body.nominee !== undefined) {
        kyc.nominee = {
          name: nominee.name ?? kyc.nominee?.name ?? "",
          panNumber:
            nominee.panNumber?.trim().toUpperCase() ??
            kyc.nominee?.panNumber ??
            "",
          aadhaarNumber:
            nominee.aadhaarNumber?.trim() ??
            kyc.nominee?.aadhaarNumber ??
            "",
          dob: nominee.dob ?? kyc.nominee?.dob ?? null,
        };
      }
  
      // Bank information: preserve the existing cheque unless replaced
      if (req.body.bank !== undefined) {
        kyc.bank = {
          beneficiaryName:
            bank.beneficiaryName ??
            kyc.bank?.beneficiaryName ??
            "",
          accountNumber:
            bank.accountNumber ??
            kyc.bank?.accountNumber ??
            "",
          ifsc:
            bank.ifsc?.toUpperCase() ??
            kyc.bank?.ifsc ??
            "",
          branch:
            bank.branch ??
            kyc.bank?.branch ??
            "",
          cancelCheque:
            kyc.bank?.cancelCheque || "",
        };
      }
  
      // Replace only files actually selected by the admin.
      const files = req.files || {};
  
      if (files.panFile?.[0]) {
        kyc.panFile = files.panFile[0].path;
        kyc.panStatus = "pending";
      }
  
      if (files.aadhaarFile?.[0]) {
        kyc.aadhaarFile = files.aadhaarFile[0].path;
        kyc.aadhaarStatus = "pending";
      }
  
      if (files.cancelCheque?.[0]) {
        kyc.bank = {
          ...(kyc.bank?.toObject?.() || kyc.bank || {}),
          cancelCheque: files.cancelCheque[0].path,
        };
      }
  
      await kyc.save();

      // If admin corrected a rejected contact/bank KYC,
// send it back to pending for final review.
if (
  kyc.approvalStatus === "rejected" &&
  kyc.rejectionType === "contact_bank"
) {
  kyc.status = "submitted";
  kyc.approvalStatus = "pending";
  kyc.rejectionType = null;
  kyc.rejectionMessage = "";

  await kyc.save();

  await User.findByIdAndUpdate(id, {
    kycStatus: "pending",
  });
}
  
      // Keep the user profile's name and email synchronized.
    
/* Keep user profile details synchronized */
const userUpdates = {};

if (fullName !== undefined) {
  userUpdates.name = fullName.trim();
}

if (email !== undefined) {
  userUpdates.email = email.trim().toLowerCase();
}

if (phone !== undefined) {
  userUpdates.phone = phone.trim();
}

if (Object.keys(userUpdates).length) {
  await User.findByIdAndUpdate(id, userUpdates, {
    runValidators: true,
  });
}

  
      return res.status(200).json({
        success: true,
        message: "KYC details and documents updated successfully",
        kyc,
      });
    } catch (error) {
      console.error("UPDATE KYC DETAILS ERROR:", error);
  
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update KYC details",
      });
    }
  };