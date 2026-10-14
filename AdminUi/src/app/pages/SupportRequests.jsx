import { useEffect, useMemo, useState } from "react";



import axios from "../../api/axios";



import {



  LifeBuoy,



  Search,



  RefreshCw,



  Clock3,



  CheckCircle2,



  XCircle,



  UserCircle,



  Mail,



  Phone,



  Building2,



  Landmark,



  Eye,



  ArrowRight,



  MessageSquare,



  AlertTriangle,



  Loader2,



  ChevronLeft,



  ChevronRight,



  CircleDot,



  ShieldCheck,



  UserRoundPen,



  CreditCard,
  Paperclip,
  FileText,
  Download,
  Upload,



} from "lucide-react";



export default function SupportRequests() {



  const [requests, setRequests] = useState([]);



  const [loading, setLoading] = useState(true);



  const [actionLoading, setActionLoading] = useState(null);



  const [search, setSearch] = useState("");



  const [statusFilter, setStatusFilter] = useState("");



  const [typeFilter, setTypeFilter] = useState("");



  const [selectedRequest, setSelectedRequest] = useState(null);



  const [modal, setModal] = useState({



    open: false,



    type: null,



    request: null,



  });



  const [adminRemark, setAdminRemark] = useState("");



  const [updatedData, setUpdatedData] = useState({});
  const [kycFiles, setKycFiles] = useState({ panFile: null, aadhaarFile: null, cancelCheque: null });



  const [page, setPage] = useState(1);



  const itemsPerPage = 10;



  // =====================================================



  // FETCH REQUESTS



  // =====================================================



  const loadRequests = async () => {



    try {



      setLoading(true);



      const params = {};



      if (search.trim()) {



        params.search = search.trim();



      }



      if (statusFilter) {



        params.status = statusFilter;



      }



      if (typeFilter) {



        params.type = typeFilter;



      }



      const res = await axios.get("/contact", {



        params,



      });



      setRequests(res.data?.data || []);



    } catch (error) {



      console.error("Failed to load support requests:", error);



    } finally {



      setLoading(false);



    }



  };



  useEffect(() => {



    loadRequests();



  }, [statusFilter, typeFilter]);



  // =====================================================



  // SEARCH



  // =====================================================



  const handleSearch = (e) => {



    e.preventDefault();



    setPage(1);



    loadRequests();



  };



  // =====================================================



  // RESET FILTERS



  // =====================================================



  const resetFilters = () => {



    setSearch("");



    setStatusFilter("");



    setTypeFilter("");



    setPage(1);



  };



  // =====================================================



  // OPEN DETAILS



  // =====================================================



  const openRequest = (request) => {



    setSelectedRequest(request);



    setAdminRemark(request.adminRemark || "");



    setUpdatedData(
      request.requestedChanges
        ? JSON.parse(JSON.stringify(request.requestedChanges))
        : {}
    );
    setKycFiles({ panFile: null, aadhaarFile: null, cancelCheque: null });



  };



  const closeRequest = () => {



    setSelectedRequest(null);



    setAdminRemark("");



    setUpdatedData({});
    setKycFiles({ panFile: null, aadhaarFile: null, cancelCheque: null });
  };



  // =====================================================



  // CONFIRM MODAL



  // =====================================================



  const openActionModal = (type, request) => {



    setModal({



      open: true,



      type,



      request,



    });



  };



  const closeActionModal = () => {



    setModal({



      open: false,



      type: null,



      request: null,



    });



  };



  // =====================================================



  // UPDATE FIELD



  // =====================================================



  const updateContactField = (field, value) => {



    setUpdatedData((prev) => ({



      ...prev,



      [field]: value,



    }));



  };



  const updateBankField = (field, value) => {



    setUpdatedData((prev) => ({



      ...prev,



      bank: {



        ...(prev.bank || {}),



        [field]: value,



      },



    }));



  };



  // =====================================================



  // RESOLVE / REJECT / IN PROGRESS



  // =====================================================



  const handleAction = async () => {



    if (!modal.request?._id) return;



    const requestId = modal.request._id;



    try {



      setActionLoading(requestId);



      let action = "approve";



      if (modal.type === "reject") {



        action = "reject";



      }



      if (modal.type === "progress") {



        action = "in_progress";



      }



      const payload = {



        action,



        adminRemark,



        rejectionReason:

          modal.type === "reject" ? adminRemark : "",



        updatedData,



      };



      const hasKycFiles = Object.values(kycFiles).some(Boolean);
      if (hasKycFiles) {
        const formData = new FormData();
        formData.append("action", action);
        formData.append("adminRemark", adminRemark || "");
        formData.append("rejectionReason", modal.type === "reject" ? adminRemark : "");
        formData.append("updatedData", JSON.stringify(updatedData || {}));
        if (kycFiles.panFile) formData.append("panFile", kycFiles.panFile);
        if (kycFiles.aadhaarFile) formData.append("aadhaarFile", kycFiles.aadhaarFile);
        if (kycFiles.cancelCheque) formData.append("cancelCheque", kycFiles.cancelCheque);
        await axios.put(`/contact/${requestId}/resolve`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await axios.put(`/contact/${requestId}/resolve`, payload);
      }



      closeActionModal();



      closeRequest();



      await loadRequests();



    } catch (error) {



      console.error("Support request action failed:", error);



      alert(



        error?.response?.data?.message ||



          "Failed to update request"



      );



    } finally {



      setActionLoading(null);



    }



  };



  // =====================================================



  // PAGINATION



  // =====================================================



  const totalPages = Math.max(



    1,



    Math.ceil(requests.length / itemsPerPage)



  );



  const paginatedRequests = useMemo(() => {



    const start = (page - 1) * itemsPerPage;



    return requests.slice(



      start,



      start + itemsPerPage



    );



  }, [requests, page]);



  // =====================================================



  // STATS



  // =====================================================



  const totalRequests = requests.length;



  const pendingCount = requests.filter(



    (item) => item.status === "pending"



  ).length;



  const inProgressCount = requests.filter(



    (item) => item.status === "in_progress"



  ).length;



  const resolvedCount = requests.filter(



    (item) => item.status === "resolved"



  ).length;



  const rejectedCount = requests.filter(



    (item) => item.status === "rejected"



  ).length;



  // =====================================================



  // TYPE LABEL



  // =====================================================



  const getTypeLabel = (type) => {



    switch (type) {



      case "contact_change":



        return "Contact Change";



      case "bank_change":



        return "Bank Details";



      case "other":



        return "Other";



      default:



        return "General";



    }



  };



  const getTypeIcon = (type) => {



    switch (type) {



      case "contact_change":



        return (



          <UserRoundPen className="w-4 h-4" />



        );



      case "bank_change":



        return (



          <Landmark className="w-4 h-4" />



        );



      default:



        return (



          <MessageSquare className="w-4 h-4" />



        );



    }



  };



  // =====================================================



  // CURRENT USER DATA



  // =====================================================



  const currentUser = selectedRequest?.userId;



  // =====================================================



  // RENDER



  // =====================================================



  return (



    <div className="min-h-screen  text-slate-900  p-6 md:p-10 font-sans relative">



      {/* TOP ACCENT */}



      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />



      <div className="max-w-7xl mx-auto space-y-8 relative z-10">



        {/* =====================================================



            HEADER



        ===================================================== */}



        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-8">



          <div>



            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-1">



              <LifeBuoy className="w-4 h-4" />



              Customer Support



            </div>



            <h1 className="text-4xl font-extrabold tracking-tighter text-slate-950">



              Support Requests



            </h1>



            <p className="text-slate-600 text-base mt-1.5 max-w-2xl">



              Review and manage investor requests for



              contact and bank information updates.



            </p>



          </div>



          <button



            onClick={loadRequests}



            disabled={loading}



            className="self-start lg:self-auto group bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2.5 disabled:opacity-60"



          >



            <RefreshCw



              className={`w-4 h-4 ${



                loading



                  ? "animate-spin text-blue-600"



                  : "text-slate-400 group-hover:text-blue-600"



              }`}



            />



            {loading



              ? "Refreshing..."



              : "Refresh Requests"}



          </button>



        </div>



        {/* =====================================================



            STATS



        ===================================================== */}



        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">



          <StatCard



            title="Total Requests"



            value={totalRequests}



            icon={<LifeBuoy />}



            iconClass="bg-blue-50 text-blue-600"



            description="All support requests"



          />



          <StatCard



            title="Pending"



            value={pendingCount}



            icon={<Clock3 />}



            iconClass="bg-amber-50 text-amber-600"



            description="Awaiting review"



          />



          <StatCard



            title="In Progress"



            value={inProgressCount}



            icon={<CircleDot />}



            iconClass="bg-indigo-50 text-indigo-600"



            description="Currently processing"



          />



          <StatCard



            title="Resolved"



            value={resolvedCount}



            icon={<CheckCircle2 />}



            iconClass="bg-emerald-50 text-emerald-600"



            description="Successfully completed"



          />



          <StatCard



            title="Rejected"



            value={rejectedCount}



            icon={<XCircle />}



            iconClass="bg-rose-50 text-rose-600"



            description="Requests declined"



          />



        </div>



        {/* =====================================================



            FILTER BAR



        ===================================================== */}



        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5">



          <div className="flex flex-col xl:flex-row gap-4">



            {/* SEARCH */}



            <form



              onSubmit={handleSearch}



              className="flex-1 relative"



            >



              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />



              <input



                value={search}



                onChange={(e) =>



                  setSearch(e.target.value)



                }



                placeholder="Search by name, email or subject..."



                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"



              />



            </form>



            {/* TYPE */}



            <select



              value={typeFilter}



              onChange={(e) => {



                setTypeFilter(e.target.value);



                setPage(1);



              }}



              className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-400"



            >



              <option value="">



                All Request Types



              </option>



              <option value="contact_change">



                Contact Change



              </option>



              <option value="bank_change">



                Bank Details



              </option>



              <option value="other">



                Other



              </option>



              <option value="general">



                General



              </option>



            </select>



            {/* STATUS */}



            <select



              value={statusFilter}



              onChange={(e) => {



                setStatusFilter(e.target.value);



                setPage(1);



              }}



              className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-400"



            >



              <option value="">



                All Status



              </option>



              <option value="pending">



                Pending



              </option>



              <option value="in_progress">



                In Progress



              </option>



              <option value="resolved">



                Resolved



              </option>



              <option value="rejected">



                Rejected



              </option>



            </select>



            <button



              onClick={resetFilters}



              className="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-600 transition"



            >



              Reset



            </button>



          </div>



        </div>



        {/* =====================================================



            TABLE



        ===================================================== */}



        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden w-full">



          <div className="w-full overflow-hidden">



            <table className="w-full table-fixed text-left border-collapse">



              <thead>



                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-600 text-[11px] uppercase tracking-wider font-semibold">



                <th className="py-4 px-3 text-left w-[23%]">User</th>



                <th className="py-4 px-3 text-left w-[15%]">Request</th>



                <th className="py-4 px-3 text-left w-[27%]">Subject</th>



                <th className="py-4 px-3 text-left w-[13%]">Status</th>



                <th className="py-4 px-3 text-left w-[12%]">Submitted</th>



                <th className="py-4 px-3 text-right w-[10%]">Action</th>



              </tr>



              </thead>



              <tbody className="divide-y divide-slate-100 text-sm">



                {loading ? (



                  [...Array(6)].map((_, index) => (



                    <tr



                      key={index}



                      className="animate-pulse"



                    >



                      <td className="p-3">



                        <div className="flex gap-3">



                          <div className="w-10 h-10 rounded-full bg-slate-100" />



                          <div>



                            <div className="h-4 bg-slate-100 rounded w-28 mb-2" />



                            <div className="h-3 bg-slate-100 rounded w-36" />



                          </div>



                        </div>



                      </td>



                      <td className="p-3">



                        <div className="h-8 bg-slate-100 rounded-xl w-32" />



                      </td>



                      <td className="p-3">



                        <div className="h-4 bg-slate-100 rounded w-40" />



                      </td>



                      <td className="p-3">



                        <div className="h-7 bg-slate-100 rounded-full w-24" />



                      </td>



                      <td className="p-3">



                        <div className="h-4 bg-slate-100 rounded w-24" />



                      </td>



                      <td className="p-3">



                        <div className="h-9 bg-slate-100 rounded-xl w-24 ml-auto" />



                      </td>



                    </tr>



                  ))



                ) : paginatedRequests.length === 0 ? (



                  <tr>



                    <td



                      colSpan={6}



                      className="py-24 text-center"



                    >



                      <div className="flex flex-col items-center">



                        <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">



                          <LifeBuoy className="w-8 h-8 stroke-[1.5]" />



                        </div>



                        <h3 className="text-lg font-bold text-slate-800">



                          No support requests



                        </h3>



                        <p className="text-sm text-slate-500 mt-1 max-w-sm">



                          There are no requests matching



                          your current filters.



                        </p>



                      </div>



                    </td>



                  </tr>



                ) : (



                  paginatedRequests.map((item) => (



                    <tr



                      key={item._id}



                      className="group hover:bg-slate-50/60 transition-colors duration-150"



                    >



                      {/* USER */}



                      <td className="py-4 px-3">



                        <div className="flex items-center gap-2.5 min-w-0">



                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm ring-2 ring-white shadow-sm">



                            {item.name



                              ? item.name



                                  .charAt(0)



                                  .toUpperCase()



                              : (



                                <UserCircle className="w-5 h-5" />



                              )}



                          </div>



                          <div>



                            <div className="font-semibold text-slate-950 text-sm truncate">



                              {item.name ||



                                item.userId?.name ||



                                "Unknown User"}



                            </div>



                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">



                              {item.email ||



                                item.userId?.email ||



                                "No email"}



                            </div>



                          </div>



                        </div>



                      </td>



                      {/* TYPE */}



                      <td className="py-4 px-3">



                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-semibold text-xs">



                          <span className="text-blue-600">



                            {getTypeIcon(item.type)}



                          </span>



                          {getTypeLabel(item.type)}



                        </div>



                      </td>



                      {/* SUBJECT */}



                      <td className="py-4 px-3">



                        <div className="w-full min-w-0">



                          <div className="font-semibold text-slate-800 truncate">



                            {item.subject ||



                              "Support Request"}



                          </div>



                          <div className="text-[11px] text-slate-400 truncate mt-1">



                            {item.message ||



                              "No description"}



                          </div>



                        </div>



                      </td>



                      {/* STATUS */}



                      <td className="py-4 px-3">



                        <StatusBadge



                          status={item.status}



                        />



                      </td>



                      {/* DATE */}



                      <td className="py-4 px-3">



                        <div className="text-sm font-medium text-slate-700">



                          {formatDate(



                            item.createdAt



                          )}



                        </div>



                        <div className="text-xs text-slate-400 mt-0.5">



                          {formatTime(



                            item.createdAt



                          )}



                        </div>



                      </td>



                      {/* ACTION */}



                      <td className="py-4 px-3 text-right">



                        <button



                          onClick={() =>



                            openRequest(item)



                          }



                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"



                        >



                          <Eye className="w-4 h-4" />



                          View



                        </button>



                      </td>



                    </tr>



                  ))



                )}



              </tbody>



            </table>



          </div>



          {/* =====================================================



              PAGINATION



          ===================================================== */}



          {!loading &&



            requests.length > 0 && (



              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">



                <p className="text-xs font-medium text-slate-500">



                  Showing{" "}



                  <span className="font-bold text-slate-900">



                    {(page - 1) *



                      itemsPerPage +



                      1}



                  </span>{" "}



                  -{" "}



                  <span className="font-bold text-slate-900">



                    {Math.min(



                      page * itemsPerPage,



                      requests.length



                    )}



                  </span>{" "}



                  of{" "}



                  <span className="font-bold text-slate-900">



                    {requests.length}



                  </span>{" "}



                  requests



                </p>



                <div className="flex items-center gap-2">



                  <button



                    disabled={



                      page === 1



                    }



                    onClick={() =>



                      setPage(



                        (prev) =>



                          prev - 1



                      )



                    }



                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"



                  >



                    <ChevronLeft className="w-4 h-4" />



                  </button>



                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">



                    {page}



                  </div>



                  <button



                    disabled={



                      page >=



                      totalPages



                    }



                    onClick={() =>



                      setPage(



                        (prev) =>



                          prev + 1



                      )



                    }



                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"



                  >



                    <ChevronRight className="w-4 h-4" />



                  </button>



                </div>



              </div>



            )}



        </div>



      </div>



      {/* =====================================================



          REQUEST DETAIL DRAWER / MODAL



      ===================================================== */}



      {selectedRequest && (



        <div className="fixed inset-0 z-50 flex justify-end">



          <div



            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"



            onClick={closeRequest}



          />



          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-slide-in">



            {/* HEADER */}



            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-5">



              <div className="flex items-center justify-between">



                <div>



                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">



                    <LifeBuoy className="w-4 h-4" />



                    Support Request



                  </div>



                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">



                    Request Details



                  </h2>



                </div>



                <button



                  onClick={closeRequest}



                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition"



                >



                  <XCircle className="w-5 h-5 text-slate-500" />



                </button>



              </div>



            </div>



            <div className="p-6 space-y-6">



              {/* USER CARD */}



              <div className="rounded-3xl bg-slate-50 border border-slate-100 p-5">



                <div className="flex items-center gap-4">



                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm">



                    {(currentUser?.name ||



                      selectedRequest.name ||



                      "U")



                      .charAt(0)



                      .toUpperCase()}



                  </div>



                  <div className="flex-1">



                    <h3 className="font-bold text-lg text-slate-950">



                      {currentUser?.name ||



                        selectedRequest.name ||



                        "Unknown User"}



                    </h3>



                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">



                      <span className="flex items-center gap-1.5 text-xs text-slate-500">



                        <Mail className="w-3.5 h-3.5" />



                        {currentUser?.email ||



                          selectedRequest.email ||



                          "N/A"}



                      </span>



                      <span className="flex items-center gap-1.5 text-xs text-slate-500">



                        <Phone className="w-3.5 h-3.5" />



                        {currentUser?.phone ||



                          selectedRequest.phone ||



                          "N/A"}



                      </span>



                    </div>



                  </div>



                  <StatusBadge



                    status={



                      selectedRequest.status



                    }



                  />



                </div>



              </div>



              {/* REQUEST INFO */}



              <section>



                <SectionTitle



                  icon={<MessageSquare />}



                  title="Request Information"



                />



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">



                  <InfoBox



                    label="Request Type"



                    value={getTypeLabel(



                      selectedRequest.type



                    )}



                  />



                  <InfoBox



                    label="Submitted"



                    value={formatDate(



                      selectedRequest.createdAt



                    )}



                  />



                </div>



                <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">



                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">



                    Message



                  </p>



                  <p className="text-sm text-slate-700 leading-relaxed">



                    {selectedRequest.message ||



                      "No message provided."}



                  </p>



                </div>



              </section>



              {/* ATTACHED SUPPORT DOCUMENTS */}
              <section>
                <SectionTitle icon={<Paperclip />} title="Attached Support Documents" />
                {Array.isArray(selectedRequest.documents) && selectedRequest.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRequest.documents.map((doc, index) => {
                      const url = typeof doc === "string" ? doc : doc?.url;
                      const name = (typeof doc === "object" && doc?.originalName) || `Document ${index + 1}`;
                      if (!url) return null;
                      return (
                        <div key={`${url}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="rounded-xl bg-blue-50 p-2 text-blue-600"><FileText className="w-5 h-5" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                            <p className="text-xs text-slate-500">{doc?.mimeType || "Attached file"}</p>
                          </div>
                          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                            <Download className="h-3.5 w-3.5" /> View
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No documents attached to this support request.</p>
                )}
              </section>

              {/* CONTACT CHANGE */}



              {selectedRequest.type ===



                "contact_change" && (



                <section>



                  <SectionTitle



                    icon={<UserRoundPen />}



                    title="Contact Information"



                  />



                  <div className="space-y-4">



                    <ComparisonRow



                      label="Full Name"



                      current={



                        currentUser?.name ||



                        selectedRequest.name



                      }



                      requested={



                        updatedData?.name



                      }



                      onChange={(value) =>



                        updateContactField(



                          "name",



                          value



                        )



                      }



                    />



                    <ComparisonRow



                      label="Email"



                      current={



                        currentUser?.email ||



                        selectedRequest.email



                      }



                      requested={



                        updatedData?.email



                      }



                      onChange={(value) =>



                        updateContactField(



                          "email",



                          value



                        )



                      }



                    />



                    <ComparisonRow



                      label="Phone"



                      current={



                        currentUser?.phone ||



                        selectedRequest.phone



                      }



                      requested={



                        updatedData?.phone



                      }



                      onChange={(value) =>



                        updateContactField(



                          "phone",



                          value



                        )



                      }



                    />



                  </div>



                </section>



              )}



              {/* BANK CHANGE */}



              {selectedRequest.type === "bank_change" && (



                <section>



                  {/* KYC VERIFICATION */}



                  <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">



                    <div className="flex items-center justify-between gap-4">



                      <div>



                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">



                          KYC Verification



                        </p>



                        <h3 className="mt-1 text-sm font-semibold text-slate-900">



                          User KYC Status



                        </h3>



                      </div>



                      <span



                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${



                          selectedRequest.kyc?.displayStatus === "approved"



                            ? "bg-emerald-50 text-emerald-700"



                            : selectedRequest.kyc?.displayStatus === "pending"



                            ? "bg-amber-50 text-amber-700"



                            : selectedRequest.kyc?.displayStatus === "rejected"



                            ? "bg-red-50 text-red-700"



                            : "bg-slate-100 text-slate-600"



                        }`}



                      >



                        {selectedRequest.kyc?.displayStatus === "approved"



                          ? "Approved"



                          : selectedRequest.kyc?.displayStatus === "pending"



                          ? "Pending"



                          : selectedRequest.kyc?.displayStatus === "rejected"



                          ? "Rejected"



                          : "Not Submitted"}



                      </span>



                    </div>



                    <div className="mt-4 grid grid-cols-2 gap-4">



                      <div>



                        <p className="text-xs text-slate-400">



                          KYC Status



                        </p>



                        <p className="mt-1 text-sm font-medium text-slate-700">



                          {selectedRequest.kyc?.status || "Not Available"}



                        </p>



                      </div>



                      <div>



                        <p className="text-xs text-slate-400">



                          Approval Status



                        </p>



                        <p className="mt-1 text-sm font-medium text-slate-700">



                          {selectedRequest.kyc?.approvalStatus || "Not Available"}



                        </p>



                      </div>



                    </div>



                    {selectedRequest.kyc?.displayStatus !== "approved" && (



                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">



                        <p className="text-sm font-medium text-amber-800">



                          Bank details cannot be updated yet.



                        </p>



                        <p className="mt-1 text-xs text-amber-700">



                          The user must complete and get their KYC approved



                          before the bank details can be updated.



                        </p>



                      </div>



                    )}



                  </div>



                  {/* EXISTING KYC DOCUMENTS + OPTIONAL REPLACEMENTS */}
                  {/* <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                    <SectionTitle icon={<FileText />} title="KYC Documents" />
                    <p className="mb-4 text-xs text-slate-500">Existing documents are shown below. Choose a new file only when you want to replace that document. If no new file is selected, the current document will remain unchanged.</p>
                    <div className="space-y-4">
                      {[
                        { key: "panFile", label: "PAN Card", current: selectedRequest.kyc?.panFile },
                        { key: "aadhaarFile", label: "Aadhaar Card", current: selectedRequest.kyc?.aadhaarFile },
                        { key: "cancelCheque", label: "Cancelled Cheque", current: selectedRequest.kyc?.bank?.cancelCheque },
                      ].map((doc) => {
                        const currentUrl = typeof doc.current === "string" ? doc.current : doc.current?.url || doc.current?.path;
                        return (
                          <div key={doc.key} className="rounded-xl border border-slate-100 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-800">{doc.label}</p>
                              {currentUrl ? (
                                <a href={currentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline">
                                  <Eye className="h-3.5 w-3.5" /> View current file
                                </a>
                              ) : <span className="text-xs text-slate-400">No file uploaded</span>}
                            </div>
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-600 hover:border-blue-400 hover:bg-blue-50">
                              <Upload className="h-4 w-4" />
                              <span className="flex-1">{kycFiles[doc.key]?.name || `Choose replacement ${doc.label}`}</span>
                              <input type="file" accept="image/*,.pdf" className="hidden"
                                onChange={(e) => setKycFiles((prev) => ({ ...prev, [doc.key]: e.target.files?.[0] || null }))}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div> */}

                  {/* REQUESTED BANK CHANGES — only requested values */}



                  <SectionTitle



                    icon={<Landmark />}



                    title="Requested Bank Changes"



                  />



                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">



                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-3">



                      User requested



                    </p>



                    <div className="space-y-3">



                      {Object.entries(updatedData?.bank || {}).map(



                        ([field, value]) => (



                          <div



                            key={field}



                            className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-slate-200/70 last:border-0 pb-3 last:pb-0"



                          >



                            <span className="text-xs font-semibold text-slate-500 sm:w-40 shrink-0">



                              {formatBankFieldLabel(field)}



                            </span>



                            <span className="text-sm font-semibold text-slate-800 break-all">



                              {value || "Not specified"}



                            </span>



                          </div>



                        )



                      )}



                      {!Object.keys(updatedData?.bank || {}).length && (



                        <p className="text-sm text-slate-500">



                          No specific bank details were provided in this request.



                        </p>



                      )}



                    </div>



                  </div>



                </section>



              )}



              {/* ADMIN REMARK */}



              <section>



                <SectionTitle



                  icon={<ShieldCheck />}



                  title="Admin Review"



                />



                <textarea



                  value={adminRemark}



                  onChange={(e) =>



                    setAdminRemark(



                      e.target.value



                    )



                  }



                  placeholder="Add an internal remark or resolution note..."



                  rows={4}



                  className="w-full resize-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition"



                />



              </section>



              {/* ACTIONS */}



           {/* ACTIONS */}



{selectedRequest.status !== "resolved" &&



  selectedRequest.status !== "rejected" && (



    <div className="border-t border-slate-100 pt-5">



      <div className="flex flex-col sm:flex-row gap-3">



        {/* ==========================================



            MARK IN PROGRESS



        ========================================== */}



        {selectedRequest.status !== "in_progress" && (



          <button



            onClick={() =>



              openActionModal(



                "progress",



                selectedRequest



              )



            }



            className="flex-1 h-11 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 font-semibold text-sm transition flex items-center justify-center gap-2"



          >



            <Clock3 className="w-4 h-4" />



            Mark In Progress



          </button>



        )}



        {/* ==========================================



            REJECT



        ========================================== */}



        <button



          onClick={() =>



            openActionModal(



              "reject",



              selectedRequest



            )



          }



          className="h-11 px-5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 font-semibold text-sm transition flex items-center justify-center gap-2"



        >



          <XCircle className="w-4 h-4" />



          Reject



        </button>



        {/* ==========================================



            BANK CHANGE



            ONLY ALLOW UPDATE IF KYC APPROVED



        ========================================== */}



        {selectedRequest.type === "bank_change" ? (



          selectedRequest.kyc?.displayStatus === "approved" ? (



            <button



              onClick={() =>



                openActionModal(



                  "resolve",



                  selectedRequest



                )



              }



              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-sm transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"



            >



              <CheckCircle2 className="w-4 h-4" />



              Update & Resolve



            </button>



          ) : (



            <button



              disabled



              className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"



            >



              <CheckCircle2 className="w-4 h-4" />



              Update & Resolve



            </button>



          )



        ) : (



          /* ==========================================



             OTHER REQUEST TYPES



             DIRECTLY ALLOW RESOLVE



          ========================================== */



          <button



            onClick={() =>



              openActionModal(



                "resolve",



                selectedRequest



              )



            }



            className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-sm transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"



          >



            <CheckCircle2 className="w-4 h-4" />



            Update & Resolve



          </button>



        )}



      </div>



      {/* BANK REQUEST + KYC NOT APPROVED MESSAGE */}



      {selectedRequest.type === "bank_change" &&



        selectedRequest.kyc?.displayStatus !== "approved" && (



          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">



            <p className="text-sm font-semibold text-amber-800">



              Bank details cannot be updated yet



            </p>



            <p className="mt-1 text-xs text-amber-700">



              User KYC must be completed and approved



              before the requested bank details can be updated.



            </p>



          </div>



        )}



    </div>



  )}



              {/* EXISTING REMARK */}



              {selectedRequest.adminRemark && (



                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">



                  <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">



                    <ShieldCheck className="w-4 h-4" />



                    Previous Admin Remark



                  </div>



                  <p className="text-sm text-blue-900/80 mt-2 leading-relaxed">



                    {selectedRequest.adminRemark}



                  </p>



                </div>



              )}



            </div>



          </div>



        </div>



      )}



      {/* =====================================================



          CONFIRMATION MODAL



      ===================================================== */}



      {modal.open && (



        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">



          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl p-7 animate-scale-in">



            <div className="flex items-start gap-4">



              <div



                className={`p-3.5 rounded-2xl ${



                  modal.type === "reject"



                    ? "bg-rose-50 text-rose-600"



                    : modal.type === "progress"



                    ? "bg-indigo-50 text-indigo-600"



                    : "bg-emerald-50 text-emerald-600"



                }`}



              >



                {modal.type ===



                "reject" ? (



                  <AlertTriangle className="w-6 h-6" />



                ) : modal.type ===



                  "progress" ? (



                  <Clock3 className="w-6 h-6" />



                ) : (



                  <CheckCircle2 className="w-6 h-6" />



                )}



              </div>



              <div>



                <h3 className="text-xl font-bold text-slate-950">



                  {modal.type ===



                  "reject"



                    ? "Reject Request?"



                    : modal.type ===



                      "progress"



                    ? "Start Processing?"



                    : "Resolve Request?"}



                </h3>



                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">



                  {modal.type ===



                  "reject"



                    ? "This request will be marked as rejected."



                    : modal.type ===



                      "progress"



                    ? "This request will be moved to in-progress status."



                    : "The requested information will be updated and the request will be marked as resolved."}



                </p>



              </div>



            </div>



            <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-slate-100">



              <button



                onClick={closeActionModal}



                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"



              >



                Cancel



              </button>



              <button



                onClick={handleAction}



                disabled={



                  actionLoading ===



                  modal.request?._id



                }



                className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition flex items-center gap-2 ${



                  modal.type === "reject"



                    ? "bg-rose-600 hover:bg-rose-700"



                    : modal.type ===



                      "progress"



                    ? "bg-indigo-600 hover:bg-indigo-700"



                    : "bg-emerald-600 hover:bg-emerald-700"



                }`}



              >



                {actionLoading ===



                  modal.request?._id && (



                  <Loader2 className="w-4 h-4 animate-spin" />



                )}



                {modal.type === "reject"



                  ? "Yes, Reject"



                  : modal.type === "progress"



                  ? "Start Processing"



                  : "Yes, Resolve"}



              </button>



            </div>



          </div>



        </div>



      )}



      {/* ANIMATIONS */}



      <style>{`



        @keyframes scale-in {



          from {



            opacity: 0;



            transform: scale(0.96);



          }



          to {



            opacity: 1;



            transform: scale(1);



          }



        }



        @keyframes slide-in {



          from {



            transform: translateX(100%);



          }



          to {



            transform: translateX(0);



          }



        }



        .animate-scale-in {



          animation: scale-in 0.2s ease-out;



        }



        .animate-slide-in {



          animation: slide-in 0.3s ease-out;



        }



      `}</style>



    </div>



  );



}



// =====================================================



// STAT CARD



// =====================================================



function StatCard({



  title,



  value,



  icon,



  iconClass,



  description,



}) {



  return (



    <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">



      <div className="flex items-center justify-between">



        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">



          {title}



        </span>



        <div



          className={`p-2.5 rounded-2xl ${iconClass}`}



        >



          {icon}



        </div>



      </div>



      <div className="text-3xl font-extrabold tracking-tight mt-4 text-slate-950">



        {value}



      </div>



      <p className="text-xs text-slate-400 mt-1">



        {description}



      </p>



    </div>



  );



}



// =====================================================



// SECTION TITLE



// =====================================================



function SectionTitle({



  icon,



  title,



}) {



  return (



    <div className="flex items-center gap-2 mb-4">



      <div className="p-2 rounded-xl bg-blue-50 text-blue-600">



        {icon}



      </div>



      <h3 className="font-bold text-slate-900">



        {title}



      </h3>



    </div>



  );



}



// =====================================================



// INFO BOX



// =====================================================



function InfoBox({



  label,



  value,



}) {



  return (



    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">



      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">



        {label}



      </p>



      <p className="text-sm font-semibold text-slate-800 mt-1.5">



        {value || "N/A"}



      </p>



    </div>



  );



}



// =====================================================



// COMPARISON ROW



// =====================================================



function ComparisonRow({



  label,



  current,



  requested,



  onChange,



}) {



  return (



    <div className="rounded-2xl border border-slate-100 overflow-hidden">



      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">



        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">



          {label}



        </span>



      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2">



        <div className="p-4 border-b sm:border-b-0 sm:border-r border-slate-100">



          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">



            Current



          </p>



          <p className="text-sm font-medium text-slate-700 break-all">



            {current || "Not available"}



          </p>



        </div>



        <div className="p-4">



          <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mb-1">



            Requested



          </p>



          <input



            value={requested || ""}



            onChange={(e) =>



              onChange(e.target.value)



            }



            placeholder="Requested value"



            className="w-full bg-emerald-50/40 border border-emerald-100 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition"



          />



        </div>



      </div>



    </div>



  );



}



// =====================================================



// STATUS BADGE



// =====================================================



function StatusBadge({ status }) {



  const base =



    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border";



  switch (status?.toLowerCase()) {



    case "resolved":



      return (



        <span



          className={`${base} bg-emerald-50 text-emerald-800 border-emerald-100`}



        >



          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />



          Resolved



        </span>



      );



    case "rejected":



      return (



        <span



          className={`${base} bg-rose-50 text-rose-800 border-rose-100`}



        >



          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />



          Rejected



        </span>



      );



    case "in_progress":



      return (



        <span



          className={`${base} bg-indigo-50 text-indigo-800 border-indigo-100`}



        >



          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />



          In Progress



        </span>



      );



    default:



      return (



        <span



          className={`${base} bg-amber-50 text-amber-900 border-amber-100`}



        >



          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />



          Pending



        </span>



      );



  }



}



// =====================================================



// DATE HELPERS



// =====================================================



function formatBankFieldLabel(field) {



  const labels = {



    beneficiaryName: "Beneficiary Name",



    accountNumber: "Account Number",



    ifsc: "IFSC",



    branch: "Branch",



    cancelCheque: "Cancelled Cheque",



  };



  return labels[field] || field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());



}



function formatDate(date) {



  if (!date) return "N/A";



  return new Date(date).toLocaleDateString(



    "en-IN",



    {



      day: "2-digit",



      month: "short",



      year: "numeric",



    }



  );



}



function formatTime(date) {



  if (!date) return "";



  return new Date(date).toLocaleTimeString(



    "en-IN",



    {



      hour: "2-digit",



      minute: "2-digit",



    }



  );



}
