const OwnershipRequest = require("../models/ownershipRequest");
const Investment = require("../models/investment");
const Property = require("../models/property");
const User = require("../models/user");
const Exit = require("../models/exit");
const mongoose = require("mongoose");

// ======================================================
// CREATE 100% OWNERSHIP REQUEST
// ======================================================

exports.createOwnershipRequest = async (req, res) => {
  try {
    const { investmentId } = req.body;

    if (!investmentId) {
      return res.status(400).json({
        message: "Investment ID is required",
      });
    }

    // ==================================================
    // 1. FIND INVESTMENT
    // ==================================================

    const investment = await Investment.findOne({
      _id: investmentId,
      userId: req.user.id,
      status: "approved",
    });

    if (!investment) {
      return res.status(404).json({
        message: "Approved investment not found",
      });
    }

    // ==================================================
    // 2. FIND PROPERTY
    // ==================================================

    const property = await Property.findById(
      investment.propertyId
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // ==================================================
    // 3. CHECK FULL OWNERSHIP ENABLED
    // ==================================================

    // if (!property.enableFullOwnership) {
    //   return res.status(400).json({
    //     message:
    //       "Full ownership is not available for this property",
    //   });
    // }

    // ==================================================
    // 4. CHECK LOCK-IN
    // ==================================================

    // let eligibleExitDate =
    //   investment.eligibleExitDate;

    // if (!eligibleExitDate) {
    //   const startDate =
    //     investment.lockInStartDate ||
    //     investment.createdAt;

    //   eligibleExitDate = new Date(startDate);

    //   eligibleExitDate.setFullYear(
    //     eligibleExitDate.getFullYear() +
    //       Number(investment.lockInYears || 2)
    //   );
    // }

    // const now = new Date();

    // if (now < eligibleExitDate) {
    //   return res.status(400).json({
    //     message:
    //       "Investment is still under lock-in period",
    //     eligibleExitDate,
    //   });
    // }

    // ==================================================
    // 5. CURRENT SHARES
    // ==================================================

    const currentShares =
      Number(investment.shares || 0);

    const totalShares =
      Number(property.totalShares || 0);

    if (currentShares <= 0) {
      return res.status(400).json({
        message:
          "You do not have any shares in this investment",
      });
    }

    if (totalShares <= 0) {
      return res.status(400).json({
        message:
          "Property total shares are not configured",
      });
    }

    // ==================================================
    // 6. ALREADY 100% OWNED
    // ==================================================

    if (currentShares >= totalShares) {
      return res.status(400).json({
        message:
          "You already own 100% of this property",
      });
    }

    // ==================================================
    // 7. REMAINING SHARES
    // ==================================================

    const requestedShares =
      totalShares - currentShares;

    // ==================================================
    // 8. CHECK EXISTING REQUEST
    // ==================================================

    const existingRequest =
      await OwnershipRequest.findOne({
        userId: req.user.id,
        investmentId: investment._id,
        propertyId: property._id,
        status: {
          $in: [
            "pending",
            "payment_pending",
            "payment_submitted",
            "payment_verified",
          ],
        },
      });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "A full ownership request already exists for this investment",
        requestId: existingRequest._id,
        status: existingRequest.status,
      });
    }

    // ==================================================
    // 9. SHARE BUYING CYCLE
    // ==================================================

    // const shareCycle =
    //   Number(
    //     investment.shareBuyingCycle ||
    //     property.shareBuyingCycle ||
    //     10
    //   );

    // if (![5, 10].includes(shareCycle)) {
    //   return res.status(400).json({
    //     message: "Invalid share buying cycle",
    //   });
    // }

    // Remaining shares can be different from normal
    // purchase quantity, so make sure they follow rule.

    // if (
    //   shareCycle === 10 &&
    //   requestedShares % 10 !== 0
    // ) {
    //   return res.status(400).json({
    //     message:
    //       `Remaining ${requestedShares} shares do not match the property's 10-share purchase cycle`,
    //   });
    // }

    // if (
    //   shareCycle === 5 &&
    //   requestedShares % 5 !== 0
    // ) {
    //   return res.status(400).json({
    //     message:
    //       `Remaining ${requestedShares} shares do not match the property's 5-share purchase cycle`,
    //   });
    // }

    // ==================================================
    // 10. PRICE PER SHARE
    // ==================================================

    const pricePerShare =
      Number(
        property.currentPricePerShare ||
        property.pricePerShare ||
        investment.pricePerShare ||
        0
      );

    if (pricePerShare <= 0) {
      return res.status(400).json({
        message: "Invalid property share price",
      });
    }

    // ==================================================
    // 11. CALCULATE AMOUNT
    // ==================================================

    const amount =
      requestedShares * pricePerShare;

    // ==================================================
    // 12. CURRENT OWNERSHIP %
    // ==================================================

    const currentOwnershipPercent =
      Number(
        (
          (currentShares / totalShares) *
          100
        ).toFixed(4)
      );

    // ==================================================
    // 13. CREATE REQUEST
    // ==================================================

    const ownershipRequest =
      await OwnershipRequest.create({
        userId: req.user.id,

        propertyId: property._id,

        investmentId: investment._id,

        currentShares,

        currentOwnershipPercent,

        requestedShares,

        totalSharesAfterTransfer: totalShares,

        pricePerShare,

        amount,

        status: "pending",
        paymentStatus: "not_paid",

        paymentMethod: "Bank Transfer",
      });

    // ==================================================
    // 14. RESPONSE
    // ==================================================

    return res.status(201).json({
        message:
          "Full ownership request created successfully",
      
        request: {
          id: ownershipRequest._id,
          propertyId: ownershipRequest.propertyId,
          investmentId: ownershipRequest.investmentId,
          currentShares: ownershipRequest.currentShares,
          currentOwnershipPercent:
            ownershipRequest.currentOwnershipPercent,
          requestedShares:
            ownershipRequest.requestedShares,
          totalSharesAfterTransfer:
            ownershipRequest.totalSharesAfterTransfer,
          pricePerShare:
            ownershipRequest.pricePerShare,
          amount: ownershipRequest.amount,
          status: ownershipRequest.status,
          paymentStatus:
            ownershipRequest.paymentStatus,
        },
      });

  } catch (error) {
    console.error(
      "CREATE OWNERSHIP REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create ownership request",
    });
  }
};


// ======================================================
// GET MY OWNERSHIP REQUESTS
// ======================================================

exports.getMyOwnershipRequests = async (req, res) => {
  try {
    const requests =
      await OwnershipRequest.find({
        userId: req.user.id,
      })
        .populate(
          "propertyId",
          "name location media pricePerShare currentPricePerShare totalShares"
        )
        .populate(
          "investmentId",
          "shares amount ownershipPercent status"
        )
        .sort({
          createdAt: -1,
        });

    return res.json(requests);

  } catch (error) {
    console.error(
      "GET MY OWNERSHIP REQUESTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to fetch ownership requests",
    });
  }
};


// ======================================================
// SUBMIT OWNERSHIP PAYMENT PROOF
// ======================================================

exports.submitOwnershipPaymentProof =
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        paymentReference,
        paymentMethod,
      } = req.body;

      // ==================================================
      // 1. FIND REQUEST
      // ==================================================

      const ownershipRequest =
        await OwnershipRequest.findOne({
          _id: id,
          userId: req.user.id,
        });

      if (!ownershipRequest) {
        return res.status(404).json({
          message:
            "Ownership request not found",
        });
      }

      // ==================================================
      // 2. CHECK STATUS
      // ==================================================

      if (
        ![
          "payment_pending",
        ].includes(
          ownershipRequest.status
        )
      ) {
        return res.status(400).json({
          message:
            "Payment cannot be submitted until the ownership request is approved by admin",
        });
      }

      // ==================================================
      // 3. PAYMENT REFERENCE
      // ==================================================

      if (!paymentReference) {
        return res.status(400).json({
          message:
            "Payment reference / UTR is required",
        });
      }

      // ==================================================
      // 4. PAYMENT SCREENSHOT
      // ==================================================

      if (!req.file) {
        return res.status(400).json({
          message:
            "Payment screenshot is required",
        });
      }

      // ==================================================
      // 5. SAVE PAYMENT
      // ==================================================

      ownershipRequest.paymentReference =
        paymentReference;

      ownershipRequest.paymentProof =
        req.file.path;

      ownershipRequest.paymentMethod =
        paymentMethod ||
        "Bank Transfer";

      ownershipRequest.paymentStatus =
        "payment_submitted";

      ownershipRequest.paymentSubmittedAt =
        new Date();

      ownershipRequest.status =
        "payment_submitted";

      await ownershipRequest.save();

      // ==================================================
      // 6. RESPONSE
      // ==================================================

      return res.json({
        message:
          "Ownership payment proof submitted successfully",

        request: ownershipRequest,
      });

    } catch (error) {
      console.error(
        "SUBMIT OWNERSHIP PAYMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to submit ownership payment",
      });
    }
  };


// ======================================================
// ADMIN — GET ALL OWNERSHIP REQUESTS
// ======================================================

exports.getAllOwnershipRequests =
  async (req, res) => {
    try {
      const requests =
        await OwnershipRequest.find()
          .populate(
            "userId",
            "name email phone"
          )
          .populate(
            "propertyId",
            "name totalShares pricePerShare currentPricePerShare"
          )
          .populate(
            "investmentId",
            "shares amount ownershipPercent"
          )
          .populate(
            "paymentVerifiedBy",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      return res.json(requests);

    } catch (error) {
      console.error(
        "GET OWNERSHIP REQUESTS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to fetch ownership requests",
      });
    }
  };


// ======================================================
// ADMIN — APPROVE FULL OWNERSHIP REQUEST
// This approval only unlocks payment for the investor
// ======================================================

exports.approveOwnershipRequest = async (req, res) => {
  try {
    const ownershipRequest =
      await OwnershipRequest.findById(req.params.id);

    if (!ownershipRequest) {
      return res.status(404).json({
        message: "Ownership request not found",
      });
    }

    // Only pending requests can be approved
    if (ownershipRequest.status !== "pending") {
      return res.status(400).json({
        message:
          "Only pending ownership requests can be approved",
        currentStatus: ownershipRequest.status,
      });
    }

    ownershipRequest.status = "payment_pending";

    ownershipRequest.approvedBy = req.user.id;

    ownershipRequest.approvedAt = new Date();

    ownershipRequest.paymentStatus = "not_paid";

    await ownershipRequest.save();

    return res.json({
      message:
        "Ownership request approved. Payment is now available to the investor.",

      request: {
        id: ownershipRequest._id,

        propertyId:
          ownershipRequest.propertyId,

        investmentId:
          ownershipRequest.investmentId,

        currentShares:
          ownershipRequest.currentShares,

        currentOwnershipPercent:
          ownershipRequest.currentOwnershipPercent,

        requestedShares:
          ownershipRequest.requestedShares,

        pricePerShare:
          ownershipRequest.pricePerShare,

        amount:
          ownershipRequest.amount,

        status:
          ownershipRequest.status,

        paymentStatus:
          ownershipRequest.paymentStatus,

        approvedBy:
          ownershipRequest.approvedBy,

        approvedAt:
          ownershipRequest.approvedAt,
      },
    });

  } catch (error) {
    console.error(
      "APPROVE OWNERSHIP REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to approve ownership request",
    });
  }
};

// ======================================================
// ADMIN — VERIFY OWNERSHIP PAYMENT
// ======================================================

exports.verifyOwnershipPayment =
  async (req, res) => {
    try {
      const ownershipRequest =
        await OwnershipRequest.findById(
          req.params.id
        );

      if (!ownershipRequest) {
        return res.status(404).json({
          message:
            "Ownership request not found",
        });
      }

      if (
        ownershipRequest.paymentStatus !==
        "payment_submitted"
      ) {
        return res.status(400).json({
          message:
            "Ownership payment proof has not been submitted",
        });
      }

      ownershipRequest.paymentStatus =
        "verified";

      ownershipRequest.paymentVerifiedAt =
        new Date();

      ownershipRequest.paymentVerifiedBy =
        req.user.id;

      ownershipRequest.status =
        "payment_verified";

      await ownershipRequest.save();

      return res.json({
        message:
          "Ownership payment verified successfully",

        request: ownershipRequest,
      });

    } catch (error) {
      console.error(
        "VERIFY OWNERSHIP PAYMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to verify ownership payment",
      });
    }
  };


// ======================================================
// ADMIN — REJECT OWNERSHIP PAYMENT
// ======================================================

exports.rejectOwnershipPayment =
  async (req, res) => {
    try {
      const ownershipRequest =
        await OwnershipRequest.findById(
          req.params.id
        );

      if (!ownershipRequest) {
        return res.status(404).json({
          message:
            "Ownership request not found",
        });
      }

      if (
        ownershipRequest.paymentStatus !==
        "payment_submitted"
      ) {
        return res.status(400).json({
          message:
            "No pending ownership payment proof to reject",
        });
      }

      ownershipRequest.paymentStatus =
        "rejected";

      ownershipRequest.status =
        "payment_pending";

      await ownershipRequest.save();

      return res.json({
        message:
          "Ownership payment rejected successfully",

        request: ownershipRequest,
      });

    } catch (error) {
      console.error(
        "REJECT OWNERSHIP PAYMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to reject ownership payment",
      });
    }
  };


// ======================================================
// ADMIN — APPROVE 100% OWNERSHIP TRANSFER
// ======================================================
exports.approveOwnershipTransfer = async (req, res) => {
    const session = await mongoose.startSession();
  
    try {
      session.startTransaction();
  
      // ==================================================
      // 1. FIND OWNERSHIP REQUEST
      // ==================================================
  
      const ownershipRequest =
        await OwnershipRequest.findById(req.params.id)
          .session(session);
  
      if (!ownershipRequest) {
        await session.abortTransaction();
  
        return res.status(404).json({
          message: "Ownership request not found",
        });
      }
  
      // ==================================================
      // 2. PAYMENT MUST BE VERIFIED
      // ==================================================
  
      if (
        ownershipRequest.paymentStatus !== "verified"
      ) {
        await session.abortTransaction();
  
        return res.status(400).json({
          message:
            "Ownership payment must be verified before transfer",
        });
      }
  
      // ==================================================
      // 3. REQUEST MUST NOT ALREADY BE APPROVED
      // ==================================================
  
      if (ownershipRequest.status === "approved") {
        await session.abortTransaction();
  
        return res.status(400).json({
          message:
            "Ownership transfer already approved",
        });
      }
  
      // ==================================================
      // 4. FIND PROPERTY
      // ==================================================
  
      const property =
        await Property.findById(
          ownershipRequest.propertyId
        ).session(session);
  
      if (!property) {
        await session.abortTransaction();
  
        return res.status(404).json({
          message: "Property not found",
        });
      }
  
      // ==================================================
      // 5. FIND BUYER INVESTMENT
      // ==================================================
  
      const buyerInvestment =
        await Investment.findById(
          ownershipRequest.investmentId
        ).session(session);
  
      if (!buyerInvestment) {
        await session.abortTransaction();
  
        return res.status(404).json({
          message: "Buyer investment not found",
        });
      }
  
      // ==================================================
      // 6. FIND BUYER
      // ==================================================
  
      const buyer =
        await User.findById(
          ownershipRequest.userId
        ).session(session);
  
      if (!buyer) {
        await session.abortTransaction();
  
        return res.status(404).json({
          message: "Buyer not found",
        });
      }
  
      // ==================================================
      // 7. TOTAL / CURRENT SHARES
      // ==================================================
  
      const totalShares =
        Number(property.totalShares || 0);
  
      const currentBuyerShares =
        Number(buyerInvestment.shares || 0);
  
      if (totalShares <= 0) {
        await session.abortTransaction();
  
        return res.status(400).json({
          message:
            "Property total shares are invalid",
        });
      }
  
      if (currentBuyerShares <= 0) {
        await session.abortTransaction();
  
        return res.status(400).json({
          message:
            "Buyer does not have any shares",
        });
      }
  
      // ==================================================
      // 8. CALCULATE ADDITIONAL SHARES
      // ==================================================
  
      const additionalShares =
        totalShares - currentBuyerShares;
  
      if (additionalShares <= 0) {
        await session.abortTransaction();
  
        return res.status(400).json({
          message:
            "Buyer already owns 100% of this property",
        });
      }
  
      // ==================================================
      // 9. PRICE
      // ==================================================
  
      const pricePerShare =
        Number(
          property.currentPricePerShare ||
          property.pricePerShare ||
          buyerInvestment.pricePerShare ||
          0
        );
  
      if (pricePerShare <= 0) {
        await session.abortTransaction();
  
        return res.status(400).json({
          message:
            "Invalid property share price",
        });
      }
  
      // ==================================================
      // 10. PAYMENT AMOUNT VALIDATION
      // ==================================================
  
      const transferAmount =
        additionalShares * pricePerShare;
  
      const requestedAmount =
        Number(ownershipRequest.amount || 0);
  
      if (
        requestedAmount > 0 &&
        requestedAmount !== transferAmount
      ) {
        await session.abortTransaction();
  
        return res.status(400).json({
          message:
            "Ownership payment amount does not match current share price",
          expectedAmount: transferAmount,
          requestAmount: requestedAmount,
        });
      }
  
    // ==================================================
// 11. FIND OTHER INVESTORS
// ==================================================

const otherInvestments =
await Investment.find({
  propertyId: property._id,
  status: "approved",
  shares: { $gt: 0 },
  _id: { $ne: buyerInvestment._id },
})
  .sort({ shares: -1, createdAt: 1 })
  .session(session);

// ==================================================
// 12. AVAILABLE PROPERTY SHARES
// ==================================================

let availableShares = Number(
property.availableShares ??
property.publicAvailableShares ??
0
);

if (availableShares < 0) {
availableShares = 0;
}

// ==================================================
// COMPANY RESERVED SHARES
// ==================================================

let companyReservedShares = Number(
property.companyReservedShares ?? 0
);

if (companyReservedShares < 0) {
companyReservedShares = 0;
}

// ==================================================
// 13. SHARES TO ASSIGN
// ==================================================

let remainingToAssign = additionalShares;

// --------------------------------------------------
// FIRST: PUBLIC AVAILABLE SHARES
// --------------------------------------------------

const sharesFromAvailable = Math.min(
availableShares,
remainingToAssign
);

remainingToAssign -= sharesFromAvailable;

// --------------------------------------------------
// SECOND: COMPANY RESERVED SHARES
// --------------------------------------------------

const sharesFromCompanyReserved = Math.min(
companyReservedShares,
remainingToAssign
);

remainingToAssign -= sharesFromCompanyReserved;

// ==================================================
// 14. TRANSFER FROM OTHER INVESTORS
// ==================================================

const assignments = [];

for (const sellerInvestment of otherInvestments) {

if (remainingToAssign <= 0) {
  break;
}

const sellerShares = Number(
  sellerInvestment.shares || 0
);

if (sellerShares <= 0) {
  continue;
}

const sharesToTransfer = Math.min(
  sellerShares,
  remainingToAssign
);

// ----------------------------------------------
// UPDATE SELLER
// ----------------------------------------------

sellerInvestment.shares =
  sellerShares - sharesToTransfer;

const sellerOwnership =
  totalShares > 0
    ? (
        sellerInvestment.shares /
        totalShares
      ) * 100
    : 0;

sellerInvestment.ownershipPercent =
  Number(
    sellerOwnership.toFixed(4)
  );

sellerInvestment.stakeholderUnit =
  Number(
    property.stakeholderUnit || 10
  );

sellerInvestment.stakeholderCount =
  sellerInvestment.shares /
  sellerInvestment.stakeholderUnit;

await sellerInvestment.save({
  session,
});

// ----------------------------------------------
// RECORD ASSIGNMENT
// ----------------------------------------------

assignments.push({
  investorId:
    sellerInvestment.userId,

  investmentId:
    sellerInvestment._id,

  shares:
    sharesToTransfer,

  remainingShares:
    sellerInvestment.shares,
});

remainingToAssign -=
  sharesToTransfer;
}

// ==================================================
// 15. VERIFY ALL SHARES AVAILABLE
// ==================================================

if (remainingToAssign > 0) {

await session.abortTransaction();

return res.status(400).json({
  message:
    "Not enough shares available to complete 100% ownership transfer",

  required:
    additionalShares,

  fromAvailable:
    sharesFromAvailable,

  fromCompanyReserved:
    sharesFromCompanyReserved,

  fromExistingInvestors:
    additionalShares -
    sharesFromAvailable -
    sharesFromCompanyReserved -
    remainingToAssign,

  remaining:
    remainingToAssign,
});
}

// ==================================================
// 16. UPDATE BUYER INVESTMENT
// ==================================================

buyerInvestment.shares =
totalShares;

buyerInvestment.amount =
Number(
  buyerInvestment.amount || 0
) + transferAmount;

buyerInvestment.pricePerShare =
pricePerShare;

buyerInvestment.stakeholderUnit =
Number(
  property.stakeholderUnit || 10
);

buyerInvestment.stakeholderCount =
buyerInvestment.shares /
buyerInvestment.stakeholderUnit;

buyerInvestment.ownershipPercent =
100;

buyerInvestment.isFullOwner =
true;

buyerInvestment.fullOwnershipDate =
new Date();

buyerInvestment.approvedShares =
totalShares;

buyerInvestment.approvedAmount =
Number(
  buyerInvestment.amount || 0
);
      // ==================================================
// 17. PROPERTY UPDATE
// ==================================================

property.availableShares =
Math.max(
  availableShares - sharesFromAvailable,
  0
);

property.publicAvailableShares =
property.availableShares;

// Company reserved shares used
property.companyReservedShares =
Math.max(
  companyReservedShares -
  sharesFromCompanyReserved,
  0
);

// Total sold shares
property.soldShares =
totalShares -
property.availableShares -
property.companyReservedShares;

property.investedAmount =
Number(
  property.investedAmount || 0
) + transferAmount;

property.soldPercent =
totalShares > 0
  ? Number(
      (
        (property.soldShares /
          totalShares) *
        100
      ).toFixed(2)
    )
  : 0;

if (property.soldShares >= totalShares) {
property.status = "funded";
}
      // ==================================================
      // 18. UPDATE INVESTOR COUNT
      // ==================================================
  
      property.investors =
        await Investment.countDocuments({
          propertyId: property._id,
          status: "approved",
          shares: { $gt: 0 },
        }).session(session);
  
      // ==================================================
      // 19. UPDATE OWNERSHIP REQUEST
      // ==================================================
  
      ownershipRequest.status =
        "approved";
  
      ownershipRequest.approvedBy =
        req.user.id;
  
      ownershipRequest.approvedAt =
        new Date();
  
      ownershipRequest.requestedShares =
        additionalShares;
  
      ownershipRequest.assignedShares =
        additionalShares;
  
      ownershipRequest.totalSharesAfterTransfer =
        totalShares;
  
      ownershipRequest.pricePerShare =
        pricePerShare;
  
      ownershipRequest.amount =
        transferAmount;
  
      // Save assignments if field exists
      if (
        Array.isArray(
          ownershipRequest.assignments
        )
      ) {
        ownershipRequest.assignments =
          assignments;
      }
  
      // ==================================================
      // 20. SAVE EVERYTHING
      // ==================================================
  
      await buyerInvestment.save({
        session,
      });
  
      await property.save({
        session,
      });
  
      await ownershipRequest.save({
        session,
      });
  
      // ==================================================
      // 21. COMMIT
      // ==================================================
  
      await session.commitTransaction();
  
      // ==================================================
      // 22. RESPONSE
      // ==================================================
  
      return res.json({
        message:
          "100% ownership transferred successfully",
  
        ownershipRequest: {
          id:
            ownershipRequest._id,
  
          status:
            ownershipRequest.status,
  
          currentShares:
            currentBuyerShares,
  
          additionalShares,
  
          totalShares,
  
          amount:
            transferAmount,
        },
  
        buyer: {
          id:
            buyer._id,
  
          name:
            buyer.name,
        },
  
        investment: {
          id:
            buyerInvestment._id,
  
          shares:
            buyerInvestment.shares,
  
          amount:
            buyerInvestment.amount,
  
          ownershipPercent:
            buyerInvestment.ownershipPercent,
  
          stakeholderCount:
            buyerInvestment.stakeholderCount,
  
          isFullOwner:
            buyerInvestment.isFullOwner,
        },
  
      assignments: {
  fromAvailableShares:
    sharesFromAvailable,

  fromCompanyReserved:
    sharesFromCompanyReserved,

  fromExistingInvestors:
    additionalShares -
    sharesFromAvailable -
    sharesFromCompanyReserved,

  investors:
    assignments,
},
  
property: {
    totalShares:
      property.totalShares,
  
    availableShares:
      property.availableShares,
  
    publicAvailableShares:
      property.publicAvailableShares,
  
    companyReservedShares:
      property.companyReservedShares,
  
    soldShares:
      property.soldShares,
  
    soldPercent:
      property.soldPercent,
  
    status:
      property.status,
  
    investors:
      property.investors,
  },
      });
  
    } catch (error) {
      await session.abortTransaction();
  
      console.error(
        "APPROVE OWNERSHIP TRANSFER ERROR:",
        error
      );
  
      return res.status(500).json({
        message:
          error.message ||
          "Failed to approve ownership transfer",
      });
  
    } finally {
      await session.endSession();
    }
  };


// ======================================================
// ADMIN — REJECT OWNERSHIP REQUEST
// ======================================================

exports.rejectOwnershipRequest =
  async (req, res) => {
    try {
      const ownershipRequest =
        await OwnershipRequest.findById(
          req.params.id
        );

      if (!ownershipRequest) {
        return res.status(404).json({
          message:
            "Ownership request not found",
        });
      }

      if (
        ownershipRequest.status ===
        "approved"
      ) {
        return res.status(400).json({
          message:
            "Approved ownership request cannot be rejected",
        });
      }

      ownershipRequest.status =
        "rejected";

      ownershipRequest.rejectedBy =
        req.user.id;

      ownershipRequest.rejectedAt =
        new Date();

      await ownershipRequest.save();

      return res.json({
        message:
          "Ownership request rejected successfully",
      });

    } catch (error) {
      console.error(
        "REJECT OWNERSHIP REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to reject ownership request",
      });
    }
  };

  // ======================================================
// ADMIN — ASSIGN SHARES
// ======================================================

exports.assignOwnershipShares = async (req, res) => {
    try {
      const { id } = req.params;
      const { assignments } = req.body;
  
      // ==========================================
      // 1. FIND OWNERSHIP REQUEST
      // ==========================================
  
      const ownershipRequest =
        await OwnershipRequest.findById(id);
  
      if (!ownershipRequest) {
        return res.status(404).json({
          message: "Ownership request not found",
        });
      }
  
      // ==========================================
      // 2. REQUEST STATUS CHECK
      // ==========================================
  
      if (
        ![
          "pending",
          "assignment_pending",
        ].includes(ownershipRequest.status)
      ) {
        return res.status(400).json({
          message:
            "Shares cannot be assigned at this stage",
        });
      }
  
      // ==========================================
      // 3. ASSIGNMENTS VALIDATION
      // ==========================================
  
      if (
        !Array.isArray(assignments) ||
        assignments.length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one share assignment is required",
        });
      }
  
      // ==========================================
      // 4. FIND BUYER INVESTMENT
      // ==========================================
  
      const buyerInvestment =
        await Investment.findById(
          ownershipRequest.investmentId
        );
  
      if (!buyerInvestment) {
        return res.status(404).json({
          message: "Buyer investment not found",
        });
      }
  
      // ==========================================
      // 5. FIND PROPERTY
      // ==========================================
  
      const property =
        await Property.findById(
          ownershipRequest.propertyId
        );
  
      if (!property) {
        return res.status(404).json({
          message: "Property not found",
        });
      }
  
      // ==========================================
      // 6. PRICE
      // ==========================================
  
      const pricePerShare =
        Number(
          property.currentPricePerShare ||
          property.pricePerShare ||
          buyerInvestment.pricePerShare ||
          0
        );
  
      if (pricePerShare <= 0) {
        return res.status(400).json({
          message: "Invalid share price",
        });
      }
  
      // ==========================================
      // 7. REQUIRED SHARES
      // ==========================================
  
      const requiredShares =
        Number(ownershipRequest.requestedShares || 0);
  
      if (requiredShares <= 0) {
        return res.status(400).json({
          message: "Invalid requested shares",
        });
      }
  
      // ==========================================
      // 8. PREPARE ASSIGNMENTS
      // ==========================================
  
      const finalAssignments = [];
      let totalAssignedShares = 0;
  
      for (const item of assignments) {
        const investmentId = item.investmentId;
        const shares = Number(item.shares);
  
        if (!investmentId || !shares) {
          return res.status(400).json({
            message:
              "Investment ID and shares are required for every assignment",
          });
        }
  
        if (
          !Number.isInteger(shares) ||
          shares <= 0
        ) {
          return res.status(400).json({
            message:
              "Assigned shares must be a positive integer",
          });
        }
  
        // ==========================================
        // FIND SELLING INVESTOR
        // ==========================================
  
        const sellerInvestment =
          await Investment.findOne({
            _id: investmentId,
            propertyId: property._id,
            status: "approved",
          });
  
        if (!sellerInvestment) {
          return res.status(404).json({
            message:
              "Assigned investor investment not found",
          });
        }
  
        // Buyer cannot assign his own shares
        if (
          sellerInvestment._id.toString() ===
          buyerInvestment._id.toString()
        ) {
          return res.status(400).json({
            message:
              "Buyer cannot assign shares to himself",
          });
        }
  
        // ==========================================
        // CHECK SELLER SHARES
        // ==========================================
  
        const sellerShares =
          Number(sellerInvestment.shares || 0);
  
        if (shares > sellerShares) {
          return res.status(400).json({
            message:
              `Investor has only ${sellerShares} shares available`,
          });
        }
  
        const amount =
          shares * pricePerShare;
  
        finalAssignments.push({
          investmentId:
            sellerInvestment._id,
  
          userId:
            sellerInvestment.userId,
  
          shares,
  
          pricePerShare,
  
          amount,
        });
  
        totalAssignedShares += shares;
      }
  
      // ==========================================
      // 9. TOTAL SHARES MUST MATCH
      // ==========================================
  
      if (
        totalAssignedShares !==
        requiredShares
      ) {
        return res.status(400).json({
          message:
            `You must assign exactly ${requiredShares} shares. Currently assigned ${totalAssignedShares}.`,
        });
      }
  
      // ==========================================
      // 10. TOTAL PAYMENT
      // ==========================================
  
      const totalAmount =
        totalAssignedShares *
        pricePerShare;
  
      // ==========================================
      // 11. SAVE ASSIGNMENT
      // ==========================================
  
      ownershipRequest.assignments =
        finalAssignments;
  
      ownershipRequest.assignedShares =
        totalAssignedShares;
  
      ownershipRequest.assignmentCompletedAt =
        new Date();
  
      ownershipRequest.assignmentCompletedBy =
        req.user.id;
  
      ownershipRequest.amount =
        totalAmount;
  
      ownershipRequest.pricePerShare =
        pricePerShare;
  
      ownershipRequest.status =
        "payment_pending";
  
      ownershipRequest.paymentStatus =
        "not_paid";
  
      await ownershipRequest.save();
  
      // ==========================================
      // 12. RESPONSE
      // ==========================================
  
      return res.json({
        message:
          "Shares assigned successfully. Payment is now pending.",
  
        request: {
          id: ownershipRequest._id,
  
          currentShares:
            ownershipRequest.currentShares,
  
          requestedShares:
            ownershipRequest.requestedShares,
  
          assignedShares:
            ownershipRequest.assignedShares,
  
          targetOwnershipPercent:
            ownershipRequest.targetOwnershipPercent,
  
          amount:
            ownershipRequest.amount,
  
          pricePerShare:
            ownershipRequest.pricePerShare,
  
          status:
            ownershipRequest.status,
  
          assignments:
            ownershipRequest.assignments,
        },
      });
  
    } catch (error) {
      console.error(
        "ASSIGN OWNERSHIP SHARES ERROR:",
        error
      );
  
      return res.status(500).json({
        message:
          error.message ||
          "Failed to assign ownership shares",
      });
    }
  };