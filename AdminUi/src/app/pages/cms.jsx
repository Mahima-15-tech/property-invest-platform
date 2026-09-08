import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../../api/axios";
import {
BookOpen,
Plus,
Search,
FileText,
Eye,
Star,
MoreVertical,
Edit3,
Trash2,
X,
Upload,
Image as ImageIcon,
Calendar,
Clock,
Tag,
User,
CheckCircle2,
FileEdit,
Sparkles,
ChevronLeft,
ChevronRight,
Loader2,
Globe2,
Save,
} from "lucide-react";



const initialForm = {
title: "",
shortDescription: "",
content: "",
category: "",
authorName: "Property Invest Team",
authorRole: "Investment Experts",
tags: "",
status: "draft",
featured: false,
readTime: 5,

};

export function CMS() {
const [blogs, setBlogs] = useState([]);
const [categories, setCategories] = useState([]);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [categoryFilter, setCategoryFilter] = useState("all");

const [pagination, setPagination] = useState({
total: 0,
page: 1,
limit: 10,
totalPages: 1,
});

const [showForm, setShowForm] = useState(false);
const [editingBlog, setEditingBlog] = useState(null);

const [form, setForm] = useState(initialForm);

const [coverImage, setCoverImage] = useState(null);
const [imagePreview, setImagePreview] = useState("");

const [menuOpen, setMenuOpen] = useState(null);

const fileInputRef = useRef(null);


// =====================================================
// FETCH BLOGS
// =====================================================

const fetchBlogs = async (page = 1) => {
  try {
    setLoading(true);

    const params = {
      page,
      limit: pagination.limit,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (categoryFilter !== "all") {
      params.category = categoryFilter;
    }

    const response = await axios.get("/blogs/admin/all", {
      params,
    });

    if (response.data.success) {
      setBlogs(response.data.blogs || []);

      setPagination(
        response.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      );
    }
  } catch (error) {
    console.error(
      "FETCH BLOGS ERROR:",
      error.response?.data || error.message
    );
  } finally {
    setLoading(false);
  }
};

// =====================================================
// FETCH CATEGORIES
// =====================================================

const fetchCategories = async () => {
  try {
    const response = await axios.get("/blogs/categories");

    if (response.data.success) {
      const list = response.data.categories || [];

      setCategories(
        list.filter((category) => category !== "All")
      );
    }
  } catch (error) {
    console.error(
      "FETCH CATEGORIES ERROR:",
      error.response?.data || error.message
    );
  }
};

useEffect(() => {
fetchBlogs(1);
}, [statusFilter, categoryFilter]);

useEffect(() => {
fetchCategories();
}, []);

// =====================================================
// SEARCH DEBOUNCE
// =====================================================

useEffect(() => {
const timer = setTimeout(() => {
fetchBlogs(1);
}, 500);


return () => clearTimeout(timer);


}, [search]);

// =====================================================
// STATS
// =====================================================

const stats = useMemo(() => {
const total = blogs.length;


const published = blogs.filter(
  (blog) => blog.status === "published"
).length;

const draft = blogs.filter(
  (blog) => blog.status === "draft"
).length;

const featured = blogs.filter(
  (blog) => blog.featured
).length;

return {
  total: pagination.total || total,
  published,
  draft,
  featured,
};


}, [blogs, pagination.total]);

// =====================================================
// FORM CHANGE
// =====================================================

const handleChange = (e) => {
const { name, value } = e.target;


setForm((prev) => ({
  ...prev,
  [name]: value,
}));


};

// =====================================================
// IMAGE CHANGE
// =====================================================

const handleImageChange = (e) => {
const file = e.target.files?.[0];


if (!file) return;

setCoverImage(file);

const previewUrl =
  URL.createObjectURL(file);

setImagePreview(previewUrl);


};

// =====================================================
// OPEN CREATE FORM
// =====================================================

const openCreateForm = () => {
setEditingBlog(null);


setForm(initialForm);

setCoverImage(null);

setImagePreview("");

setShowForm(true);


};

// =====================================================
// OPEN EDIT FORM
// =====================================================

const openEditForm = (blog) => {
setEditingBlog(blog);


setForm({
  title: blog.title || "",
  shortDescription:
    blog.shortDescription || "",
  content: blog.content || "",
  category: blog.category || "",
  authorName:
    blog.author?.name ||
    "Property Invest Team",
  authorRole:
    blog.author?.role ||
    "Investment Experts",
  tags: Array.isArray(blog.tags)
    ? blog.tags.join(", ")
    : "",
  status: blog.status || "draft",
  featured: Boolean(blog.featured),
  readTime: blog.readTime || 5,
  
});

setCoverImage(null);

setImagePreview(
  blog.coverImage || ""
);

setShowForm(true);

setMenuOpen(null);


};

// =====================================================
// CLOSE FORM
// =====================================================

const closeForm = () => {
setShowForm(false);


setEditingBlog(null);

setForm(initialForm);

setCoverImage(null);

setImagePreview("");


};

// =====================================================
// CREATE / UPDATE BLOG
// =====================================================

const handleSubmit = async (e) => {
e.preventDefault();


if (
  !form.title ||
  !form.shortDescription ||
  !form.content ||
  !form.category
) {
  alert(
    "Please fill all required fields"
  );

  return;
}

try {
  setSaving(true);

  const formData = new FormData();

  Object.entries(form).forEach(
    ([key, value]) => {
      if (key === "featured") {
        formData.append(
          key,
          value ? "true" : "false"
        );
      } else {
        formData.append(key, value);
      }
    }
  );

  if (coverImage) {
    formData.append(
      "coverImage",
      coverImage
    );
  }

  let response;

  if (editingBlog) {
    response = await axios.put(
      `/blogs/${editingBlog._id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } else {
    response = await axios.post(
      "/blogs",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  if (response.data.success) {
    closeForm();

    await fetchBlogs(
      pagination.page
    );

    await fetchCategories();

    alert(
      editingBlog
        ? "Blog updated successfully"
        : "Blog created successfully"
    );
  }
} catch (error) {
  console.error(
    "SAVE BLOG ERROR:",
    error.response?.data || error
  );

  alert(
    error.response?.data?.message ||
      "Failed to save blog"
  );
} finally {
  setSaving(false);
}


};

// =====================================================
// CHANGE STATUS
// =====================================================

const changeStatus = async (blog, status) => {
  try {
    await axios.patch(
      `/blogs/${blog._id}/status`,
      { status }
    );

    await fetchBlogs(pagination.page);

    setMenuOpen(null);
  } catch (error) {
    console.error(
      "STATUS ERROR:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
        "Failed to update status"
    );
  }
};

// =====================================================
// TOGGLE FEATURED
// =====================================================

const toggleFeatured = async (blog) => {
  try {
    await axios.patch(
      `/blogs/${blog._id}/featured`
    );

    await fetchBlogs(pagination.page);

    setMenuOpen(null);
  } catch (error) {
    console.error(
      "FEATURED ERROR:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
        "Failed to update featured status"
    );
  }
};

// =====================================================
// DELETE BLOG
// =====================================================

const deleteBlog = async (blog) => {
const confirmed = window.confirm(
`Are you sure you want to delete "${blog.title}"?`
);


if (!confirmed) return;

try {
  await axios.delete(
    `${API_BASE_URL}/api/blogs/${blog._id}`,
    {
      headers: getHeaders(),
    }
  );

  await fetchBlogs(
    pagination.page
  );

  setMenuOpen(null);
} catch (error) {
  console.error(
    "DELETE BLOG ERROR:",
    error
  );

  alert("Failed to delete blog");
}


};

// =====================================================
// DATE FORMAT
// =====================================================

const formatDate = (date) => {
if (!date) return "Not published";


return new Date(
  date
).toLocaleDateString("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});


};

return ( <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8"> <div className="mx-auto max-w-[1600px] space-y-8">


    {/* ================================================= */}
    {/* HEADER */}
    {/* ================================================= */}

    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-2xl">

      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-3 flex items-center gap-2 text-indigo-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              Content Management System
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Blog Management
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
            Create, manage and publish high-quality
            investment content for your Property
            Invest platform.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
        >
          <Plus className="h-5 w-5" />
          Create New Blog
        </button>
      </div>
    </div>

    {/* ================================================= */}
    {/* STATS */}
    {/* ================================================= */}

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Total Blogs"
        value={stats.total}
        icon={BookOpen}
        description="All blog content"
        iconColor="bg-indigo-100 text-indigo-600"
      />

      <StatCard
        title="Published"
        value={stats.published}
        icon={Globe2}
        description="Live on platform"
        iconColor="bg-emerald-100 text-emerald-600"
      />

      <StatCard
        title="Drafts"
        value={stats.draft}
        icon={FileEdit}
        description="Work in progress"
        iconColor="bg-amber-100 text-amber-600"
      />

      <StatCard
        title="Featured"
        value={stats.featured}
        icon={Star}
        description="Highlighted content"
        iconColor="bg-violet-100 text-violet-600"
      />
    </div>

    {/* ================================================= */}
    {/* BLOG MANAGEMENT */}
    {/* ================================================= */}

    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* TOP BAR */}

      <div className="border-b border-slate-100 p-5 md:p-6">

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your Blog Library
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage all your published articles and drafts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* SEARCH */}

            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search blogs..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* STATUS FILTER */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500"
            >
              <option value="all">
                All Status
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>

            {/* CATEGORY FILTER */}

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BLOG LIST */}

      <div className="p-5 md:p-6">

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : blogs.length === 0 ? (

          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
              <BookOpen className="h-9 w-9 text-slate-400" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No blogs found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Start building your content library by
              creating your first blog post.
            </p>

            <button
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Create Blog
            </button>
          </div>

        ) : (

          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">

            {blogs.map((blog) => (

              <div
                key={blog._id}
                className="group overflow-visible rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* IMAGE */}

                <div className="relative h-48 overflow-hidden bg-slate-100">

                  {blog.coverImage ? (

                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50">
                      <ImageIcon className="h-12 w-12 text-slate-300" />
                    </div>

                  )}

                  {/* STATUS */}

                  <div className="absolute left-4 top-4 flex gap-2">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
                        blog.status === "published"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-400 text-slate-900"
                      }`}
                    >
                      {blog.status === "published"
                        ? "Published"
                        : "Draft"}
                    </span>

                    {blog.featured && (
                      <span className="flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                        <Star className="h-3 w-3 fill-white" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* MENU */}

                  <div className="absolute right-4 top-4">

                    <button
                      onClick={() =>
                        setMenuOpen(
                          menuOpen === blog._id
                            ? null
                            : blog._id
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {menuOpen === blog._id && (

                      <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-2xl">

                        <button
                          onClick={() =>
                            openEditForm(blog)
                          }
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Blog
                        </button>

                        <button
                          onClick={() =>
                            toggleFeatured(blog)
                          }
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Star className="h-4 w-4" />

                          {blog.featured
                            ? "Remove Featured"
                            : "Make Featured"}
                        </button>

                        {blog.status === "published" ? (

                          <button
                            onClick={() =>
                              changeStatus(
                                blog,
                                "draft"
                              )
                            }
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <FileEdit className="h-4 w-4" />
                            Move to Draft
                          </button>

                        ) : (

                          <button
                            onClick={() =>
                              changeStatus(
                                blog,
                                "published"
                              )
                            }
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Publish Blog
                          </button>

                        )}

                        <div className="my-2 border-t border-slate-100" />

                        <button
                          onClick={() =>
                            deleteBlog(blog)
                          }
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Blog
                        </button>
                      </div>

                    )}
                  </div>
                </div>

                {/* CONTENT */}

                <div className="p-5">

                  <div className="mb-3 flex items-center justify-between gap-3">

                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                      {blog.category}
                    </span>

                    <div className="flex items-center gap-3 text-xs text-slate-400">

                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {blog.views || 0}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {blog.readTime || 5} min
                      </span>
                    </div>
                  </div>

                  <h3 className="line-clamp-2 text-lg font-bold leading-6 text-slate-900">
                    {blog.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {blog.shortDescription}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {blog.author?.name}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {blog.author?.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />

                      {formatDate(
                        blog.publishedAt ||
                        blog.createdAt
                      )}
                    </div>
                  </div>
                </div>
              </div>

            ))}
          </div>

        )}

        {/* ================================================= */}
        {/* PAGINATION */}
        {/* ================================================= */}

        {pagination.totalPages > 1 && (

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">

            <p className="text-sm text-slate-500">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>

            <div className="flex gap-2">

              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  fetchBlogs(
                    pagination.page - 1
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={
                  pagination.page >=
                  pagination.totalPages
                }
                onClick={() =>
                  fetchBlogs(
                    pagination.page + 1
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        )}
      </div>
    </div>
  </div>

{/* ================================================= */}
{/* CREATE / EDIT BLOG MODAL */}
{/* ================================================= */}

{showForm && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md md:p-6">

    {/* MODAL */}
    <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-5 py-5 text-white md:px-8 md:py-8">

        <div className="absolute right-0 top-0 h-44 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl" />

        <div className="relative flex items-center justify-between gap-4">

          <div className="flex items-center mb-16 gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              {editingBlog ? (
                <Edit3 className="h-5 w-5 text-white" />
              ) : (
                <Plus className="h-6 w-6 text-white" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                Content Management
              </p>

              <h2 className="mt-1 text-xl font-bold md:text-2xl">
                {editingBlog
                  ? "Edit Blog Post"
                  : "Create New Blog"}
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                {editingBlog
                  ? "Update your blog content and publishing settings."
                  : "Create engaging content for your Property Invest audience."}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            className="flex h-10 w-10 mb-18 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

      </div>

      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col"
      >

        {/* SCROLLABLE CONTENT */}

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8">

          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">

            {/* ============================================= */}
            {/* LEFT SIDE */}
            {/* ============================================= */}

            <div className="space-y-6">

              {/* BASIC INFORMATION */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Blog Details
                      </h3>

                      <p className="text-xs text-slate-500">
                        Add the main information about your article.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="space-y-5 p-5">

                  {/* TITLE */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Blog Title
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <span className="text-xs text-slate-400">
                        {form.title.length}/200
                      </span>
                    </div>

                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      maxLength={200}
                      placeholder="Enter an engaging blog title..."
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  {/* SHORT DESCRIPTION */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">
                        Short Description
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <span className="text-xs text-slate-400">
                        {form.shortDescription.length}/500
                      </span>

                    </div>

                    <textarea
                      name="shortDescription"
                      value={form.shortDescription}
                      onChange={handleChange}
                      rows={4}
                      maxLength={500}
                      placeholder="Write a short and compelling summary of your blog..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                </div>

              </div>


              {/* BLOG CONTENT */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Article Content
                      </h3>

                      <p className="text-xs text-slate-500">
                        Write the complete content of your blog.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="p-5">

                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows={20}
                    placeholder="Start writing your blog content here..."
                    className="min-h-[420px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <div className="mt-3 flex items-center justify-between">

                    <p className="text-xs text-slate-400">
                      Write detailed and valuable content for your readers.
                    </p>

                    <p className="text-xs font-medium text-slate-400">
                      {form.content.length.toLocaleString()} characters
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* ============================================= */}
            {/* RIGHT SIDE */}
            {/* ============================================= */}

            <div className="space-y-6">


              {/* ============================================= */}
              {/* COVER IMAGE */}
              {/* ============================================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <ImageIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Cover Image
                      </h3>

                      <p className="text-xs text-slate-500">
                        Upload a featured image.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="p-5">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <div
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-indigo-400 hover:bg-indigo-50"
                  >

                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Blog cover preview"
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/55 opacity-0 transition duration-300 group-hover:opacity-100">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg">
                            <Upload className="h-5 w-5" />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-white">
                            Change Image
                          </p>

                        </div>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                          <Upload className="h-6 w-6" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-700">
                          Upload Cover Image
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          JPG, PNG, WEBP or other supported image formats
                        </p>

                      </div>
                    )}

                  </div>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setCoverImage(null);
                        setImagePreview("");

                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="mt-3 w-full rounded-xl border border-red-100 bg-red-50 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Remove Image
                    </button>
                  )}

                </div>

              </div>


              {/* ============================================= */}
              {/* PUBLISHING */}
              {/* ============================================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Globe2 className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Publishing
                      </h3>

                      <p className="text-xs text-slate-500">
                        Control visibility of this blog.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="space-y-5 p-5">

                  {/* STATUS */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Blog Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="draft">
                        Save as Draft
                      </option>

                      <option value="published">
                        Publish Immediately
                      </option>
                    </select>
                  </div>


                  {/* FEATURED */}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex items-start gap-3">

                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                          <Star className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Featured Blog
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            Highlight this article on your platform.
                          </p>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            featured: !prev.featured,
                          }))
                        }
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-all ${
                          form.featured
                            ? "bg-indigo-600"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${
                            form.featured
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </button>

                    </div>

                  </div>

                </div>

              </div>


              {/* ============================================= */}
              {/* ORGANIZATION */}
              {/* ============================================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Tag className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Organization
                      </h3>

                      <p className="text-xs text-slate-500">
                        Categorize your blog content.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="space-y-5 p-5">

                  {/* CATEGORY */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Category
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="Example: Investment Guide"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />

                    {categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">

                        {categories.slice(0, 5).map(
                          (category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  category,
                                }))
                              }
                              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                                form.category === category
                                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                              }`}
                            >
                              {category}
                            </button>
                          )
                        )}

                      </div>
                    )}

                  </div>


                  {/* TAGS */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tags
                    </label>

                    <input
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="Real Estate, Investment, ROI"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Separate multiple tags using commas.
                    </p>
                  </div>


                  {/* READ TIME */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Read Time
                    </label>

                    <div className="relative">

                      <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        name="readTime"
                        type="number"
                        min="1"
                        value={form.readTime}
                        onChange={handleChange}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-16 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        minutes
                      </span>

                    </div>
                  </div>

                </div>

              </div>


              {/* ============================================= */}
              {/* AUTHOR */}
              {/* ============================================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <User className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Author Details
                      </h3>

                      <p className="text-xs text-slate-500">
                        Information displayed with the blog.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="space-y-5 p-5">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Author Name
                    </label>

                    <input
                      name="authorName"
                      value={form.authorName}
                      onChange={handleChange}
                      placeholder="Author name"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Author Role
                    </label>

                    <input
                      name="authorRole"
                      value={form.authorRole}
                      onChange={handleChange}
                      placeholder="Example: Investment Expert"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* FOOTER ACTIONS */}
        {/* ================================================= */}

        <div className="border-t border-slate-200 bg-white px-5 py-4 md:px-8 md:py-5">

          <div className="mx-auto flex max-w-6xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="text-xs text-slate-400">
              Fields marked with
              <span className="mx-1 text-red-500">*</span>
              are required.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`flex min-w-[170px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  form.status === "published"
                    ? "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
                    : "bg-slate-950 shadow-slate-200 hover:bg-slate-800"
                }`}
              >

                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {form.status === "published" ? (
                      <Globe2 className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    {editingBlog
                      ? "Update Blog"
                      : form.status === "published"
                      ? "Publish Blog"
                      : "Save Draft"}
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </form>

    </div>

  </div>
)}
</div>


);
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
title,
value,
icon: Icon,
description,
iconColor,
}) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">


  <div className="flex items-start justify-between">

    <div>
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </div>

    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconColor}`}
    >
      <Icon className="h-5 w-5" />
    </div>
  </div>
</div>


);
}

// =====================================================
// FORM SECTION
// =====================================================

function FormSection({
title,
icon: Icon,
children,
}) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">


  <div className="mb-5 flex items-center gap-3">

    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
      <Icon className="h-5 w-5" />
    </div>

    <h3 className="font-bold text-slate-900">
      {title}
    </h3>
  </div>

  {children}
</div>


);
}

// =====================================================
// INPUT FIELD
// =====================================================

function InputField({
label,
...props
}) {
return ( <div>


  <label className="mb-2 block text-sm font-semibold text-slate-700">
    {label}
  </label>

  <input
    {...props}
    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
  />
</div>


);
}
