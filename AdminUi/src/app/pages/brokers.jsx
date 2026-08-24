<<<<<<< HEAD
import React from "react";
=======
import React, { useEffect, useState } from "react";
>>>>>>> backup-local
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
<<<<<<< HEAD
  Legend,
} from "recharts";
import { DollarSign, Users, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { getBrokers } from "../../api/broker";
import { getCommissionBreakdown } from "../../api/broker";


/* ------------------ DATA ------------------ */




/* ------------------ COMPONENT ------------------ */

export function Brokers() {
  const [brokers, setBrokers] = useState([]);
const [loading, setLoading] = useState(false);
const [commissionBreakdown, setCommissionBreakdown] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const currentBrokers = brokers.slice(indexOfFirst, indexOfLast);
// const [breakdown, setBreakdown] = useState([]);
const totalPages = Math.ceil(brokers.length / itemsPerPage);

const paginate = (pageNumber) => {
  setCurrentPage(pageNumber);
};

useEffect(() => {
  fetchBrokers();
  fetchBreakdown(); 
}, []);

const fetchBrokers = async () => {
  try {
    setLoading(true);
    const res = await getBrokers();
    setBrokers(res.data);
    
    // ✅ correct
    const total = res.data.reduce((sum, b) => sum + b.earnings, 0);
    
    const fetchBreakdown = async () => {
      const res = await getCommissionBreakdown();
    
      const { sale, referral, performance, total } = res.data;
    
      setCommissionBreakdown([
        {
          name: "Property Sales",
          value: sale,
          percent: total ? (sale / total) * 100 : 0,
          color: "#0A2540",
        },
        {
          name: "Referral Bonus",
          value: referral,
          percent: total ? (referral / total) * 100 : 0,
          color: "#00C48C",
        },
        {
          name: "Performance",
          value: performance,
          percent: total ? (performance / total) * 100 : 0,
          color: "#FFB020",
        },
      ]);
    };

  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};
const earningsData = brokers.map((b, i) => ({
  month: `B${i + 1}`,
  earnings: b.earnings,
}));

// const commissionBreakdown = [
//   { name: "Property Sales", value: 68, color: "#0A2540" },
//   { name: "Referral Bonus", value: 22, color: "#00C48C" },
//   { name: "Performance", value: 10, color: "#FFB020" },
// ];

const fetchBreakdown = async () => {
  try {
    const res = await getCommissionBreakdown();

    const { sale, referral, performance, total } = res.data;

    setCommissionBreakdown([
      {
        name: "Property Sales",
        value: sale,
        percent: total ? (sale / total) * 100 : 0,
        color: "#0A2540",
      },
      {
        name: "Referral Bonus",
        value: referral,
        percent: total ? (referral / total) * 100 : 0,
        color: "#00C48C",
      },
      {
        name: "Performance",
        value: performance,
        percent: total ? (performance / total) * 100 : 0,
        color: "#FFB020",
      },
    ]);
  } catch (err) {
    console.log("Breakdown error:", err);
  }
};


  const totalReferrals = brokers.reduce((sum, b) => sum + b.referrals, 0);
  const totalConversions = brokers.reduce((sum, b) => sum + b.conversions, 0);
  const totalEarnings = brokers.reduce(
    (sum, b) => sum + b.earnings,
    0
  );
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Brokers</h1>
        <p className="text-muted-foreground mt-1">
          Manage broker performance and commissions
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Users className="text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Brokers</p>
              <p className="text-2xl font-semibold">{brokers.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <TrendingUp className="text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-semibold">{totalReferrals}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Award className="text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="text-2xl font-semibold">{totalConversions}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <DollarSign className="text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-semibold">
                ${(totalEarnings / 1000).toFixed(0)}K
              </p>
            </div>
          </CardContent>
=======
} from "recharts";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  PieChart as PieIcon,
  BarChart3,
  Search
} from "lucide-react";
import { getBrokers, getCommissionBreakdown } from "../../api/broker";

/* ------------------ CUSTOM TOOLTIP COMPONENTS ------------------ */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-300">{label}</p>
        <p className="font-mono text-emerald-400 font-bold">
          Earnings: ₹{payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

/* ------------------ MAIN COMPONENT ------------------ */
export function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commissionBreakdown, setCommissionBreakdown] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  const itemsPerPage = 6;

  useEffect(() => {
    fetchBrokersData();
  }, []);

  const fetchBrokersData = async () => {
    try {
      setLoading(true);
      const [brokersRes, breakdownRes] = await Promise.all([
        getBrokers(),
        getCommissionBreakdown()
      ]);

      if (brokersRes?.data) {
        setBrokers(brokersRes.data);
      }

      if (breakdownRes?.data) {
        const { sale, referral, performance, total } = breakdownRes.data;
        setCommissionBreakdown([
          {
            name: "Property Sales",
            value: sale || 0,
            percent: total ? (sale / total) * 100 : 0,
            color: "#2563eb", // Blue
          },
          {
            name: "Referral Bonus",
            value: referral || 0,
            percent: total ? (referral / total) * 100 : 0,
            color: "#10b981", // Emerald
          },
          {
            name: "Performance",
            value: performance || 0,
            percent: total ? (performance / total) * 100 : 0,
            color: "#f59e0b", // Amber
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching broker data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Brokers based on search input
  const filteredBrokers = brokers.filter((b) =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBrokers = filteredBrokers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBrokers.length / itemsPerPage) || 1;

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Chart & Summary Calculations
  const earningsData = brokers.map((b, i) => ({
    month: b.name ? b.name.split(" ")[0] : `Broker ${i + 1}`,
    earnings: b.earnings || 0,
  }));

  const totalReferrals = brokers.reduce((sum, b) => sum + (b.referrals || 0), 0);
  const totalConversions = brokers.reduce((sum, b) => sum + (b.conversions || 0), 0);
  const totalEarnings = brokers.reduce((sum, b) => sum + (b.earnings || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Broker Performance Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans text-slate-900">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
            <Users className="w-3.5 h-3.5" /> Partner Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Brokers Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track partner conversions, payouts, and commission distribution.
          </p>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Brokers */}
        <Card className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Brokers</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-950 font-mono">{brokers.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Active network partners</p>
          </div>
        </Card>

        {/* Total Referrals */}
        <Card className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Referrals</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-950 font-mono">{totalReferrals}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Lead volume generated</p>
          </div>
        </Card>

        {/* Conversions */}
        <Card className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversions</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-950 font-mono">{totalConversions}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Successful deals closed</p>
          </div>
        </Card>

        {/* Total Earnings */}
        <Card className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white hover:border-slate-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earnings</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-950 font-mono">
              ₹{totalEarnings >= 100000 ? `${(totalEarnings / 100000).toFixed(1)}L` : totalEarnings.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Total commission paid</p>
          </div>
>>>>>>> backup-local
        </Card>

      </div>

<<<<<<< HEAD
      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#00C48C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PIE CHART */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={commissionBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    label={({ percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {commissionBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* LIST */}
            <div className="mt-4 space-y-2">
              {commissionBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{item.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
=======
      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BAR CHART: Broker Earnings */}
        <Card className="lg:col-span-2 p-6 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Broker Earnings Comparison</h2>
            </div>
            <span className="text-xs font-medium text-slate-400">Top Performers</span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 11 }} 
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="earnings" 
                  fill="#2563eb" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* PIE CHART: Commission Breakdown */}
        <Card className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Commission Breakdown</h2>
          </div>

          <div className="h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={commissionBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {commissionBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* CUSTOM LEGEND / LIST */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {commissionBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  {item.percent ? item.percent.toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
>>>>>>> backup-local
        </Card>

      </div>

<<<<<<< HEAD
      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>All Brokers</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
=======
      {/* BROKERS DATA TABLE */}
      <Card className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-4">
        
        {/* TABLE HEADER & SEARCH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Registered Brokers</h2>
            <p className="text-xs text-slate-500">Detailed overview of partner metrics</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search broker..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* TABLE COMPONENT */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-500">Broker Name</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 text-center">Referrals</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 text-center">Conversions</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Total Earnings</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Commission Rate</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 text-right">Status</TableHead>
>>>>>>> backup-local
              </TableRow>
            </TableHeader>

            <TableBody>
<<<<<<< HEAD
              {currentBrokers.map((broker) => (
            <TableRow key={broker._id}>
                  <TableCell className="font-medium">
                    {broker.name}
                  </TableCell>
                  <TableCell>{broker.referrals}</TableCell>
                  <TableCell>{broker.conversions}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                  ₹ {broker.earnings}
                  </TableCell>
                  <TableCell>{broker.commissionRate}</TableCell>
                  <TableCell>
                    <StatusBadge status={broker.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>

          <div className="flex items-center justify-between mt-6 flex-wrap gap-4">

{/* LEFT INFO */}
<div className="text-sm text-muted-foreground">
  Showing {indexOfFirst + 1}–
  {Math.min(indexOfLast, brokers.length)} of {brokers.length}
</div>

{/* PAGINATION */}
<div className="flex items-center gap-2">

  {/* PREV */}
  <button
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
    className={`px-3 py-1 rounded-lg border text-sm transition
      ${currentPage === 1
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-muted"}`}
  >
    ←
  </button>

  {/* PAGE NUMBERS */}
  {[...Array(totalPages)].map((_, i) => {
    const page = i + 1;
    return (
      <button
        key={page}
        onClick={() => paginate(page)}
        className={`px-3 py-1 rounded-lg text-sm transition
          ${
            currentPage === page
              ? "bg-primary text-white shadow-md"
              : "hover:bg-muted border"
          }`}
      >
        {page}
      </button>
    );
  })}

  {/* NEXT */}
  <button
    onClick={() => paginate(currentPage + 1)}
    disabled={currentPage === totalPages}
    className={`px-3 py-1 rounded-lg border text-sm transition
      ${currentPage === totalPages
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-muted"}`}
  >
    →
  </button>

</div>
</div>
        </CardContent>
=======
              {currentBrokers.length > 0 ? (
                currentBrokers.map((broker) => (
                  <TableRow key={broker._id || broker.id} className="border-slate-100 hover:bg-slate-50/60 transition">
                    <TableCell className="font-semibold text-xs text-slate-900 py-3.5">
                      {broker.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono text-center">
                      {broker.referrals || 0}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono text-center">
                      {broker.conversions || 0}
                    </TableCell>
                    <TableCell className="text-xs font-bold font-mono text-emerald-600">
                      ₹{broker.earnings?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600 font-mono">
                      {broker.commissionRate || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={broker.status || "active"} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    No brokers found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
          
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredBrokers.length > 0 ? indexOfFirst + 1 : 0}</span> to{" "}
            <span className="font-semibold text-slate-800">{Math.min(indexOfLast, filteredBrokers.length)}</span> of{" "}
            <span className="font-semibold text-slate-800">{filteredBrokers.length}</span> brokers
          </p>

          <div className="flex items-center gap-1.5">
            {/* PREVIOUS */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* NUMERIC PAGE BUTTONS */}
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`h-8 w-8 text-xs rounded-lg font-mono transition ${
                    currentPage === page
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                      : "bg-transparent text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </Button>
              );
            })}

            {/* NEXT */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

        </div>

>>>>>>> backup-local
      </Card>

    </div>
  );
}