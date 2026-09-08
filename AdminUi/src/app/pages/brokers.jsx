import React, { useEffect, useMemo, useState } from "react";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { StatusBadge } from "../components/status-badge";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Users,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PieChart as PieIcon,
  BarChart3,
  Search,
  DollarSign,
  UserRound,
  ArrowUpRight,
  WalletCards,
  RefreshCw,
  CircleDollarSign,
} from "lucide-react";

import {
  getBrokers,
  getCommissionBreakdown,
} from "../../api/broker";

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-xl">
      <p className="mb-1 text-[11px] font-medium text-slate-400">
        {label}
      </p>

      <p className="text-sm font-bold text-white">
        ₹{Number(payload[0].value || 0).toLocaleString()}
      </p>

      <p className="mt-0.5 text-[10px] text-emerald-400">
        Commission earnings
      </p>
    </div>
  );
};

/* =========================================================
   BROKER AVATAR
========================================================= */

const BrokerAvatar = ({ name }) => {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "B";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
      {initials}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commissionBreakdown, setCommissionBreakdown] =
    useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 6;

  /* =======================================================
     FETCH DATA
  ======================================================= */

  useEffect(() => {
    fetchBrokersData();
  }, []);

  const fetchBrokersData = async () => {
    try {
      setLoading(true);

      const [brokersRes, breakdownRes] =
        await Promise.all([
          getBrokers(),
          getCommissionBreakdown(),
        ]);

      if (brokersRes?.data) {
        setBrokers(brokersRes.data);
      }

      if (breakdownRes?.data) {
        const {
          sale,
          referral,
          performance,
          total,
        } = breakdownRes.data;

        setCommissionBreakdown([
          {
            name: "Property Sales",
            value: sale || 0,
            percent: total
              ? (sale / total) * 100
              : 0,
            color: "#2563eb",
          },
          {
            name: "Referral Bonus",
            value: referral || 0,
            percent: total
              ? (referral / total) * 100
              : 0,
            color: "#10b981",
          },
          {
            name: "Performance",
            value: performance || 0,
            percent: total
              ? (performance / total) * 100
              : 0,
            color: "#f59e0b",
          },
        ]);
      }
    } catch (err) {
      console.error(
        "Error fetching broker data:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredBrokers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
  
    // Copy brokers array so original state is not mutated
    let result = [...brokers];
  
    // SEARCH FILTER
    if (search) {
      result = result.filter((broker) => {
        return (
          broker.name?.toLowerCase().includes(search) ||
          broker.email?.toLowerCase().includes(search) ||
          broker.status?.toLowerCase().includes(search)
        );
      });
    }
  
    // NEWEST REGISTERED BROKER FIRST
    result.sort((a, b) => {
      const dateA = new Date(
        a.createdAt || a.registeredAt || 0
      ).getTime();
  
      const dateB = new Date(
        b.createdAt || b.registeredAt || 0
      ).getTime();
  
      return dateB - dateA;
    });
  
    return result;
  }, [brokers, searchTerm]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.ceil(
      filteredBrokers.length / itemsPerPage
    ) || 1;

  const currentBrokers = useMemo(() => {
    const start =
      (currentPage - 1) * itemsPerPage;

    return filteredBrokers.slice(
      start,
      start + itemsPerPage
    );
  }, [
    filteredBrokers,
    currentPage,
  ]);

  const paginate = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      setCurrentPage(pageNumber);
    }
  };

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalReferrals = brokers.reduce(
    (sum, broker) =>
      sum + Number(broker.referrals || 0),
    0
  );

  const totalConversions = brokers.reduce(
    (sum, broker) =>
      sum + Number(broker.conversions || 0),
    0
  );

  const totalEarnings = brokers.reduce(
    (sum, broker) =>
      sum + Number(broker.earnings || 0),
    0
  );

  const conversionRate =
    totalReferrals > 0
      ? (
          (totalConversions /
            totalReferrals) *
          100
        ).toFixed(1)
      : "0.0";

  /* =======================================================
     CHART DATA
  ======================================================= */

  const earningsData = brokers.map(
    (broker, index) => ({
      month:
        broker.name
          ?.split(" ")
          .slice(0, 2)
          .join(" ") ||
        `Broker ${index + 1}`,
      earnings:
        Number(broker.earnings || 0),
    })
  );

  /* =======================================================
     PAGE RANGE
  ======================================================= */

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages = [1];

    if (currentPage > 3) {
      pages.push("left-dots");
    }

    const start = Math.max(
      2,
      currentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (currentPage < totalPages - 2) {
      pages.push("right-dots");
    }

    pages.push(totalPages);

    return pages;
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50/70">
        <div className="flex min-h-[70vh] flex-col items-center justify-center">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading broker dashboard
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fetching partner performance data...
          </p>

        </div>
      </div>
    );
  }

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50/70 px-1 py-1 text-slate-900">

      <div className="mx-auto max-w-7xl space-y-6 pb-10">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Users className="h-4 w-4 text-blue-600" />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                Partner Operations
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Brokers
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Monitor broker activity, conversions,
              commission earnings and partner performance.
            </p>

          </div>

          <Button
            onClick={fetchBrokersData}
            variant="outline"
            className="h-10 w-fit rounded-xl border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Refresh Data
          </Button>

        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL BROKERS */}

          <Card className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

            <div className="p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Brokers
                  </p>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                    {brokers.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>

              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-blue-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Active network partners
              </div>

            </div>

            <div className="h-1 bg-blue-500/80" />

          </Card>

          {/* REFERRALS */}

          <Card className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

            <div className="p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Referrals
                  </p>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                    {totalReferrals.toLocaleString()}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>

              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Leads generated
              </div>

            </div>

            <div className="h-1 bg-emerald-500/80" />

          </Card>

          {/* CONVERSIONS */}

          <Card className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

            <div className="p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Conversions
                  </p>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                    {totalConversions.toLocaleString()}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Award className="h-5 w-5" />
                </div>

              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
                <TrendingUp className="h-3.5 w-3.5" />
                {conversionRate}% referral conversion
              </div>

            </div>

            <div className="h-1 bg-amber-500/80" />

          </Card>

          {/* EARNINGS */}

          <Card className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

            <div className="p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Earnings
                  </p>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                    ₹
                    {totalEarnings >= 100000
                      ? `${(
                          totalEarnings / 100000
                        ).toFixed(1)}L`
                      : totalEarnings.toLocaleString()}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <CircleDollarSign className="h-5 w-5" />
                </div>

              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-violet-600">
                <WalletCards className="h-3.5 w-3.5" />
                Total commission
              </div>

            </div>

            <div className="h-1 bg-violet-500/80" />

          </Card>

        </div>

        {/* =================================================
            CHARTS
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

          {/* EARNINGS */}

          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Broker Earnings
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Commission comparison across partners
                  </p>
                </div>

              </div>

              <span className="w-fit rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Performance
              </span>

            </div>

            <div className="h-[300px] w-full px-3 pb-4 pt-5 sm:px-5">

              {earningsData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={earningsData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eef2f7"
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
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 10,
                      }}
                      tickFormatter={(value) =>
                        value >= 1000
                          ? `₹${(
                              value / 1000
                            ).toFixed(0)}k`
                          : `₹${value}`
                      }
                    />

                    <Tooltip
                      cursor={{
                        fill: "#f8fafc",
                      }}
                      content={
                        <CustomTooltip />
                      }
                    />

                    <Bar
                      dataKey="earnings"
                      fill="#2563eb"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                      barSize={34}
                    />

                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-slate-200" />
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    No earnings data available
                  </p>
                </div>
              )}

            </div>

          </Card>

          {/* COMMISSION BREAKDOWN */}

          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                  <PieIcon className="h-4 w-4 text-violet-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Commission Breakdown
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Distribution by commission type
                  </p>
                </div>

              </div>

            </div>

            <div className="flex flex-col">

              <div className="relative h-[205px]">

                {commissionBreakdown.some(
                  (item) =>
                    Number(item.value) > 0
                ) ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>

                      <Pie
                        data={commissionBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={54}
                        outerRadius={78}
                        paddingAngle={4}
                        strokeWidth={0}
                      >

                        {commissionBreakdown.map(
                          (
                            entry,
                            index
                          ) => (
                            <Cell
                              key={index}
                              fill={
                                entry.color
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip />

                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <PieIcon className="mx-auto h-8 w-8 text-slate-200" />
                      <p className="mt-2 text-xs text-slate-400">
                        No commission data
                      </p>
                    </div>
                  </div>
                )}

              </div>

              <div className="space-y-2 border-t border-slate-100 px-5 py-4">

                {commissionBreakdown.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >

                      <div className="flex items-center gap-2.5">

                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              item.color,
                          }}
                        />

                        <span className="text-xs font-medium text-slate-600">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-xs font-bold text-slate-800">
                        {item.percent
                          ? item.percent.toFixed(
                              0
                            )
                          : 0}
                        %
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>

          </Card>

        </div>

        {/* =================================================
            BROKER TABLE
        ================================================= */}

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <UserRound className="h-4 w-4 text-emerald-600" />
              </div>

              <div>

                <h2 className="text-sm font-bold text-slate-900">
                  Registered Brokers
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Partner performance overview
                </p>

              </div>

            </div>

            <div className="relative w-full sm:w-72">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search brokers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <Table>

              <TableHeader>

                <TableRow className="border-slate-100 bg-slate-50/60 hover:bg-slate-50/60">

                  <TableHead className="h-11 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Broker
                  </TableHead>

                  <TableHead className="h-11 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Referrals
                  </TableHead>

                  <TableHead className="h-11 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Conversions
                  </TableHead>

                  <TableHead className="h-11 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Earnings
                  </TableHead>

                  <TableHead className="h-11 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Commission
                  </TableHead>

                  <TableHead className="h-11 pr-5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {currentBrokers.length > 0 ? (
                  currentBrokers.map(
                    (broker) => (
                      <TableRow
                        key={
                          broker._id ||
                          broker.id
                        }
                        className="border-slate-100 transition-colors hover:bg-slate-50/70"
                      >

                        {/* BROKER */}

                        <TableCell className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <BrokerAvatar
                              name={
                                broker.name
                              }
                            />

                            <div className="min-w-0">

                              <p className="truncate text-xs font-bold text-slate-900">
                                {broker.name ||
                                  "N/A"}
                              </p>

                              {broker.email && (
                                <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-400">
                                  {
                                    broker.email
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                        </TableCell>

                        {/* REFERRALS */}

                        <TableCell className="text-center">

                          <span className="inline-flex min-w-[34px] items-center justify-center rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                            {broker.referrals ||
                              0}
                          </span>

                        </TableCell>

                        {/* CONVERSIONS */}

                        <TableCell className="text-center">

                          <span className="inline-flex min-w-[34px] items-center justify-center rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                            {broker.conversions ||
                              0}
                          </span>

                        </TableCell>

                        {/* EARNINGS */}

                        <TableCell>

                          <div className="flex items-center gap-1.5">

                            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />

                            <span className="text-xs font-bold text-slate-800">
                              ₹
                              {Number(
                                broker.earnings ||
                                  0
                              ).toLocaleString()}
                            </span>

                          </div>

                        </TableCell>

                        {/* COMMISSION */}

                        <TableCell>

                          <span className="rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                            {broker.commissionRate ||
                              "N/A"}
                            {broker.commissionRate
                              ? ""
                              : ""}
                          </span>

                        </TableCell>

                        {/* STATUS */}

                        <TableCell className="pr-5 text-right">

                          <StatusBadge
                            status={
                              broker.status ||
                              "active"
                            }
                          />

                        </TableCell>

                      </TableRow>
                    )
                  )
                ) : (
                  <TableRow>

                    <TableCell
                      colSpan={6}
                      className="py-16 text-center"
                    >

                      <div className="mx-auto flex max-w-sm flex-col items-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                          <Search className="h-5 w-5 text-slate-400" />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No brokers found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try changing your search criteria.
                        </p>

                      </div>

                    </TableCell>

                  </TableRow>
                )}

              </TableBody>

            </Table>

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <p className="text-[11px] text-slate-500">

              Showing{" "}

              <span className="font-bold text-slate-800">
                {filteredBrokers.length > 0
                  ? (currentPage - 1) *
                      itemsPerPage +
                    1
                  : 0}
              </span>

              {" "}to{" "}

              <span className="font-bold text-slate-800">
                {Math.min(
                  currentPage *
                    itemsPerPage,
                  filteredBrokers.length
                )}
              </span>

              {" "}of{" "}

              <span className="font-bold text-slate-800">
                {filteredBrokers.length}
              </span>

              {" "}brokers

            </p>

            <div className="flex items-center gap-1">

              {/* PREVIOUS */}

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  paginate(
                    currentPage - 1
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="h-9 w-9 rounded-lg border-slate-200 bg-white text-slate-500 shadow-none hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* PAGE NUMBERS */}

              {getPageNumbers().map(
                (page, index) => {

                  if (
                    page ===
                    "left-dots"
                  ) {
                    return (
                      <span
                        key={`left-${index}`}
                        className="flex h-9 min-w-7 items-center justify-center px-1 text-xs font-bold text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }

                  if (
                    page ===
                    "right-dots"
                  ) {
                    return (
                      <span
                        key={`right-${index}`}
                        className="flex h-9 min-w-7 items-center justify-center px-1 text-xs font-bold text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      onClick={() =>
                        paginate(page)
                      }
                      className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold shadow-none transition ${
                        currentPage ===
                        page
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                }
              )}

              {/* NEXT */}

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  paginate(
                    currentPage + 1
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="h-9 w-9 rounded-lg border-slate-200 bg-white text-slate-500 shadow-none hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

            </div>

          </div>

        </Card>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">

          <ShieldCheckIcon />

          <span>
            Broker performance data is calculated from
            recorded platform activity.
          </span>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   SMALL FOOTER ICON
========================================================= */

function ShieldCheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-300"
    >
      <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}