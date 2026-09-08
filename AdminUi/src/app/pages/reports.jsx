import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  LuIndianRupee,
  LuBuilding2,
  LuUsers,
  LuPercent,
  LuWalletCards,
  LuTrendingUp,
  LuRefreshCw,
  LuDownload,
  LuCircleCheck,
  LuActivity,
  LuArrowUpRight,
  LuChartNoAxesCombined,
} from "react-icons/lu";

import { getReports } from "../../api/report";

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value) => {
  const amount = Number(value || 0);

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

const formatFullCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const formatPercent = (value) => {
  return `${Number(value || 0).toFixed(1)}%`;
};

const getStatusStyles = (status) => {
  switch (status) {
    case "funded":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "funding":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "available":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "funded":
      return "Funded";

    case "funding":
      return "Active Funding";

    case "available":
      return "Available";

    default:
      return status || "Unknown";
  }
};

// ============================================================
// TOOLTIP
// ============================================================

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="min-w-[190px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-3 text-xs font-bold text-slate-500">{label}</p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center justify-between gap-6 py-1 text-sm"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  item.dataKey === "revenue"
                    ? "#10b981"
                    : "#3b82f6",
              }}
            />

            <span className="text-slate-600">
              {item.dataKey === "revenue"
                ? "Revenue"
                : "Investment Volume"}
            </span>
          </div>

          <span className="font-bold text-slate-900">
            {formatFullCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const FundingTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="min-w-[160px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-3 text-xs font-bold text-slate-500">{label}</p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center justify-between gap-6 py-1 text-sm"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  item.dataKey === "funded"
                    ? "#10b981"
                    : "#3b82f6",
              }}
            />

            <span className="capitalize text-slate-600">
              {item.dataKey}
            </span>
          </div>

          <span className="font-bold text-slate-900">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const GrowthTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="min-w-[170px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-3 text-xs font-bold text-slate-500">{label}</p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center justify-between gap-6 py-1 text-sm"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  item.dataKey === "investors"
                    ? "#8b5cf6"
                    : "#f59e0b",
              }}
            />

            <span className="capitalize text-slate-600">
              {item.dataKey}
            </span>
          </div>

          <span className="font-bold text-slate-900">
            {formatNumber(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// KPI CARD
// ============================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) {
  const colorConfig = {
    blue: {
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      circle: "bg-blue-50",
      accent: "bg-blue-500",
    },

    emerald: {
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      circle: "bg-emerald-50",
      accent: "bg-emerald-500",
    },

    violet: {
      iconBg: "bg-violet-50",
      iconText: "text-violet-600",
      circle: "bg-violet-50",
      accent: "bg-violet-500",
    },

    amber: {
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
      circle: "bg-amber-50",
      accent: "bg-amber-500",
    },
  };

  const theme = colorConfig[color] || colorConfig.blue;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${theme.circle} opacity-80 transition-transform duration-500 group-hover:scale-125`}
      />

      <div
        className={`absolute bottom-0 left-0 top-0 w-1 ${theme.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>

            <h3 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </h3>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
          >
            <Icon size={19} />
          </div>
        </div>

        {subtitle && (
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <LuArrowUpRight
              size={14}
              className={theme.iconText}
            />

            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LOADING CARD
// ============================================================

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-7 w-32 rounded bg-slate-200" />
        </div>

        <div className="h-10 w-10 rounded-xl bg-slate-200" />
      </div>

      <div className="mt-4 h-3 w-28 rounded bg-slate-200" />
    </div>
  );
}

// ============================================================
// EMPTY CHART
// ============================================================

function EmptyChart({ text = "No data available" }) {
  return (
    <div className="flex h-[320px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <LuChartNoAxesCombined size={22} />
        </div>

        <p className="text-sm font-medium text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function Reports() {
  const [period, setPeriod] = useState("6months");

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // FETCH REPORT
  // ==========================================================

  const fetchReports = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getReports(period);

      const data = response?.data || response;

      if (!data) {
        throw new Error("No report data received");
      }

      setReport(data);
    } catch (error) {
      console.error("REPORT FETCH ERROR:", error);

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Unable to load reports"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  // ==========================================================
  // DATA
  // ==========================================================

  const summary = report?.summary || {};

  const revenueData = report?.revenueData || [];

  const fundingData = report?.fundingData || [];

  const growthData = report?.growthData || [];

  const propertyPerformance =
    report?.propertyPerformance || [];

  // ==========================================================
  // EXPORT
  // ==========================================================

  const exportReport = () => {
    if (!report) {
      toast.error("Report data is not available");
      return;
    }

    try {
      const rows = [];

      rows.push([
        "REPORT SUMMARY",
        "",
      ]);

      rows.push([
        "Period",
        report.period || period,
      ]);

      rows.push([
        "Total Revenue",
        summary.totalRevenue || 0,
      ]);

      rows.push([
        "Investment Volume",
        summary.investmentVolume || 0,
      ]);

      rows.push([
        "Properties Funded",
        summary.fundedProperties || 0,
      ]);

      rows.push([
        "New Investors",
        summary.newInvestors || 0,
      ]);

      rows.push([
        "Average ROI",
        summary.avgROI || 0,
      ]);

      rows.push([
        "Active Properties",
        summary.activeProperties || 0,
      ]);

      rows.push([
        "Total Investors",
        summary.totalInvestors || 0,
      ]);

      rows.push([
        "Conversion Rate",
        summary.conversionRate || 0,
      ]);

      rows.push([]);

      rows.push([
        "MONTHLY REVENUE",
      ]);

      rows.push([
        "Month",
        "Revenue",
        "Investment Volume",
      ]);

      revenueData.forEach((item) => {
        rows.push([
          item.month,
          item.revenue || 0,
          item.investmentVolume || 0,
        ]);
      });

      rows.push([]);

      rows.push([
        "FUNDING ACTIVITY",
      ]);

      rows.push([
        "Month",
        "Funded",
        "Active",
      ]);

      fundingData.forEach((item) => {
        rows.push([
          item.month,
          item.funded || 0,
          item.active || 0,
        ]);
      });

      rows.push([]);

      rows.push([
        "PLATFORM GROWTH",
      ]);

      rows.push([
        "Month",
        "Investors",
        "Properties",
      ]);

      growthData.forEach((item) => {
        rows.push([
          item.month,
          item.investors || 0,
          item.properties || 0,
        ]);
      });

      rows.push([]);

      rows.push([
        "PROPERTY PERFORMANCE",
      ]);

      rows.push([
        "Property",
        "Total Value",
        "Invested Amount",
        "Funding %",
        "Investors",
        "ROI",
        "Status",
      ]);

      propertyPerformance.forEach((property) => {
        rows.push([
          property.name || "",
          property.totalValue || 0,
          property.investedAmount || 0,
          property.fundedPercent || 0,
          property.investors || 0,
          property.roi || 0,
          property.status || "",
        ]);
      });

      const csv = rows
        .map((row) =>
          row
            .map((cell) => {
              const value = String(cell ?? "");

              if (
                value.includes(",") ||
                value.includes('"') ||
                value.includes("\n")
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }

              return value;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `property-invest-report-${period}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("EXPORT REPORT ERROR:", error);

      toast.error("Unable to export report");
    }
  };

  // ==========================================================
  // TOP PROPERTY
  // ==========================================================

  const topProperty = useMemo(() => {
    if (!propertyPerformance.length) {
      return null;
    }

    return propertyPerformance[0];
  }, [propertyPerformance]);

  // ==========================================================
  // PERIOD LABEL
  // ==========================================================

  const periodLabel = useMemo(() => {
    switch (period) {
      case "1month":
        return "Last 1 Month";

      case "3months":
        return "Last 3 Months";

      case "1year":
        return "Last 1 Year";

      default:
        return "Last 6 Months";
    }
  }, [period]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <LuChartNoAxesCombined size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Reports & Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor platform performance and investment activity
              </p>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* PERIOD */}

            <div className="relative">

              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value)
                }
                className="h-10 min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:bg-slate-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                <option value="1month">
                  Last 1 Month
                </option>

                <option value="3months">
                  Last 3 Months
                </option>

                <option value="6months">
                  Last 6 Months
                </option>

                <option value="1year">
                  Last 1 Year
                </option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▾
              </span>

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => fetchReports(true)}
              disabled={loading || refreshing}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LuRefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            {/* EXPORT */}

            <button
              type="button"
              onClick={exportReport}
              disabled={loading || !report}
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LuDownload size={16} />

              Export Report
            </button>

          </div>
        </div>

        {/* ================================================== */}
        {/* PERIOD INFO */}
        {/* ================================================== */}

        {!loading && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <LuActivity size={14} />
              </div>

              <span>
                Showing data for{" "}
                <span className="font-semibold text-slate-700">
                  {periodLabel}
                </span>
              </span>

            </div>

            {topProperty && (
              <div className="flex items-center gap-2 text-xs text-slate-500">

                <span>Top property:</span>

                <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 font-semibold text-violet-700">
                  {topProperty.name}
                </span>

              </div>
            )}

          </div>
        )}

        {/* ================================================== */}
        {/* KPI CARDS */}
        {/* ================================================== */}

        {loading ? (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {Array.from({ length: 8 }).map(
              (_, index) => (
                <SkeletonCard key={index} />
              )
            )}

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary.totalRevenue)}
              subtitle="Platform revenue"
              icon={LuIndianRupee}
              color="emerald"
            />

            <StatCard
              title="Investment Volume"
              value={formatCurrency(summary.investmentVolume)}
              subtitle="Approved investments"
              icon={LuWalletCards}
              color="blue"
            />

            <StatCard
              title="Properties Funded"
              value={formatNumber(summary.fundedProperties)}
              subtitle="Fully funded properties"
              icon={LuCircleCheck}
              color="violet"
            />

            <StatCard
              title="New Investors"
              value={formatNumber(summary.newInvestors)}
              subtitle={periodLabel}
              icon={LuUsers}
              color="amber"
            />

            <StatCard
              title="Average ROI"
              value={formatPercent(summary.avgROI)}
              subtitle="Across active properties"
              icon={LuTrendingUp}
              color="emerald"
            />

            <StatCard
              title="Active Properties"
              value={formatNumber(summary.activeProperties)}
              subtitle="Currently funding"
              icon={LuBuilding2}
              color="blue"
            />

            <StatCard
              title="Total Investors"
              value={formatNumber(summary.totalInvestors)}
              subtitle="Registered investors"
              icon={LuUsers}
              color="violet"
            />

            <StatCard
              title="Conversion Rate"
              value={formatPercent(summary.conversionRate)}
              subtitle="Investor conversion"
              icon={LuPercent}
              color="amber"
            />

          </div>
        )}

        {/* ================================================== */}
        {/* REVENUE + FUNDING */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

          {/* ================================================= */}
          {/* REVENUE */}
          {/* ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

            <div className="border-b border-slate-100 px-5 py-5">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <LuIndianRupee size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Revenue & Investment Volume
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Monthly financial activity
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-4 text-xs">

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <span className="text-slate-500">
                      Revenue
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />

                    <span className="text-slate-500">
                      Investment Volume
                    </span>
                  </div>

                </div>

              </div>

            </div>

            <div className="p-5">

              {revenueData.length ? (

                <div className="h-[320px] w-full">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <AreaChart
                      data={revenueData}
                      margin={{
                        top: 10,
                        right: 5,
                        left: -10,
                        bottom: 0,
                      }}
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
                            stopColor="#10b981"
                            stopOpacity={0.22}
                          />

                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>

                        <linearGradient
                          id="investmentGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.14}
                          />

                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>

                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 11,
                        }}
                        tickFormatter={(value) =>
                          formatCurrency(value)
                        }
                      />

                      <Tooltip
                        content={<RevenueTooltip />}
                      />

                      <Area
                        type="monotone"
                        dataKey="investmentVolume"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#investmentGradient)"
                      />

                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#revenueGradient)"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </div>

              ) : (
                <EmptyChart />
              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* FUNDING */}
          {/* ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <LuBuilding2 size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Funding Activity
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Funded vs active properties
                  </p>
                </div>

              </div>

            </div>

            <div className="p-5">

              {fundingData.length ? (

                <div className="h-[320px] w-full">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={fundingData}
                      margin={{
                        top: 10,
                        right: 0,
                        left: -20,
                        bottom: 0,
                      }}
                      barGap={5}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 10,
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 10,
                        }}
                      />

                      <Tooltip
                        content={<FundingTooltip />}
                      />

                      <Bar
                        dataKey="active"
                        name="Active"
                        fill="#3b82f6"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={18}
                      />

                      <Bar
                        dataKey="funded"
                        name="Funded"
                        fill="#10b981"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={18}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              ) : (
                <EmptyChart />
              )}

            </div>

          </div>

        </div>

        {/* ================================================== */}
        {/* PLATFORM GROWTH */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <LuTrendingUp size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Platform Growth
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    New investors and properties added over time
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 text-xs">

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />

                  <span className="text-slate-500">
                    Investors
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />

                  <span className="text-slate-500">
                    Properties
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="p-5">

            {growthData.length ? (

              <div className="h-[320px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={growthData}
                    margin={{
                      top: 10,
                      right: 5,
                      left: -10,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      content={<GrowthTooltip />}
                    />

                    <Line
                      type="monotone"
                      dataKey="properties"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="investors"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            ) : (
              <EmptyChart />
            )}

          </div>

        </div>

        {/* ================================================== */}
        {/* PROPERTY PERFORMANCE */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <LuBuilding2 size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Property Performance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Top properties ranked by investment activity
                </p>
              </div>

            </div>

            {propertyPerformance.length > 0 && (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                Top {propertyPerformance.length}
              </span>
            )}

          </div>

          {propertyPerformance.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Property
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Total Value
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Invested
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Funding
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Investors
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      ROI
                    </th>

                    <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {propertyPerformance.map(
                    (property, index) => {

                      const fundedPercent = Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            property.fundedPercent || 0
                          )
                        )
                      );

                      return (
                        <tr
                          key={
                            property._id ||
                            index
                          }
                          className="transition-colors hover:bg-slate-50/70"
                        >

                          {/* PROPERTY */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                                {property.image ? (

                                  <img
                                    src={property.image}
                                    alt={
                                      property.name ||
                                      "Property"
                                    }
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display =
                                        "none";
                                    }}
                                  />

                                ) : (

                                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                                    <LuBuilding2
                                      size={20}
                                    />
                                  </div>

                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="max-w-[230px] truncate text-sm font-semibold text-slate-900">
                                  {property.name ||
                                    "Unnamed Property"}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Property #{index + 1}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* TOTAL VALUE */}

                          <td className="px-5 py-4">

                            <span className="text-sm font-semibold text-slate-800">
                              {formatCurrency(
                                property.totalValue
                              )}
                            </span>

                          </td>

                          {/* INVESTED */}

                          <td className="px-5 py-4">

                            <span className="text-sm font-semibold text-slate-800">
                              {formatCurrency(
                                property.investedAmount
                              )}
                            </span>

                          </td>

                          {/* FUNDING */}

                          <td className="px-5 py-4">

                            <div className="w-[150px]">

                              <div className="mb-1.5 flex items-center justify-between">

                                <span className="text-xs font-medium text-slate-500">
                                  Funding
                                </span>

                                <span className="text-xs font-bold text-blue-700">
                                  {fundedPercent.toFixed(
                                    0
                                  )}
                                  %
                                </span>

                              </div>

                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                                  style={{
                                    width: `${fundedPercent}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                          {/* INVESTORS */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-1.5">

                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                <LuUsers size={13} />
                              </div>

                              <span className="text-sm font-semibold text-slate-700">
                                {formatNumber(
                                  property.investors
                                )}
                              </span>

                            </div>

                          </td>

                          {/* ROI */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-1.5">

                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <LuTrendingUp size={13} />
                              </div>

                              <span className="text-sm font-bold text-emerald-700">
                                {formatPercent(
                                  property.roi
                                )}
                              </span>

                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusStyles(
                                property.status
                              )}`}
                            >
                              {getStatusLabel(
                                property.status
                              )}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="flex min-h-[240px] items-center justify-center px-5">

              <div className="text-center">

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <LuBuilding2 size={22} />
                </div>

                <h3 className="text-sm font-semibold text-slate-700">
                  No property data
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Property performance will appear here once data is available.
                </p>

              </div>

            </div>

          )}

        </div>

        {/* ================================================== */}
        {/* FOOTER INSIGHT */}
        {/* ================================================== */}

        {!loading && report && (

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <LuActivity size={17} />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Report updated
                </p>

                <p className="text-xs text-slate-500">
                  Data is dynamically calculated from your platform records.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >

              <LuRefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh data

            </button>

          </div>

        )}

      </div>
    </div>
  );
}