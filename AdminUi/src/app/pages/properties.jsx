import React, { useEffect, useState, Fragment } from "react";
import { getProperties, deleteProperty, toggleFeatured } from "../../api/property";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Search,
  Filter,
  MoreVertical,
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
  Building2,
  TrendingUp,
  PieChart,
  Eye,
  Edit3,
  Trash2,
  Users,
  Clock,
  Coins,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export function Properties() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await getProperties();
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setProperties(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(properties.map((p) => p._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const handleToggleFeatured = async (id, value) => {
    try {
      await toggleFeatured(id, value);
      toast.success(value ? "Marked as Featured" : "Removed from Featured");
      fetchProperties();
    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.message || "Error updating featured status");
    }
  };

  const handleView = (id) => navigate(`/properties/view/${id}`);
  const handleEdit = (id) => navigate(`/properties/edit/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property listing?")) return;

    try {
      await deleteProperty(id);
      toast.success("Property deleted successfully");
      fetchProperties();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (property.createdBy?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key] || "";
    const bVal = b[sortConfig.key] || "";

    if (sortConfig.direction === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProperties = sortedProperties.slice(indexOfFirst, indexOfLast);

  const totalValueSum = properties.reduce((acc, curr) => acc + Number(curr.totalValue || 0), 0);
  const activeFundingCount = properties.filter(p => p.status === "funding" || !p.status).length;

  return (
    <div className="min-h-screen text-slate-900 p-4 sm:p-6 md:p-8 font-sans selection:bg-blue-50 selection:text-blue-700 relative w-full overflow-x-hidden">
      
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10 w-full">

        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-medium mb-1">
              <Building2 className="w-4 h-4" />
              Real Estate Asset Catalog
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Properties
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Manage real estate assets, monitor crowdfunding status, and configure yield returns.
            </p>
          </div>

          <div>
            <Link to="/properties/create">
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
                <Plus className="h-4 w-4" />
                Create Property
              </Button>
            </Link>
          </div>
        </div>

        {/* --- STATS OVERVIEW CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 p-4 sm:p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs sm:text-sm font-medium">Total Listings Value</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            {/* Reduced big font size to text-xl / text-2xl */}
            <div className="text-xl sm:text-2xl font-bold tracking-tight mt-2 text-slate-950 truncate">
              ₹{totalValueSum.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-slate-400 mt-1">{properties.length} active properties</p>
          </div>

          <div className="bg-white border border-slate-100 p-4 sm:p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs sm:text-sm font-medium">Active Crowdfunding</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight mt-2 text-slate-950">
              {activeFundingCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">Open for capital</p>
          </div>

          <div className="bg-white border border-slate-100 p-4 sm:p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs sm:text-sm font-medium">Avg. Expected Yield</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight mt-2 text-slate-950">
              11.4%
            </div>
            <p className="text-xs text-slate-400 mt-1">Projected ROI</p>
          </div>
        </div>

        {/* --- FILTERS & ACTIONS --- */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search property, city or admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 border-slate-200 rounded-xl bg-slate-50/50 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 h-10 rounded-xl border-slate-200 bg-white text-xs sm:text-sm">
                  <Filter className="h-3.5 w-3.5 mr-2 text-slate-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="funding">Funding</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="h-10 border-slate-200 rounded-xl gap-2 text-slate-700 text-xs sm:text-sm">
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Export
              </Button>
            </div>
          </div>

          {selectedRows.length > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-slate-900 text-white rounded-xl shadow-md">
              <span className="text-xs font-semibold px-2">
                {selectedRows.length} selected
              </span>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-xs text-slate-200 hover:text-white">Publish</Button>
                <Button variant="ghost" size="sm" className="text-xs text-rose-400 hover:text-rose-300">Delete</Button>
              </div>
            </div>
          )}
        </div>

        {/* --- TABLE CONTAINER --- */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 w-8 text-center">
                    <Checkbox
                      checked={selectedRows.length === properties.length && properties.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>

                  <th className="py-3 px-3">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Name
                      {sortConfig?.key === "name" && (
                        sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>

                  <th className="py-3 px-3">City</th>
                  <th className="py-3 px-3">Value</th>
                  <th className="py-3 px-3">Shares</th>
                  <th className="py-3 px-3 w-40">Funding Progress</th>
                  <th className="py-3 px-3">ROI</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-center">Featured</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {loading ? (
                  [...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="p-3"><div className="h-4 bg-slate-100 rounded w-4" /></td>
                      <td className="p-3"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                      <td className="p-3"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                      <td className="p-3"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                      <td className="p-3"><div className="h-4 bg-slate-100 rounded w-12" /></td>
                      <td className="p-3"><div className="h-3 bg-slate-100 rounded-full w-24" /></td>
                      <td className="p-3"><div className="h-4 bg-slate-100 rounded w-10" /></td>
                      <td className="p-3"><div className="h-5 bg-slate-100 rounded-full w-16" /></td>
                      <td className="p-3"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                      <td className="p-3"><div className="h-4 bg-slate-100 rounded w-4 mx-auto" /></td>
                      <td className="p-3"><div className="h-6 bg-slate-100 rounded w-6 ml-auto" /></td>
                    </tr>
                  ))
                ) : currentProperties.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building2 className="w-8 h-8 text-slate-300 stroke-[1]" />
                        <p className="text-sm font-semibold text-slate-800">No properties found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentProperties.map((property) => {
                    // Safe percentage calculation and formatting
                    const rawPercent = Number(property.soldPercent || 0);
                    const formattedPercent = rawPercent > 0 ? (rawPercent % 1 === 0 ? rawPercent : rawPercent.toFixed(1)) : 0;

                    return (
                      <Fragment key={property._id}>
                        <tr
                          className={`hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer ${
                            expandedRow === property._id ? "bg-slate-50/50" : ""
                          }`}
                          onClick={() =>
                            setExpandedRow(expandedRow === property._id ? null : property._id)
                          }
                        >
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedRows.includes(property._id)}
                              onCheckedChange={(checked) => handleSelectRow(property._id, checked)}
                            />
                          </td>

                          <td className="py-3 px-3 font-semibold text-slate-950 max-w-[150px] truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate">{property.name}</span>
                              {property.isFeatured && (
                                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-600 font-medium truncate max-w-[100px]">
                            {property.location?.city || "N/A"}
                          </td>

                          <td className="py-3 px-3 font-medium text-slate-950 whitespace-nowrap">
                            ₹{Number(property.totalValue || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-1 min-w-[100px]">
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">

    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-slate-500">
        Total
      </span>

      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-xs font-bold">
        {(property.totalShares || 0).toLocaleString()}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-slate-500">
        Remaining
      </span>

      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold">
        {(property.availableShares || 0).toLocaleString()}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-slate-500">
        Sold
      </span>

      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
        {(property.soldShares || 0).toLocaleString()}
      </span>
    </div>

  </div>
</td>

                          {/* CLEANED UP FUNDING PROGRESS COLUMN */}
                          <td className="py-3 px-3 min-w-[130px]">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                                <span>Funded</span>
                                <span className="text-slate-900 font-semibold">{formattedPercent}%</span>
                              </div>
                              <Progress value={Math.max(0, Math.min(100, rawPercent))} className="h-1.5 bg-slate-100" />
                            </div>
                          </td>

                          <td className="py-3 px-3 font-semibold text-emerald-600">
                            {property.roi || 0}%
                          </td>

                          <td className="py-3 px-3">
                            <PropertyStatusBadge status={property.status || "funding"} />
                          </td>

                          <td className="py-3 px-3 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                            {property.createdAt ? new Date(property.createdAt).toLocaleDateString("en-IN") : "N/A"}
                          </td>

                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={!!property.isFeatured}
                              onCheckedChange={(checked) => handleToggleFeatured(property._id, checked)}
                            />
                          </td>

                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-lg border-slate-100">
                                <DropdownMenuItem 
                                  onClick={() => handleView(property._id)}
                                  className="rounded-lg flex items-center gap-2 text-xs font-medium cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                  onClick={() => handleEdit(property._id)}
                                  className="rounded-lg flex items-center gap-2 text-xs font-medium cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit Listing
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleDelete(property._id)}
                                  className="rounded-lg flex items-center gap-2 text-xs font-medium text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>

                        {/* EXPANDED ROW DETAILS */}
                        {expandedRow === property._id && (
                          <tr className="bg-slate-50/70 border-b border-slate-100">
                            <td colSpan={11} className="p-4">
                              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] text-slate-400 font-medium">Total Active Investors</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{property.investors || 0} Investors</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Coins className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] text-slate-400 font-medium">Avg Investment Ticket</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                                      ₹{property.investors && property.investedAmount
                                        ? Math.floor(property.investedAmount / property.investors).toLocaleString("en-IN")
                                        : 0}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] text-slate-400 font-medium">Campaign Duration</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                                      {Math.floor((Date.now() - new Date(property.createdAt)) / (1000 * 60 * 60 * 24))} Days Active
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- PAGINATION --- */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-500">
            Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1 shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1 shadow-sm"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- BADGE HELPER COMPONENT ---
function PropertyStatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "funding";

  if (normalized === "funded" || normalized === "active") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
        Funded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-100">
      Funding
    </span>
  );
}