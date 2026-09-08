const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    category: String,

    description: String,
    size: String,

    // 📍 LOCATION
    location: {
      city: String,
      state: String,
      address: String,
      street: String,
      landmark: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },

    // 💰 INVESTMENT
    // 💰 INVESTMENT
totalValue: Number,

// Total shares of complete property
totalShares: Number,

// Company ke fixed/reserved shares
companyReservedShares: {
  type: Number,
  default: 10,
},

// Public investors ke liye available shares
publicAvailableShares: Number,

// Share purchase cycle for this property
// 5 cycle → 10, 15, 20, 25...
// 10 cycle → 10, 20, 30, 40...
shareBuyingCycle: {
  type: Number,
  enum: [5, 10],
  default: 10,
},

// Fixed business rule
// 10 shares = 1 stakeholder
stakeholderUnit: {
  type: Number,
  default: 10,
},

// Lock-in period in years
lockInYears: {
  type: Number,
  default: 2,
},

// Can investor request 100% ownership?
enableFullOwnership: {
  type: Boolean,
  default: false,
},

soldShares: {
  type: Number,
  default: 0,
},

isDeleted: {
  type: Boolean,
  default: false,
},

deletedAt: {
  type: Date,
  default: null,
},
    
    
status: {
  type: String,
  enum: ["available", "funding", "funded"],
  default: "funding",
},
    availableShares: Number,
    pricePerShare: Number,
    currentPricePerShare: Number,

    roi: Number,
    targetROI: Number,
    rentalYield: Number,
    appreciation: Number,
    duration: Number,

   

    soldPercent: {
      type: Number,
      default: 0,
    },

    investors: {
      type: Number,
      default: 0,
    },

    investedAmount: {
      type: Number,
      default: 0,
    },

    // ⭐ FLAGS
    isPublished: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // 🏢 EXTRA DETAILS (🔥 NEW IMPORTANT)
    tenants: String,          // e.g. "3 Tenants"
    propertyGrade: String,    // e.g. "Grade-A Tower"

    // 🌟 HIGHLIGHTS
    highlights: [String],

    // 📍 NEARBY LOCATIONS
    // nearby: [
    //   {
    //     name: String,
    //     distance: String,
    //   },
    // ],

    // 🏊 AMENITIES
    amenities: [String],

    // 📂 MEDIA
    media: {
      images: [String],
      video: String,
      brochure: String, 
      documents: [
        {
          name: String,
          url: String,
        },
      ],
    },

    

   


    // 👤 OWNER
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);