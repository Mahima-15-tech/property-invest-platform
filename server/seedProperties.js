require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("./models/property");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo Connected"))
  .catch((err) => console.log(err));

const properties = [
  {
    name: "Prestige Tech Park Tower",
    type: "commercial",
    category: "Office",

    description:
      "Prestige Tech Park Tower is a Grade-A commercial office property located in Whitefield, Bengaluru. Fully leased to multinational companies offering stable rental income and long-term capital appreciation.",

    size: "48,500 sq ft",

    location: {
      city: "Bengaluru",
      state: "Karnataka",
      address: "Prestige Tech Park, Whitefield Main Road",
      street: "ITPL Main Road",
      landmark: "Near ITPL Tech Park",
      pincode: "560066",
      lat: 12.9698,
      lng: 77.7499,
    },

    totalValue: 180000000,
    totalShares: 18000,
    availableShares: 18000,
    soldShares: 0,
    soldPercent: 0,

    pricePerShare: 10000,
    currentPricePerShare: 10000,

    roi: 11.8,
    targetROI: 14,
    rentalYield: 8.2,
    appreciation: 6.4,
    duration: 60,

    status: "funding",

    investors: 0,
    investedAmount: 0,

    isPublished: true,
    isFeatured: true,

    tenants: "8 Corporate Tenants",
    propertyGrade: "Grade-A Commercial",

    highlights: [
      "100% Occupancy",
      "Prime IT Hub",
      "Long-Term Lease",
      "Professional Management",
      "High Rental Yield",
    ],

    amenities: [
      "Gym",
      "Lift",
      "CCTV",
      "Security",
      "Power Backup",
      "Club House",
    ],

    media: {
      images: [],
      video: "",
      brochure: "",
      documents: [],
    },
  },

  {
    name: "Godrej Riverside Residences",
    type: "residential",
    category: "Apartment",

    description:
      "Premium residential apartments in Kharadi, Pune with excellent rental demand, premium amenities and strong appreciation potential.",

    size: "32,000 sq ft",

    location: {
      city: "Pune",
      state: "Maharashtra",
      address: "Godrej Riverside, Kharadi",
      street: "Kharadi Main Road",
      landmark: "Near EON IT Park",
      pincode: "411014",
      lat: 18.5514,
      lng: 73.9425,
    },

    totalValue: 95000000,
    totalShares: 9500,
    availableShares: 9500,
    soldShares: 0,
    soldPercent: 0,

    pricePerShare: 10000,
    currentPricePerShare: 10000,

    roi: 9.8,
    targetROI: 12,
    rentalYield: 7.5,
    appreciation: 5.3,
    duration: 72,

    status: "funding",

    investors: 0,
    investedAmount: 0,

    isPublished: true,
    isFeatured: true,

    tenants: "124 Residential Families",
    propertyGrade: "Premium Residential",

    highlights: [
      "River View",
      "Premium Society",
      "High Appreciation",
      "Smart Security",
      "Fully Occupied",
    ],

    amenities: [
      "Pool",
      "Gym",
      "Garden",
      "Lift",
      "Security",
      "CCTV",
      "Club House",
      "Power Backup",
    ],

    media: {
      images: [],
      video: "",
      brochure: "",
      documents: [],
    },
  },

  {
    name: "DLF Cyber Plaza",
    type: "commercial",
    category: "Office",

    description:
      "Premium Grade-A office property located in Cyber City Gurugram leased to Fortune 500 companies with strong rental income and appreciation.",

    size: "61,000 sq ft",

    location: {
      city: "Gurugram",
      state: "Haryana",
      address: "DLF Cyber City Phase II",
      street: "Cyber Hub Road",
      landmark: "Near Cyber Hub",
      pincode: "122002",
      lat: 28.4941,
      lng: 77.0890,
    },

    totalValue: 250000000,
    totalShares: 25000,
    availableShares: 25000,
    soldShares: 0,
    soldPercent: 0,

    pricePerShare: 10000,
    currentPricePerShare: 10000,

    roi: 12.6,
    targetROI: 15,
    rentalYield: 9.1,
    appreciation: 7.0,
    duration: 60,

    status: "funding",

    investors: 0,
    investedAmount: 0,

    isPublished: true,
    isFeatured: true,

    tenants: "12 Corporate Offices",
    propertyGrade: "Grade-A Office Space",

    highlights: [
      "Fortune 500 Companies",
      "Corporate Hub",
      "Metro Connectivity",
      "100% Occupancy",
      "Premium Asset",
    ],

    amenities: [
      "Gym",
      "Lift",
      "CCTV",
      "Security",
      "Power Backup",
      "Club House",
    ],

    media: {
      images: [],
      video: "",
      brochure: "",
      documents: [],
    },
  },

  {
    name: "Phoenix MarketCity",
    type: "mixed",
    category: "Retail & Commercial",

    description:
      "Mixed-use premium commercial asset combining retail outlets, restaurants, office spaces and entertainment facilities with excellent footfall and rental returns.",

    size: "95,000 sq ft",

    location: {
      city: "Chennai",
      state: "Tamil Nadu",
      address: "Phoenix MarketCity Velachery",
      street: "Velachery Main Road",
      landmark: "Near Phoenix Mall",
      pincode: "600042",
      lat: 12.9797,
      lng: 80.2209,
    },

    totalValue: 320000000,
    totalShares: 32000,
    availableShares: 32000,
    soldShares: 0,
    soldPercent: 0,

    pricePerShare: 10000,
    currentPricePerShare: 10000,

    roi: 13.4,
    targetROI: 16,
    rentalYield: 9.8,
    appreciation: 7.6,
    duration: 84,

    status: "funding",

    investors: 0,
    investedAmount: 0,

    isPublished: true,
    isFeatured: true,

    tenants: "75 Retail & Office Tenants",
    propertyGrade: "Premium Mixed Development",

    highlights: [
      "Shopping Mall",
      "Entertainment Zone",
      "Office Spaces",
      "Premium Brands",
      "Stable Cash Flow",
    ],

    amenities: [
      "Pool",
      "Gym",
      "Lift",
      "Security",
      "Garden",
      "Power Backup",
      "Club House",
      "CCTV",
    ],

    media: {
      images: [],
      video: "",
      brochure: "",
      documents: [],
    },
  },
];

async function seed() {
  try {
    await Property.deleteMany({});

    await Property.insertMany(properties);

    console.log("🎉 4 Premium Properties Inserted Successfully");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();