import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import React from "react";
import { useNavigate } from "react-router-dom";

import {
  getInvestors,
  getInvestorDetails,
  updateKyc,
  exportInvestors,
} from "../../api/user";

import { toast } from "sonner";

import {
  approveInvestment,
  rejectInvestment,
  verifyPayment,
  rejectPayment,
} from "../../api/investment";

import {
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  UserCheck,
  Building2,
  TrendingUp,
  Clock,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Landmark,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MapPin,
  WalletCards,
} from "lucide-react";

export function Investors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kycFilter, setKycFilter] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [editedInvestment, setEditedInvestment] = useState({});
  const [investmentPage, setInvestmentPage] = useState(1);
  

  // Expanded investment details
  const [expandedInvestment, setExpandedInvestment] = useState(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState(null);

  const INVESTMENTS_PER_PAGE = 3;
  const navigate = useNavigate();

  // =====================================================
  // FETCH INVESTORS
  // =====================================================

  useEffect(() => {
    fetchInvestors();
  }, [page]);

  const fetchInvestors = async () => {
    try {
      setLoading(true);

      const res = await getInvestors(page);

      setInvestors(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load investors");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER INVESTORS
  // =====================================================

  const filteredInvestors = investors.filter((investor) => {
    const name = investor.name?.toLowerCase() || "";
    const email = investor.email?.toLowerCase() || "";

    const search = searchQuery.toLowerCase();

    const matchSearch =
      name.includes(search) ||
      email.includes(search);

    const matchKyc = kycFilter
      ? investor.kycStatus === kycFilter
      : true;

    return matchSearch && matchKyc;
  });

  // =====================================================
  // VIEW INVESTOR
  // =====================================================

  const handleView = async (id) => {
    try {
      const res = await getInvestorDetails(id);

      setSelectedInvestor(res.data);

      // New investor opens from investment page 1
      setInvestmentPage(1);

      // Clear previous edited shares
      setEditedInvestment({});

      // Close previously expanded investment
      setExpandedInvestment(null);
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch investor details");
    }
  };

  // =====================================================
  // REFRESH SELECTED INVESTOR
  // IMPORTANT:
  // Does NOT refresh main investors list.
  // Therefore main page remains unchanged.
  // Also keeps current investment page.
  // =====================================================

  const refreshSelectedInvestor = async () => {
    if (!selectedInvestor?.user?._id) return;

    try {
      const currentInvestmentPage = investmentPage;
      const currentExpandedInvestment = expandedInvestment;

      const res = await getInvestorDetails(
        selectedInvestor.user._id
      );

      setSelectedInvestor(res.data);

      // Keep the same investment pagination page
      setInvestmentPage(currentInvestmentPage);

      // Keep currently expanded investment open
      setExpandedInvestment(currentExpandedInvestment);
    } catch (err) {
      console.error(err);
      toast.error("Could not refresh investor details");
    }
  };

  // =====================================================
  // KYC ACTION
  // =====================================================

  const handleKyc = async (id, status) => {
    try {
      await updateKyc(id, status);

      toast.success(`KYC status updated to ${status}`);

      // Main investor list needs to reflect KYC change
      await fetchInvestors();

      if (selectedInvestor?.user?._id === id) {
        await refreshSelectedInvestor();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update KYC status");
    }
  };

  // =====================================================
  // EXPORT
  // =====================================================

  const handleExport = async () => {
    try {
      toast.info("Generating PDF report...");

      const res = await exportInvestors();

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "investors_report.pdf"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Export downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    }
  };

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  const handleVerifyPayment = async (inv) => {
    try {
      setActionLoading(`verify-${inv._id}`);

      await verifyPayment(inv._id);

      toast.success("Payment verified successfully");

      // IMPORTANT:
      // Do NOT call fetchInvestors().
      // Main page will remain exactly where it is.
      //
      // Refresh only side panel data.
      await refreshSelectedInvestor();
    } catch (err) {
      console.log(
        "VERIFY PAYMENT ERROR =",
        err
      );

      console.log(
        "RESPONSE =",
        err.response?.data
      );

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

  const handleRejectPayment = async (inv) => {
    try {
      setActionLoading(`reject-payment-${inv._id}`);

      await rejectPayment(inv._id);

      toast.success("Payment rejected");

      // Only refresh side panel.
      // Main pagination stays untouched.
      await refreshSelectedInvestor();
    } catch (err) {
      console.log(
        "REJECT PAYMENT ERROR =",
        err
      );

      console.log(
        "RESPONSE =",
        err.response?.data
      );

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

  const handleApproveInvestment = async (inv) => {
    try {
      const shares =
        editedInvestment[inv._id]?.shares ??
        inv.requestedShares ??
        inv.shares;

      if (!shares || Number(shares) < 10) {
        toast.error(
          "Minimum approved shares are 10"
        );
        return;
      }

      setActionLoading(`approve-${inv._id}`);

      await approveInvestment(inv._id, {
        shares: Number(shares),
      });

      toast.success("Investment Approved");

      // Only refresh side panel.
      // Main page remains unchanged.
      await refreshSelectedInvestor();
    } catch (err) {
      console.log("ERROR =", err);

      console.log(
        "Response =",
        err.response
      );

      console.log(
        "Data =",
        err.response?.data
      );

      toast.error(
        err.response?.data?.message ||
          "Approval Failed"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // REJECT INVESTMENT
  // =====================================================

  const handleRejectInvestment = async (id) => {
    try {
      setActionLoading(`reject-investment-${id}`);

      await rejectInvestment(id);

      toast.success("Investment Rejected");

      if (selectedInvestor?.user?._id) {
        // Only refresh side panel.
        await refreshSelectedInvestor();
      }
    } catch (err) {
      console.error(err);
      toast.error("Rejection Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const formatAddress = (address) => {
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
  };

  // =====================================================
  // PROPERTY IMAGE HELPER
  // =====================================================

  const getPropertyImage = (inv) => {
    const property = inv?.propertyId;

    const possibleImages = [
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

    // In case backend stores image as an object
    if (typeof image === "object") {
      return (
        image?.url ||
        image?.secure_url ||
        image?.path ||
        ""
      );
    }

    return image;
  };

  // =====================================================
  // METRICS
  // =====================================================

  const pendingKycCount = investors.filter(
    (i) => i.kycStatus === "pending"
  ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen text-slate-900 p-6 md:p-10 font-sans selection:bg-blue-50 selection:text-blue-700 relative">

      {/* TOP ACCENT */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-8">

          <div>

            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-1">
              <UserCheck className="w-4 h-4" />
              Investor Management
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
              Active Investors
            </h1>

            <p className="text-slate-600 text-base mt-1.5 max-w-2xl">
              Monitor investor portfolios, verify KYC documents, and approve pending investment allocations.
            </p>

          </div>

          <Button
            onClick={handleExport}
            className="self-start md:self-auto bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export PDF Report
          </Button>

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">

            <div className="flex items-center justify-between">

              <span className="text-slate-500 text-sm font-medium">
                Total Investors Onboarded
              </span>

              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <UserCheck className="w-5 h-5" />
              </div>

            </div>

            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {investors.length}
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Active portfolio holders
            </p>

          </div>


          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">

            <div className="flex items-center justify-between">

              <span className="text-slate-500 text-sm font-medium">
                Pending KYC Verifications
              </span>

              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>

            </div>

            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {pendingKycCount}
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Requires document review
            </p>

          </div>


          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">

            <div className="flex items-center justify-between">

              <span className="text-slate-500 text-sm font-medium">
                Platform Growth
              </span>

              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </div>

            </div>

            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              Active
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Verified asset allocations
            </p>

          </div>

        </div>


        {/* =================================================
            SEARCH & FILTER
        ================================================= */}

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

          <div className="relative flex-1 w-full">

            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <Input
              type="search"
              placeholder="Search by investor name or email..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 focus:bg-white text-sm"
            />

          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">

            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2 bg-white shadow-sm w-full md:w-auto">

              <Filter className="h-4 w-4 text-slate-400" />

              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                KYC:
              </span>

              <select
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-slate-800"
                value={kycFilter}
                onChange={(e) =>
                  setKycFilter(e.target.value)
                }
              >
                <option value="">
                  All Statuses
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

            </div>

          </div>

        </div>


        {/* =================================================
            INVESTORS TABLE
        ================================================= */}

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs uppercase tracking-wider font-semibold">

                  <th className="py-5 px-6">
                    Investor
                  </th>

                  <th className="py-5 px-6">
                    Total Invested
                  </th>

                  <th className="py-5 px-6">
                    Properties
                  </th>

                  <th className="py-5 px-6">
                    Avg. ROI
                  </th>

                  <th className="py-5 px-6">
                    KYC Status
                  </th>

                  <th className="py-5 px-6">
                    Joined
                  </th>

                  <th className="py-5 px-6 text-right">
                    Details
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100 text-sm">

                {loading ? (

                  [...Array(5)].map((_, idx) => (

                    <tr
                      key={idx}
                      className="animate-pulse"
                    >

                      <td className="p-6">
                        <div className="h-5 bg-slate-100 rounded-lg w-32" />
                      </td>

                      <td className="p-6">
                        <div className="h-5 bg-slate-100 rounded-lg w-40" />
                      </td>

                      <td className="p-6">
                        <div className="h-5 bg-slate-100 rounded-lg w-24" />
                      </td>

                      <td className="p-6">
                        <div className="h-5 bg-slate-100 rounded-lg w-12" />
                      </td>

                      <td className="p-6">
                        <div className="h-6 bg-slate-100 rounded-full w-20" />
                      </td>

                      <td className="p-6">
                        <div className="h-5 bg-slate-100 rounded-lg w-24" />
                      </td>

                      <td className="p-6">
                        <div className="h-8 bg-slate-100 rounded-lg w-8 ml-auto" />
                      </td>

                    </tr>

                  ))

                ) : filteredInvestors.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="text-center py-20 text-slate-500"
                    >

                      <div className="flex flex-col items-center justify-center gap-2">

                        <UserCheck className="w-10 h-10 text-slate-300 stroke-[1]" />

                        <p className="text-lg font-semibold text-slate-800">
                          No investors matching criteria
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredInvestors.map((investor) => (

                    <tr
                      key={investor._id}
                      className="hover:bg-slate-50/60 transition-colors duration-150 group"
                    >

                      <td className="py-5 px-6 font-semibold text-slate-950">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">

                            {investor.name
                              ? investor.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "I"}

                          </div>

                          <span>
                            {investor.name}
                          </span>

                        </div>

                      </td>


                      <td className="py-5 px-6 font-bold text-slate-950 font-mono">

                        {typeof investor.totalInvested ===
                        "number"
                          ? `₹${investor.totalInvested.toLocaleString(
                              "en-IN"
                            )}`
                          : investor.totalInvested ||
                            "₹0"}

                      </td>


                      <td className="py-5 px-6 text-slate-700">

                        <div className="flex items-center gap-1.5 font-medium">

                          <Building2 className="w-4 h-4 text-slate-400" />

                          {investor.properties || 0}

                        </div>

                      </td>


                      <td className="py-5 px-6 font-semibold text-emerald-600 font-mono">

                        {investor.avgROI || "0%"}

                      </td>


                      <td className="py-5 px-6">

                        <KycStatusBadge
                          status={investor.kycStatus}
                        />

                      </td>


                      <td className="py-5 px-6 text-slate-500 text-xs font-medium">

                        {investor.joinDate
                          ? new Date(
                              investor.joinDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "N/A"}

                      </td>


                      <td className="py-5 px-6 text-right">

                      <Button
  variant="ghost"
  size="sm"
  onClick={() =>
    navigate(`/investors/${investor._id}`)
  }
  className="hover:bg-slate-100 text-slate-600 rounded-xl"
>
  <Eye className="h-4 w-4" />
</Button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            MAIN PAGINATION
        ================================================= */}

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">

          <p className="text-xs font-medium text-slate-500">

            Showing Page{" "}

            <span className="font-bold text-slate-900">
              {page}
            </span>{" "}

            of{" "}

            <span className="font-bold text-slate-900">
              {totalPages}
            </span>

          </p>


          <div className="flex items-center gap-2">

            <button
              disabled={page === 1}
              onClick={() =>
                setPage(page - 1)
              }
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1 shadow-sm"
            >

              <ChevronLeft className="w-4 h-4" />

              Previous

            </button>


            <div className="flex gap-1.5">

              {[...Array(totalPages)].map(
                (_, i) => {

                  const p = i + 1;

                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 1 &&
                      p <= page + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        onClick={() =>
                          setPage(p)
                        }
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          page === p
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }

                  if (
                    p === page - 2 ||
                    p === page + 2
                  ) {
                    return (
                      <span
                        key={p}
                        className="text-xs text-slate-400 self-center"
                      >
                        ...
                      </span>
                    );
                  }

                  return null;
                }
              )}

            </div>


            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage(page + 1)
              }
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1 shadow-sm"
            >

              Next

              <ChevronRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          INVESTOR SIDE PANEL
      ===================================================== */}

      <Sheet
        open={!!selectedInvestor}
        onOpenChange={() =>
          setSelectedInvestor(null)
        }
      >

        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto bg-slate-50 border-l border-slate-200 text-slate-900">

          {selectedInvestor && (

            <div className="space-y-4 pb-8">

              {/* =================================================
                  PROFILE HEADER
              ================================================= */}

              <div className="bg-white px-5 pt-5 pb-4 border-b border-slate-200">

                <SheetHeader className="pb-4 border-b border-slate-100">

                  <SheetTitle className="text-xl font-bold text-slate-950">
                    Investor Profile
                  </SheetTitle>

                </SheetHeader>


                <div className="flex items-start gap-4 mt-4">

                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">

                    {selectedInvestor.user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}

                  </div>


                  <div className="min-w-0 flex-1">

                    <h3 className="font-bold text-lg text-slate-950">
                      {selectedInvestor.user.name}
                    </h3>

                    {/* EMAIL */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">

                      <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />

                      <span className="truncate">
                        {selectedInvestor.user.email ||
                          "Email not available"}
                      </span>

                    </div>

                    {/* PHONE */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5">

                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                      <span>
                        {selectedInvestor.user.phone ||
                          "Phone not available"}
                      </span>

                    </div>

                  </div>


                  <div className="shrink-0">

                    <KycStatusBadge
                      status={
                        selectedInvestor.user
                          .kycStatus
                      }
                    />

                  </div>

                </div>

              </div>


              {/* =================================================
                  PROFILE STATS
              ================================================= */}

              <section className="bg-white border-y border-slate-200 px-5 py-4">

                <div className="flex items-center gap-2 mb-3">

                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <WalletCards className="w-4 h-4" />
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">
                    Portfolio Overview
                  </h4>

                </div>


                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">

                    <p className="text-[10px] text-slate-400 font-medium">
                      Total Invested
                    </p>

                    <p className="text-base font-bold text-slate-950 mt-1">
                      {selectedInvestor.user
                        .totalInvested || "₹0"}
                    </p>

                  </div>


                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">

                    <p className="text-[10px] text-slate-400 font-medium">
                      Properties
                    </p>

                    <p className="text-base font-bold text-slate-950 mt-1">
                      {selectedInvestor.user
                        .properties || 0}
                    </p>

                  </div>


                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">

                    <p className="text-[10px] text-slate-400 font-medium">
                      Avg. ROI
                    </p>

                    <p className="text-base font-bold text-emerald-600 mt-1">
                      {selectedInvestor.user
                        .avgROI || "0%"}
                    </p>

                  </div>


                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">

                    <p className="text-[10px] text-slate-400 font-medium">
                      KYC
                    </p>

                    <div className="mt-1">

                      <KycStatusBadge
                        status={
                          selectedInvestor.user
                            .kycStatus
                        }
                      />

                    </div>

                  </div>

                </div>

              </section>


              {/* =================================================
                  KYC SECTION
              ================================================= */}

              {selectedInvestor.kyc && (

                <section className="bg-white border-y border-slate-200 px-5 py-4">

                  <div className="flex items-center justify-between mb-4">

                    <div>

                      <h4 className="font-bold text-slate-900 text-sm">
                        KYC & Identity
                      </h4>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Personal details and verification documents
                      </p>

                    </div>

                    <ShieldCheck className="w-5 h-5 text-slate-300" />

                  </div>


                  {/* PERSONAL DETAILS */}

                  <div className="grid grid-cols-2 gap-2 mb-2">

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">

                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                        Legal Name
                      </p>

                      <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                        {selectedInvestor.kyc
                          .fullName || "N/A"}
                      </p>

                    </div>


                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">

                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                        DOB
                      </p>

                      <p className="text-sm font-semibold text-slate-800 mt-1">

                        {selectedInvestor.kyc
                          .dob
                          ? new Date(
                              selectedInvestor.kyc.dob
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "N/A"}

                      </p>

                    </div>

                  </div>


                  {/* ADDRESS */}

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">

  <div className="flex items-center gap-1.5">

    <MapPin className="w-3.5 h-3.5 text-slate-400" />

    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
      Address
    </p>

  </div>

  <p className="text-sm text-slate-700 mt-1 line-clamp-3">
    {formatAddress(selectedInvestor.kyc.address)}
  </p>

</div>


                  {/* DOCUMENTS */}

                  <div>

                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Verification Documents
                    </p>

                    <div className="space-y-2">

                      <DocumentRow
                        icon={
                          <CreditCard className="w-4 h-4" />
                        }
                        iconClass="bg-blue-50 text-blue-600"
                        title="PAN Card"
                        subtitle="Identity document"
                        file={
                          selectedInvestor.kyc
                            .panFile
                        }
                      />


                      <DocumentRow
                        icon={
                          <FileText className="w-4 h-4" />
                        }
                        iconClass="bg-indigo-50 text-indigo-600"
                        title="Aadhaar Card"
                        subtitle="Identity document"
                        file={
                          selectedInvestor.kyc
                            .aadhaarFile
                        }
                      />


                      <DocumentRow
                        icon={
                          <Landmark className="w-4 h-4" />
                        }
                        iconClass="bg-emerald-50 text-emerald-600"
                        title="Bank Details"
                        subtitle={
                          selectedInvestor.kyc.bank
                            ?.accountNumber
                            ? `A/C •••• ${String(
                                selectedInvestor.kyc.bank.accountNumber
                              ).slice(-4)}`
                            : "Not available"
                        }
                        file={
                          selectedInvestor.kyc.bank
                            ?.cancelCheque
                        }
                      />

                    </div>

                  </div>

                </section>

              )}


              {/* =================================================
                  KYC ACTIONS
              ================================================= */}

              {selectedInvestor.user
                .kycStatus === "pending" && (

                <section className="bg-white border-y border-slate-200 px-5 py-4">

                  <div className="flex items-center gap-2 mb-3">

                    <ShieldAlert className="w-4 h-4 text-amber-500" />

                    <p className="text-xs font-bold text-slate-800">
                      KYC Action Required
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-10 shadow-sm"
                      onClick={() =>
                        handleKyc(
                          selectedInvestor.user
                            ._id,
                          "approved"
                        )
                      }
                    >

                      <Check className="h-4 w-4 mr-1.5" />

                      Approve KYC

                    </Button>


                    <Button
                      variant="destructive"
                      className="flex-1 font-semibold rounded-xl h-10 shadow-sm"
                      onClick={() =>
                        handleKyc(
                          selectedInvestor.user
                            ._id,
                          "rejected"
                        )
                      }
                    >

                      <X className="h-4 w-4 mr-1.5" />

                      Reject KYC

                    </Button>

                  </div>

                </section>

              )}


              {/* =================================================
                  INVESTMENTS
              ================================================= */}

              {(() => {

                const investments = [
                  ...(selectedInvestor.investments ||
                    []),
                ].sort(
                  (a, b) =>
                    new Date(
                      b.createdAt || 0
                    ) -
                    new Date(
                      a.createdAt || 0
                    )
                );


                const totalInvestmentPages =
                  Math.ceil(
                    investments.length /
                      INVESTMENTS_PER_PAGE
                  );


                const startIndex =
                  (investmentPage - 1) *
                  INVESTMENTS_PER_PAGE;


                const paginatedInvestments =
                  investments.slice(
                    startIndex,
                    startIndex +
                      INVESTMENTS_PER_PAGE
                  );


                return (

                  <section className="bg-white border-y border-slate-200 px-5 py-4">

                    {/* HEADER */}

                    <div className="flex items-center justify-between mb-4">

                      <div>

                        <div className="flex items-center gap-2">

                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <Building2 className="w-4 h-4" />
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm">
                            Investments
                          </h4>

                          <span className="text-slate-400 font-medium text-xs">
                            ({investments.length})
                          </span>

                        </div>

                        <p className="text-[11px] text-slate-400 mt-1">
                          Latest investments are shown first
                        </p>

                      </div>


                      {totalInvestmentPages >
                        1 && (

                        <span className="text-[11px] text-slate-400 font-medium">

                          Page {investmentPage} of{" "}
                          {totalInvestmentPages}

                        </span>

                      )}

                    </div>


                    {/* INVESTMENT LIST */}

                    <div className="space-y-3">

                      {investments.length ===
                      0 ? (

                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">

                          <Building2 className="w-7 h-7 text-slate-300 mx-auto mb-2" />

                          <p className="text-xs text-slate-400 italic">
                            No investment records found.
                          </p>

                        </div>

                      ) : (

                        paginatedInvestments.map(
                          (inv) => {

                            const isExpanded =
                              expandedInvestment ===
                              inv._id;


                            const shares =
                              editedInvestment[
                                inv._id
                              ]?.shares ??
                              inv.requestedShares ??
                              inv.shares ??
                              0;


                            const pricePerShare =
                              inv.propertyId
                                ?.pricePerShare ||
                              inv.pricePerShare ||
                              0;


                            const amount =
                              inv.requestedAmount ||
                              inv.amount ||
                              0;


                            const approvedAmount =
                              Number(shares) *
                              Number(
                                pricePerShare
                              );


                            const propertyImage =
                              getPropertyImage(inv);


                            return (

                              <div
                                key={inv._id}
                                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                              >

                                {/* =================================================
                                    PROPERTY IMAGE + SUMMARY
                                ================================================= */}

                                <div className="p-3.5">

                                  <div className="flex items-start gap-3">

                                    {/* PROPERTY IMAGE */}

                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">

                                      {propertyImage ? (

                                        <img
                                          src={
                                            propertyImage
                                          }
                                          alt={
                                            inv
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
                                                ".property-image-fallback"
                                              )
                                              ?.classList.remove(
                                                "hidden"
                                              );
                                          }}
                                        />

                                      ) : null}


                                      <div
                                        className={`property-image-fallback w-full h-full ${
                                          propertyImage
                                            ? "hidden"
                                            : ""
                                        } flex items-center justify-center bg-slate-100 text-slate-400`}
                                      >

                                        <Building2 className="w-7 h-7" />

                                      </div>

                                    </div>


                                    {/* PROPERTY INFO */}

                                    <div className="min-w-0 flex-1">

                                      <div className="flex items-start justify-between gap-2">

                                        <div className="min-w-0">

                                          <p className="font-bold text-sm text-slate-900 truncate">

                                            {inv
                                              .propertyId
                                              ?.name ||
                                              "Property Allocation"}

                                          </p>


                                          {inv.propertyId?.location && (
  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">

    <MapPin className="w-3 h-3 shrink-0" />

    {formatAddress(inv.propertyId.location)}

  </p>
)}


                                          <p className="text-[11px] text-slate-400 mt-1">

                                            {inv.createdAt
                                              ? new Date(
                                                  inv.createdAt
                                                ).toLocaleDateString(
                                                  "en-IN"
                                                )
                                              : "N/A"}

                                          </p>

                                        </div>


                                        <KycStatusBadge
                                          status={
                                            inv.status
                                          }
                                        />

                                      </div>

                                    </div>

                                  </div>


                                  {/* SUMMARY */}

                                  <div className="grid grid-cols-3 gap-2 mt-3">

                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">

                                      <p className="text-[10px] text-slate-400 uppercase font-medium">
                                        Shares
                                      </p>

                                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                                        {shares}
                                      </p>

                                    </div>


                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">

                                      <p className="text-[10px] text-slate-400 uppercase font-medium">
                                        Amount
                                      </p>

                                      <p className="text-sm font-bold text-slate-900 mt-0.5">

                                        ₹
                                        {Number(
                                          amount
                                        ).toLocaleString(
                                          "en-IN"
                                        )}

                                      </p>

                                    </div>


                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 min-w-0">

                                      <p className="text-[10px] text-slate-400 uppercase font-medium">
                                        Payment
                                      </p>

                                      <div className="mt-1 overflow-hidden">

                                        <PaymentStatusBadge
                                          status={
                                            inv.paymentStatus
                                          }
                                        />

                                      </div>

                                    </div>

                                  </div>


                                  {/* EXPAND BUTTON */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedInvestment(
                                        isExpanded
                                          ? null
                                          : inv._id
                                      )
                                    }
                                    className="w-full mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                  >

                                    <span>
                                      {isExpanded
                                        ? "Hide Details"
                                        : "View Investment Details"}
                                    </span>


                                    <ChevronRight
                                      className={`w-4 h-4 transition-transform ${
                                        isExpanded
                                          ? "rotate-90"
                                          : ""
                                      }`}
                                    />

                                  </button>

                                </div>


                                {/* =================================================
                                    EXPANDED DETAILS
                                ================================================= */}

                                {isExpanded && (

                                  <div className="border-t border-slate-200 bg-slate-50 p-3.5 space-y-3">

                                    {/* PAYMENT DETAILS */}

                                    <div className="rounded-xl bg-white border border-slate-200 p-3.5">

                                      <div className="flex items-center gap-2 mb-3">

                                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                          <CreditCard className="w-4 h-4" />
                                        </div>

                                        <p className="text-xs font-bold text-slate-800">
                                          Payment Details
                                        </p>

                                      </div>


                                      <div className="grid grid-cols-2 gap-3 text-xs">

                                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">

                                          <p className="text-slate-400">
                                            Payment Method
                                          </p>

                                          <p className="font-semibold text-slate-800 mt-0.5">
                                            {inv.paymentMethod ||
                                              "N/A"}
                                          </p>

                                        </div>


                                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">

                                          <p className="text-slate-400">
                                            Reference / UTR
                                          </p>

                                          <p className="font-semibold text-slate-800 mt-0.5 break-all">
                                            {inv.paymentReference ||
                                              "N/A"}
                                          </p>

                                        </div>

                                      </div>


                                      {/* PAYMENT PROOF */}

                                      {inv.paymentProof && (

                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full mt-3 h-9 text-xs rounded-lg"
                                          onClick={() =>
                                            window.open(
                                              inv.paymentProof,
                                              "_blank"
                                            )
                                          }
                                        >

                                          <Eye className="w-3.5 h-3.5 mr-1" />

                                          View Payment Proof

                                        </Button>

                                      )}

                                    </div>


                                    {/* APPROVED SHARES */}

                                    <div className="rounded-xl bg-white border border-slate-200 p-3.5">

                                      <div className="flex items-center gap-2 mb-2">

                                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                                          <Building2 className="w-4 h-4" />
                                        </div>

                                        <p className="text-xs font-bold text-slate-800">
                                          Approved Shares
                                        </p>

                                      </div>


                                      {(() => {

                                        const shareCycle =
                                          Number(
                                            inv
                                              .propertyId
                                              ?.shareBuyingCycle ||
                                            inv.shareBuyingCycle ||
                                            10
                                          );


                                        return (

                                          <>

                                            <Input
                                              type="number"
                                              min={10}
                                              step={
                                                shareCycle
                                              }
                                              className="mt-1 h-9 text-sm"
                                              value={
                                                shares
                                              }
                                              onChange={(
                                                e
                                              ) => {

                                                const value =
                                                  e
                                                    .target
                                                    .value;


                                                if (
                                                  value ===
                                                  ""
                                                ) {

                                                  setEditedInvestment(
                                                    (
                                                      prev
                                                    ) => ({
                                                      ...prev,
                                                      [inv._id]:
                                                        {
                                                          ...prev[
                                                            inv
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
                                                    [inv._id]:
                                                      {
                                                        ...prev[
                                                          inv
                                                            ._id
                                                        ],
                                                        shares:
                                                          newShares,
                                                      },
                                                  })
                                                );

                                              }}
                                            />


                                            <p className="text-[10px] text-slate-400 mt-1">
                                              Purchase cycle:{" "}
                                              {
                                                shareCycle
                                              }{" "}
                                              shares
                                            </p>

                                          </>

                                        );

                                      })()}

                                    </div>


                                    {/* APPROVED AMOUNT */}

                                    <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-emerald-50 border border-emerald-200">

                                      <div>

                                        <p className="text-[10px] uppercase font-semibold text-emerald-600">
                                          Approved Amount
                                        </p>

                                        <p className="text-lg font-bold text-emerald-800">
                                          ₹
                                          {approvedAmount.toLocaleString(
                                            "en-IN"
                                          )}
                                        </p>

                                      </div>

                                    </div>


                                    {/* PAYMENT ACTIONS */}

                                    {inv.paymentStatus ===
                                      "payment_submitted" && (

                                      <div className="rounded-xl bg-white border border-amber-200 p-3">

                                        <p className="text-[11px] font-bold text-amber-800 mb-2">
                                          Payment Verification Required
                                        </p>

                                        <div className="flex gap-2">

                                          <Button
                                            size="sm"
                                            disabled={
                                              actionLoading ===
                                              `verify-${inv._id}`
                                            }
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                                            onClick={() =>
                                              handleVerifyPayment(
                                                inv
                                              )
                                            }
                                          >

                                            <Check className="w-3.5 h-3.5 mr-1" />

                                            {actionLoading ===
                                            `verify-${inv._id}`
                                              ? "Verifying..."
                                              : "Verify Payment"}

                                          </Button>


                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={
                                              actionLoading ===
                                              `reject-payment-${inv._id}`
                                            }
                                            className="flex-1 text-xs rounded-lg"
                                            onClick={() =>
                                              handleRejectPayment(
                                                inv
                                              )
                                            }
                                          >

                                            <X className="w-3.5 h-3.5 mr-1" />

                                            {actionLoading ===
                                            `reject-payment-${inv._id}`
                                              ? "Rejecting..."
                                              : "Reject"}

                                          </Button>

                                        </div>

                                      </div>

                                    )}


                                    {/* INVESTMENT ACTIONS */}

                                    {inv.paymentStatus ===
                                      "verified" &&
                                      inv.status !==
                                        "approved" && (

                                        <div className="rounded-xl bg-white border border-emerald-200 p-3">

                                          <p className="text-[11px] font-bold text-emerald-800 mb-2">
                                            Payment Verified — Investment Approval Required
                                          </p>

                                          <div className="flex gap-2">

                                            <Button
                                              size="sm"
                                              disabled={
                                                actionLoading ===
                                                `approve-${inv._id}`
                                              }
                                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg"
                                              onClick={() =>
                                                handleApproveInvestment(
                                                  inv
                                                )
                                              }
                                            >

                                              <Check className="w-3.5 h-3.5 mr-1" />

                                              {actionLoading ===
                                              `approve-${inv._id}`
                                                ? "Approving..."
                                                : "Approve"}

                                            </Button>


                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              disabled={
                                                actionLoading ===
                                                `reject-investment-${inv._id}`
                                              }
                                              className="flex-1 text-xs rounded-lg"
                                              onClick={() =>
                                                handleRejectInvestment(
                                                  inv._id
                                                )
                                              }
                                            >

                                              <X className="w-3.5 h-3.5 mr-1" />

                                              {actionLoading ===
                                              `reject-investment-${inv._id}`
                                                ? "Rejecting..."
                                                : "Reject"}

                                            </Button>

                                          </div>

                                        </div>

                                      )}

                                  </div>

                                )}

                              </div>

                            );
                          }
                        )

                      )}

                    </div>


                    {/* =================================================
                        INVESTMENT PAGINATION
                    ================================================= */}

                    {totalInvestmentPages >
                      1 && (

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">

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
                          className="text-xs rounded-lg h-8"
                        >

                          <ChevronLeft className="w-3.5 h-3.5 mr-1" />

                          Previous

                        </Button>


                        <div className="flex items-center gap-1.5">

                          {[
                            ...Array(
                              totalInvestmentPages
                            ),
                          ].map(
                            (_, index) => {

                              const pageNumber =
                                index + 1;

                              return (

                                <button
                                  type="button"
                                  key={
                                    pageNumber
                                  }
                                  onClick={() =>
                                    setInvestmentPage(
                                      pageNumber
                                    )
                                  }
                                  className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                                    investmentPage ===
                                    pageNumber
                                      ? "bg-slate-900 text-white"
                                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  {
                                    pageNumber
                                  }
                                </button>

                              );

                            }
                          )}

                        </div>


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
                          className="text-xs rounded-lg h-8"
                        >

                          Next

                          <ChevronRight className="w-3.5 h-3.5 ml-1" />

                        </Button>

                      </div>

                    )}

                  </section>

                );

              })()}

            </div>

          )}

        </SheetContent>

      </Sheet>

    </div>
  );
}


// =====================================================
// DOCUMENT ROW
// =====================================================

function DocumentRow({
  icon,
  iconClass,
  title,
  subtitle,
  file,
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">

      <div className="flex items-center gap-2 min-w-0">

        <div
          className={`p-2 rounded-lg shrink-0 ${iconClass}`}
        >
          {icon}
        </div>


        <div className="min-w-0">

          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="text-[11px] text-slate-400 truncate">
            {subtitle}
          </p>

        </div>

      </div>


      {file ? (

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs rounded-lg shrink-0"
          onClick={() =>
            window.open(
              file,
              "_blank"
            )
          }
        >

          <Eye className="w-3.5 h-3.5 mr-1" />

          View

        </Button>

      ) : (

        <span className="text-[11px] text-slate-400 shrink-0">
          Not uploaded
        </span>

      )}

    </div>
  );
}


// =====================================================
// KYC STATUS BADGE
// =====================================================

function KycStatusBadge({ status }) {

  const normalized =
    status?.toLowerCase() || "pending";

  const baseClass =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap";


  if (
    normalized === "approved" ||
    normalized === "verified"
  ) {

    return (
      <span
        className={`${baseClass} bg-emerald-50 text-emerald-800 border-emerald-100`}
      >

        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />

        Approved

      </span>
    );

  }


  if (normalized === "rejected") {

    return (
      <span
        className={`${baseClass} bg-rose-50 text-rose-800 border-rose-100`}
      >

        <ShieldX className="w-3.5 h-3.5 text-rose-600" />

        Rejected

      </span>
    );

  }


  return (
    <span
      className={`${baseClass} bg-amber-50 text-amber-900 border-amber-100`}
    >

      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />

      Pending

    </span>
  );
}


// =====================================================
// PAYMENT STATUS BADGE
// =====================================================

function PaymentStatusBadge({ status }) {

  const normalized =
    status?.toLowerCase() || "not_paid";

  const baseClass =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap";


  if (normalized === "verified") {

    return (
      <span
        className={`${baseClass} bg-emerald-50 text-emerald-800 border-emerald-100`}
      >

        <ShieldCheck className="w-3 h-3 text-emerald-600" />

        Verified

      </span>
    );

  }


  if (
    normalized === "payment_submitted"
  ) {

    return (
      <span
        className={`${baseClass} bg-amber-50 text-amber-900 border-amber-100`}
      >

        <Clock className="w-3 h-3 text-amber-600" />

        Submitted

      </span>
    );

  }


  if (normalized === "rejected") {

    return (
      <span
        className={`${baseClass} bg-rose-50 text-rose-800 border-rose-100`}
      >

        <ShieldX className="w-3 h-3 text-rose-600" />

        Rejected

      </span>
    );

  }


  return (
    <span
      className={`${baseClass} bg-slate-50 text-slate-700 border-slate-200`}
    >

      <Clock className="w-3 h-3 text-slate-500" />

      Not Paid

    </span>
  );
}