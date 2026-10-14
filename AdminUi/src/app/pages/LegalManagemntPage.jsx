import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  ArrowLeft,
  FileText,
  Save,
  Globe,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Bold,
  Italic,
  Heading2,
  Pilcrow,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Code2,
} from "lucide-react";

const LEGAL_PAGES = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-and-conditions", title: "Terms & Conditions" },
  {
    slug: "refund-cancellation-policy",
    title: "Refund & Cancellation Policy",
  },
  {
    slug: "shipping-delivery-policy",
    title: "Shipping & Delivery Policy",
  },
  { slug: "grievance-officer", title: "Grievance Officer" },
  { slug: "cookie-policy", title: "Cookie Policy" },
  {
    slug: "account-data-deletion",
    title: "Account & Data Deletion",
  },
];

// Content ko normal text jaisa dikhane wali styling (editor + preview dono me)
const CONTENT_STYLES = [
  "[&_section]:mb-6",
  "[&_h2]:mb-2",
  "[&_h2]:text-lg",
  "[&_h2]:font-bold",
  "[&_h2]:text-slate-900",
  "[&_p]:mb-3",
  "[&_p]:text-sm",
  "[&_p]:leading-7",
  "[&_p]:text-slate-600",
  "[&_ul]:mb-3",
  "[&_ul]:list-disc",
  "[&_ul]:pl-6",
  "[&_ol]:mb-3",
  "[&_ol]:list-decimal",
  "[&_ol]:pl-6",
  "[&_li]:text-sm",
  "[&_li]:leading-7",
  "[&_li]:text-slate-600",
].join(" ");

// HTML se tags hata kar dekhta hai ki content sach me khali to nahi
const isEmptyContent = (html) =>
  !html || html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() === "";

/* =====================================================
   RICH TEXT EDITOR (normal likhne wala editor)
===================================================== */

function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);

  // Value bahar se badle (page switch / load) tabhi editor update karo
  useEffect(() => {
    const el = editorRef.current;

    if (el && el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const run = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    onChange(editorRef.current.innerHTML);
  };

  const tools = [
    { icon: Heading2, label: "Heading", action: () => run("formatBlock", "<h2>") },
    { icon: Pilcrow, label: "Paragraph", action: () => run("formatBlock", "<p>") },
    { icon: Bold, label: "Bold", action: () => run("bold") },
    { icon: Italic, label: "Italic", action: () => run("italic") },
    { icon: List, label: "Bullet list", action: () => run("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbered list", action: () => run("insertOrderedList") },
    { icon: Undo2, label: "Undo", action: () => run("undo") },
    { icon: Redo2, label: "Redo", action: () => run("redo") },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-teal-600">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {tools.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            // mouseDown preventDefault: taaki selection editor se na hate
            onMouseDown={(event) => {
              event.preventDefault();
              action();
            }}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900"
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* EDITABLE AREA */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className={`min-h-[420px] max-h-[600px] overflow-y-auto px-5 py-4 outline-none ${CONTENT_STYLES}`}
      />
    </div>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function LegalPagesManagement() {
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("terms-and-conditions");

  const [form, setForm] = useState({
    title: "Terms & Conditions",
    description: "",
    content: "",
    status: "draft",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [notice, setNotice] = useState(null);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setNotice(null);

      const response = await axios.get("/legal-pages/admin/all");
      const fetchedPages = response.data?.pages || [];

      setPages(fetchedPages);

      const selected = fetchedPages.find((page) => page.slug === selectedSlug);

      if (selected) {
        setForm({
          title: selected.title || "",
          description: selected.description || "",
          content: selected.content || "",
          status: selected.status || "draft",
        });
      }
    } catch (error) {
      console.error("FETCH LEGAL PAGES:", error);

      setNotice({
        type: "error",
        text:
          error.response?.data?.message ||
          "Legal pages load nahi hue. Admin login aur backend check karein.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectPage = (slug) => {
    setSelectedSlug(slug);
    setPreview(false);
    setHtmlMode(false);
    setNotice(null);

    const selected = pages.find((page) => page.slug === slug);
    const meta = LEGAL_PAGES.find((page) => page.slug === slug);

    setForm({
      title: selected?.title || meta?.title || "",
      description: selected?.description || "",
      content: selected?.content || "",
      status: selected?.status || "draft",
    });
  };

  const savePage = async (status) => {
    if (!form.title.trim() || isEmptyContent(form.content)) {
      setNotice({
        type: "error",
        text: "Page title aur content required hain.",
      });
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      const response = await axios.put(`/legal-pages/admin/${selectedSlug}`, {
        title: form.title,
        description: form.description,
        content: form.content,
        status,
      });

      const savedPage = response.data?.page;

      if (savedPage) {
        setPages((current) => {
          const others = current.filter((page) => page.slug !== savedPage.slug);

          return [...others, savedPage];
        });

        setForm({
          title: savedPage.title,
          description: savedPage.description || "",
          content: savedPage.content || "",
          status: savedPage.status,
        });
      }

      setNotice({
        type: "success",
        text:
          status === "published"
            ? "Legal page is published."
            : "Draft saved",
      });
    } catch (error) {
      console.error("SAVE LEGAL PAGE:", error);

      setNotice({
        type: "error",
        text:
          error.response?.data?.message ||
          "Page is not save",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedMeta = LEGAL_PAGES.find((page) => page.slug === selectedSlug);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="rounded-3xl bg-slate-900 p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-teal-300">
                <FileText size={18} />
                <span className="text-sm font-medium">
                  Content Management System
                </span>
              </div>

              <h1 className="text-3xl font-bold md:text-4xl">
                Legal Pages Management
              </h1>

              
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/cms")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <ArrowLeft size={16} />
                Blog Management
              </button>

              <button
                type="button"
                onClick={fetchPages}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {notice && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {notice.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <h2 className="px-3 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              Select a page
            </h2>

            <div className="space-y-1">
              {LEGAL_PAGES.map((item) => {
                const saved = pages.find((page) => page.slug === item.slug);
                const active = selectedSlug === item.slug;

                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => selectPage(item.slug)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm transition ${
                      active
                        ? "bg-teal-50 font-semibold text-teal-800 ring-1 ring-teal-100"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.title}</span>

                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                        saved?.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {saved?.status || "draft"}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            {loading ? (
              <div className="flex items-center gap-3 py-12 text-sm text-slate-500">
                <Loader2 className="animate-spin" size={20} />
                Loading legal pages...
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
                      Editing page
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {selectedMeta?.title}
                    </h2>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      Website URL: /{selectedSlug}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreview((value) => !value)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    {preview ? "Edit Content" : "Preview"}
                  </button>
                </div>

                {!preview ? (
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Page Title *
                      </label>

                      <input
                        value={form.title}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        maxLength={200}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-teal-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Short Description
                      </label>

                      <textarea
                        rows={3}
                        value={form.description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          Page Content *
                        </label>

                        <button
                          type="button"
                          onClick={() => setHtmlMode((value) => !value)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <Code2 size={14} />
                          {htmlMode ? "Normal Editor" : "HTML View"}
                        </button>
                      </div>

                      {htmlMode ? (
                        <textarea
                          rows={22}
                          spellCheck={false}
                          value={form.content}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              content: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-6 text-slate-800 outline-none focus:border-teal-600 focus:bg-white"
                        />
                      ) : (
                        <RichEditor
                          value={form.content}
                          onChange={(html) =>
                            setForm((current) => ({
                              ...current,
                              content: html,
                            }))
                          }
                        />
                      )}

                     
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 p-5">
                    <h2 className="mb-3 text-2xl font-bold text-gray-900">
                      {form.title}
                    </h2>

                    {form.description && (
                      <p className="mb-6 text-sm leading-6 text-gray-600">
                        {form.description}
                      </p>
                    )}

                    <div
                      className={CONTENT_STYLES}
                      dangerouslySetInnerHTML={{
                        __html: form.content || "<p>No content yet.</p>",
                      }}
                    />
                  </div>
                )}

                <div className="mt-7 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-500">
                    Status: <strong>{form.status || "draft"}</strong>
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => savePage("draft")}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={() => savePage("published")}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Globe size={16} />
                      )}
                      Save & Publish
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}