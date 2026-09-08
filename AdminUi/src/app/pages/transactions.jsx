import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
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
import { StatusBadge } from "../components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";

import {
  Search,
  Download,
  Eye,
  Plus,
  RefreshCw,
  FileText,
  CreditCard,
  User,
  Building2,
  CalendarDays,
  IndianRupee,
  X,
} from "lucide-react";

import { getTransactions } from "../../api/transaction";
import { createManualTransaction } from "../../api/transaction";
// import { getUsersList } from "../../api/user";
import { getPropertiesList } from "../../api/property";

const TransactionStatusBadge = ({ status }) => {
  const config = {
    Pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },

    "Payment Submitted": {
      label: "Payment Submitted",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
    },

    Completed: {
      label: "Completed",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },

    Rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-200",
    },

    Exited: {
      label: "Exited",
      className:
        "bg-slate-100 text-slate-700 border-slate-200",
    },
  };

  const current =
    config[status] || {
      label: status || "Pending",
      className:
        "bg-slate-100 text-slate-600 border-slate-200",
    };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
};


export function Transactions() {
  // =====================================================
  // STATE
  // =====================================================

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  

  const [page, setPage] = useState(1);

  const itemsPerPage = 6;

  const [open, setOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState([]);

  const [properties, setProperties] = useState([]);

  // =====================================================
  // MANUAL TRANSACTION FORM
  // =====================================================

  const [form, setForm] = useState({
    investorName: "",
    propertyId: "",
    amount: "",
    method: "Bank Transfer",
    notes: "",
  });
  // =====================================================
  // FETCH TRANSACTIONS
  // =====================================================

  const fetchTransactions = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const res = await getTransactions();

      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];

      setTransactions(data);
    } catch (error) {
      console.error(
        "FETCH TRANSACTIONS ERROR:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // FETCH USERS + PROPERTIES
  // =====================================================

  const fetchDropdowns = async () => {
    try {
      const propertiesRes =
        await getPropertiesList();
  
      setProperties(
        Array.isArray(propertiesRes?.data)
          ? propertiesRes.data
          : propertiesRes?.data?.properties || []
      );
    } catch (error) {
      console.error(
        "FETCH PROPERTIES ERROR:",
        error
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchTransactions();
    fetchDropdowns();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredTransactions = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return transactions;
    }

    return transactions.filter((tx) => {
      const investor =
        tx.investor?.toLowerCase() || "";

      const email =
        tx.investorEmail?.toLowerCase() || "";

      const property =
        tx.property?.toLowerCase() || "";

      const method =
        tx.method?.toLowerCase() || "";

      const status =
        tx.status?.toLowerCase() || "";

      const reference =
        tx.paymentReference?.toLowerCase() || "";

      return (
        investor.includes(query) ||
        email.includes(query) ||
        property.includes(query) ||
        method.includes(query) ||
        status.includes(query) ||
        reference.includes(query)
      );
    });
  }, [transactions, searchQuery]);

  // =====================================================
  // RESET PAGE WHEN SEARCH CHANGES
  // =====================================================

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTransactions.length /
        itemsPerPage
    )
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex =
    (page - 1) * itemsPerPage;

  const currentTransactions =
    filteredTransactions.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN"
    );
  };

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const handleExport = () => {
    if (!filteredTransactions.length) {
      alert("No transactions available to export.");
      return;
    }

    const headers = [
      "Investor",
      "Investor Email",
      "Property",
      "Amount",
      "Date",
      "Time",
      "Payment Method",
      "Status",
      "Shares",
      "Payment Reference",
    ];

    const rows = filteredTransactions.map(
      (tx) => [
        tx.investor || "",
        tx.investorEmail || "",
        tx.property || "",
        tx.amount || 0,
        tx.date || "",
        tx.time || "",
        tx.method || "",
        tx.status || "",
        tx.shares || 0,
        tx.paymentReference || "",
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const safeValue = String(
              value ?? ""
            ).replace(/"/g, '""');

            return `"${safeValue}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `transactions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // ADD MANUAL TRANSACTION
  // =====================================================

  const handleAddTransaction = async () => {
    try {
      if (
        !form.investorName.trim() ||
        !form.propertyId ||
        !form.amount
      ) {
        alert(
          "Please enter investor name, select property and enter amount."
        );
  
        return;
      }
  
      if (Number(form.amount) <= 0) {
        alert("Amount must be greater than 0.");
        return;
      }
  
      setSaving(true);
  
      await createManualTransaction({
        investorName:
          form.investorName.trim(),
  
        propertyId: form.propertyId,
  
        amount: Number(form.amount),
  
        method: form.method,
  
        notes: form.notes,
      });
  
      setOpen(false);
  
      setForm({
        investorName: "",
        propertyId: "",
        amount: "",
        method: "Bank Transfer",
        notes: "",
      });
  
      await fetchTransactions(false);
    } catch (error) {
      console.error(
        "ADD MANUAL TRANSACTION ERROR:",
        error
      );
  
      alert(
        error.response?.data?.message ||
          "Failed to add transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PAGINATION COMPONENT
  // =====================================================

  const Pagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - 1 &&
          i <= page + 1)
      ) {
        pages.push(i);
      }
    }

    const uniquePages = [
      ...new Set(pages),
    ];

    return (
      <div className="flex items-center gap-1.5">
        {/* PREVIOUS */}

        <button
          type="button"
          disabled={page === 1}
          onClick={() =>
            setPage((prev) =>
              Math.max(1, prev - 1)
            )
          }
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ‹
        </button>

        {uniquePages.map(
          (pageNumber, index) => {
            const previous =
              uniquePages[index - 1];

            const showDots =
              previous &&
              pageNumber - previous > 1;

            return (
              <div
                key={pageNumber}
                className="flex items-center gap-1.5"
              >
                {showDots && (
                  <span className="px-1 text-slate-400 text-xs">
                    ...
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setPage(pageNumber)
                  }
                  className={`h-9 min-w-9 px-2 rounded-lg text-xs font-bold transition ${
                    page === pageNumber
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              </div>
            );
          }
        )}

        {/* NEXT */}

        <button
          type="button"
          disabled={
            page === totalPages
          }
          onClick={() =>
            setPage((prev) =>
              Math.min(
                totalPages,
                prev + 1
              )
            )
          }
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ›
        </button>
      </div>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />

          <p className="text-sm font-medium text-slate-500">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-full bg-slate-50/30 p-4 sm:p-6 lg:p-7">

      <div className="max-w-7xl mx-auto space-y-5">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                <CreditCard className="h-4 w-4 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Transactions
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Monitor and manage financial
                  transaction records.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* REFRESH */}

            <Button
              variant="outline"
              onClick={() =>
                fetchTransactions(false)
              }
              disabled={refreshing}
              className="h-10 gap-2 rounded-xl border-slate-200 bg-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </Button>

            {/* EXPORT */}

            <Button
              variant="outline"
              onClick={handleExport}
              className="h-10 gap-2 rounded-xl border-slate-200 bg-white"
            >
              <Download className="h-4 w-4" />

              <span>
                Export
              </span>
            </Button>

            {/* ADD */}

            <Button
              onClick={() =>
                setOpen(true)
              }
              className="h-10 gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 shadow-sm"
            >
              <Plus className="h-4 w-4" />

              <span>
                Add Transaction
              </span>
            </Button>
          </div>
        </div>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* TOTAL TRANSACTIONS */}

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Transactions
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  {transactions.length}
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </Card>

          {/* COMPLETED */}

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Completed
                </p>

                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {
                    transactions.filter(
                      (tx) =>
                        tx.status ===
                        "Completed"
                    ).length
                  }
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <span className="text-emerald-600 font-bold">
                  ✓
                </span>
              </div>
            </div>
          </Card>

          {/* VOLUME */}

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-4">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Transaction Volume
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  ₹
                  {formatAmount(
                    transactions.reduce(
                      (sum, tx) =>
                        sum +
                        Number(
                          tx.amount || 0
                        ),
                      0
                    )
                  )}
                </p>
              </div>

              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </Card>

        </div>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white p-3">
          <div className="relative">

            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <Input
              type="search"
              placeholder="Search by investor, email, property, method, status or payment reference..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="h-11 pl-10 pr-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}

          </div>
        </Card>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">

          {/* TABLE HEADER */}

          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Transaction Records
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                {filteredTransactions.length}{" "}
                records found
              </p>
            </div>

            {searchQuery && (
              <Badge
                variant="secondary"
                className="rounded-lg"
              >
                Search active
              </Badge>
            )}

          </div>

          {currentTransactions.length ===
          0 ? (
            <div className="py-16 text-center">

              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                <Search className="h-5 w-5 text-slate-400" />
              </div>

              <h3 className="text-sm font-bold text-slate-800 mt-4">
                No transactions found
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Try changing your search.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <Table>

                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-100">

                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3">
                      Investor
                    </TableHead>

                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Property
                    </TableHead>

                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Amount
                    </TableHead>

                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Date & Time
                    </TableHead>

                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Method
                    </TableHead>

                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </TableHead>

                    <TableHead className="w-12" />

                  </TableRow>
                </TableHeader>

                <TableBody>

                  {currentTransactions.map(
                    (tx) => (
                      <TableRow
                        key={tx.mongoId}
                        className="border-slate-100 hover:bg-slate-50/60 transition-colors"
                      >

                        {/* INVESTOR */}

                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">

                            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>

                            <div className="min-w-0">

                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[170px]">
                                {tx.investor ||
                                  "Unknown Investor"}
                              </p>

                              {tx.investorEmail && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                  {
                                    tx.investorEmail
                                  }
                                </p>
                              )}

                            </div>
                          </div>
                        </TableCell>

                        {/* PROPERTY */}

                        <TableCell>
                          <div className="flex items-center gap-2">

                            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />

                            <span className="text-sm font-medium text-slate-700 max-w-[180px] truncate">
                              {tx.property ||
                                "Unknown Property"}
                            </span>

                          </div>
                        </TableCell>

                        {/* AMOUNT */}

                        <TableCell>
                          <span className="text-sm font-black text-slate-900 whitespace-nowrap">
                            ₹
                            {formatAmount(
                              tx.amount
                            )}
                          </span>
                        </TableCell>

                        {/* DATE */}

                        <TableCell>
                          <div className="flex items-center gap-2">

                            <CalendarDays className="h-4 w-4 text-slate-400" />

                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                {tx.date}
                              </p>

                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {tx.time}
                              </p>
                            </div>

                          </div>
                        </TableCell>

                        {/* METHOD */}

                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="rounded-lg bg-slate-100 text-slate-600 border-0 font-medium"
                          >
                            {tx.method ||
                              "Bank Transfer"}
                          </Badge>
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                        <TransactionStatusBadge
  status={tx.status}
/>
                        </TableCell>

                        {/* VIEW */}

                        <TableCell>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTransaction(
                                tx
                              )
                            }
                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </TableCell>

                      </TableRow>
                    )
                  )}

                </TableBody>

              </Table>
            </div>
          )}

          {/* ================================================= */}
          {/* TABLE FOOTER */}
          {/* ================================================= */}

          {currentTransactions.length >
            0 && (
            <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <p className="text-xs text-slate-400">

                Showing{" "}
                <span className="font-semibold text-slate-600">
                  {startIndex + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-slate-600">
                  {Math.min(
                    startIndex +
                      itemsPerPage,
                    filteredTransactions.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600">
                  {
                    filteredTransactions.length
                  }
                </span>

              </p>

              <Pagination />

            </div>
          )}

        </Card>

      </div>

      {/* ===================================================== */}
      {/* TRANSACTION DETAILS DIALOG */}
      {/* ===================================================== */}

      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() =>
          setSelectedTransaction(null)
        }
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">

          {selectedTransaction && (
            <>

              {/* HEADER */}

              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70">

                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Transaction Details
                      </p>

                      <DialogTitle className="text-xl font-black text-slate-900 mt-1">
                        {
                          selectedTransaction.property
                        }
                      </DialogTitle>

                      <p className="text-sm text-slate-500 mt-1">
                        {
                          selectedTransaction.investor
                        }
                      </p>

                    </div>

                    <TransactionStatusBadge
  status={selectedTransaction.status}
/>

                  </div>
                </DialogHeader>

              </div>

              {/* BODY */}

              <div className="px-6 py-5 space-y-5">

                {/* AMOUNT CARD */}

                <div className="rounded-2xl bg-slate-900 px-5 py-5 text-white">

                  <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
                    Transaction Amount
                  </p>

                  <p className="text-3xl font-black mt-1">
                    ₹
                    {formatAmount(
                      selectedTransaction.amount
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">

                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      {
                        selectedTransaction.method
                      }
                    </span>

                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {
                        selectedTransaction.date
                      }
                    </span>

                    <span>
                      {
                        selectedTransaction.time
                      }
                    </span>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="rounded-xl border border-slate-200 p-4">

                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-slate-400" />

                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Investor
                      </p>
                    </div>

                    <p className="text-sm font-bold text-slate-800">
                      {
                        selectedTransaction.investor
                      }
                    </p>

                    {selectedTransaction.investorEmail && (
                      <p className="text-xs text-slate-400 mt-1 break-all">
                        {
                          selectedTransaction.investorEmail
                        }
                      </p>
                    )}

                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">

                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-slate-400" />

                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Property
                      </p>
                    </div>

                    <p className="text-sm font-bold text-slate-800">
                      {
                        selectedTransaction.property
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Payment Method
                    </p>

                    <Badge
                      variant="secondary"
                      className="mt-2 rounded-lg"
                    >
                      {
                        selectedTransaction.method
                      }
                    </Badge>

                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Shares
                    </p>

                    <p className="text-lg font-black text-slate-800 mt-1">
                      {
                        selectedTransaction.shares ||
                        0
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">

                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Payment Reference
                    </p>

                    <p className="text-sm font-mono font-semibold text-slate-700 mt-1 break-all">
                      {
                        selectedTransaction.paymentReference ||
                        "Not available"
                      }
                    </p>

                  </div>

                </div>

                {/* PAYMENT PROOF */}

                {selectedTransaction.paymentProof && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">

                    <div className="flex items-center gap-3">

                      <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center">
                        <FileText className="h-4 w-4 text-indigo-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Payment Proof
                        </p>

                        <p className="text-xs text-slate-500">
                          Uploaded payment document
                        </p>
                      </div>

                    </div>

                    <a
                      href={
                        selectedTransaction.paymentProof
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-white border border-indigo-100 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
                    >
                      View Proof
                    </a>

                  </div>
                )}

                {/* NOTES */}

                {selectedTransaction.notes && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">

                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Notes
                    </p>

                    <p className="text-sm text-slate-600 mt-1">
                      {
                        selectedTransaction.notes
                      }
                    </p>

                  </div>
                )}

              </div>

            </>
          )}

        </DialogContent>
      </Dialog>

      {/* ===================================================== */}
      {/* ADD TRANSACTION DIALOG */}
      {/* ===================================================== */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">

          {/* HEADER */}

          <div className="px-6 py-5 bg-slate-50/70 border-b border-slate-100">

            <DialogHeader>

              <DialogTitle className="text-xl font-black text-slate-900">
                Add Transaction
              </DialogTitle>

              <p className="text-xs text-slate-500 mt-1">
                Manually record a financial transaction.
              </p>

            </DialogHeader>

          </div>

          {/* FORM */}

          <div className="px-6 py-5 space-y-4">

            {/* INVESTOR */}

            <div>
  <label className="block text-xs font-bold text-slate-600 mb-1.5">
    Investor Name
  </label>

  <div className="relative">
    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

    <Input
      type="text"
      placeholder="Enter investor name"
      value={form.investorName}
      onChange={(e) =>
        setForm({
          ...form,
          investorName: e.target.value,
        })
      }
      className="h-11 pl-9 rounded-xl border-slate-200"
    />
  </div>

  <p className="text-[10px] text-slate-400 mt-1.5">
    Enter the investor name manually for this transaction.
  </p>
</div>

            {/* PROPERTY */}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Property
              </label>

              <select
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={
                  form.propertyId
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    propertyId:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Property
                </option>

                {properties.map(
                  (property) => (
                    <option
                      key={
                        property._id
                      }
                      value={
                        property._id
                      }
                    >
                      {property.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* AMOUNT + METHOD */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Amount
                </label>

                <div className="relative">

                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={
                      form.amount
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount:
                          e.target.value,
                      })
                    }
                    className="h-11 pl-9 rounded-xl border-slate-200"
                  />

                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Payment Method
                </label>

                <select
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={
                    form.method
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      method:
                        e.target.value,
                    })
                  }
                >
                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Cash">
                    Cash
                  </option>
                </select>
              </div>

            </div>

            {/* NOTES */}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Notes
              </label>

              <textarea
                placeholder="Add any internal notes..."
                value={
                  form.notes
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes:
                      e.target.value,
                  })
                }
                className="w-full min-h-[90px] rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            {/* ACTIONS */}

            <div className="flex justify-end gap-2 pt-2">

              <Button
                variant="outline"
                onClick={() =>
                  setOpen(false)
                }
                disabled={saving}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                onClick={
                  handleAddTransaction
                }
                disabled={saving}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 min-w-[130px]"
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Save Transaction
                  </>
                )}
              </Button>

            </div>

          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}