import React, { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Activity,
  Clock,
  MapPin,
  RefreshCw,
  ArrowUpRight,
  Wallet,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Sparkles,
  ChevronRight,
  BadgeCheck,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value = 0) => {
  const amount = Number(value) || 0;

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatFullCurrency = (value = 0) => {
  return `₹${(Number(value) || 0).toLocaleString("en-IN")}`;
};

const formatTimeAgo = (date) => {
  if (!date) return "Recently";

  const now = new Date();
  const then = new Date(date);

  const diff = Math.floor(
    (now.getTime() - then.getTime()) / 1000
  );

  if (diff < 60) {
    return "Just now";
  }

  const minutes = Math.floor(diff / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return then.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getLocation = (location) => {
  if (!location) return "Location unavailable";

  if (typeof location === "string") {
    return location;
  }

  return [location.city, location.state]
    .filter(Boolean)
    .join(", ") || "Location unavailable";
};

const getFundingPercentage = (property) => {
  const percentage = Number(property?.soldPercent);

  if (Number.isFinite(percentage)) {
    return Math.min(Math.max(percentage, 0), 100);
  }

  const totalShares = Number(property?.totalShares) || 0;
  const availableShares =
    Number(property?.availableShares) || 0;

  if (totalShares > 0) {
    return Math.min(
      Math.max(
        ((totalShares - availableShares) / totalShares) * 100,
        0
      ),
      100
    );
  }

  return 0;
};

// =====================================================
// KPI CARD
// =====================================================

function PremiumKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
  loading,
}) {
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-slate-100" />
            <div className="h-3 w-14 rounded bg-slate-100" />
          </div>

          <div className="mt-5 h-3 w-28 rounded bg-slate-100" />
          <div className="mt-2 h-7 w-32 rounded bg-slate-100" />
          <div className="mt-3 h-3 w-20 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl
        border border-slate-200/80 bg-white
        p-5 shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50
      "
    >
      {/* Accent glow */}
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${accent} opacity-[0.07] blur-2xl transition-all duration-500 group-hover:scale-150`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor} border border-white shadow-sm`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {title}
          </p>

          <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// CHART TOOLTIP
// =====================================================

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-white">
        {formatFullCurrency(payload[0]?.value)}
      </p>
    </div>
  );
};

// =====================================================
// ACTIVITY ICON
// =====================================================

const ActivityIcon = ({ type }) => {
  const config = {
    property: {
      icon: Building2,
      className:
        "bg-indigo-50 text-indigo-600 border-indigo-100",
    },

    investment: {
      icon: TrendingUp,
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
    },

    payment: {
      icon: IndianRupee,
      className:
        "bg-amber-50 text-amber-600 border-amber-100",
    },

    kyc: {
      icon: ShieldCheck,
      className:
        "bg-violet-50 text-violet-600 border-violet-100",
    },

    funded: {
      icon: CheckCircle2,
      className:
        "bg-green-50 text-green-600 border-green-100",
    },
  };

  const item = config[type] || config.property;

  const Icon = item.icon;

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${item.className}`}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
};

// =====================================================
// LOADING ACTIVITY
// =====================================================

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex animate-pulse gap-3"
        >
          <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100" />

          <div className="min-w-0 flex-1">
            <div className="h-3 w-32 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-52 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// PROPERTY SKELETON
// =====================================================

function PropertySkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-4">
      <div className="flex gap-4">
        <div className="h-20 w-24 shrink-0 rounded-xl bg-slate-100" />

        <div className="min-w-0 flex-1">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
          <div className="mt-5 h-2 w-full rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// DASHBOARD
// =====================================================

export function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ===================================================
  // FETCH DASHBOARD
  // ===================================================

  const fetchDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get("/dashboard");

      setDashboard(response.data);
    } catch (err) {
      console.error(
        "Dashboard fetch error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ===================================================
  // DATA
  // ===================================================

  const stats = dashboard?.stats || {};

  const monthlyRevenue =
    dashboard?.monthlyRevenue || [];

  const activeFundingProperties =
    dashboard?.activeFundingProperties || [];

  const recentActivity =
    dashboard?.recentActivity || [];

  // ===================================================
  // CURRENT MONTH REVENUE CHANGE
  // ===================================================

  const revenueGrowth = useMemo(() => {
    if (monthlyRevenue.length < 2) {
      return null;
    }

    const current =
      Number(
        monthlyRevenue[
          monthlyRevenue.length - 1
        ]?.revenue
      ) || 0;

    const previous =
      Number(
        monthlyRevenue[
          monthlyRevenue.length - 2
        ]?.revenue
      ) || 0;

    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return (
      ((current - previous) / previous) *
      100
    ).toFixed(1);
  }, [monthlyRevenue]);

  // ===================================================
  // KPI DATA
  // ===================================================

  const kpis = [
    {
      title: "Total Asset Value",
      value: formatCurrency(
        stats.totalAssetValue
      ),
      subtitle: "Across published properties",
      icon: Building2,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      accent: "bg-indigo-600",
    },

    {
      title: "Active Funding",
      value: formatCurrency(
        stats.activeFunding
      ),
      subtitle: "Currently being raised",
      icon: Wallet,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "bg-emerald-600",
    },

    {
      title: "Revenue",
      value: formatCurrency(
        stats.revenue
      ),
      subtitle: revenueGrowth !== null
        ? `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% vs last month`
        : "Current month",
      icon: CircleDollarSign,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accent: "bg-violet-600",
    },

    {
      title: "Conversion Rate",
      value: `${Number(
        stats.conversionRate || 0
      ).toFixed(1)}%`,
      subtitle: `${stats.approvedInvestors || 0} approved investors`,
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accent: "bg-blue-600",
    },

    {
      title: "Pending KYC",
      value: Number(
        stats.pendingKyc || 0
      ).toLocaleString("en-IN"),
      subtitle: "Awaiting admin review",
      icon: ShieldCheck,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accent: "bg-amber-600",
    },

    {
      title: "Broker Payouts",
      value: formatCurrency(
        stats.brokerPayouts
      ),
      subtitle: "Paid this month",
      icon: CreditCard,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      accent: "bg-rose-600",
    },
  ];

  // ===================================================
  // ERROR STATE
  // ===================================================

  if (error && !dashboard) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50/70 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                Dashboard unavailable
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {error}
              </p>

              <button
                onClick={() => fetchDashboard()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            relative overflow-hidden rounded-3xl
            border border-slate-200/80
            bg-white
            px-6 py-6
            shadow-sm
            sm:px-8
          "
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-emerald-100/30 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Dashboard Overview
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live Data
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Monitor your property portfolio,
                investments and platform performance
                from one place.
              </p>
            </div>

            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="
                inline-flex w-fit items-center gap-2
                rounded-xl border border-slate-200
                bg-white px-4 py-2.5
                text-xs font-bold text-slate-700
                shadow-sm
                transition-all
                hover:border-slate-300
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* =================================================
            KPI GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <PremiumKpiCard
              key={kpi.title}
              {...kpi}
              loading={loading}
            />
          ))}
        </div>

        {/* =================================================
            REVENUE + ACTIVITY
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

          {/* =================================================
              REVENUE CHART
          ================================================= */}

          <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm xl:col-span-7">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-black text-slate-900">
                      Revenue Performance
                    </CardTitle>

                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                      6 Months
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Successful payments recorded
                    over the last six months
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                  <BarChart3Icon />
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-5 pt-6 sm:px-6">
              {loading ? (
                <div className="flex h-[320px] animate-pulse items-end gap-5 px-5 pb-8">
                  {[45, 65, 50, 75, 60, 85].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-xl bg-slate-100"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    )
                  )}
                </div>
              ) : monthlyRevenue.length === 0 ? (
                <div className="flex h-[320px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <BarChart3Icon />
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No revenue data yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Revenue will appear here once
                    successful payments are recorded.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <BarChart
                    data={monthlyRevenue}
                    margin={{
                      top: 10,
                      right: 5,
                      left: -15,
                      bottom: 0,
                    }}
                    barCategoryGap="28%"
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6366f1"
                          stopOpacity={1}
                        />

                        <stop
                          offset="100%"
                          stopColor="#818cf8"
                          stopOpacity={0.65}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#EEF2F7"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 10,
                      }}
                      tickFormatter={(value) =>
                        formatCurrency(value)
                      }
                    />

                    <Tooltip
                      cursor={{
                        fill: "#eef2ff",
                        opacity: 0.35,
                      }}
                      content={
                        <RevenueTooltip />
                      }
                    />

                    <Bar
                      dataKey="revenue"
                      fill="url(#revenueGradient)"
                      radius={[
                        8,
                        8,
                        3,
                        3,
                      ]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {!loading &&
                revenueGrowth !== null && (
                  <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div>

                      <span className="text-xs font-semibold text-slate-500">
                        Monthly trend
                      </span>
                    </div>

                    <span
                      className={`text-xs font-black ${
                        Number(revenueGrowth) >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {Number(revenueGrowth) >=
                      0
                        ? "+"
                        : ""}
                      {revenueGrowth}%
                    </span>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm xl:col-span-5">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Activity className="h-4 w-4" />
                    </div>

                    <CardTitle className="text-base font-black text-slate-900">
                      Recent Activity
                    </CardTitle>
                  </div>

                  <p className="ml-11 mt-1 text-xs text-slate-400">
                    Latest platform activity
                  </p>
                </div>

                <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                  Latest 5
                </span>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-5">
              {loading ? (
                <ActivitySkeleton />
              ) : recentActivity.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <Activity className="h-5 w-5" />
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No recent activity
                  </p>

                  <p className="mt-1 max-w-xs text-xs text-slate-400">
                    New properties,
                    investments, payments and
                    KYC activity will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {recentActivity.map(
                    (activity, index) => (
                      <div
                        key={
                          activity.id ||
                          index
                        }
                        className="group relative flex gap-3 pb-5 last:pb-0"
                      >
                        {/* Timeline */}
                        {index !==
                          recentActivity.length -
                            1 && (
                          <div className="absolute left-[17px] top-10 h-[calc(100%-18px)] w-px bg-slate-100" />
                        )}

                        <ActivityIcon
                          type={
                            activity.type
                          }
                        />

                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-xs font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
                              {activity.action}
                            </p>

                            <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-slate-400">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(
                                activity.time ||
                                  activity.date
                              )}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                            {
                              activity.description
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* =================================================
            ACTIVE FUNDING PROPERTIES
        ================================================= */}

        <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Landmark className="h-4 w-4" />
                  </div>

                  <CardTitle className="text-base font-black text-slate-900">
                    Active Funding Properties
                  </CardTitle>

                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                    Top 5
                  </span>
                </div>

                <p className="ml-11 mt-1 text-xs text-slate-400">
                  Highest-funded active properties
                  currently raising capital
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/properties")
                }
                className="
                  inline-flex w-fit items-center gap-1.5
                  rounded-xl border border-slate-200
                  bg-white px-3.5 py-2
                  text-[11px] font-bold text-slate-600
                  transition-all
                  hover:border-indigo-200
                  hover:bg-indigo-50
                  hover:text-indigo-600
                "
              >
                View all properties
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(
                  (item) => (
                    <PropertySkeleton
                      key={item}
                    />
                  )
                )}
              </div>
            ) : activeFundingProperties.length ===
              0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Building2 className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-800">
                  No active funding properties
                </h3>

                <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                  Properties currently in funding
                  status will automatically appear
                  here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeFundingProperties.map(
                  (property, index) => {
                    const progress =
                      getFundingPercentage(
                        property
                      );

                    const totalValue =
                      Number(
                        property.totalValue
                      ) || 0;

                    const investedAmount =
                      Number(
                        property.investedAmount
                      ) || 0;

                    const remaining = Math.max(
                      totalValue -
                        investedAmount,
                      0
                    );

                    return (
                      <div
                        key={
                          property._id ||
                          index
                        }
                        className="
                          group relative overflow-hidden
                          rounded-2xl border
                          border-slate-200/80
                          bg-slate-50/40
                          p-4
                          transition-all duration-300
                          hover:border-slate-300
                          hover:bg-white
                          hover:shadow-lg
                        "
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                          {/* Ranking */}
                          <div className="hidden shrink-0 lg:flex lg:w-8 lg:justify-center">
                            <span
                              className={`
                                flex h-7 w-7 items-center
                                justify-center rounded-lg
                                text-[10px] font-black
                                ${
                                  index === 0
                                    ? "bg-slate-900 text-white"
                                    : "bg-white text-slate-400 border border-slate-200"
                                }
                              `}
                            >
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>
                          </div>

                          {/* Image */}
                          <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-32">
                            {property.image ? (
                              <img
                                src={
                                  property.image
                                }
                                alt={
                                  property.name ||
                                  "Property"
                                }
                                className="
                                  h-full w-full
                                  object-cover
                                  transition-transform
                                  duration-500
                                  group-hover:scale-105
                                "
                                onError={(
                                  e
                                ) => {
                                  e.currentTarget.style.display =
                                    "none";
                                  e.currentTarget.nextElementSibling.style.display =
                                    "flex";
                                }}
                              />
                            ) : null}

                            <div
                              className={`${
                                property.image
                                  ? "hidden"
                                  : "flex"
                              } absolute inset-0 items-center justify-center bg-slate-100 text-slate-300`}
                            >
                              <ImageIcon className="h-7 w-7" />
                            </div>

                            <div className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 shadow-sm backdrop-blur">
                              Funding
                            </div>
                          </div>

                          {/* Main Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="truncate text-sm font-black text-slate-900">
                                    {
                                      property.name
                                    }
                                  </h3>

                                  {index ===
                                    0 && (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-1 text-[9px] font-bold text-amber-700">
                                      <Sparkles className="h-2.5 w-2.5" />
                                      Highest
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                  <MapPin className="h-3 w-3" />
                                  {getLocation(
                                    property.location
                                  )}
                                </p>
                              </div>

                              {/* Amount */}
                              <div className="shrink-0 sm:text-right">
                                <p className="text-sm font-black text-slate-900">
                                  {formatCurrency(
                                    investedAmount
                                  )}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  of{" "}
                                  {formatCurrency(
                                    totalValue
                                  )}{" "}
                                  raised
                                </p>
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-4">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500">
                                  Funding progress
                                </span>

                                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-600">
                                  {progress.toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </div>

                              <Progress
                                value={
                                  progress
                                }
                                className="h-2 bg-slate-200/80"
                              />

                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">
                                  {property.soldShares ||
                                    0}{" "}
                                  /{" "}
                                  {property.totalShares ||
                                    0}{" "}
                                  shares sold
                                </span>

                                <span className="text-[10px] font-semibold text-slate-400">
                                  {formatCurrency(
                                    remaining
                                  )}{" "}
                                  remaining
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <button
                            onClick={() =>
                              property._id &&
                              navigate(
                                `/properties/view/${property._id}`
                              )
                            }
                            className="
                              hidden h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-xl border
                              border-slate-200
                              bg-white text-slate-400
                              transition-all
                              hover:border-indigo-200
                              hover:bg-indigo-50
                              hover:text-indigo-600
                              lg:flex
                            "
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* =================================================
            SMALL FOOTER SUMMARY
        ================================================= */}

        {!loading && dashboard && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Investors
                </p>

                <p className="mt-0.5 text-lg font-black text-slate-900">
                  {Number(
                    stats.totalInvestors || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgeCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Approved Investors
                </p>

                <p className="mt-0.5 text-lg font-black text-slate-900">
                  {Number(
                    stats.approvedInvestors ||
                      0
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Platform Status
                </p>

                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-black text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Operational
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// SMALL ICON COMPONENT
// =====================================================

function BarChart3Icon() {
  return (
    <div className="flex items-end gap-[3px]">
      <span className="h-2.5 w-1.5 rounded-sm bg-current opacity-50" />
      <span className="h-4 w-1.5 rounded-sm bg-current opacity-75" />
      <span className="h-5.5 w-1.5 rounded-sm bg-current" />
    </div>
  );
}