const mongoose = require("mongoose");

// ======================================================
// BLOG SCHEMA
// ======================================================

const blogSchema = new mongoose.Schema(
{
// ==================================================
// BASIC INFORMATION
// ==================================================


title: {
  type: String,
  required: true,
  trim: true,
  maxlength: 200,
},

slug: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
},

shortDescription: {
  type: String,
  required: true,
  trim: true,
  maxlength: 500,
},

// ==================================================
// BLOG CONTENT
// ==================================================

content: {
  type: String,
  required: true,
},

// ==================================================
// CATEGORY
// ==================================================

category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

// ==================================================
// COVER IMAGE
// ==================================================

coverImage: {
  type: String,
  default: "",
},

// ==================================================
// AUTHOR
// ==================================================

author: {
  name: {
    type: String,
    default: "Property Invest Team",
  },

  role: {
    type: String,
    default: "Investment Experts",
  },
},

// ==================================================
// TAGS
// ==================================================

tags: {
  type: [String],
  default: [],
},

// ==================================================
// STATUS
// ==================================================

status: {
  type: String,
  enum: ["draft", "published"],
  default: "draft",
},

// ==================================================
// FEATURED BLOG
// ==================================================

featured: {
  type: Boolean,
  default: false,
},

// ==================================================
// READ TIME
// ==================================================

readTime: {
    type: Number,
    default: 5,
    min: 1,
  },

// ==================================================
// PUBLISH DATE
// ==================================================

publishedAt: {
  type: Date,
  default: null,
},

// ==================================================
// VIEW COUNT
// ==================================================

views: {
  type: Number,
  default: 0,
},

// ==================================================
// SEO
// ==================================================

seoTitle: {
  type: String,
  trim: true,
  default: "",
},

seoDescription: {
  type: String,
  trim: true,
  default: "",
},


},
{
timestamps: true,
}
);

// ======================================================
// INDEXES
// ======================================================

blogSchema.index({
status: 1,
publishedAt: -1,
});

blogSchema.index({
category: 1,
});

blogSchema.index({
featured: 1,
});

// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
"Blog",
blogSchema
);
