const express = require("express");

const router = express.Router();

const blog = require("../controllers/blogController");

const protect = require("../middleware/authmiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
  uploadBlogImage,
} = require("../middleware/upload");


// ======================================================
// ADMIN ROUTES
// IMPORTANT: Specific routes first
// ======================================================


// GET ALL BLOGS
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  blog.getAdminBlogs
);


// GET SINGLE BLOG BY ID
router.get(
  "/admin/:id",
  protect,
  authorize("admin"),
  blog.getAdminBlogById
);


// CREATE BLOG
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadBlogImage,
  blog.createBlog
);


// UPDATE BLOG
router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadBlogImage,
  blog.updateBlog
);


// DELETE BLOG
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  blog.deleteBlog
);


// CHANGE BLOG STATUS
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  blog.changeBlogStatus
);


// TOGGLE FEATURED
router.patch(
  "/:id/featured",
  protect,
  authorize("admin"),
  blog.toggleFeatured
);


// ======================================================
// PUBLIC ROUTES
// ======================================================


// GET FEATURED BLOGS
router.get(
  "/featured",
  blog.getFeaturedBlogs
);


// GET BLOG CATEGORIES
router.get(
  "/categories",
  blog.getBlogCategories
);


// GET RELATED BLOGS
router.get(
  "/slug/:slug/related",
  blog.getRelatedBlogs
);


// GET SINGLE BLOG BY SLUG
router.get(
  "/slug/:slug",
  blog.getBlogBySlug
);


// GET ALL PUBLISHED BLOGS
router.get(
  "/",
  blog.getPublicBlogs
);


module.exports = router;