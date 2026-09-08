import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

import {
  Search,
  Filter,
  Download,
  RefreshCw,
  FileText,
  User,
  Clock3,
  Activity,
  ShieldCheck,
  Plus,
  CheckCircle2,
  ArrowRightLeft,
  Pencil,
  X,
} from "lucide-react";

import toast from "react-hot-toast";
import { getAuditLogs } from "../../api/audit";


// ============================================================
// TYPE CONFIG
// ============================================================

const typeConfig = {
  create: {
    label: "Create",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    icon: Plus,
  },

  approval: {
    label: "Approval",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  transaction: {
    label: "Transaction",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    icon: ArrowRightLeft,
  },

  security: {
    label: "Security",
    className:
      "border-red-200 bg-red-50 text-red-700",
    icon: ShieldCheck,
  },

  update: {
    label: "Update",
    className:
      "border-violet-200 bg-violet-50 text-violet-700",
    icon: Pencil,
  },
};


// ============================================================
// HELPERS
// ============================================================

const getTypeConfig = (type) => {
  return (
    typeConfig[type] || {
      label: type || "Unknown",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
      icon: Activity,
    }
  );
};


const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


// ============================================================
// MAIN COMPONENT
// ============================================================

export function AuditLogs() {
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [showFilter, setShowFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;
  // ==========================================================
  // FETCH LOGS
  // ==========================================================

  const fetchLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await getAuditLogs();

      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setLogs(data);
    } catch (error) {
      console.error("GET AUDIT LOGS ERROR:", error);

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Unable to load audit logs"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchLogs();
  }, []);


  // ==========================================================
  // FILTERED LOGS
  // ==========================================================

  const filteredLogs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesType =
        typeFilter === "all" ||
        log.type === typeFilter;

      if (!matchesType) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const searchableText = [
        log.action,
        log.details,
        log.type,
        log.user?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchValue);
    });
  }, [logs, search, typeFilter]);

  // ==========================================================
// PAGINATION
// ==========================================================

const totalPages = Math.ceil(
  filteredLogs.length / logsPerPage
);

const paginatedLogs = useMemo(() => {
  const startIndex =
    (currentPage - 1) * logsPerPage;

  const endIndex =
    startIndex + logsPerPage;

  return filteredLogs.slice(
    startIndex,
    endIndex
  );
}, [filteredLogs, currentPage]);


// ==========================================================
// RESET PAGE WHEN SEARCH / FILTER CHANGES
// ==========================================================

useEffect(() => {
  setCurrentPage(1);
}, [search, typeFilter]);


  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  const exportLogs = () => {
    if (!filteredLogs.length) {
      toast.error("No audit logs available to export");
      return;
    }

    try {
      const headers = [
        "Action",
        "User",
        "Details",
        "Timestamp",
        "Type",
      ];

      const rows = filteredLogs.map((log) => [
        log.action || "",
        log.user?.name || "System",
        log.details || "",
        formatDate(log.createdAt),
        log.type || "",
      ]);

      const csv = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map((value) => {
              const stringValue = String(value ?? "");

              if (
                stringValue.includes(",") ||
                stringValue.includes('"') ||
                stringValue.includes("\n")
              ) {
                return `"${stringValue.replace(
                  /"/g,
                  '""'
                )}"`;
              }

              return stringValue;
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

      link.download = `audit-logs-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success("Audit logs exported successfully");
    } catch (error) {
      console.error("EXPORT AUDIT LOGS ERROR:", error);

      toast.error("Unable to export audit logs");
    }
  };


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
  };


  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "all";


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
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Audit Logs
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track system activities, changes and administrative actions
              </p>
            </div>

          </div>


          <div className="flex flex-wrap items-center gap-2">

            <Button
              variant="outline"
              onClick={() => fetchLogs(true)}
              disabled={loading || refreshing}
              className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </Button>


            <Button
              onClick={exportLogs}
              disabled={loading || !filteredLogs.length}
              className="gap-2 rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />

              Export Logs
            </Button>

          </div>

        </div>


        {/* ================================================== */}
        {/* SUMMARY STRIP */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          {/* TOTAL */}

          <Card className="relative overflow-hidden border-slate-200 bg-white p-4 shadow-sm">

            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-blue-50" />

            <div className="relative flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Activities
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {logs.length}
                </p>
              </div>

            </div>

          </Card>


          {/* VISIBLE */}

          <Card className="relative overflow-hidden border-slate-200 bg-white p-4 shadow-sm">

            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-emerald-50" />

            <div className="relative flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Showing
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {filteredLogs.length}
                </p>
              </div>

            </div>

          </Card>


          {/* USERS */}

          <Card className="relative overflow-hidden border-slate-200 bg-white p-4 shadow-sm">

            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-violet-50" />

            <div className="relative flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <User className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Logged Actions
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {
                    logs.filter(
                      (log) => log.user
                    ).length
                  }
                </p>
              </div>

            </div>

          </Card>

        </div>


        {/* ================================================== */}
        {/* SEARCH / FILTER */}
        {/* ================================================== */}

        <Card className="border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            {/* SEARCH */}

            <div className="relative flex-1">

              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by action, user, details or type..."
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 pr-10 text-sm focus:bg-white"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

            </div>


            {/* FILTER */}

            <Button
              variant="outline"
              onClick={() =>
                setShowFilter((prev) => !prev)
              }
              className={`h-11 gap-2 rounded-xl border-slate-200 bg-white ${
                typeFilter !== "all"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : ""
              }`}
            >
              <Filter className="h-4 w-4" />

              Filter

              {typeFilter !== "all" && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                  1
                </span>
              )}
            </Button>


            {/* CLEAR */}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-11 rounded-xl text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                Clear
              </Button>
            )}

          </div>


          {/* FILTER PANEL */}

          {showFilter && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Filter by activity type
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Select the type of audit activity you want to view.
                  </p>
                </div>


                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">
                    All Activities
                  </option>

                  <option value="create">
                    Create
                  </option>

                  <option value="approval">
                    Approval
                  </option>

                  <option value="transaction">
                    Transaction
                  </option>

                  <option value="security">
                    Security
                  </option>

                  <option value="update">
                    Update
                  </option>
                </select>

              </div>

            </div>
          )}

        </Card>


        {/* ================================================== */}
        {/* TABLE */}
        {/* ================================================== */}

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-base font-bold text-slate-900">
                  Activity History
                </h2>

                {!loading && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {filteredLogs.length}
                  </span>
                )}

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Complete record of system activities
              </p>

            </div>

            {hasActiveFilters && (
              <p className="text-xs text-blue-600">
                Filters applied
              </p>
            )}

          </div>


          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading ? (

            <div className="divide-y divide-slate-100">

              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="animate-pulse px-5 py-5"
                  >
                    <div className="grid grid-cols-5 gap-5">

                      <div className="h-4 rounded bg-slate-200" />

                      <div className="h-4 rounded bg-slate-200" />

                      <div className="h-4 rounded bg-slate-200" />

                      <div className="h-4 rounded bg-slate-200" />

                      <div className="h-6 rounded-full bg-slate-200" />

                    </div>
                  </div>
                )
              )}

            </div>

          ) : filteredLogs.length === 0 ? (

            /* ================================================= */
            /* EMPTY */
            /* ================================================= */

            <div className="flex min-h-[320px] items-center justify-center px-5">

              <div className="text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  {hasActiveFilters ? (
                    <Search className="h-6 w-6" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-800">
                  {hasActiveFilters
                    ? "No matching logs"
                    : "No audit logs yet"}
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                  {hasActiveFilters
                    ? "Try changing your search or filter to find other activities."
                    : "System activities will appear here once audit events are recorded."}
                </p>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4 rounded-xl"
                  >
                    Clear filters
                  </Button>
                )}

              </div>

            </div>

          ) : (

            /* ================================================= */
            /* DATA TABLE */
            /* ================================================= */

            <div className="overflow-x-auto">

              <Table>

                <TableHeader>

                  <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">

                    <TableHead className="h-12 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </TableHead>

                    <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      User
                    </TableHead>

                    <TableHead className="h-12 min-w-[300px] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Details
                    </TableHead>

                    <TableHead className="h-12 min-w-[180px] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Timestamp
                    </TableHead>

                    <TableHead className="h-12 pr-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Type
                    </TableHead>

                  </TableRow>

                </TableHeader>


                <TableBody>

                {paginatedLogs.map((log) => {

                    const config =
                      getTypeConfig(log.type);

                    const TypeIcon =
                      config.icon;

                    return (
                      <TableRow
                        key={log._id}
                        className="border-slate-100 transition-colors hover:bg-slate-50/60"
                      >

                        {/* ACTION */}

                        <TableCell className="px-5 py-4">

                          <div className="flex items-center gap-2.5">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <Activity className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">

                              <p className="max-w-[190px] truncate text-sm font-semibold text-slate-800">
                                {log.action ||
                                  "—"}
                              </p>

                            </div>

                          </div>

                        </TableCell>


                        {/* USER */}

                        <TableCell className="py-4">

                          <div className="flex items-center gap-2.5">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                              {log.user?.name
                                ? log.user.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "S"}
                            </div>

                            <div className="min-w-0">

                              <p className="max-w-[160px] truncate text-sm font-medium text-slate-700">
                                {log.user?.name ||
                                  "System"}
                              </p>

                              {!log.user && (
                                <p className="text-[11px] text-slate-400">
                                  System generated
                                </p>
                              )}

                            </div>

                          </div>

                        </TableCell>


                        {/* DETAILS */}

                        <TableCell className="py-4">

                          <p
                            title={
                              log.details ||
                              ""
                            }
                            className="max-w-[420px] truncate text-sm text-slate-600"
                          >
                            {log.details ||
                              "No details available"}
                          </p>

                        </TableCell>


                        {/* TIMESTAMP */}

                        <TableCell className="py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-500">

                            <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="whitespace-nowrap">
                              {formatDate(
                                log.createdAt
                              )}
                            </span>

                          </div>

                        </TableCell>


                        {/* TYPE */}

                        <TableCell className="py-4 pr-5">

                          <Badge
                            variant="outline"
                            className={`gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
                          >
                            <TypeIcon className="h-3 w-3" />

                            {config.label}
                          </Badge>

                        </TableCell>

                      </TableRow>
                    );
                  })}

                </TableBody>

              </Table>

            </div>

          )}

        </Card>

{/* ================================================== */}
{/* PAGINATION */}
{/* ================================================== */}

{!loading && filteredLogs.length > 0 && totalPages > 1 && (
  <Card className="border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      {/* RESULTS INFO */}

      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {(currentPage - 1) * logsPerPage + 1}
        </span>
        {" "}to{" "}
        <span className="font-semibold text-slate-700">
          {Math.min(
            currentPage * logsPerPage,
            filteredLogs.length
          )}
        </span>
        {" "}of{" "}
        <span className="font-semibold text-slate-700">
          {filteredLogs.length}
        </span>
        {" "}logs
      </p>


      {/* PAGINATION BUTTONS */}

      <div className="flex items-center gap-1.5">

        {/* PREVIOUS */}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) =>
              Math.max(prev - 1, 1)
            )
          }
          className="h-9 rounded-lg border-slate-200 bg-white px-3 text-xs disabled:opacity-40"
        >
          Previous
        </Button>


        {/* PAGE NUMBERS */}

        <div className="flex items-center gap-1">

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (

            <button
              key={page}
              type="button"
              onClick={() =>
                setCurrentPage(page)
              }
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                currentPage === page
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>

          ))}

        </div>


        {/* NEXT */}

        <Button
          variant="outline"
          size="sm"
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(
                prev + 1,
                totalPages
              )
            )
          }
          className="h-9 rounded-lg border-slate-200 bg-white px-3 text-xs disabled:opacity-40"
        >
          Next
        </Button>

      </div>

    </div>
  </Card>
)}

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        {!loading && logs.length > 0 && (
  <div className="flex flex-col gap-2 px-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

    <span>
      Showing{" "}
      <span className="font-semibold text-slate-600">
        {paginatedLogs.length}
      </span>{" "}
      on this page of{" "}
      <span className="font-semibold text-slate-600">
        {filteredLogs.length}
      </span>{" "}
      matching activities
    </span>

    <span className="flex items-center gap-1.5">
      <ShieldCheck className="h-3.5 w-3.5" />
      Audit history is read-only
    </span>

  </div>
)}

      </div>
    </div>
  );
}