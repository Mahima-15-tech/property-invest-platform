const User = require("../models/user");
const AuditLog = require("../models/auditLog");
const Investment = require("../models/investment");
const Exit = require("../models/exit");
const KYC = require("../models/kyc");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.adminLogin = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.trim() }).select("+password");

    if (!user || user.role !== "admin") {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    if (!password || !user.password) {
      return res.status(400).json({ message: "Password missing" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.approveBroker = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id);
  
      if (!user || user.role !== "broker") {
        return res.status(400).json({ message: "Invalid broker" });
      }
  
      user.isApproved = true;
      await user.save();
  
      res.json({ message: "Broker approved" });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.approveKyc = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      user.kycStatus = "approved";
      await user.save();
  
      const kyc = await KYC.findOneAndUpdate(
        { userId: id },
        {
          approvalStatus: "approved",
        },
        { new: true }
      );
  
      res.json({
        message: "KYC approved",
        status: kyc.status,
        approvalStatus: kyc.approvalStatus,
      });
  
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  
  
  exports.rejectKyc = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      // USER MODEL
      user.kycStatus = "rejected";
      await user.save();
  
      // KYC MODEL
      await KYC.findOneAndUpdate(
        { userId: id },
        { status: "rejected" }
      );
  
      res.json({
        message: "KYC rejected",
      });
  
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  



  const Property = require("../models/property");


  exports.approveInvestment = async (req, res) => {
    try {
      const investment = await Investment.findById(req.params.id);
  
      if (!investment) {
        return res.status(404).json({
          message: "Investment not found",
        });
      }
  
      if (investment.status === "approved") {
        return res.status(400).json({
          message: "Investment already approved",
        });
      }
  
      const { shares, amount } = req.body;
  
      if (shares !== undefined) {
        investment.shares = Number(shares);
      }
  
      if (amount !== undefined) {
        investment.amount = Number(amount);
      }
  
      const property = await Property.findById(investment.propertyId);
  
      if (!property) {
        return res.status(404).json({
          message: "Property not found",
        });
      }
  
      if (investment.shares > property.availableShares) {
        return res.status(400).json({
          message: "Not enough shares available",
        });
      }
  
      const user = await User.findById(investment.userId);
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      if (user.kycStatus !== "approved") {
        return res.status(400).json({
          message: "KYC not approved",
        });
      }
  
      // Property update based on ADMIN APPROVED values
      property.availableShares =
        property.availableShares - investment.shares;
  
      property.soldShares =
        property.soldShares + investment.shares;
  
      property.investedAmount =
        property.investedAmount + investment.amount;
  
      property.investors =
        property.investors + 1;
  
      property.soldPercent = Number(
        (
          (property.soldShares / property.totalShares) *
          100
        ).toFixed(2)
      );
  
      property.status =
        property.availableShares <= 0
          ? "funded"
          : "funding";
  
      investment.status = "approved";
      investment.canEdit = false;
  
      await investment.save();
      await property.save();
  
      res.json({
        message: "Investment approved successfully",
        investment,
      });
  
    } catch (error) {
      console.error("APPROVE INVESTMENT ERROR:", error);
  
      res.status(500).json({
        message: error.message || "Failed to approve investment",
      });
    }
  };

  exports.rejectInvestment = async (req, res) => {
    try {
      const investment = await Investment.findById(req.params.id);
  
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
  
      investment.status = "rejected";
      await investment.save();
  
      res.json({ message: "Investment rejected" });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.getAllExitRequests = async (req, res) => {
    try {
      const exits = await Exit.find()
        .populate("userId", "name email")
        .populate("propertyId", "name")
        .populate("investmentId", "shares amount roi duration canEdit")
        .sort({ createdAt: -1 });
  
      res.json(exits);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };

  exports.approveExit = async (req, res) => {
    try {
  
      const exit = await Exit.findById(req.params.id);
  
      if (!exit) {
        return res.status(404).json({
          message: "Exit not found",
        });
      }
  
      if (exit.status !== "pending") {
        return res.status(400).json({
          message: "Already processed",
        });
      }
  
      const investment = await Investment.findById(exit.investmentId);
  
      const property = await Property.findById(exit.propertyId);
  
      if (!investment) {
        return res.status(404).json({
          message: "Investment not found",
        });
      }
  
      if (!property) {
        return res.status(404).json({
          message: "Property not found",
        });
      }
  
      // price per share of that investment
     // Remaining Investment
investment.shares -= exit.shares;
investment.amount -= exit.amount;

// Safety
if (investment.shares < 0)
  investment.shares = 0;

if (investment.amount < 0)
  investment.amount = 0;

// Investment completed exit
if (investment.shares === 0) {
  investment.status = "exited";
}

await investment.save();
  
      // property update
      property.soldShares -= exit.shares;
  
      property.availableShares += exit.shares;
  
      property.investedAmount -= exit.amount;

      property.investors = await Investment.countDocuments({
        propertyId: property._id,
        status: "approved",
        shares: { $gt: 0 },
      });
  
      property.soldPercent = Number(
        (
          (property.soldShares /
            property.totalShares) *
          100
        ).toFixed(2)
      );
  
      property.status =
        property.availableShares === property.totalShares
          ? "available"
          : property.availableShares <= 0
          ? "funded"
          : "funding";
  
      await property.save();
  
      exit.status = "approved";
  
      exit.approvedBy = req.user.id;
  
      exit.approvedAt = new Date();
  
      await exit.save();
  
      res.json({
        message: "Exit approved successfully",
      });
  
    } catch (err) {
  
      res.status(500).json({
        error: err.message,
      });
  
    }
  };

      exports.rejectExit=async(req,res)=>{

        const exit=await Exit.findById(req.params.id);
        
        if(!exit){
        
        return res.status(404).json({
        message:"Exit not found"
        });
        
        }
        
        exit.status="rejected";
        
        await exit.save();
        
        res.json({
        message:"Exit rejected"
        });
        
        }


        exports.getAllUsers = async (req, res) => {
          try {
        
            const users = await User.find({
              role: "investor"
            }).sort({ createdAt: -1 });
        
            const data = [];
        
            for (const user of users) {
        
              const investment = await Investment.findOne({
                userId: user._id,
              });
        
              // jisne investment ki hai usko skip karo
              if (investment) continue;
        
              data.push({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                kycStatus: user.kycStatus,
                joinDate: user.createdAt,
              });
        
            }
        
            res.json(data);
        
          } catch (err) {
            res.status(500).json({
              error: err.message,
            });
          }
        };

        exports.updateInvestment = async (req, res) => {
          try {
            const investment = await Investment.findById(req.params.id);
        
            if (!investment) {
              return res.status(404).json({
                message: "Investment not found",
              });
            }
        
        
            const {
              shares,
              amount,
              roi,
              duration,
            } = req.body;
        
            if (shares !== undefined) {
              investment.shares = Number(shares);
          }
          
          if (amount !== undefined) {
              investment.amount = Number(amount);
          }
            if (roi !== undefined) investment.roi = roi;
            if (duration !== undefined) investment.duration = duration;
        
            await investment.save();

            await Exit.findOneAndUpdate(
              {
                  investmentId: investment._id,
              },
              {
                  shares: investment.shares,
                  amount: investment.amount,
              }
          );
        
            res.json({
              message: "Investment updated successfully",
              investment,
            });
        
          } catch (err) {
            res.status(500).json({
              error: err.message,
            });
          }
        };

        exports.updateExit = async (req, res) => {
          try {
        
            const exit = await Exit.findById(req.params.id);
        
            if (!exit) {
              return res.status(404).json({
                message: "Exit not found",
              });
            }
        
            const { shares, amount } = req.body;
        
            if (shares !== undefined) {
              exit.shares = Number(shares);
            }
        
            if (amount !== undefined) {
              exit.amount = Number(amount);
            }
        
            await exit.save();
        
            res.json({
              message: "Exit updated successfully",
              exit,
            });
        
          } catch (err) {
            res.status(500).json({
              error: err.message,
            });
          }
        };