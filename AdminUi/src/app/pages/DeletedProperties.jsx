import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Building2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  getDeletedProperties,
  restoreProperty,
} from "../../api/property";
import { toast } from "sonner";

export function DeletedProperties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchDeletedProperties();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchDeletedProperties = async () => {
    try {
      setLoading(true);

      const res = await getDeletedProperties();

      const data =
        res.data?.properties ||
        res.data ||
        [];

      setProperties(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch deleted properties"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (
      !window.confirm(
        "Restore this property to active properties?"
      )
    ) {
      return;
    }

    try {
      await restoreProperty(id);

      toast.success(
        "Property restored successfully"
      );

      fetchDeletedProperties();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to restore property"
      );
    }
  };

  const filteredProperties = properties.filter(
    (property) => {
      const search =
        searchQuery.toLowerCase();

      return (
        property.name
          ?.toLowerCase()
          .includes(search) ||
        property.location?.city
          ?.toLowerCase()
          .includes(search) ||
        property.location?.state
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  const totalPages =
    Math.ceil(
      filteredProperties.length /
        itemsPerPage
    ) || 1;

  const indexOfLast =
    currentPage * itemsPerPage;

  const indexOfFirst =
    indexOfLast - itemsPerPage;

  const currentProperties =
    filteredProperties.slice(
      indexOfFirst,
      indexOfLast
    );

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
              <Trash2 className="w-4 h-4" />
              Property Recycle Bin
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">
              Deleted Properties
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Properties removed from the active
              property catalog.
            </p>
          </div>

          <Button
            onClick={() =>
              navigate("/properties")
            }
            variant="outline"
            className="rounded-xl gap-2"
          >
            <Building2 className="w-4 h-4" />
            Back to Properties
          </Button>

        </div>

        {/* SEARCH */}

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">

          <div className="relative max-w-xl">
            <Search
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                w-4 h-4
                text-slate-400
              "
            />

            <Input
              placeholder="Search deleted property or city..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="
                pl-10
                h-10
                rounded-xl
                bg-slate-50/50
              "
            />
          </div>

        </div>

        {/* TABLE */}

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">

                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500">
                    Property
                  </th>

                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500">
                    Location
                  </th>

                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500">
                    Value
                  </th>

                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500">
                    Deleted On
                  </th>

                  <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  [...Array(5)].map(
                    (_, index) => (
                      <tr key={index}>
                        <td
                          colSpan={5}
                          className="p-5"
                        >
                          <div className="h-5 bg-slate-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    )
                  )
                ) : currentProperties.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center"
                    >
                      <Trash2 className="w-10 h-10 mx-auto text-slate-200" />

                      <p className="mt-3 text-sm font-semibold text-slate-800">
                        No deleted properties
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Your deleted property
                        listings will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentProperties.map(
                    (property) => (
                      <tr
                        key={property._id}
                        className="hover:bg-slate-50/70 transition"
                      >

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-slate-400" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {property.name}
                              </p>

                              <p className="text-[11px] text-slate-400">
                                {property.type ||
                                  "Property"}
                              </p>
                            </div>

                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {property.location?.city ||
                            "N/A"}
                          {property.location?.state
                            ? `, ${property.location.state}`
                            : ""}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                          ₹
                          {Number(
                            property.totalValue ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {property.deletedAt
                            ? new Date(
                                property.deletedAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "N/A"}
                        </td>

                        <td className="px-5 py-4 text-right">

                          <Button
                            onClick={() =>
                              handleRestore(
                                property._id
                              )
                            }
                            variant="outline"
                            className="
                              h-8
                              rounded-lg
                              text-xs
                              font-semibold
                              gap-1.5
                              border-emerald-200
                              text-emerald-700
                              hover:bg-emerald-50
                            "
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restore
                          </Button>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>

          </div>
        </div>

        {/* PAGINATION */}

        <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3.5 shadow-sm">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredProperties.length
                  ? indexOfFirst + 1
                  : 0}
              </span>
              {" – "}
              <span className="font-bold text-slate-900">
                {Math.min(
                  indexOfLast,
                  filteredProperties.length
                )}
              </span>
              {" of "}
              <span className="font-bold text-slate-900">
                {filteredProperties.length}
              </span>{" "}
              deleted properties
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">

                <button
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.max(
                          1,
                          prev - 1
                        )
                    )
                  }
                  className="
                    h-8 px-3
                    rounded-lg
                    border
                    border-slate-200
                    text-xs
                    font-semibold
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline" />
                  Prev
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`
                      h-8 min-w-8
                      rounded-lg
                      text-xs font-bold
                      ${
                        currentPage === page
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 text-slate-600"
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.min(
                          totalPages,
                          prev + 1
                        )
                    )
                  }
                  className="
                    h-8 px-3
                    rounded-lg
                    border
                    border-slate-200
                    text-xs
                    font-semibold
                    disabled:opacity-40
                  "
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 inline" />
                </button>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}