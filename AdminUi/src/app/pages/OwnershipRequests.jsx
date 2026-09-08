import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../api/axios";

export default function OwnershipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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
  // PAGINATION DATA
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(requests.length / itemsPerPage)
  );

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return requests.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [requests, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =====================================================
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
  // =====================================================

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-28 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

        <p className="text-sm font-semibold text-slate-500 tracking-wide">
          Loading ownership requests...
        </p>
      </div>
    );
  }

  // =====================================================
  // EMPTY
  // =====================================================

  if (!requests.length) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            No Ownership Requests
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            There are currently no ownership transfer
            requests in the system.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="max-w-7xl mx-auto space-y-5 p-4 sm:p-6 font-sans">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Full Ownership Requests
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Review payment and approve 100% ownership
            transfers.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 w-fit">
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {requests.length} Total Requests
          </span>
        </div>
      </div>

      {/* ================================================= */}
      {/* REQUEST CARDS */}
      {/* ================================================= */}

      <div className="space-y-3">
        {paginatedRequests.map((request) => {
          const investor = request.userId;
          const property = request.propertyId;
          const investment = request.investmentId;

          const isPaymentSubmitted =
            request.paymentStatus === "payment_submitted";

          const isPaymentVerified =
            request.paymentStatus === "verified";

          const isApproved =
            request.status === "approved";

          const isRejected =
            request.status === "rejected";

          const statusStyle =
            getStatusStyle(request);

          return (
            <div
              key={request._id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >

              {/* ================================================= */}
              {/* COMPACT HEADER */}
              {/* ================================================= */}

              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

                  {/* Property + Investor */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">

                      <span className="text-[9px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">
                        Full Ownership
                      </span>

                      <h3 className="text-base font-bold text-slate-900 truncate max-w-[420px]">
                        {property?.name || "Property"}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                      <span className="text-[11px] text-slate-400">
                        Investor
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
                        {investor?.name ||
                          investor?.email ||
                          "Unknown"}
                      </span>

                      {investor?.email &&
                        investor?.name && (
                          <>
                            <span className="text-slate-300">
                              •
                            </span>

                            <span className="text-[11px] text-slate-500">
                              {investor.email}
                            </span>
                          </>
                        )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 shrink-0">

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusStyle.wrapper}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                      />

                      {getStatusLabel(request)}
                    </span>

                    <span className="hidden sm:inline-flex text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md">
                      Payment:{" "}
                      <span className="font-bold capitalize ml-1 text-slate-700">
                        {request.paymentStatus ||
                          "not_paid"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* MAIN CONTENT */}
              {/* ================================================= */}

              <div className="px-4 py-3">

                {/* ================================================= */}
                {/* OWNERSHIP STATS */}
                {/* ================================================= */}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">

                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Current Shares
                    </p>

                    <p className="text-lg font-black text-slate-900 leading-tight mt-1">
                      {request.currentShares ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Current Ownership
                    </p>

                    <p className="text-lg font-black text-slate-900 leading-tight mt-1">
                      {request.currentOwnershipPercent ?? 0}%
                    </p>
                  </div>

                  <div className="rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-teal-600">
                      Additional Shares
                    </p>

                    <p className="text-lg font-black text-teal-800 leading-tight mt-1">
                      +{request.requestedShares ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                      Target Ownership
                    </p>

                    <p className="text-lg font-black text-emerald-800 leading-tight mt-1">
                      {request.targetOwnershipPercent ??
                        100}
                      %
                    </p>
                  </div>
                </div>

                {/* ================================================= */}
                {/* PAYMENT DETAILS - COMPACT */}
                {/* ================================================= */}

                <div className="mt-2.5 rounded-xl border border-slate-200 bg-white overflow-hidden">

                  <div className="px-3 py-2 bg-slate-50/70 border-b border-slate-100">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Payment Details
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4">

                    {/* Price */}
                    <div className="px-3 py-2.5 border-b md:border-b-0 md:border-r border-slate-100">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">
                        Price / Share
                      </p>

                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        ₹
                        {Number(
                          request.pricePerShare || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="px-3 py-2.5 border-b md:border-b-0 md:border-r border-slate-100">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">
                        Total Amount
                      </p>

                      <p className="text-sm font-black text-indigo-600 mt-0.5">
                        ₹
                        {Number(
                          request.amount || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Method */}
                    <div className="px-3 py-2.5 border-r-0 md:border-r border-slate-100">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">
                        Payment Method
                      </p>

                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {request.paymentMethod ||
                          "Bank Transfer"}
                      </p>
                    </div>

                    {/* Reference */}
                    <div className="px-3 py-2.5">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">
                        Payment Reference
                      </p>

                      <p className="text-[11px] font-mono font-semibold text-slate-700 mt-1 truncate">
                        {request.paymentReference ||
                          "Not submitted"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* BOTTOM ACTION BAR */}
                {/* ================================================= */}

                {!isApproved && !isRejected && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    {/* Payment Proof */}
                    <div>
                      {request.paymentProof ? (
                        <a
                          href={request.paymentProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-100 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 transition-colors text-[11px] font-bold"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>

                          View Payment Proof
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          No payment proof uploaded
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2">

                      {/* STEP 1 */}
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              rejectRequest(request._id)
                            }
                            disabled={
                              actionLoading ===
                              request._id
                            }
                            className="px-3.5 py-2 rounded-lg border border-rose-200 text-rose-600 text-[11px] font-bold hover:bg-rose-50 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() =>
                              approveRequest(request._id)
                            }
                            disabled={
                              actionLoading ===
                              request._id
                            }
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {actionLoading ===
                              request._id && (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}

                            {actionLoading ===
                            request._id
                              ? "Approving..."
                              : "Approve Request"}
                          </button>
                        </>
                      )}

                      {/* STEP 2 */}
                      {request.status ===
                        "payment_pending" &&
                        request.paymentStatus ===
                          "not_paid" && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />

                            <span className="text-[11px] font-semibold text-blue-800">
                              Waiting for investor payment
                            </span>
                          </div>
                        )}

                      {/* STEP 3 */}
                      {isPaymentSubmitted && (
                        <>
                          <button
                            onClick={() =>
                              rejectPayment(
                                request._id
                              )
                            }
                            disabled={
                              actionLoading ===
                              request._id
                            }
                            className="px-3.5 py-2 rounded-lg border border-rose-200 text-rose-600 text-[11px] font-bold hover:bg-rose-50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading ===
                            request._id
                              ? "Processing..."
                              : "Reject Payment"}
                          </button>

                          <button
                            onClick={() =>
                              verifyPayment(
                                request._id
                              )
                            }
                            disabled={
                              actionLoading ===
                              request._id
                            }
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {actionLoading ===
                              request._id && (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}

                            {actionLoading ===
                            request._id
                              ? "Verifying..."
                              : "Verify Payment"}
                          </button>
                        </>
                      )}

                      {/* STEP 4 */}
                      {isPaymentVerified && (
                        <>
                          <button
                            onClick={() =>
                              rejectRequest(
                                request._id
                              )
                            }
                            disabled={
                              actionLoading ===
                              request._id
                            }
                            className="px-3.5 py-2 rounded-lg border border-rose-200 text-rose-600 text-[11px] font-bold hover:bg-rose-50 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() =>
                              approveOwnership(
                                request._id
                              )
                            }
                            disabled={
                              actionLoading ===
                              request._id
                            }
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {actionLoading ===
                              request._id && (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}

                            {actionLoading ===
                            request._id
                              ? "Transferring..."
                              : "Approve 100% Ownership"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ================================================= */}
                {/* COMPLETED */}
                {/* ================================================= */}

                {isApproved && (
                  <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </div>

                    <div>
                      <p className="text-xs font-bold text-emerald-900">
                        100% Ownership Transferred
                      </p>

                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        This investor now owns 100% of the property.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* PAGINATION */}
      {/* ================================================= */}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">

          {/* Result info */}
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            –{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(
                currentPage * itemsPerPage,
                requests.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {requests.length}
            </span>{" "}
            requests
          </p>

          <div className="flex items-center gap-1.5">

            {/* Previous */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(1, prev - 1)
                )
              }
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ←
            </button>

            {/* Page Numbers */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  currentPage === page
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}