import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import {
  getInvestorDetails,
  updateKyc,
} from "../../api/user";

import {
  approveInvestment,
  rejectInvestment,
  verifyPayment,
  rejectPayment,
} from "../../api/investment";

import { toast } from "sonner";

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MapPin,
  CalendarDays,
  Building2,
  WalletCards,
  CreditCard,
  Landmark,
  FileText,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  CircleDollarSign,
  BadgeCheck,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";


// =====================================================
// HELPERS
// =====================================================

const INVESTMENTS_PER_PAGE = 3;


function formatAddress(address) {
  if (!address) return "N/A";

  if (typeof address === "string") {
    return address;
  }

  if (typeof address === "object") {
    return [
      address.address,
      address.street,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return String(address);
}


function getPropertyImage(inv) {
    const property = inv?.propertyId;
  
    const possibleImages = [
      // ✅ Actual API structure
      property?.media?.images?.[0],
  
      // Other possible structures
      property?.images?.[0],
      property?.image,
      property?.propertyImage,
      property?.propertyImages?.[0],
  
      inv?.propertyImage,
      inv?.propertyImages?.[0],
      inv?.image,
    ];
  
    const image = possibleImages.find(Boolean);
  
    if (!image) return "";
  
    if (typeof image === "object") {
      return (
        image?.url ||
        image?.secure_url ||
        image?.path ||
        ""
      );
    }
  
    return image;
  }


function formatCurrency(value) {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN")}`;
}


function formatDate(date) {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatDateTime(date) {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


// =====================================================
// STATUS BADGES
// =====================================================

function KycStatusBadge({ status }) {
  const normalized =
    typeof status === "string"
      ? status.toLowerCase()
      : "pending";

  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap";

  if (
    normalized === "approved" ||
    normalized === "verified"
  ) {
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Approved
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span
        className={`${base} bg-rose-50 text-rose-700 border-rose-100`}
      >
        <ShieldX className="w-3.5 h-3.5" />
        Rejected
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-amber-50 text-amber-700 border-amber-100`}
    >
      <ShieldAlert className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}


function PaymentStatusBadge({ status }) {
  const normalized =
    typeof status === "string"
      ? status.toLowerCase()
      : "not_paid";

  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap";

  if (normalized === "verified") {
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}
      >
        <BadgeCheck className="w-3.5 h-3.5" />
        Verified
      </span>
    );
  }

  if (normalized === "payment_submitted") {
    return (
      <span
        className={`${base} bg-amber-50 text-amber-700 border-amber-100`}
      >
        <Clock className="w-3.5 h-3.5" />
        Submitted
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span
        className={`${base} bg-rose-50 text-rose-700 border-rose-100`}
      >
        <ShieldX className="w-3.5 h-3.5" />
        Rejected
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-slate-50 text-slate-600 border-slate-200`}
    >
      <Clock className="w-3.5 h-3.5" />
      Not Paid
    </span>
  );
}


function InvestmentStatusBadge({ status }) {
  const normalized =
    typeof status === "string"
      ? status.toLowerCase()
      : "pending";

  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap";

  if (normalized === "approved") {
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}
      >
        <BadgeCheck className="w-3.5 h-3.5" />
        Approved
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span
        className={`${base} bg-rose-50 text-rose-700 border-rose-100`}
      >
        <ShieldX className="w-3.5 h-3.5" />
        Rejected
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-amber-50 text-amber-700 border-amber-100`}
    >
      <Clock className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}


// =====================================================
// SMALL UI COMPONENTS
// =====================================================

function InfoItem({
  icon: Icon,
  label,
  value,
  mono = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
        {Icon && (
          <Icon className="w-3.5 h-3.5 text-slate-400" />
        )}
        {label}
      </div>

      <p
        className={`mt-1.5 text-sm font-semibold text-slate-800 break-words ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "N/A"}
      </p>
    </div>
  );
}


function StatCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-slate-50 -translate-y-8 translate-x-8" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">
            {label}
          </p>

          <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
          {value}
        </p>

        {description && (
          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}


function SectionHeader({
  icon: Icon,
  title,
  description,
  right,
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
          <Icon className="w-4 h-4" />
        </div>

        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            {title}
          </h2>

          {description && (
            <p className="text-xs text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {right}
    </div>
  );
}


function DocumentCard({
  icon: Icon,
  title,
  description,
  file,
}) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 shrink-0">
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">
            {title}
          </p>

          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {file ? (
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-9 px-3 shrink-0 text-xs font-semibold"
          onClick={() =>
            window.open(file, "_blank")
          }
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          View
        </Button>
      ) : (
        <span className="text-[11px] font-medium text-slate-400 shrink-0">
          Not uploaded
        </span>
      )}
    </div>
  );
}


// =====================================================
// MAIN COMPONENT
// =====================================================

export function InvestorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState("overview");

  const [investmentPage, setInvestmentPage] =
    useState(1);

  const [expandedInvestment, setExpandedInvestment] =
    useState(null);

  const [editedInvestment, setEditedInvestment] =
    useState({});

  const [actionLoading, setActionLoading] =
    useState(null);

  // =====================================================
  // FETCH INVESTOR
  // =====================================================

  const fetchInvestor = async () => {
    try {
      setLoading(true);

      const res = await getInvestorDetails(id);

      setInvestor(res.data);
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Could not fetch investor details"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchInvestor();
  }, [id]);


  // =====================================================
  // INVESTMENTS
  // =====================================================

  const investments = useMemo(() => {
    return [
      ...(investor?.investments || []),
    ].sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );
  }, [investor]);


  const totalInvestmentPages = Math.max(
    1,
    Math.ceil(
      investments.length /
        INVESTMENTS_PER_PAGE
    )
  );


  const paginatedInvestments = useMemo(() => {
    const start =
      (investmentPage - 1) *
      INVESTMENTS_PER_PAGE;

    return investments.slice(
      start,
      start + INVESTMENTS_PER_PAGE
    );
  }, [
    investments,
    investmentPage,
  ]);


  // =====================================================
  // REFRESH AFTER ACTION
  // =====================================================

  const refreshInvestor = async () => {
    try {
      const currentPage = investmentPage;
      const currentExpanded =
        expandedInvestment;

      const res =
        await getInvestorDetails(id);

      setInvestor(res.data);

      setInvestmentPage(currentPage);
      setExpandedInvestment(
        currentExpanded
      );
    } catch (err) {
      console.error(err);

      toast.error(
        "Could not refresh investor details"
      );
    }
  };


  // =====================================================
  // KYC
  // =====================================================

  const handleKyc = async (status) => {
    try {
      setActionLoading(`kyc-${status}`);

      await updateKyc(id, status);

      toast.success(
        `KYC status updated to ${status}`
      );

      await refreshInvestor();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to update KYC"
      );
    } finally {
      setActionLoading(null);
    }
  };


  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  const handleVerifyPayment = async (
    investment
  ) => {
    try {
      setActionLoading(
        `verify-${investment._id}`
      );

      await verifyPayment(
        investment._id
      );

      toast.success(
        "Payment verified successfully"
      );

      await refreshInvestor();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Payment verification failed"
      );
    } finally {
      setActionLoading(null);
    }
  };


  // =====================================================
  // REJECT PAYMENT
  // =====================================================

  const handleRejectPayment = async (
    investment
  ) => {
    try {
      setActionLoading(
        `reject-payment-${investment._id}`
      );

      await rejectPayment(
        investment._id
      );

      toast.success("Payment rejected");

      await refreshInvestor();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Payment rejection failed"
      );
    } finally {
      setActionLoading(null);
    }
  };


  // =====================================================
  // APPROVE INVESTMENT
  // =====================================================

  const handleApproveInvestment = async (
    investment
  ) => {
    const shares =
      editedInvestment[
        investment._id
      ]?.shares ??
      investment.requestedShares ??
      investment.shares;

    if (
      !shares ||
      Number(shares) < 10
    ) {
      toast.error(
        "Minimum approved shares are 10"
      );
      return;
    }

    try {
      setActionLoading(
        `approve-${investment._id}`
      );

      await approveInvestment(
        investment._id,
        {
          shares: Number(shares),
        }
      );

      toast.success(
        "Investment approved successfully"
      );

      await refreshInvestor();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Investment approval failed"
      );
    } finally {
      setActionLoading(null);
    }
  };


  // =====================================================
  // REJECT INVESTMENT
  // =====================================================

  const handleRejectInvestment = async (
    investment
  ) => {
    try {
      setActionLoading(
        `reject-investment-${investment._id}`
      );

      await rejectInvestment(
        investment._id
      );

      toast.success(
        "Investment rejected"
      );

      await refreshInvestor();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Investment rejection failed"
      );
    } finally {
      setActionLoading(null);
    }
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">

          <div className="h-5 w-36 bg-slate-200 rounded" />

          <div className="rounded-3xl bg-white border border-slate-200 p-8">
            <div className="flex gap-5">
              <div className="h-20 w-20 rounded-2xl bg-slate-200" />

              <div className="space-y-3 flex-1">
                <div className="h-7 w-64 bg-slate-200 rounded" />
                <div className="h-4 w-80 bg-slate-200 rounded" />
                <div className="h-4 w-52 bg-slate-200 rounded" />
              </div>
            </div>
          </div>

          <div className="h-14 bg-white rounded-2xl border border-slate-200" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-white rounded-2xl border border-slate-200" />
            <div className="h-32 bg-white rounded-2xl border border-slate-200" />
            <div className="h-32 bg-white rounded-2xl border border-slate-200" />
          </div>

        </div>
      </div>
    );
  }


  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!investor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
            <User className="w-7 h-7 text-slate-300" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Investor not found
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            We couldn't load this investor's details.
          </p>

          <Button
            onClick={() =>
              navigate("/investors")
            }
            className="mt-5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Investors
          </Button>

        </div>
      </div>
    );
  }


  const user =
    investor.user || {};

  const kyc =
    investor.kyc || {};

  const bank =
    kyc.bank || {};

  const totalInvested =
    user.totalInvested ||
    investor.totalInvested ||
    0;

  const propertyCount =
    user.properties ||
    investor.properties ||
    investments.length ||
    0;

  const avgROI =
    user.avgROI ||
    investor.avgROI ||
    "0%";


  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "IN";


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">

      {/* TOP GRADIENT */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10 py-6 md:py-8">

        {/* =================================================
            BREADCRUMB / BACK
        ================================================= */}

        <div className="flex items-center justify-between mb-6">

          <button
            type="button"
            onClick={() =>
              navigate("/investors")
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Investors
          </button>

          <button
            type="button"
            onClick={refreshInvestor}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

        </div>


        {/* =================================================
            PREMIUM PROFILE HEADER
        ================================================= */}

        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

          {/* subtle decorative background */}

          <div className="absolute inset-0 pointer-events-none">

            <div className="absolute -right-24 -top-32 w-80 h-80 rounded-full bg-blue-50/80 blur-2xl" />

            <div className="absolute right-48 -bottom-40 w-72 h-72 rounded-full bg-indigo-50/70 blur-3xl" />

          </div>


          <div className="relative p-6 md:p-8">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-7">

              <div className="flex items-start gap-5 min-w-0">

                {/* AVATAR */}

                <div className="h-20 w-20 md:h-24 md:w-24 rounded-[22px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center text-white text-2xl md:text-3xl font-extrabold shadow-lg shrink-0">
                  {initials}
                </div>


                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2.5">

                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">
                      {user.name ||
                        "Investor"}
                    </h1>

                    <KycStatusBadge
                      status={
                        user.kycStatus
                      }
                    />

                  </div>


                  <div className="mt-3 flex flex-col gap-2">

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {user.email ||
                          "Email not available"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        {user.phone ||
                          "Phone not available"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays className="w-4 h-4 shrink-0" />
                      Joined{" "}
                      {formatDate(
                        user.createdAt ||
                          investor.createdAt
                      )}
                    </div>

                  </div>

                </div>

              </div>


              {/* RIGHT META */}

              <div className="lg:text-right">

                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-400">
                  Investor ID
                </p>

                <p className="mt-1 font-mono text-xs text-slate-500 break-all">
                  {user._id || id}
                </p>

                <div className="mt-3 flex lg:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 text-[11px] font-bold">
                    <BriefcaseBusiness className="w-3.5 h-3.5" />
                    Investor Account
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            TABS
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">

          <div className="grid grid-cols-3 gap-1">

            {[
              {
                id: "overview",
                label: "Overview",
                icon: User,
              },
              {
                id: "kyc",
                label: "KYC & Documents",
                icon: ShieldCheck,
              },
              {
                id: "investments",
                label: "Investments",
                icon: Building2,
              },
            ].map((tab) => {

              const Icon = tab.icon;

              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);

                    if (
                      tab.id !==
                      "investments"
                    ) {
                      setExpandedInvestment(
                        null
                      );
                    }
                  }}
                  className={`relative flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs md:text-sm font-bold transition-all ${
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />

                  <span>
                    {tab.label}
                  </span>

                  {tab.id ===
                    "investments" && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        active
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {investments.length}
                    </span>
                  )}

                </button>
              );
            })}

          </div>

        </div>


        {/* =================================================
            TAB CONTENT
        ================================================= */}

        <div className="mt-6">


          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeTab === "overview" && (

            <div className="space-y-6">

              {/* STATS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <StatCard
                  icon={WalletCards}
                  label="Total Invested"
                  value={
                    typeof totalInvested ===
                    "number"
                      ? formatCurrency(
                          totalInvested
                        )
                      : totalInvested ||
                        "₹0"
                  }
                  description="Total portfolio value"
                />

                <StatCard
                  icon={Building2}
                  label="Properties"
                  value={
                    propertyCount
                  }
                  description="Investment properties"
                />

                <StatCard
                  icon={TrendingUpIcon}
                  label="Average ROI"
                  value={avgROI}
                  description="Portfolio performance"
                />

              </div>


              {/* PERSONAL INFORMATION */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">

                <SectionHeader
                  icon={User}
                  title="Personal Information"
                  description="Basic investor account information"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  <InfoItem
                    icon={User}
                    label="Full Name"
                    value={
                      user.name
                    }
                  />

                  <InfoItem
                    icon={Mail}
                    label="Email Address"
                    value={
                      user.email
                    }
                  />

                  <InfoItem
                    icon={Phone}
                    label="Phone Number"
                    value={
                      user.phone
                    }
                  />

                  <InfoItem
                    icon={ShieldCheck}
                    label="KYC Status"
                    value={
                      typeof user.kycStatus ===
                      "string"
                        ? user.kycStatus
                            .charAt(0)
                            .toUpperCase() +
                          user.kycStatus.slice(
                            1
                          )
                        : "Pending"
                    }
                  />

                </div>

              </section>


              {/* ACCOUNT DETAILS */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">

                <SectionHeader
                  icon={BriefcaseBusiness}
                  title="Account Details"
                  description="Investor account metadata"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  <InfoItem
                    icon={Hash}
                    label="Investor ID"
                    value={
                      user._id ||
                      id
                    }
                    mono
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Joined On"
                    value={formatDate(
                      user.createdAt ||
                        investor.createdAt
                    )}
                  />

                  <InfoItem
                    icon={Building2}
                    label="Total Investments"
                    value={
                      investments.length
                    }
                  />

                </div>

              </section>

            </div>

          )}


          {/* =================================================
              KYC TAB
          ================================================= */}

          {activeTab === "kyc" && (

            <div className="space-y-6">

              {/* KYC STATUS BANNER */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="rounded-2xl bg-slate-100 p-3">
                      <ShieldCheck className="w-5 h-5 text-slate-700" />
                    </div>

                    <div>
                      <h2 className="font-extrabold text-slate-950">
                        KYC Verification
                      </h2>

                      <p className="text-xs text-slate-400 mt-1">
                        Review identity information and submitted documents.
                      </p>
                    </div>

                  </div>

                  <KycStatusBadge
                    status={
                      user.kycStatus
                    }
                  />

                </div>

              </section>


              {/* PERSONAL KYC */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">

                <SectionHeader
                  icon={User}
                  title="Identity Information"
                  description="Information submitted during KYC verification"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  <InfoItem
                    icon={User}
                    label="Legal Name"
                    value={
                      kyc.fullName
                    }
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Date of Birth"
                    value={formatDate(
                      kyc.dob
                    )}
                  />

                </div>


                {/* ADDRESS */}

                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">

                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    Residential Address
                  </div>

                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {formatAddress(
                      kyc.address
                    )}
                  </p>

                </div>

              </section>


              {/* DOCUMENTS */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">

                <SectionHeader
                  icon={FileText}
                  title="Verification Documents"
                  description="Documents submitted by the investor"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                  <DocumentCard
                    icon={CreditCard}
                    title="PAN Card"
                    description="Government identity document"
                    file={
                      kyc.panFile
                    }
                  />

                  <DocumentCard
                    icon={FileText}
                    title="Aadhaar Card"
                    description="Government identity document"
                    file={
                      kyc.aadhaarFile
                    }
                  />

                  <DocumentCard
                    icon={Landmark}
                    title="Cancelled Cheque"
                    description={
                      bank.accountNumber
                        ? `A/C •••• ${String(
                            bank.accountNumber
                          ).slice(-4)}`
                        : "Bank account document"
                    }
                    file={
                      bank.cancelCheque
                    }
                  />

                </div>

              </section>


              {/* BANK DETAILS */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">

                <SectionHeader
                  icon={Landmark}
                  title="Bank Information"
                  description="Registered bank account information"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  <InfoItem
                    icon={Landmark}
                    label="Account Number"
                    value={
                      bank.accountNumber
                        ? `•••• ${String(
                            bank.accountNumber
                          ).slice(-4)}`
                        : "N/A"
                    }
                    mono
                  />

                  <InfoItem
                    icon={Hash}
                    label="IFSC Code"
                    value={
                      bank.ifsc ||
                      bank.ifscCode
                    }
                    mono
                  />

                  <InfoItem
                    icon={Landmark}
                    label="Bank Name"
                    value={
                      bank.bankName ||
                      bank.name
                    }
                  />

                </div>

              </section>


              {/* KYC ACTIONS */}

              {user.kycStatus ===
                "pending" && (

                <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 md:p-6">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="rounded-xl bg-amber-100 p-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-600" />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-amber-950">
                          KYC review required
                        </h3>

                        <p className="text-xs text-amber-800/70 mt-1">
                          Review all submitted information before approving the investor.
                        </p>
                      </div>

                    </div>

                    <div className="flex gap-2">

                      <Button
                        disabled={
                          !!actionLoading
                        }
                        onClick={() =>
                          handleKyc(
                            "approved"
                          )
                        }
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        <Check className="w-4 h-4 mr-1.5" />

                        {actionLoading ===
                        "kyc-approved"
                          ? "Approving..."
                          : "Approve KYC"}
                      </Button>

                      <Button
                        disabled={
                          !!actionLoading
                        }
                        variant="destructive"
                        onClick={() =>
                          handleKyc(
                            "rejected"
                          )
                        }
                        className="rounded-xl font-bold"
                      >
                        <X className="w-4 h-4 mr-1.5" />

                        {actionLoading ===
                        "kyc-rejected"
                          ? "Rejecting..."
                          : "Reject"}
                      </Button>

                    </div>

                  </div>

                </section>

              )}

            </div>

          )}


          {/* =================================================
              INVESTMENTS TAB
          ================================================= */}

          {activeTab ===
            "investments" && (

            <div className="space-y-5">

              {/* HEADER */}

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-600">
                    Portfolio
                  </p>

                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-1">
                    Investment Portfolio
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    Review properties, payment status and investment approvals.
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Total Investments
                  </p>

                  <p className="text-xl font-extrabold text-slate-950 mt-0.5">
                    {investments.length}
                  </p>

                </div>

              </div>


              {/* EMPTY */}

              {investments.length ===
                0 ? (

                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">

                  <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-slate-400" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    No investments yet
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    This investor doesn't have any investment records.
                  </p>

                </div>

              ) : (

                <>

                  {/* INVESTMENT CARDS */}

                  <div className="space-y-4">

                    {paginatedInvestments.map(
                      (investment) => {

                        const isExpanded =
                          expandedInvestment ===
                          investment._id;

                        const shares =
                          editedInvestment[
                            investment._id
                          ]?.shares ??
                          investment.requestedShares ??
                          investment.shares ??
                          0;

                        const pricePerShare =
                          investment
                            .propertyId
                            ?.pricePerShare ||
                          investment.pricePerShare ||
                          0;

                        const requestedAmount =
                          investment.requestedAmount ??
                          investment.amount ??
                          0;

                        const approvedAmount =
                          Number(shares) *
                          Number(
                            pricePerShare
                          );

                        const propertyImage =
                          getPropertyImage(
                            investment
                          );

                        const shareCycle =
                          Number(
                            investment
                              .propertyId
                              ?.shareBuyingCycle ||
                            investment.shareBuyingCycle ||
                            10
                          );

                        return (
                          <div
                            key={
                              investment._id
                            }
                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                          >

                            {/* =================================================
                                CARD HEADER
                            ================================================= */}

                            <div className="p-4 md:p-5">

                              <div className="flex flex-col md:flex-row gap-4">

                                {/* PROPERTY IMAGE */}

                                <div className="relative w-full md:w-40 h-44 md:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">

                                  {propertyImage ? (

                                    <img
                                      src={
                                        propertyImage
                                      }
                                      alt={
                                        investment
                                          .propertyId
                                          ?.name ||
                                        "Property"
                                      }
                                      className="w-full h-full object-cover"
                                      onError={(
                                        e
                                      ) => {
                                        e.currentTarget.style.display =
                                          "none";

                                        e.currentTarget.parentElement
                                          .querySelector(
                                            ".property-fallback"
                                          )
                                          ?.classList.remove(
                                            "hidden"
                                          );
                                      }}
                                    />

                                  ) : null}

                                  <div
                                    className={`property-fallback absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 ${
                                      propertyImage
                                        ? "hidden"
                                        : ""
                                    }`}
                                  >
                                    <Building2 className="w-9 h-9" />
                                  </div>

                                  <div className="absolute left-2.5 top-2.5 rounded-lg bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm">
                                    Property
                                  </div>

                                </div>


                                {/* PROPERTY INFO */}

                                <div className="min-w-0 flex-1">

                                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">

                                    <div className="min-w-0">

                                      <h3 className="text-lg font-extrabold text-slate-950 truncate">
                                        {investment
                                          .propertyId
                                          ?.name ||
                                          "Property Allocation"}
                                      </h3>

                                      {investment
                                        .propertyId
                                        ?.location && (

                                        <div className="flex items-start gap-1.5 mt-1.5 text-xs text-slate-400">

                                          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />

                                          <span className="line-clamp-2">
                                            {formatAddress(
                                              investment
                                                .propertyId
                                                .location
                                            )}
                                          </span>

                                        </div>

                                      )}

                                      <div className="flex flex-wrap items-center gap-2 mt-3">

                                        <InvestmentStatusBadge
                                          status={
                                            investment.status
                                          }
                                        />

                                        <PaymentStatusBadge
                                          status={
                                            investment.paymentStatus
                                          }
                                        />

                                      </div>

                                    </div>


                                    {/* DATE */}

                                    <div className="text-left lg:text-right shrink-0">

                                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                        Invested On
                                      </p>

                                      <p className="text-xs font-semibold text-slate-600 mt-1">
                                        {formatDate(
                                          investment.createdAt
                                        )}
                                      </p>

                                    </div>

                                  </div>


                                  {/* SUMMARY */}

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">

                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">

                                      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                                        Shares
                                      </p>

                                      <p className="text-sm font-extrabold text-slate-900 mt-1">
                                        {shares}
                                      </p>

                                    </div>

                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">

                                      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                                        Requested
                                      </p>

                                      <p className="text-sm font-extrabold text-slate-900 mt-1">
                                        {formatCurrency(
                                          requestedAmount
                                        )}
                                      </p>

                                    </div>

                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">

                                      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                                        Price / Share
                                      </p>

                                      <p className="text-sm font-extrabold text-slate-900 mt-1">
                                        {formatCurrency(
                                          pricePerShare
                                        )}
                                      </p>

                                    </div>

                                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">

                                      <p className="text-[10px] uppercase tracking-wide font-bold text-emerald-600">
                                        Approved
                                      </p>

                                      <p className="text-sm font-extrabold text-emerald-800 mt-1">
                                        {formatCurrency(
                                          approvedAmount
                                        )}
                                      </p>

                                    </div>

                                  </div>

                                </div>

                              </div>


                              {/* EXPAND */}

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedInvestment(
                                    isExpanded
                                      ? null
                                      : investment._id
                                  )
                                }
                                className="mt-4 w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                              >

                                <span>
                                  {isExpanded
                                    ? "Hide investment details"
                                    : "View investment & payment details"}
                                </span>

                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}

                              </button>

                            </div>


                            {/* =================================================
                                EXPANDED INVESTMENT DETAILS
                            ================================================= */}

                            {isExpanded && (

                              <div className="border-t border-slate-200 bg-slate-50/70 p-4 md:p-5 space-y-4">

                                {/* PAYMENT */}

                                <div className="rounded-2xl border border-slate-200 bg-white p-4">

                                  <div className="flex items-center gap-2 mb-4">

                                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                                      <CreditCard className="w-4 h-4" />
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-extrabold text-slate-900">
                                        Payment Details
                                      </h4>

                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        Payment information submitted for this investment
                                      </p>
                                    </div>

                                  </div>


                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                    <InfoItem
                                      icon={
                                        CreditCard
                                      }
                                      label="Payment Method"
                                      value={
                                        typeof investment.paymentMethod ===
                                        "string"
                                          ? investment.paymentMethod
                                          : "N/A"
                                      }
                                    />

                                    <InfoItem
                                      icon={
                                        Hash
                                      }
                                      label="Reference / UTR"
                                      value={
                                        typeof investment.paymentReference ===
                                        "string"
                                          ? investment.paymentReference
                                          : "N/A"
                                      }
                                      mono
                                    />

                                  </div>


                                  {investment.paymentProof && (

                                    <Button
                                      variant="outline"
                                      className="w-full mt-3 rounded-xl font-semibold"
                                      onClick={() =>
                                        window.open(
                                          investment.paymentProof,
                                          "_blank"
                                        )
                                      }
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Payment Proof
                                    </Button>

                                  )}

                                </div>


                                {/* SHARES */}

                                <div className="rounded-2xl border border-slate-200 bg-white p-4">

                                  <div className="flex items-center gap-2 mb-4">

                                    <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                                      <Building2 className="w-4 h-4" />
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-extrabold text-slate-900">
                                        Investment Allocation
                                      </h4>

                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        Set the final approved share quantity
                                      </p>
                                    </div>

                                  </div>


                                  <div className="max-w-sm">

                                    <label className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                                      Approved Shares
                                    </label>

                                    <Input
                                      type="number"
                                      min={10}
                                      step={
                                        shareCycle
                                      }
                                      className="mt-1.5 h-11 rounded-xl"
                                      value={
                                        shares
                                      }
                                      onChange={(
                                        e
                                      ) => {

                                        const value =
                                          e.target.value;

                                        if (
                                          value ===
                                          ""
                                        ) {
                                          setEditedInvestment(
                                            (
                                              prev
                                            ) => ({
                                              ...prev,
                                              [investment._id]:
                                                {
                                                  ...prev[
                                                    investment
                                                      ._id
                                                  ],
                                                  shares:
                                                    "",
                                                },
                                            })
                                          );

                                          return;
                                        }

                                        const newShares =
                                          Number(
                                            value
                                          );

                                        if (
                                          !Number.isInteger(
                                            newShares
                                          )
                                        ) {
                                          return;
                                        }

                                        if (
                                          newShares <
                                          10
                                        ) {
                                          toast.error(
                                            "Minimum approved shares are 10"
                                          );
                                          return;
                                        }

                                        if (
                                          shareCycle ===
                                            10 &&
                                          newShares %
                                            10 !==
                                            0
                                        ) {
                                          toast.error(
                                            "This property allows shares in multiples of 10"
                                          );
                                          return;
                                        }

                                        if (
                                          shareCycle ===
                                            5 &&
                                          (newShares -
                                            10) %
                                            5 !==
                                            0
                                        ) {
                                          toast.error(
                                            "This property allows 10 shares minimum, then 5-share increments"
                                          );
                                          return;
                                        }

                                        setEditedInvestment(
                                          (
                                            prev
                                          ) => ({
                                            ...prev,
                                            [investment._id]:
                                              {
                                                ...prev[
                                                  investment
                                                    ._id
                                                ],
                                                shares:
                                                  newShares,
                                              },
                                          })
                                        );
                                      }}
                                    />

                                    <p className="text-[10px] text-slate-400 mt-1.5">
                                      Purchase cycle:{" "}
                                      {shareCycle}{" "}
                                      shares
                                    </p>

                                  </div>


                                  <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">

                                    <div>
                                      <p className="text-[10px] uppercase font-bold text-emerald-600">
                                        Final Approved Amount
                                      </p>

                                      <p className="text-lg font-extrabold text-emerald-800 mt-0.5">
                                        {formatCurrency(
                                          approvedAmount
                                        )}
                                      </p>
                                    </div>

                                    <CircleDollarSign className="w-6 h-6 text-emerald-500" />

                                  </div>

                                </div>


                                {/* PAYMENT ACTION */}

                                {investment.paymentStatus ===
                                  "payment_submitted" && (

                                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

                                      <div>
                                        <p className="text-xs font-extrabold text-amber-950">
                                          Payment verification required
                                        </p>

                                        <p className="text-[11px] text-amber-800/70 mt-1">
                                          Review the payment proof before verifying this payment.
                                        </p>
                                      </div>

                                      <div className="flex gap-2">

                                        <Button
                                          size="sm"
                                          disabled={
                                            !!actionLoading
                                          }
                                          onClick={() =>
                                            handleVerifyPayment(
                                              investment
                                            )
                                          }
                                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                        >
                                          <Check className="w-3.5 h-3.5 mr-1.5" />

                                          {actionLoading ===
                                          `verify-${investment._id}`
                                            ? "Verifying..."
                                            : "Verify Payment"}
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          disabled={
                                            !!actionLoading
                                          }
                                          onClick={() =>
                                            handleRejectPayment(
                                              investment
                                            )
                                          }
                                          className="rounded-xl font-bold"
                                        >
                                          <X className="w-3.5 h-3.5 mr-1.5" />

                                          {actionLoading ===
                                          `reject-payment-${investment._id}`
                                            ? "Rejecting..."
                                            : "Reject"}
                                        </Button>

                                      </div>

                                    </div>

                                  </div>

                                )}


                                {/* INVESTMENT ACTION */}

                                {investment.paymentStatus ===
                                  "verified" &&
                                  investment.status !==
                                    "approved" && (

                                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

                                      <div>
                                        <p className="text-xs font-extrabold text-emerald-950">
                                          Payment verified — investment approval required
                                        </p>

                                        <p className="text-[11px] text-emerald-800/70 mt-1">
                                          Confirm the final share allocation to approve this investment.
                                        </p>
                                      </div>

                                      <div className="flex gap-2">

                                        <Button
                                          size="sm"
                                          disabled={
                                            !!actionLoading
                                          }
                                          onClick={() =>
                                            handleApproveInvestment(
                                              investment
                                            )
                                          }
                                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        >
                                          <Check className="w-3.5 h-3.5 mr-1.5" />

                                          {actionLoading ===
                                          `approve-${investment._id}`
                                            ? "Approving..."
                                            : "Approve Investment"}
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          disabled={
                                            !!actionLoading
                                          }
                                          onClick={() =>
                                            handleRejectInvestment(
                                              investment
                                            )
                                          }
                                          className="rounded-xl font-bold"
                                        >
                                          <X className="w-3.5 h-3.5 mr-1.5" />

                                          {actionLoading ===
                                          `reject-investment-${investment._id}`
                                            ? "Rejecting..."
                                            : "Reject"}
                                        </Button>

                                      </div>

                                    </div>

                                  </div>

                                )}

                              </div>

                            )}

                          </div>
                        );
                      }
                    )}

                  </div>


                  {/* PAGINATION */}

                  {totalInvestmentPages >
                    1 && (

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                        <p className="text-xs font-medium text-slate-500">
                          Showing{" "}
                          <span className="font-bold text-slate-900">
                            {(
                              (investmentPage -
                                1) *
                                INVESTMENTS_PER_PAGE +
                              1
                            )}
                          </span>
                          {" "}–{" "}
                          <span className="font-bold text-slate-900">
                            {Math.min(
                              investmentPage *
                                INVESTMENTS_PER_PAGE,
                              investments.length
                            )}
                          </span>
                          {" "}of{" "}
                          <span className="font-bold text-slate-900">
                            {investments.length}
                          </span>
                        </p>


                        <div className="flex items-center gap-1.5">

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              investmentPage ===
                              1
                            }
                            onClick={() =>
                              setInvestmentPage(
                                (prev) =>
                                  prev - 1
                              )
                            }
                            className="h-9 rounded-xl text-xs"
                          >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            Previous
                          </Button>


                          {[
                            ...Array(
                              totalInvestmentPages
                            ),
                          ].map(
                            (_, index) => {

                              const number =
                                index + 1;

                              return (
                                <button
                                  key={
                                    number
                                  }
                                  type="button"
                                  onClick={() =>
                                    setInvestmentPage(
                                      number
                                    )
                                  }
                                  className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                                    investmentPage ===
                                    number
                                      ? "bg-slate-950 text-white"
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {number}
                                </button>
                              );
                            }
                          )}


                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              investmentPage ===
                              totalInvestmentPages
                            }
                            onClick={() =>
                              setInvestmentPage(
                                (prev) =>
                                  prev + 1
                              )
                            }
                            className="h-9 rounded-xl text-xs"
                          >
                            Next
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>

                        </div>

                      </div>

                    </div>

                  )}

                </>

              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


// =====================================================
// ROI ICON
// =====================================================

function TrendingUpIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}