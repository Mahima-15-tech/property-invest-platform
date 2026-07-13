import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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


export function Investors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycFilter, setKycFilter] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);


  const filteredInvestors = investors.filter((investor) => {
    const name = investor.name?.toLowerCase() || "";
    const email = investor.email?.toLowerCase() || "";
  
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


  const handleView = async (id) => {
    try {
      const res = await getInvestorDetails(id);
      setSelectedInvestor(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleKyc = async (id, status) => {
    try {
      await updateKyc(id, status);
      toast.success(`KYC ${status}`);
      fetchInvestors();
    } catch {
      toast.error("Failed");
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportInvestors();
  
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
  
      link.href = url;
      link.setAttribute("download", "investors.pdf");
  
      document.body.appendChild(link);
      link.click();
  
    } catch (err) {
      console.log(err);
      toast.error("Export failed");
    }
  };

  const handleApproveInvestment = async (id) => {
    try {
      await approveInvestment(id);
      toast.success("Investment Approved");
      handleView(selectedInvestor.user._id); // refresh
    } catch {
      toast.error("Failed");
    }
  };
  
  const handleRejectInvestment = async (id) => {
    try {
      await rejectInvestment(id);
      toast.success("Investment Rejected");
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
}