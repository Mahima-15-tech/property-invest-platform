import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
<<<<<<< HEAD
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Card } from "../components/ui/card";
import { StatusBadge } from "../components/status-badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Search, Filter, Download, Eye, Check, X } from "lucide-react";
import React from "react";
import { getInvestors, getInvestorDetails, updateKyc, exportInvestors } from "../../api/user";
import { toast } from "sonner";
import { approveInvestment, rejectInvestment } from "../../api/investment";

=======
import { Card } from "../components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import React from "react";
import { getInvestors, getInvestorDetails, updateKyc, exportInvestors } from "../../api/user";
import { toast } from "sonner";
import { approveInvestment, rejectInvestment, updateInvestment } from "../../api/investment";

// Premium Icons
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
  Calendar, 
  FileText, 
  CreditCard, 
  Landmark, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  PieChart
} from "lucide-react";
>>>>>>> backup-local

export function Investors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [investors, setInvestors] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [kycFilter, setKycFilter] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

=======
  const [loading, setLoading] = useState(true);
  const [kycFilter, setKycFilter] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [editedInvestment, setEditedInvestment] = useState({});

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
>>>>>>> backup-local

  const filteredInvestors = investors.filter((investor) => {
    const name = investor.name?.toLowerCase() || "";
    const email = investor.email?.toLowerCase() || "";
<<<<<<< HEAD
  
    const matchSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase());
  
    const matchKyc = kycFilter
      ? investor.kycStatus === kycFilter
      : true;
  
    return matchSearch && matchKyc;
  });

const currentInvestors = filteredInvestors;



useEffect(() => {
  fetchInvestors();
}, [page]);
  
  const fetchInvestors = async () => {
    const res = await getInvestors(page);
    setInvestors(res.data.data);
    setTotalPages(res.data.totalPages);
  };


=======

    const matchSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase());

    const matchKyc = kycFilter ? investor.kycStatus === kycFilter : true;

    return matchSearch && matchKyc;
  });

>>>>>>> backup-local
  const handleView = async (id) => {
    try {
      const res = await getInvestorDetails(id);
      setSelectedInvestor(res.data);
    } catch (err) {
<<<<<<< HEAD
      console.log(err);
=======
      console.error(err);
      toast.error("Could not fetch investor details");
>>>>>>> backup-local
    }
  };

  const handleKyc = async (id, status) => {
    try {
      await updateKyc(id, status);
<<<<<<< HEAD
      toast.success(`KYC ${status}`);
      fetchInvestors();
    } catch {
      toast.error("Failed");
=======
      toast.success(`KYC status updated to ${status}`);
      fetchInvestors();
      if (selectedInvestor?.user?._id === id) {
        handleView(id);
      }
    } catch {
      toast.error("Failed to update KYC status");
>>>>>>> backup-local
    }
  };

  const handleExport = async () => {
    try {
<<<<<<< HEAD
      const res = await exportInvestors();
  
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
  
      link.href = url;
      link.setAttribute("download", "investors.pdf");
  
      document.body.appendChild(link);
      link.click();
  
    } catch (err) {
      console.log(err);
=======
      toast.info("Generating PDF report...");
      const res = await exportInvestors();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "investors_report.pdf");
      document.body.appendChild(link);
      link.click();
      toast.success("Export downloaded successfully");
    } catch (err) {
      console.error(err);
>>>>>>> backup-local
      toast.error("Export failed");
    }
  };

<<<<<<< HEAD
  const handleApproveInvestment = async (id) => {
    try {
      await approveInvestment(id);
      toast.success("Investment Approved");
      handleView(selectedInvestor.user._id); // refresh
    } catch {
      toast.error("Failed");
    }
  };
  
=======
  const handleApproveInvestment = async (inv) => {

    try {
  
      const shares =
        editedInvestment[inv._id]?.shares ??
        inv.shares;
  
      const amount =
        shares *
        inv.pricePerShare;
  
      await updateInvestment(
        inv._id,
        {
          shares,
          amount,
        }
      );
  
      await approveInvestment(inv._id, {
        shares,
        amount,
    });
  
      toast.success(
        "Investment Approved"
      );
  
      handleView(
        selectedInvestor.user._id
      );
  
    } catch (err) {
      console.log("ERROR =", err);
      console.log("Response =", err.response);
      console.log("Data =", err.response?.data);
    
      toast.error(err.response?.data?.message || "Approval Failed");
    }
  
  };

>>>>>>> backup-local
  const handleRejectInvestment = async (id) => {
    try {
      await rejectInvestment(id);
      toast.success("Investment Rejected");
<<<<<<< HEAD
      handleView(selectedInvestor.user._id);
    } catch {
      toast.error("Failed");
    }
  };

  const Pagination = ({ page, totalPages, setPage }) => {
    return (
      <div className="flex items-center justify-between mt-6">
  
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
        >
          ← Prev
        </button>
  
        <div className="flex gap-2">
          {[...Array(totalPages)].map((_, i) => {
            const p = i + 1;
  
            if (
              p === 1 ||
              p === totalPages ||
              (p >= page - 1 && p <= page + 1)
            ) {
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg ${
                    page === p
                      ? "bg-[#0F766E] text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            }
  
            if (p === page - 2 || p === page + 2) {
              return <span key={p}>...</span>;
            }
  
            return null;
          })}
        </div>
  
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Investors</h1>
          <p className="text-muted-foreground mt-1">
            Manage investor accounts and KYC verification
          </p>
        </div>

        <Button onClick={handleExport} className="gap-2">
  <Download className="h-4 w-4" />
  Export PDF
</Button>
      </div>

      {/* FILTERS */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

    
            <Filter className="h-8 w-4" />
            <select
  className="border rounded-lg px-3 py-2 text-sm bg-background"
  onChange={(e) => setKycFilter(e.target.value)}
>
  <option value="">All</option>
  <option value="approved">Approved</option>
  <option value="pending">Pending</option>
  <option value="rejected">Rejected</option>
</select>
          
        </div>
      </Card>

      {/* TABLE */}
      <Card className="p-4 shadow-md rounded-2xl">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Invested</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Avg ROI</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentInvestors.map((investor) => (
                <TableRow 
                key={investor._id} 
                className={`transition-all duration-200 hover:bg-gray-50 ${
                  investors.indexOf(investor) % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                  <TableCell className="font-medium">{investor.name}</TableCell>
                  <TableCell>{investor.email}</TableCell>
                  <TableCell className="font-semibold text-[#0F766E]">
  {investor.totalInvested}
</TableCell>
                  <TableCell>{investor.properties}</TableCell>
                  <TableCell className="text-green-600 font-medium">
  {investor.avgROI}
</TableCell>
                  <TableCell>
                  <StatusBadge status={investor.kycStatus} className="shadow-sm" />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                  {new Date(investor.joinDate).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(investor._id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          
        </div>
      </Card>

      {/* SIDE PANEL */}
     {/* SIDE PANEL */}
<Sheet open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
  <SheetContent className="w-full sm:max-w-lg p-6 overflow-y-auto bg-gradient-to-br from-white to-gray-50">

    {selectedInvestor && (
      <>
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold tracking-tight">
            Investor Details
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">

          {/* 🔥 PROFILE */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border shadow-md">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
              {selectedInvestor.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <div>
              <h3 className="font-semibold text-lg">
                {selectedInvestor.user.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedInvestor.user.email}
              </p>
            </div>
          </div>

          {/* 🔥 STATS */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Invested", value: selectedInvestor.user.totalInvested },
              { label: "Properties", value: selectedInvestor.user.properties },
              { label: "ROI", value: selectedInvestor.user.avgROI, green: true },
              { label: "KYC", value: selectedInvestor.user.kycStatus, badge: true },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border shadow-sm">
                <p className="text-xs text-muted-foreground">{item.label}</p>

                {item.badge ? (
                  <StatusBadge status={item.value} />
                ) : (
                  <p className={`text-lg font-semibold ${item.green ? "text-green-600" : "text-primary"}`}>
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 🔥 PHONE */}
          <div className="p-4 rounded-xl bg-white border shadow-sm">
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{selectedInvestor.user.phone}</p>
          </div>

          {/* 🔥 KYC DETAILS */}
          {/* 🔥 PREMIUM KYC */}
{selectedInvestor.kyc && (
  <div className="space-y-4">

    {/* BASIC */}
    <div className="p-4 rounded-xl bg-white border shadow-sm">
      <h4 className="font-semibold mb-2">Basic Info</h4>
      <p><b>Name:</b> {selectedInvestor.kyc.fullName}</p>
      <p><b>DOB:</b> {new Date(selectedInvestor.kyc.dob).toLocaleDateString()}</p>
      <p><b>Address:</b> {selectedInvestor.kyc.address}</p>
    </div>

    {/* PAN */}
    <div className="p-4 rounded-xl bg-white border shadow-sm">
      <h4 className="font-semibold mb-2">PAN Details</h4>
      <p><b>PAN Number:</b> {selectedInvestor.kyc.panNumber}</p>

      {selectedInvestor.kyc.panFile && (
        <img
          src={selectedInvestor.kyc.panFile}
          className="mt-2 rounded-lg border h-40 object-cover"
        />
      )}
    </div>

    {/* AADHAAR */}
    <div className="p-4 rounded-xl bg-white border shadow-sm">
      <h4 className="font-semibold mb-2">Aadhaar Details</h4>
      <p><b>Aadhaar:</b> {selectedInvestor.kyc.aadhaarNumber}</p>

      {selectedInvestor.kyc.aadhaarFile && (
        <img
          src={selectedInvestor.kyc.aadhaarFile}
          className="mt-2 rounded-lg border h-40 object-cover"
        />
      )}
    </div>

    {/* BANK */}
    <div className="p-4 rounded-xl bg-white border shadow-sm">
      <h4 className="font-semibold mb-2">Bank Details</h4>
      <p><b>Name:</b> {selectedInvestor.kyc.bank?.beneficiaryName}</p>
      <p><b>Account:</b> {selectedInvestor.kyc.bank?.accountNumber}</p>
      <p><b>IFSC:</b> {selectedInvestor.kyc.bank?.ifsc}</p>

      {selectedInvestor.kyc.bank?.cancelCheque && (
        <img
          src={selectedInvestor.kyc.bank.cancelCheque}
          className="mt-2 rounded-lg border h-40 object-cover"
        />
      )}
    </div>

  </div>
)}

          {/* 🔥 KYC APPROVE */}
          {selectedInvestor.user.kycStatus === "pending" && (
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 shadow-md hover:scale-105"
                onClick={() => handleKyc(selectedInvestor.user._id, "approved")}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve KYC
              </Button>

              <Button
                variant="destructive"
                className="flex-1 shadow-md hover:scale-105"
                onClick={() => handleKyc(selectedInvestor.user._id, "rejected")}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}

          {/* 🔥 INVESTMENTS */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Investments</h4>

            <div className="space-y-4">

              {selectedInvestor.investments.map((inv, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border shadow-md hover:shadow-lg transition"
                >
                  <div className="flex justify-between">

                    {/* LEFT */}
                    <div>
                      <p className="font-semibold">
                        {inv.propertyId?.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        ₹ {inv.amount}
                      </p>

                      <div className="mt-1">
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </p>

                      {/* 🔥 APPROVE BUTTON */}
                      {inv.status !== "approved" && (
                        <div className="flex gap-2 mt-2 justify-end">

                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveInvestment(inv._id)}
                          >
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectInvestment(inv._id)}
                          >
                            Reject
                          </Button>

                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </>
    )}
  </SheetContent>
</Sheet>

<div className="flex items-center justify-between mt-6 flex-wrap gap-4">

  <div className="text-sm text-muted-foreground">
    Page {page} of {totalPages}
  </div>

  <div className="flex items-center gap-2">

   

    <Pagination
  page={page}
  totalPages={totalPages}
  setPage={setPage}
/>

   

  </div>
</div>
    </div>
  );
=======
      if (selectedInvestor?.user?._id) {
        handleView(selectedInvestor.user._id);
      }
    } catch {
      toast.error("Rejection Failed");
    }
  };

  // Metrics Calculations
  const pendingKycCount = investors.filter(i => i.kycStatus === "pending").length;

  return (
    <div className="min-h-screen  text-slate-900 p-6 md:p-10 font-sans selection:bg-blue-50 selection:text-blue-700 relative">
      
      {/* Top Subtle Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* --- HEADER --- */}
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

        {/* --- STATS OVERVIEW CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Total Investors Onboarded</span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {investors.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Active portfolio holders</p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Pending KYC Verifications</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {pendingKycCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">Requires document review</p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Platform Growth</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              Active
            </div>
            <p className="text-xs text-slate-400 mt-1">Verified asset allocations</p>
          </div>
        </div>

        {/* --- SEARCH & FILTERS --- */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by investor name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 focus:bg-white text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2 bg-white shadow-sm w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KYC:</span>
              <select
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-slate-800"
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- TABLE CONTAINER --- */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-5 px-6">Investor</th>
                  {/* <th className="py-5 px-6">Email</th> */}
                  <th className="py-5 px-6">Total Invested</th>
                  <th className="py-5 px-6">Properties</th>
                  <th className="py-5 px-6">Avg. ROI</th>
                  <th className="py-5 px-6">KYC Status</th>
                  <th className="py-5 px-6">Joined</th>
                  <th className="py-5 px-6 text-right">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  [...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-32" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-40" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-24" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-12" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-16" /></td>
                      <td className="p-6"><div className="h-6 bg-slate-100 rounded-full w-20" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-24" /></td>
                      <td className="p-6"><div className="h-8 bg-slate-100 rounded-lg w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredInvestors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-20 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UserCheck className="w-10 h-10 text-slate-300 stroke-[1]" />
                        <p className="text-lg font-semibold text-slate-800">No investors matching criteria</p>
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
                            {investor.name ? investor.name.charAt(0).toUpperCase() : "I"}
                          </div>
                          <span>{investor.name}</span>
                        </div>
                      </td>

                      {/* <td className="py-5 px-6 text-slate-600 font-medium">{investor.email}</td> */}

                      <td className="py-5 px-6 font-bold text-slate-950 font-mono">
                        {typeof investor.totalInvested === 'number' 
                          ? `₹${investor.totalInvested.toLocaleString("en-IN")}` 
                          : investor.totalInvested || "₹0"}
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
                        <KycStatusBadge status={investor.kycStatus} />
                      </td>

                      <td className="py-5 px-6 text-slate-500 text-xs font-medium">
                        {investor.joinDate ? new Date(investor.joinDate).toLocaleDateString("en-IN") : "N/A"}
                      </td>

                      <td className="py-5 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(investor._id)}
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

        {/* --- PAGINATION --- */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="text-xs font-medium text-slate-500">
            Showing Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex gap-1.5">
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
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
                if (p === page - 2 || p === page + 2) {
                  return <span key={p} className="text-xs text-slate-400 self-center">...</span>;
                }
                return null;
              })}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1 shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* --- SIDE PANEL / SHEET --- */}
      <Sheet open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
        <SheetContent className="w-full sm:max-w-xl p-6 overflow-y-auto bg-white border-l border-slate-200 text-slate-900">
          {selectedInvestor && (
            <div className="space-y-6">
              <SheetHeader className="border-b border-slate-100 pb-4">
                <SheetTitle className="text-2xl font-bold text-slate-950">
                  Investor Profile Overview
                </SheetTitle>
              </SheetHeader>

              {/* USER CARD HEADER */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                  {selectedInvestor.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-950">
                    {selectedInvestor.user.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                    {/* <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedInvestor.user.email}</span> */}
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedInvestor.user.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* STATS MATRIX */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 font-medium">Total Invested</p>
                  <p className="text-lg font-bold text-slate-950 mt-1">
                    {selectedInvestor.user.totalInvested || "₹0"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 font-medium">Properties Owned</p>
                  <p className="text-lg font-bold text-slate-950 mt-1">
                    {selectedInvestor.user.properties || 0}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 font-medium">Average ROI</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    {selectedInvestor.user.avgROI || "0%"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 font-medium mb-1">KYC Status</p>
                  <KycStatusBadge status={selectedInvestor.user.kycStatus} />
                </div>
              </div>

              {/* KYC DOCUMENTS SECTION */}
              {selectedInvestor.kyc && (
                <div className="space-y-4 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm tracking-wider uppercase border-b border-slate-100 pb-2">
                    KYC & Identity Documentation
                  </h4>

                  {/* Basic Info Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 text-sm space-y-1.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Personal Details</p>
                    <p className="text-slate-900"><b>Legal Name:</b> {selectedInvestor.kyc.fullName || "N/A"}</p>
                    <p className="text-slate-900"><b>DOB:</b> {selectedInvestor.kyc.dob ? new Date(selectedInvestor.kyc.dob).toLocaleDateString() : "N/A"}</p>
                    <p className="text-slate-900"><b>Address:</b> {selectedInvestor.kyc.address || "N/A"}</p>
                  </div>

                  {/* PAN Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>PAN Details</span>
                    </div>

                    {selectedInvestor.kyc.panFile && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                        <img
                          src={selectedInvestor.kyc.panFile}
                          alt="PAN Document"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Aadhaar Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Aadhaar Details</span>
                    </div>

                    {selectedInvestor.kyc.aadhaarFile && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                        <img
                          src={selectedInvestor.kyc.aadhaarFile}
                          alt="Aadhaar Document"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Bank Details */}
                  <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Landmark className="w-4 h-4 text-emerald-600" />
                      <span>Bank Account Details</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-700">
                      <p><b>Beneficiary:</b> {selectedInvestor.kyc.bank?.beneficiaryName || "N/A"}</p>
                      <p><b>Account No:</b> {selectedInvestor.kyc.bank?.accountNumber || "N/A"}</p>
                      <p><b>IFSC:</b> {selectedInvestor.kyc.bank?.ifsc || "N/A"}</p>
                    </div>

                    {selectedInvestor.kyc.bank?.cancelCheque && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                        <img
                          src={selectedInvestor.kyc.bank.cancelCheque}
                          alt="Cancelled Cheque"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* KYC ACTION BUTTONS */}
              {selectedInvestor.user.kycStatus === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-2.5 shadow-md transition-all active:scale-95"
                    onClick={() => handleKyc(selectedInvestor.user._id, "approved")}
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Approve KYC
                  </Button>

                  <Button
                    variant="destructive"
                    className="flex-1 font-semibold rounded-xl py-2.5 shadow-md transition-all active:scale-95"
                    onClick={() => handleKyc(selectedInvestor.user._id, "rejected")}
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Reject KYC
                  </Button>
                </div>
              )}

              {/* INVESTMENTS LISTING */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-900 text-sm tracking-wider uppercase mb-4">
                  Investments Portfolio ({selectedInvestor.investments?.length || 0})
                </h4>

                <div className="space-y-3">
                  {selectedInvestor.investments?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No investment records found.</p>
                  ) : (
                    selectedInvestor.investments.map((inv, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-bold text-slate-950 text-sm">
                            {inv.propertyId?.name || "Property Allocation"}
                          </p>
                          <div className="mt-3">
    <p className="text-xs text-gray-500">
        Requested Shares
    </p>

    <p className="font-semibold">
        {inv.requestedShares || inv.shares}
    </p>
</div>

<div className="mt-2">
    <p className="text-xs text-gray-500">
        Requested Amount
    </p>

    <p className="font-semibold">
        ₹{(
            inv.requestedAmount ||
            inv.amount
        ).toLocaleString()}
    </p>
</div>

<div className="mt-4">
  <p className="text-xs text-blue-600 font-semibold">
    Approved Shares
  </p>

  <Input
    type="number"
    className="mt-1"
    value={
      editedInvestment[inv._id]?.shares ??
      inv.shares
    }
    onChange={(e) => {

      const shares = Number(e.target.value);

      setEditedInvestment({
        ...editedInvestment,
        [inv._id]: {
          shares,
          amount:
            editedInvestment[inv._id]?.amount ??
            inv.amount,
        },
      });

    }}
  />
</div>

<div className="mt-3">
  <p className="text-xs text-blue-600 font-semibold">
    Approved Amount
  </p>

  <Input
  type="number"
  className="mt-1"
  value={
    editedInvestment[inv._id]?.amount ??
    inv.amount
  }
  onChange={(e) => {
    setEditedInvestment({
      ...editedInvestment,
      [inv._id]: {
        shares:
          editedInvestment[inv._id]?.shares ??
          inv.shares,
        amount: Number(e.target.value),
      },
    });
  }}
/>
</div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <KycStatusBadge status={inv.status} />

                          {inv.status !== "approved" && (
                            <div className="flex gap-1.5 mt-1">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 h-auto rounded-lg"
                                onClick={() => handleApproveInvestment(inv)}
                              >
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs px-2.5 py-1 h-auto rounded-lg"
                                onClick={() => handleRejectInvestment(inv._id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}

// --- BADGE HELPER COMPONENT ---
function KycStatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "pending";
  const baseClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border";

  if (normalized === "approved" || normalized === "verified") {
    return (
      <span className={`${baseClass} bg-emerald-50 text-emerald-800 border-emerald-100`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Approved
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className={`${baseClass} bg-rose-50 text-rose-800 border-rose-100`}>
        <ShieldX className="w-3.5 h-3.5 text-rose-600" />
        Rejected
      </span>
    );
  }

  return (
    <span className={`${baseClass} bg-amber-50 text-amber-900 border-amber-100`}>
      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
      Pending
    </span>
  );
>>>>>>> backup-local
}