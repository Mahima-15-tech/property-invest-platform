import React from "react";
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
        </Card>

      </div>

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
        </Card>

      </div>

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
              </TableRow>
            </TableHeader>

            <TableBody>
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
      </Card>

    </div>
  );
}