import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {

  ArrowLeft,

  User,

  Mail,

  Phone,

  ShieldCheck,

  ShieldAlert,

  CreditCard,

  FileText,

  Users,

  TrendingUp,

  WalletCards,

  IndianRupee,

  CalendarDays,

  Copy,

  CheckCircle2,

  Clock3,

  Loader2,

  RefreshCw,

  ExternalLink,

} from "lucide-react";

import { Button } from "../components/ui/button";

import { getBrokerById, markCommissionPaid, updateCommissionStatus, } from "../../api/broker";

// =====================================================

// HELPERS

// =====================================================

const formatCurrency = (value) => {

  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN")}`;

};

const formatDate = (date) => {

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

};

const formatDateTime = (date) => {

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

};

// =====================================================

// STAT CARD

// =====================================================

function StatCard({

  title,

  value,

  icon: Icon,

  iconBg = "bg-slate-100",

  iconColor = "text-slate-700",

}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">

            {title}

          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">

            {value}

          </p>

        </div>

        <div

          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}

        >

          <Icon className={`h-5 w-5 ${iconColor}`} />

        </div>

      </div>

    </div>

  );

}

// =====================================================

// INFO ITEM

// =====================================================

function InfoItem({ label, value }) {

  return (

    <div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">

        {label}

      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">

        {value || "N/A"}

      </p>

    </div>

  );

}

// =====================================================

// STATUS BADGE

// =====================================================

function StatusBadge({ status }) {

  const normalized = String(status || "").toLowerCase();

  if (

    normalized === "active" ||

    normalized === "approved" ||

    normalized === "paid" ||

    normalized === "converted"

  ) {

    return (

      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">

        <CheckCircle2 className="h-3.5 w-3.5" />

        {status}

      </span>

    );

  }

  if (

    normalized === "pending" ||

    normalized === "not converted"

  ) {

    return (

      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">

        <Clock3 className="h-3.5 w-3.5" />

        {status}

      </span>

    );

  }

  return (

    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold capitalize text-slate-600">

      {status || "N/A"}

    </span>

  );

}

// =====================================================

// MAIN

// =====================================================

export default function BrokerDetails() {

  const navigate = useNavigate();

  const { id } = useParams();

  const [broker, setBroker] = useState(null);

  const [summary, setSummary] = useState(null);

  const [referredInvestors, setReferredInvestors] = useState([]);

  const [commissions, setCommissions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [payingCommissionId, setPayingCommissionId] = useState(null);

  // ===================================================

  // FETCH BROKER

  // ===================================================

  const fetchBroker = async () => {

    if (!id) {

      setError("Broker ID is missing");

      setLoading(false);

      return;

    }

    try {

      setLoading(true);

      setError("");

      const response = await getBrokerById(id);

      const data = response?.data || {};

      if (!data?.success) {

        throw new Error(

          data?.message || "Unable to fetch broker details"

        );

      }

      setBroker(data.broker || null);

      setSummary(data.summary || null);

      setReferredInvestors(

        Array.isArray(data.referredInvestors)

          ? data.referredInvestors

          : []

      );

      setCommissions(

        Array.isArray(data.commissions)

          ? data.commissions

          : []

      );

    } catch (err) {

      console.error("BROKER DETAILS ERROR:", err);

      setError(

        err?.response?.data?.message ||

          err?.message ||

          "Unable to load broker details"

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchBroker();

  }, [id]);

  // ===================================================

  // COPY REFERRAL CODE

  // ===================================================

  const copyReferralCode = async () => {

    if (!broker?.referralCode) return;

    try {

      await navigator.clipboard.writeText(

        broker.referralCode

      );

      setCopied(true);

      setTimeout(() => {

        setCopied(false);

      }, 2000);

    } catch (err) {

      console.error("COPY ERROR:", err);

    }

  };

  // ===================================================

  // MARK ONE COMMISSION AS PAID
 
const handleCommissionStatusChange = async (
    commissionId,
    status
  ) => {
    if (!commissionId || payingCommissionId) return;
  
    const confirmed = window.confirm(
      `Are you sure you want to mark this commission as ${
        status === "paid" ? "Paid" : "Pending"
      }?`
    );
  
    if (!confirmed) {
      await fetchBroker();
      return;
    }
  
    try {
      setPayingCommissionId(commissionId);
  
      const response = await updateCommissionStatus(
        commissionId,
        status
      );
  
      if (response?.data?.success === false) {
        throw new Error(
          response.data.message || "Unable to update status"
        );
      }
  
      await fetchBroker();
    } catch (err) {
      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update commission status"
      );
  
      await fetchBroker();
    } finally {
      setPayingCommissionId(null);
    }
  };
  

  // LOADING

  // ===================================================

  if (loading) {

    return (

      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="h-8 w-8 animate-spin text-slate-700" />

          <p className="text-sm font-medium text-slate-500">

            Loading broker details...

          </p>

        </div>

      </div>

    );

  }

  // ===================================================

  // ERROR

  // ===================================================

  if (error || !broker) {

    return (

      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-5xl">

          <Button

            type="button"

            variant="outline"

            onClick={() => navigate("/brokers")}

            className="mb-6 gap-2"

          >

            <ArrowLeft className="h-4 w-4" />

            Back to Brokers

          </Button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />

            <h2 className="mt-4 text-lg font-bold text-red-800">

              Unable to Load Broker

            </h2>

            <p className="mt-2 text-sm text-red-600">

              {error || "Broker not found"}

            </p>

            <Button

              type="button"

              onClick={fetchBroker}

              className="mt-5 gap-2"

            >

              <RefreshCw className="h-4 w-4" />

              Try Again

            </Button>

          </div>

        </div>

      </div>

    );

  }

  // ===================================================

  // MAIN UI

  // ===================================================

  return (

    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =============================================

            TOP BAR

        \\============================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <button

              type="button"

              onClick={() => navigate("/brokers")}

              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"

            >

              <ArrowLeft className="h-4 w-4" />

              Back to Brokers

            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">

              Broker Details

            </h1>

            <p className="mt-1 text-sm text-slate-500">

              Complete broker profile, referral performance and commission details

            </p>

          </div>

          <Button

            type="button"

            variant="outline"

            onClick={fetchBroker}

            className="gap-2 self-start sm:self-auto"

          >

            <RefreshCw className="h-4 w-4" />

            Refresh

          </Button>

        </div>

        {/* =============================================

            BROKER PROFILE

        \\============================================= */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-2 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />

          <div className="p-6">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">

                  {broker?.name

                    ?.split(" ")

                    .filter(Boolean)

                    .slice(0, 2)

                    .map((word) => word[0]?.toUpperCase())

                    .join("") || "B"}

                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">

                    {broker.name || "N/A"}

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    {broker.email || "N/A"}

                  </p>

                  <div className="mt-3">

                    <StatusBadge

                      status={

                        broker.status ||

                        (broker.isApproved

                          ? "active"

                          : "pending")

                      }

                    />

                  </div>

                </div>

              </div>

              <div className="flex flex-wrap gap-3">

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">

                    Referral Code

                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="text-sm font-bold text-slate-800">

                      {broker.referralCode || "N/A"}

                    </span>

                    {broker.referralCode && (

                      <button

                        type="button"

                        onClick={copyReferralCode}

                        className="text-slate-400 transition hover:text-slate-800"

                        title="Copy referral code"

                      >

                        {copied ? (

                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                        ) : (

                          <Copy className="h-4 w-4" />

                        )}

                      </button>

                    )}

                  </div>

                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">

                    Commission Rate

                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">

                    {Number(

                      broker.commissionRate || 0

                    )}

                    %

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =============================================

            SUMMARY CARDS

        \\============================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard

            title="Total Referrals"

            value={summary?.totalReferrals || 0}

            icon={Users}

            iconBg="bg-blue-50"

            iconColor="text-blue-600"

          />

          <StatCard

            title="Conversions"

            value={summary?.totalConversions || 0}

            icon={TrendingUp}

            iconBg="bg-emerald-50"

            iconColor="text-emerald-600"

          />

          <StatCard

            title="Total Investment"

            value={formatCurrency(

              summary?.totalInvestment

            )}

            icon={IndianRupee}

            iconBg="bg-violet-50"

            iconColor="text-violet-600"

          />

          <StatCard

            title="Total Commission"

            value={formatCurrency(

              summary?.totalCommission

            )}

            icon={WalletCards}

            iconBg="bg-amber-50"

            iconColor="text-amber-600"

          />

        </div>

        {/* =============================================

            BROKER INFORMATION + COMMISSION SUMMARY

        \\============================================= */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* BROKER INFO */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                <User className="h-5 w-5 text-slate-700" />

              </div>

              <div>

                <h3 className="text-sm font-bold text-slate-900">

                  Broker Information

                </h3>

                <p className="text-[11px] text-slate-400">

                  Registered broker details

                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <InfoItem

                label="Full Name"

                value={broker.name}

              />

              <InfoItem

                label="Email"

                value={broker.email}

              />

              <InfoItem

                label="Phone"

                value={broker.phone}

              />

              <InfoItem

                label="PAN"

                value={broker.pan}

              />

              <InfoItem

                label="RERA Number"

                value={broker.rera}

              />

              <InfoItem

                label="Referral Code"

                value={broker.referralCode}

              />

              <InfoItem

                label="Commission Rate"

                value={`${Number(

                  broker.commissionRate || 0

                )}%`}

              />

              <InfoItem

                label="Registration Date"

                value={formatDate(

                  broker.createdAt

                )}

              />

            </div>

          </div>

          {/* COMMISSION SUMMARY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">

                <WalletCards className="h-5 w-5 text-emerald-600" />

              </div>

              <div>

                <h3 className="text-sm font-bold text-slate-900">

                  Commission Summary

                </h3>

                <p className="text-[11px] text-slate-400">

                  Earnings overview

                </p>

              </div>

            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                <span className="text-xs text-slate-500">

                  Total Commission

                </span>

                <span className="text-sm font-bold text-slate-900">

                  {formatCurrency(

                    summary?.totalCommission

                  )}

                </span>

              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                <span className="text-xs text-slate-500">

                  Paid Commission

                </span>

                <span className="text-sm font-bold text-emerald-600">

                  {formatCurrency(

                    summary?.paidCommission

                  )}

                </span>

              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                <span className="text-xs text-slate-500">

                  Pending Commission

                </span>

                <span className="text-sm font-bold text-amber-600">

                  {formatCurrency(

                    summary?.pendingCommission

                  )}

                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">

                  Conversion Rate

                </span>

                <span className="text-sm font-bold text-slate-900">

                  {Number(

                    summary?.conversionRate || 0

                  ).toFixed(1)}

                  %

                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =============================================

            REFERRED INVESTORS

        \\============================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-sm font-bold text-slate-900">

                Referred Investors

              </h3>

              <p className="mt-1 text-[11px] text-slate-400">

                Investors referred by this broker

              </p>

            </div>

            <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">

              {referredInvestors.length} Investors

            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Investor

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Contact

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Investment

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Investments

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    KYC

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Status

                  </th>

                </tr>

              </thead>

              <tbody>

                {referredInvestors.length > 0 ? (

                  referredInvestors.map((investor) => (

                    <tr

                      key={

                        investor._id ||

                        investor.id ||

                        investor.email

                      }

                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"

                    >

                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-slate-800">

                          {investor.name || "N/A"}

                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">

                          Joined{" "}

                          {formatDate(

                            investor.signupDate

                          )}

                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <p className="text-xs text-slate-700">

                          {investor.email || "N/A"}

                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">

                          {investor.phone || "N/A"}

                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <span className="text-sm font-bold text-slate-800">

                          {formatCurrency(

                            investor.totalInvestment

                          )}

                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">

                          {investor.investmentCount || 0}

                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <StatusBadge

                          status={

                            investor.kycStatus ||

                            "pending"

                          }

                        />

                      </td>

                      <td className="px-5 py-4">

                        <StatusBadge

                          status={

                            investor.status ||

                            "Not Converted"

                          }

                        />

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td

                      colSpan={6}

                      className="px-5 py-12 text-center"

                    >

                      <Users className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-semibold text-slate-500">

                        No referred investors found

                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =============================================

            COMMISSION HISTORY

        \\============================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-sm font-bold text-slate-900">

                Commission History

              </h3>

              <p className="mt-1 text-[11px] text-slate-400">

                Commission generated by referred investments

              </p>

            </div>

            <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">

              {commissions.length} Records

            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Investor

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Property

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Amount

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Type

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Status

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                    Date

                  </th>

                </tr>

              </thead>

              <tbody>

                {commissions.length > 0 ? (

                  commissions.map((commission) => (

                    <tr

                      key={

                        commission._id ||

                        commission.id

                      }

                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"

                    >

                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-slate-800">

                          {commission.investor ||

                            "N/A"}

                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">

                          {commission.investorEmail ||

                            "N/A"}

                        </p>

                      </td>

                                           <td className="px-5 py-4">

                       <div className="flex min-w-[260px] items-start gap-3">

                         {(() => {

                           const imageItem =

                             commission.propertyDetails?.images?.[0] ||

                             commission.propertyDetails?.image ||

                             commission.propertyDetails?.media?.images?.[0];

                           return typeof imageItem === "string"

                             ? imageItem

                             : imageItem?.url || imageItem?.secure_url || imageItem?.path || "";

                         })() ? (

                           <img

                             src={(() => {

                               const imageItem =

                                 commission.propertyDetails?.images?.[0] ||

                                 commission.propertyDetails?.image ||

                                 commission.propertyDetails?.media?.images?.[0];

                               return typeof imageItem === "string"

                                 ? imageItem

                                 : imageItem?.url || imageItem?.secure_url || imageItem?.path || "";

                             })()}

                             alt={commission.propertyDetails?.name || commission.property || "Property"}

                             className="h-16 w-20 shrink-0 rounded-lg border border-slate-200 object-cover"

                             onError={(event) => {

                               event.currentTarget.style.display = "none";

                             }}

                           />

                         ) : (

                           <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] text-slate-400">

                             No image

                           </div>

                         )}

                         <div className="min-w-0">

                           <p className="text-sm font-semibold text-slate-800">

                             {commission.propertyDetails?.name ||

                               commission.propertyDetails?.title ||

                               commission.property ||

                               "Property details unavailable"}

                           </p>

                           {(commission.propertyDetails?.location ||

                             commission.propertyDetails?.address ||

                             commission.propertyDetails?.city ||

                             commission.propertyDetails?.state) && (

                             <p className="mt-1 text-[11px] text-slate-500">

                               {[

                                 typeof commission.propertyDetails?.location === "string"

                                   ? commission.propertyDetails.location

                                   : commission.propertyDetails?.location?.address ||

                                     commission.propertyDetails?.location?.city ||

                                     commission.propertyDetails?.location?.name,

                                 commission.propertyDetails?.address,

                                 commission.propertyDetails?.city,

                                 commission.propertyDetails?.state,

                               ]

                                 .filter(Boolean)

                                 .filter((value, index, array) => array.indexOf(value) === index)

                                 .join(", ")}

                             </p>

                           )}

                           <div className="mt-2 flex flex-wrap gap-1.5">

                             {commission.propertyDetails?.status && (

                               <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold capitalize text-blue-700">

                                 {commission.propertyDetails.status}

                               </span>

                             )}

                             {commission.propertyDetails?.pricePerShare != null && (

                               <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">

                                 ₹{Number(commission.propertyDetails.pricePerShare).toLocaleString("en-IN")} / share

                               </span>

                             )}

                             {commission.propertyDetails?.totalShares != null && (

                               <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">

                                 {Number(commission.propertyDetails.totalShares).toLocaleString("en-IN")} shares

                               </span>

                             )}

                           </div>

                         </div>

                       </div>

                     </td>

                      <td className="px-5 py-4">

                        <span className="text-sm font-bold text-slate-800">

                          {formatCurrency(

                            commission.amount

                          )}

                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span className="text-xs font-medium capitalize text-slate-600">

                          {commission.type ||

                            "N/A"}

                        </span>

                      </td>

                    
<td className="px-5 py-4">
  <div className="flex min-w-[150px] flex-col gap-2">
    <select
      value={
        String(commission.status || "pending").toLowerCase() === "paid"
          ? "paid"
          : "pending"
      }
      disabled={payingCommissionId === commission._id}
      onChange={(e) =>
        handleCommissionStatusChange(
          commission._id,
          e.target.value
        )
      }
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="paid">Paid</option>
    </select>

    {/* {String(commission.status || "").toLowerCase() === "paid" && (
      <span className="text-[11px] text-emerald-700">
        Paid on: {formatDateTime(commission.paidAt)}
      </span>
    )} */}
  </div>
</td>


                      <td className="px-5 py-4">

                        <span className="text-xs text-slate-500">

                          {formatDateTime(

                            commission.date

                          )}

                        </span>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td

                      colSpan={6}

                      className="px-5 py-12 text-center"

                    >

                      <WalletCards className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-semibold text-slate-500">

                        No commission records found

                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =============================================

            DOCUMENT

        \\============================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

              <FileText className="h-5 w-5 text-blue-600" />

            </div>

            <div>

              <h3 className="text-sm font-bold text-slate-900">

                Broker Document

              </h3>

              <p className="text-[11px] text-slate-400">

                Registration / KYC document

              </p>

            </div>

          </div>

          {broker.kycDocument ? (

            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">

                  <FileText className="h-5 w-5 text-slate-600" />

                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">

                    Broker Registration Document

                  </p>

                  <p className="text-[11px] text-slate-400">

                    Uploaded document

                  </p>

                </div>

              </div>

              <a

                href={broker.kycDocument}

                target="_blank"

                rel="noopener noreferrer"

                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"

              >

                View Document

                <ExternalLink className="h-3.5 w-3.5" />

              </a>

            </div>

          ) : (

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

              <FileText className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-500">

                No document uploaded

              </p>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}