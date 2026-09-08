const Blog = require("../models/blog");

// ======================================================
// CREATE BLOG
// ADMIN
// ======================================================

exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      content,
      category,
      authorName,
      authorRole,
      tags,
      status,
      featured,
      readTime,
      seoTitle,
      seoDescription,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!title || !shortDescription || !content || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Title, short description, content and category are required",
      });
    }

    // ==================================================
    // CREATE SLUG
    // ==================================================

    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    let slug = baseSlug;

    let counter = 1;

    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // ==================================================
    // PARSE TAGS
    // ==================================================

    let parsedTags = [];

    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        }
      }
    }

    // ==================================================
    // STATUS
    // ==================================================

    const blogStatus =
      status === "published"
        ? "published"
        : "draft";

    // ==================================================
    // CREATE BLOG
    // ==================================================

    const blog = await Blog.create({
      title,

      slug,

      shortDescription,

      content,

      category,

      coverImage:
        req.file?.path || "",

      author: {
        name:
          authorName ||
          "Property Invest Team",

        role:
          authorRole ||
          "Investment Experts",
      },

      tags: parsedTags,

      status: blogStatus,

      featured:
        featured === true ||
        featured === "true",

      readTime:
        Number(readTime) || 5,

      publishedAt:
        blogStatus === "published"
          ? new Date()
          : null,

      seoTitle:
        seoTitle || title,

      seoDescription:
        seoDescription ||
        shortDescription,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });

  } catch (error) {

    console.error(
      "CREATE BLOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create blog",
    });
  }
};


// ======================================================
// GET PUBLIC BLOGS
// WEBSITE / APP
// ======================================================

exports.getPublicBlogs = async (req, res) => {
  try {

    const {
      category,
      search,
      page = 1,
      limit = 9,
    } = req.query;

    const query = {
      status: "published",
    };

    // CATEGORY FILTER

    if (category && category !== "All") {
      query.category = category;
    }

    // SEARCH

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          shortDescription: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const currentPage = Number(page);

    const pageLimit = Number(limit);

    const skip =
      (currentPage - 1) * pageLimit;

    const total =
      await Blog.countDocuments(query);

    const blogs =
      await Blog.find(query)
        .sort({
          featured: -1,
          publishedAt: -1,
        })
        .skip(skip)
        .limit(pageLimit);

    return res.json({
      success: true,

      blogs,

      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages:
          Math.ceil(total / pageLimit),
      },
    });

  } catch (error) {

    console.error(
      "GET PUBLIC BLOGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch blogs",
    });
  }
};


// ======================================================
// GET FEATURED BLOGS
// WEBSITE / APP
// ======================================================

exports.getFeaturedBlogs = async (
  req,
  res
) => {
  try {

    const blogs =
      await Blog.find({
        status: "published",
        featured: true,
      })
        .sort({
          publishedAt: -1,
        })
        .limit(5);

    return res.json({
      success: true,
      blogs,
    });

  } catch (error) {

    console.error(
      "GET FEATURED BLOGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch featured blogs",
    });
  }
};


// ======================================================
// GET BLOG CATEGORIES
// WEBSITE / APP
// ======================================================

exports.getBlogCategories = async (
  req,
  res
) => {
  try {

    const categories =
      await Blog.distinct(
        "category",
        {
          status: "published",
        }
      );

    return res.json({
      success: true,

      categories: [
        "All",
        ...categories,
      ],
    });

  } catch (error) {

    console.error(
      "GET BLOG CATEGORIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch categories",
    });
  }
};


// ======================================================
// GET SINGLE BLOG BY SLUG
// WEBSITE / APP
// ======================================================

exports.getBlogBySlug = async (
  req,
  res
) => {
  try {

    const blog =
      await Blog.findOne({
        slug: req.params.slug,
        status: "published",
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // INCREASE VIEW COUNT

    blog.views =
      Number(blog.views || 0) + 1;

    await blog.save();

    return res.json({
      success: true,
      blog,
    });

  } catch (error) {

    console.error(
      "GET BLOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch blog",
    });
  }
};


// ======================================================
// GET RELATED BLOGS
// WEBSITE / APP
// ======================================================

exports.getRelatedBlogs = async (
  req,
  res
) => {
  try {

    const blog =
      await Blog.findOne({
        slug: req.params.slug,
        status: "published",
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const relatedBlogs =
      await Blog.find({
        status: "published",

        _id: {
          $ne: blog._id,
        },

        category:
          blog.category,
      })
        .sort({
          publishedAt: -1,
        })
        .limit(3);

    return res.json({
      success: true,
      blogs: relatedBlogs,
    });

  } catch (error) {

    console.error(
      "GET RELATED BLOGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch related blogs",
    });
  }
};


// ======================================================
// GET ALL BLOGS
// ADMIN
// ======================================================

exports.getAdminBlogs = async (
  req,
  res
) => {
  try {

    const {
      status,
      category,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // STATUS

    if (status) {
      query.status = status;
    }

    // CATEGORY

    if (category) {
      query.category = category;
    }

    // SEARCH

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const currentPage =
      Number(page);

    const pageLimit =
      Number(limit);

    const skip =
      (currentPage - 1) *
      pageLimit;

    const total =
      await Blog.countDocuments(query);

    const blogs =
      await Blog.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageLimit);

    return res.json({
      success: true,

      blogs,

      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages:
          Math.ceil(
            total / pageLimit
          ),
      },
    });

  } catch (error) {

    console.error(
      "GET ADMIN BLOGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch blogs",
    });
  }
};


// ======================================================
// GET SINGLE BLOG BY ID
// ADMIN
// ======================================================

exports.getAdminBlogById = async (
  req,
  res
) => {
  try {

    const blog =
      await Blog.findById(
        req.params.id
      );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.json({
      success: true,
      blog,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch blog",
    });
  }
};


// ======================================================
// UPDATE BLOG
// ADMIN
// ======================================================

exports.updateBlog = async (
  req,
  res
) => {
  try {

    const blog =
      await Blog.findById(
        req.params.id
      );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const {
      title,
      shortDescription,
      content,
      category,
      authorName,
      authorRole,
      tags,
      status,
      featured,
      readTime,
      seoTitle,
      seoDescription,
    } = req.body;

    // BASIC FIELDS

    if (title !== undefined) {
      blog.title = title;
    }

    if (
      shortDescription !== undefined
    ) {
      blog.shortDescription =
        shortDescription;
    }

    if (content !== undefined) {
      blog.content = content;
    }

    if (category !== undefined) {
      blog.category = category;
    }

    // IMAGE

    if (req.file) {
      blog.coverImage =
        req.file.path;
    }

    // AUTHOR

    if (authorName !== undefined) {
      blog.author.name =
        authorName;
    }

    if (authorRole !== undefined) {
      blog.author.role =
        authorRole;
    }

    // TAGS

    if (tags !== undefined) {

      if (Array.isArray(tags)) {
        blog.tags = tags;
      } else {
        try {
          blog.tags =
            JSON.parse(tags);
        } catch {
          blog.tags =
            tags
              .split(",")
              .map((tag) =>
                tag.trim()
              )
              .filter(Boolean);
        }
      }
    }

    // READ TIME

    if (readTime !== undefined) {
      blog.readTime =
        Number(readTime) || 5;
    }

    // SEO

    if (seoTitle !== undefined) {
      blog.seoTitle = seoTitle;
    }

    if (
      seoDescription !== undefined
    ) {
      blog.seoDescription =
        seoDescription;
    }

    // FEATURED

    if (featured !== undefined) {
      blog.featured =
        featured === true ||
        featured === "true";
    }

    // STATUS

    if (
      status !== undefined &&
      ["draft", "published"].includes(
        status
      )
    ) {

      // FIRST TIME PUBLISH

      if (
        status === "published" &&
        blog.status !== "published"
      ) {
        blog.publishedAt =
          new Date();
      }

      blog.status = status;

      // If moved back to draft,
      // keep publishedAt for history
    }

    await blog.save();

    return res.json({
      success: true,
      message:
        "Blog updated successfully",
      blog,
    });

  } catch (error) {

    console.error(
      "UPDATE BLOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update blog",
    });
  }
};


// ======================================================
// DELETE BLOG
// ADMIN
// ======================================================

exports.deleteBlog = async (
  req,
  res
) => {
  try {

    const blog =
      await Blog.findByIdAndDelete(
        req.params.id
      );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Blog deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE BLOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete blog",
    });
  }
};


// ======================================================
// CHANGE BLOG STATUS
// ADMIN
// ======================================================

exports.changeBlogStatus = async (
  req,
  res
) => {
  try {

    const { status } = req.body;

    if (
      !["draft", "published"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be draft or published",
      });
    }

    const blog =
      await Blog.findById(
        req.params.id
      );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (
      status === "published" &&
      blog.status !== "published"
    ) {
      blog.publishedAt =
        new Date();
    }

    blog.status = status;

    await blog.save();

    return res.json({
      success: true,
      message:
        `Blog ${status} successfully`,
      blog,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to update blog status",
    });
  }
};


// ======================================================
// TOGGLE FEATURED
// ADMIN
// ======================================================

exports.toggleFeatured = async (
  req,
  res
) => {
  try {

    const blog =
      await Blog.findById(
        req.params.id
      );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.featured =
      !blog.featured;

    await blog.save();

    return res.json({
      success: true,

      message:
        blog.featured
          ? "Blog marked as featured"
          : "Blog removed from featured",

      blog,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to update featured status",
    });
  }
};