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
    totalValue: Number,
    totalShares: Number,
    soldShares: {
      type: Number,
      default: 0,
    },
    
    soldPercent: {
      type: Number,
      default: 0,
    },
    
    status: {
      type: String,
      enum: ["funding", "funded"],
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

    // 📊 STATUS
    status: {
      type: String,
      default: "funding",
    },

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

    currentPricePerShare: Number,


    // 👤 OWNER
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);