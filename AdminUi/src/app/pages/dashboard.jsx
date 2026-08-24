import React from "react";
import { KPICard } from "../components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { StatusBadge } from "../components/status-badge";
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
  DollarSign,
  TrendingUp,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const kpiData = [
  {
    title: "Total Asset Value",
    value: "124.5M",
    change: 12.5,
    data: [{ value: 100 }, { value: 110 }, { value: 105 }, { value: 115 }, { value: 120 }, { value: 125 }],
    prefix: "$",
  },
  {
    title: "Active Funding",
    value: "8.2M",
    change: 8.3,
    data: [{ value: 80 }, { value: 82 }, { value: 85 }, { value: 83 }, { value: 86 }, { value: 88 }],
    prefix: "$",
  },
  {
    title: "Revenue",
    value: "1.24M",
    change: 15.2,
    data: [{ value: 100 }, { value: 105 }, { value: 110 }, { value: 115 }, { value: 118 }, { value: 124 }],
    prefix: "$",
  },
  {
    title: "Conversion Rate",
    value: "3.2",
    change: 2.1,
    data: [{ value: 2.8 }, { value: 2.9 }, { value: 3.0 }, { value: 3.1 }, { value: 3.15 }, { value: 3.2 }],
    suffix: "%",
  },
  {
    title: "Pending KYC",
    value: "24",
    change: -5.2,
    data: [{ value: 30 }, { value: 28 }, { value: 26 }, { value: 27 }, { value: 25 }, { value: 24 }],
  },
  {
    title: "Broker Payouts",
    value: "182K",
    change: 18.7,
    data: [{ value: 140 }, { value: 150 }, { value: 160 }, { value: 165 }, { value: 175 }, { value: 182 }],
    prefix: "$",
  },
];

const fundingProgress = [
  {
    id: 1,
    name: "Manhattan Tower Residences",
    location: "New York, NY",
    value: "$12.5M",
    raised: "$10.2M",
    progress: 82,
    status: "funding",
  },
  {
    id: 2,
    name: "Bayview Luxury Apartments",
    location: "San Francisco, CA",
    value: "$8.3M",
    raised: "$5.8M",
    progress: 70,
    status: "funding",
  },
  {
    id: 3,
    name: "Downtown Business Plaza",
    location: "Chicago, IL",
    value: "$15.2M",
    raised: "$14.1M",
    progress: 93,
    status: "funding",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "New property listing",
    description: "Sunset Boulevard Complex added by John Doe",
    time: "2 minutes ago",
  },
  {
    id: 2,
    action: "KYC Approved",
    description: "Sarah Johnson's verification completed",
    time: "15 minutes ago",
  },
  {
    id: 3,
    action: "Investment made",
    description: "Michael Chen invested $50,000 in Marina Bay",
    time: "1 hour ago",
  },
  {
    id: 4,
    action: "Broker payout",
    description: "$2,500 commission paid to Alex Turner",
    time: "2 hours ago",
  },
  {
    id: 5,
    action: "Property funded",
    description: "Harbor View Condos reached 100% funding",
    time: "3 hours ago",
  },
];

const monthlyData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 61000 },
  { month: "Apr", revenue: 58000 },
  { month: "May", revenue: 67000 },
  { month: "Jun", revenue: 74000 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your platform overview.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          View Full Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" />
                <XAxis dataKey="month" stroke="#717182" />
                <YAxis stroke="#717182" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0A2540" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            {recentActivity.map((a) => (
              <div key={a.id} className="flex gap-3 border-b pb-3 mb-3 last:border-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="font-medium">{a.action}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* Funding */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Active Funding Properties</CardTitle>
          <Button variant="outline" size="sm">
            <Building2 className="mr-2 h-4 w-4" />
            View All
          </Button>
        </CardHeader>

        <CardContent>
          {fundingProgress.map((p) => (
            <div key={p.id} className="mb-6">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.location}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>{p.raised} / {p.value}</span>
                  <span>{p.progress}%</span>
                </div>
                <Progress value={p.progress} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Building2 /> Add Property
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <Users /> Review KYC
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <DollarSign /> Process Payout
          </Button>

          <Button variant="outline" className="h-20 flex-col gap-2">
            <TrendingUp /> Reports
          </Button>

        </CardContent>
      </Card>

    </div>
  );
}