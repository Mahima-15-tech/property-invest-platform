import { useEffect, useState } from "react";
import { getProperties } from "../../api/property";
import { Link } from "react-router-dom";
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
import { Progress } from "../components/ui/progress";
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
} from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteProperty } from "../../api/property";
import { updateProperty } from "../../api/property";



export function Properties() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const [properties, setProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);
  
  const fetchProperties = async () => {
    try {
      const res = await getProperties();
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setProperties(sorted);
    } catch (err) {
      console.log(err);
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
      await updateProperty(id, { isFeatured: value });
  
      toast.success(
        value ? "Marked as Featured ⭐" : "Removed from Featured"
      );
  
      fetchProperties(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating");
    }
  };

  const handleView = (id) => {
    navigate(`/properties/view/${id}`);
  };
  
  const handleEdit = (id) => {
    navigate(`/properties/edit/${id}`);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;
  
    try {
      await deleteProperty(id);
      toast.success("Deleted successfully");
      fetchProperties();
    } catch (err) {
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

  const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;

const currentProperties = sortedProperties.slice(indexOfFirst, indexOfLast);
  

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Properties
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all property listings and funding status
          </p>
        </div>

        <Link to="/properties/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Property
          </Button>
        </Link>
      </div>

      {/* FILTERS */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="funding">Funding</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {selectedRows.length > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-accent rounded-lg">
            <span className="text-sm font-medium">
              {selectedRows.length} selected
            </span>

            <Button variant="outline" size="sm">Publish</Button>
            <Button variant="outline" size="sm">Archive</Button>
            <Button variant="outline" size="sm" className="text-destructive">
              Delete
            </Button>
          </div>
        )}
      </Card>

      {/* TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.length === properties.length}
                    onCheckedChange={handleSelectAll}
                  />
                  
                </TableHead>

                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("name")}
                    className="p-0"
                  >
                    Property Name
                    {sortConfig?.key === "name" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>

                <TableHead>City</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Sold %</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
            {currentProperties.map((property) => (
                <>
                  <TableRow
                    key={property._id}
                    className="hover:bg-accent/50"
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === property._id ? null : property._id
                      )
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                       checked={selectedRows.includes(property._id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(property._id, checked)
                        }
                      />
                    </TableCell>

                    <TableCell>{property.name}</TableCell>
                    <TableCell>{property.location?.city}</TableCell>
                    <TableCell>${property.totalValue}</TableCell>
                    <TableCell>{property.totalShares}</TableCell>
                    <TableCell>{property.soldPercent}%</TableCell>

                    <TableCell>
                      <Progress value={property.progress} />
                    </TableCell>

                    <TableCell>{property.roi}%</TableCell>
                    <TableCell>
                    <StatusBadge status={property.status || "funding"} />
                    </TableCell>

                    <TableCell>Admin</TableCell>
                    <TableCell>
  {new Date(property.createdAt).toLocaleString()}
</TableCell>
<TableCell onClick={(e) => e.stopPropagation()}>
  <Checkbox
    checked={property.isFeatured}
    onCheckedChange={(checked) =>
      handleToggleFeatured(property._id, checked)
    }
  />
</TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                      <DropdownMenuTrigger asChild>
  <button
    className="p-2 rounded-md hover:bg-accent transition"
  >
    <MoreVertical className="h-4 w-4" />
  </button>
</DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(property._id)}>
  👁 Preview
</DropdownMenuItem>

<DropdownMenuItem onClick={() => handleEdit(property._id)}>
  ✏️ Edit
</DropdownMenuItem>

<DropdownMenuItem
  onClick={() => handleDelete(property._id)}
  className="text-red-500"
>
  🗑 Delete
</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {expandedRow === property._id && (
                    <TableRow>
                      <TableCell colSpan={12}>
                        <div className="p-4 grid grid-cols-3 gap-4">
                          <div>
                            <p>Investors</p>
                            <p> {property.investors || 0}</p>
                          </div>
                          <div>
                            <p>Avg Investment</p>
                            <p>
  ₹
  {property.investors
    ? Math.floor(property.investedAmount / property.investors)
    : 0}
</p>
                          </div>
                          <div>
                            <p>Time to Fund</p>
                            <p>{Math.floor(
    (Date.now() - new Date(property.createdAt)) /
      (1000 * 60 * 60 * 24)
  )}{" "}
  days</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center p-4">
  <Button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    Previous
  </Button>

  <span className="text-sm">
    Page {currentPage} of{" "}
    {Math.ceil(filteredProperties.length / itemsPerPage)}
  </span>

  <Button
    disabled={
      currentPage ===
      Math.ceil(filteredProperties.length / itemsPerPage)
    }
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    Next
  </Button>
</div>

        </div>
      </Card>
    </div>
  );
}

