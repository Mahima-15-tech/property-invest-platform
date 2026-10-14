import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import axios from "../../api/axios";

export default function OwnershipRequests() {

 
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =====================================================

  // PAGINATION

  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // =====================================================

  // FETCH ALL OWNERSHIP REQUESTS

  // =====================================================

  const fetchRequests = async () => {

    try {

      setLoading(true);

      const res = await axios.get("/ownership/admin/requests");

      console.log("OWNERSHIP REQUEST API RESPONSE:", res.data);

      const ownershipRequests =

        res.data?.requests ||

        res.data?.data ||

        (Array.isArray(res.data) ? res.data : []);

      setRequests(ownershipRequests);

    } catch (error) {

      console.error("FETCH OWNERSHIP REQUESTS ERROR:", error);

      toast.error(

        error.response?.data?.message ||

          "Failed to fetch ownership requests"

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchRequests();

  }, []);

  // =====================================================

  // FILTERED + PAGINATED REQUESTS
  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const investor = request.userId || {};
      const property = request.propertyId || {};
      const matchesSearch = !query || [
        property.name,
        investor.name,
        investor.email,
        request.paymentReference,
        request.status,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && request.status === "pending") ||
        (statusFilter === "payment" &&
          ["payment_pending", "payment_submitted", "payment_verified"].includes(request.status)) ||
        (statusFilter === "completed" && request.status === "approved") ||
        (statusFilter === "rejected" && request.status === "rejected");

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // APPROVE REQUEST

  // =====================================================

  const approveRequest = async (id) => {

    const confirmApproval = window.confirm(

      "Are you sure you want to approve this ownership request? The investor will then be allowed to make the payment."

    );

    if (!confirmApproval) return;

    try {

      setActionLoading(id);

      const res = await axios.put(

        `/ownership/admin/${id}/approve-request`

      );

      toast.success(

        res.data?.message ||

          "Ownership request approved. Payment is now available."

      );

      await fetchRequests();

    } catch (error) {

      console.error(

        "APPROVE OWNERSHIP REQUEST ERROR:",

        error

      );

      toast.error(

        error.response?.data?.message ||

          "Failed to approve ownership request"

      );

    } finally {

      setActionLoading(null);

    }

  };

  // =====================================================

  // VERIFY PAYMENT

  // =====================================================

  const verifyPayment = async (id) => {

    try {

      setActionLoading(id);

      await axios.put(

        `/ownership/admin/${id}/verify-payment`

      );

      toast.success("Ownership payment verified");

      await fetchRequests();

    } catch (error) {

      console.error("VERIFY PAYMENT ERROR:", error);

      toast.error(

        error.response?.data?.message ||

          "Failed to verify payment"

      );

    } finally {

      setActionLoading(null);

    }

  };

  // =====================================================

  // REJECT PAYMENT

  // =====================================================

  const rejectPayment = async (id) => {

    try {

      setActionLoading(id);

      await axios.put(

        `/ownership/admin/${id}/reject-payment`

      );

      toast.success("Ownership payment rejected");

      await fetchRequests();

    } catch (error) {

      console.error("REJECT PAYMENT ERROR:", error);

      toast.error(

        error.response?.data?.message ||

          "Failed to reject payment"

      );

    } finally {

      setActionLoading(null);

    }

  };

  // =====================================================

  // APPROVE OWNERSHIP

  // =====================================================

  const approveOwnership = async (id) => {

    const confirmApproval = window.confirm(

      "Are you sure you want to approve 100% ownership transfer?"

    );

    if (!confirmApproval) return;

    try {

      setActionLoading(id);

      const res = await axios.put(

        `/ownership/admin/${id}/approve`

      );

      toast.success(

        res.data?.message ||

          "100% ownership transferred successfully"

      );

      await fetchRequests();

    } catch (error) {

      console.error(

        "APPROVE OWNERSHIP ERROR:",

        error

      );

      toast.error(

        error.response?.data?.message ||

          "Failed to approve ownership"

      );

    } finally {

      setActionLoading(null);

    }

  };

  // =====================================================

  // REJECT REQUEST

  // =====================================================

  const rejectRequest = async (id) => {

    try {

      setActionLoading(id);

      await axios.put(

        `/ownership/admin/${id}/reject`

      );

      toast.success("Ownership request rejected");

      await fetchRequests();

    } catch (error) {

      console.error("REJECT OWNERSHIP ERROR:", error);

      toast.error(

        error.response?.data?.message ||

          "Failed to reject ownership request"

      );

    } finally {

      setActionLoading(null);

    }

  };

  // =====================================================

  // STATUS LABEL

  // =====================================================

  const getStatusLabel = (request) => {

    switch (request.status) {

      case "pending":

        return "Request Pending";

      case "payment_pending":

        return "Awaiting Payment";

      case "payment_submitted":

        return "Payment Submitted";

      case "payment_verified":

        return "Payment Verified";

      case "approved":

        return "Ownership Completed";

      case "rejected":

        return "Rejected";

      default:

        return request.status || "Unknown";

    }

  };

  // =====================================================

  // STATUS STYLE

  // =====================================================

  const getStatusStyle = (request) => {

    const isApproved = request.status === "approved";

    const isRejected = request.status === "rejected";

    const isPaymentVerified =

      request.paymentStatus === "verified";

    const isPaymentSubmitted =

      request.paymentStatus === "payment_submitted";

    if (isApproved) {

      return {

        wrapper:

          "bg-emerald-50 text-emerald-700 border-emerald-200",

        dot: "bg-emerald-500",

      };

    }

    if (isRejected) {

      return {

        wrapper:

          "bg-rose-50 text-rose-700 border-rose-200",

        dot: "bg-rose-500",

      };

    }

    if (isPaymentVerified) {

      return {

        wrapper:

          "bg-blue-50 text-blue-700 border-blue-200",

        dot: "bg-blue-500",

      };

    }

    if (isPaymentSubmitted) {

      return {

        wrapper:

          "bg-amber-50 text-amber-700 border-amber-200",

        dot: "bg-amber-500",

      };

    }

    return {

      wrapper:

        "bg-slate-100 text-slate-700 border-slate-200",

      dot: "bg-slate-400",

    };

  };

  // =====================================================

  // LOADING
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">Loading ownership requests</p>
          <p className="mt-1 text-xs text-slate-500">Getting the latest investor and payment details</p>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter((item) => item.status === "pending").length;
  const paymentCount = requests.filter((item) =>
    ["payment_pending", "payment_submitted", "payment_verified"].includes(item.status)
  ).length;
  const completedCount = requests.filter((item) => item.status === "approved").length;
  const rejectedCount = requests.filter((item) => item.status === "rejected").length;

  const statCards = [
    { label: "Total Requests", value: requests.length, tone: "slate", icon: "▤" },
    { label: "Awaiting Review", value: pendingCount, tone: "amber", icon: "◷" },
    { label: "Payment Stage", value: paymentCount, tone: "blue", icon: "₹" },
    { label: "Completed", value: completedCount, tone: "emerald", icon: "✓" },
  ];

  const toneClasses = {
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 text-white shadow-lg shadow-slate-900/10 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-teal-300/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl shadow-inner">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v5.2c0 4.6 3.1 7.7 7.5 9.8 4.4-2.1 7.5-5.2 7.5-9.8V6L12 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12 2.2 2.2 4.8-5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">Investment Management</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Ownership Requests</h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-300">
                Review full-ownership requests, verify payment proofs, and complete property transfers.
              </p>
            </div>
          </div>
          <button type="button" onClick={fetchRequests} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 sm:self-center">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7v5h-5M4 17v-5h5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2" />
            </svg>
            Refresh requests
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.label} className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-500 sm:text-sm">{item.label}</p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold ring-1 ${toneClasses[item.tone]}`}>{item.icon}</span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{item.value}</p>
            <p className="mt-1 text-[11px] text-slate-400">Live request overview</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">All ownership requests</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredRequests.length} result{filteredRequests.length === 1 ? "" : "s"} found
                {requests.length !== filteredRequests.length ? ` from ${requests.length} total requests` : ""}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <div className="relative min-w-0 flex-1 sm:min-w-[270px] xl:w-[320px]">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10.8" cy="10.8" r="6.8" /><path strokeLinecap="round" d="m16 16 4.5 4.5" />
                </svg>
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search property, investor, UTR..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10">
                <option value="all">All statuses</option>
                <option value="pending">Awaiting review</option>
                <option value="payment">Payment stage</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {!requests.length ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No ownership requests yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">New requests will appear here when investors request full ownership of a property.</p>
          </div>
        ) : !paginatedRequests.length ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">No requests match your search</p>
            <button type="button" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} className="mt-3 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50">Clear filters</button>
          </div>
        ) : (
          <div className="space-y-4 bg-slate-50/60 p-3 sm:p-5">
            {paginatedRequests.map((request) => {
              const investor = request.userId;
              const property = request.propertyId;
              const isPaymentSubmitted = request.paymentStatus === "payment_submitted";
              const isPaymentVerified = request.paymentStatus === "verified";
              const isApproved = request.status === "approved";
              const isRejected = request.status === "rejected";
              const statusStyle = getStatusStyle(request);

              return (
                <article key={request._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md">
                  <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 4l9 6.5M5.5 9.5V20h13V9.5M9 20v-6h6v6" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-extrabold text-slate-900 sm:text-lg">{property?.name || "Property"}</h3>
                          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">Full ownership</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span className="font-semibold text-slate-700">{investor?.name || investor?.email || "Unknown investor"}</span>
                          {investor?.name && investor?.email && <span className="text-slate-300">•</span>}
                          {investor?.name && investor?.email && <span className="break-all text-slate-500">{investor.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold ${statusStyle.wrapper}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                        {getStatusLabel(request)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                        Payment: <span className="ml-1 capitalize text-slate-700">{String(request.paymentStatus || "not_paid").replace(/_/g, " ")}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Ownership progress</p>
                        <p className="text-xs font-bold text-slate-700">{request.currentOwnershipPercent ?? 0}% <span className="font-medium text-slate-400">to</span> {request.targetOwnershipPercent ?? 100}%</p>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all" style={{ width: `${Math.max(0, Math.min(100, Number(request.currentOwnershipPercent || 0)))}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Current shares</p>
                        <p className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900">{request.currentShares ?? 0}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Current ownership</p>
                        <p className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900">{request.currentOwnershipPercent ?? 0}%</p>
                      </div>
                      <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-teal-700">Additional shares</p>
                        <p className="mt-1.5 text-xl font-extrabold tracking-tight text-teal-800">+{request.requestedShares ?? 0}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">Target ownership</p>
                        <p className="mt-1.5 text-xl font-extrabold tracking-tight text-emerald-800">{request.targetOwnershipPercent ?? 100}%</p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-600">Payment summary</p>
                        {request.paymentReference ? (
                          <span className="max-w-[55%] truncate rounded-md bg-white px-2 py-1 font-mono text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">UTR: {request.paymentReference}</span>
                        ) : <span className="text-[10px] font-medium text-slate-400">UTR not submitted</span>}
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
                        <div className="p-3.5">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Price / share</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">₹{Number(request.pricePerShare || 0).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="p-3.5">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total amount</p>
                          <p className="mt-1 text-sm font-extrabold text-emerald-700">₹{Number(request.amount || 0).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="p-3.5">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Payment method</p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">{request.paymentMethod || "Bank Transfer"}</p>
                        </div>
                        <div className="p-3.5">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Payment proof</p>
                          {request.paymentProof ? (
                            <a href={request.paymentProof} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                              View proof
                            </a>
                          ) : <span className="mt-1 block text-xs text-slate-400">Not uploaded</span>}
                        </div>
                      </div>
                    </div>

                    {!isApproved && !isRejected && (
                      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] leading-5 text-slate-500">
                          {request.status === "pending" && "Review the request before allowing the investor to pay."}
                          {request.status === "payment_pending" && request.paymentStatus === "not_paid" && "Waiting for the investor to submit payment proof."}
                          {isPaymentSubmitted && "Payment proof submitted. Verify the payment before transferring ownership."}
                          {isPaymentVerified && "Payment verified. You can now complete the ownership transfer."}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          {request.status === "pending" && (
                            <>
                              <button type="button" onClick={() => rejectRequest(request._id)} disabled={actionLoading === request._id} className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">Reject request</button>
                              <button type="button" onClick={() => approveRequest(request._id)} disabled={actionLoading === request._id} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {actionLoading === request._id && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                {actionLoading === request._id ? "Approving..." : "Approve request"}
                              </button>
                            </>
                          )}
                          {request.status === "payment_pending" && request.paymentStatus === "not_paid" && (
                            <span className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-xs font-semibold text-blue-800"><span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />Awaiting investor payment</span>
                          )}
                          {isPaymentSubmitted && (
                            <>
                              <button type="button" onClick={() => rejectPayment(request._id)} disabled={actionLoading === request._id} className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50">Reject payment</button>
                              <button type="button" onClick={() => verifyPayment(request._id)} disabled={actionLoading === request._id} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">
                                {actionLoading === request._id && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                {actionLoading === request._id ? "Verifying..." : "Verify payment"}
                              </button>
                            </>
                          )}
                          {isPaymentVerified && (
                            <>
                              <button type="button" onClick={() => rejectRequest(request._id)} disabled={actionLoading === request._id} className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50">Reject request</button>
                              <button type="button" onClick={() => approveOwnership(request._id)} disabled={actionLoading === request._id} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50">
                                {actionLoading === request._id && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                {actionLoading === request._id ? "Transferring..." : "Approve 100% ownership"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {isApproved && (
                      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" /></svg>
                        </span>
                        <div><p className="text-sm font-bold text-emerald-900">100% ownership transferred</p><p className="mt-0.5 text-xs text-emerald-700">This investor now owns the full property.</p></div>
                      </div>
                    )}
                    {isRejected && <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs font-semibold text-rose-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100">!</span>This ownership request has been rejected.</div>}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span>–<span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</span> of <span className="font-bold text-slate-800">{filteredRequests.length}</span> requests</p>
            <div className="flex items-center gap-1.5">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} className="flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-9 min-w-9 rounded-lg px-2.5 text-xs font-bold transition ${currentPage === page ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{page}</button>
              ))}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} className="flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </section>
      {rejectedCount > 0 && <p className="text-right text-[11px] text-slate-400">{rejectedCount} rejected request{rejectedCount === 1 ? "" : "s"} in total</p>}
    </div>
  );
}
