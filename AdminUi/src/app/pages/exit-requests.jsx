import { useEffect, useState } from "react";
import {
  getExitRequests,
  approveExit,
  rejectExit,
  updateInvestment,
  updateExit,
} from "../../api/exit";
// Premium Icons
import { 
  Check, 
  X, 
  Clock3, 
  Building, 
  UserCircle, 
  IndianRupee, 
  AlertTriangle,
  Loader2,
  PieChart,
  Save,
  RotateCcw,
  Edit3
} from "lucide-react";

export default function ExitRequests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [editData, setEditData] = useState({
    shares: "",
    amount: "",
  });
  const [actionLoading, setActionLoading] = useState(null);
  
  // Custom Modern Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: null, // 'approve' | 'reject'
    id: null,
    investorName: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getExitRequests();

setData(res.data || []);
      await new Promise(resolve => setTimeout(resolve, 800)); 
      setData(res.data || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openConfirmation = (type, id, name) => {
    setModal({ isOpen: true, type, id, investorName: name });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null, id: null, investorName: '' });
  };

  const handleConfirmAction = async () => {
    if (!modal.id || !modal.type) return;

    setActionLoading(modal.id);
    closeModal();

    try {
      if (modal.type === "approve") {
        await approveExit(modal.id);
      } else {
        await rejectExit(modal.id);
      }
      await loadData();
    } catch (err) {
      console.error(`Failed to ${modal.type} request:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async () => {
    try {
  
      const exit = data.find(
        (item) => item._id === editingId
      );
  
      await updateExit(exit._id, {
        shares: Number(editData.shares),
        amount: Number(editData.amount),
      });
  
      setEditingId(null);
  
      setEditData({
        shares: "",
        amount: "",
      });
  
      loadData();
  
    } catch (err) {
      console.error(err);
      alert("Failed to update exit");
    }
  };

  // Metrics calculation
  const totalAmount = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingCount = data.filter((d) => d.status === "pending").length;

  return (
    // MAIN BACKGROUND - NOW PURE WHITE
    <div className="min-h-screen text-slate-900 p-6 md:p-10 font-sans selection:bg-blue-50 selection:text-blue-700 relative">
      
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-1">
              <PieChart className="w-4 h-4" />
              Portfolio Management
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-slate-950">
              Exit Requests
            </h1>
            <p className="text-slate-600 text-base mt-1.5 max-w-2xl">
              Review and process liquidity requests from investors holding property shares.
            </p>
          </div>
          
          <button 
            onClick={loadData}
            disabled={loading}
            className="self-start md:self-auto group bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2.5 disabled:opacity-60"
          >
            <Loader2 className={`w-4 h-4 transition-colors ${loading ? "animate-spin text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
            {loading ? "Refreshing..." : "Refresh Board"}
          </button>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
               <IndianRupee size={100} strokeWidth={1} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">Total Exit Value Requested</span>
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                        <IndianRupee className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
                    ₹{totalAmount.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-slate-400 mt-1">Across all properties</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Awaiting Decision</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock3 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {pendingCount} <span className="text-xl text-slate-400 font-medium tracking-normal">Requests</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Requires immediate attention</p>
          </div>
          
          {/* Card 3 - Quick Filter/Info */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl shadow-inner sm:col-span-2 lg:col-span-1 flex items-center gap-4">
             <div className="p-3 bg-white rounded-full shadow-sm text-indigo-500 border border-slate-100">
                 <AlertTriangle className="w-6 h-6" />
             </div>
             <div>
                 <h4 className="font-semibold text-slate-900">Important Note</h4>
                 <p className="text-sm text-slate-600 mt-0.5">Approving an exit request will initiate the share transfer process. This action is irreversible.</p>
             </div>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-5 px-6">Investor</th>
                  <th className="py-5 px-6">Property</th>
                  <th className="py-5 px-6">Shares</th>
                  <th className="py-5 px-6">Amount</th>
                  <th className="py-5 px-6">Status</th>
                  <th className="py-5 px-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  [...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-32" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-40" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-16" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-24" /></td>
                      <td className="p-6"><div className="h-7 bg-slate-100 rounded-full w-20" /></td>
                      <td className="p-6"><div className="h-9 bg-slate-100 rounded-xl w-32 ml-auto" /></td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                            <PieChart className="w-10 h-10 stroke-[1]" />
                        </div>
                        <p className="text-lg font-semibold text-slate-800">No requests yet</p>
                        <p className="text-sm text-slate-500 max-w-xs">When investors request to exit, their applications will appear here for your review.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr 
                      key={item._id} 
                      className="hover:bg-slate-50/50 transition-colors duration-150 group"
                    >
                      {/* Investor */}
                      <td className="py-5 px-6 font-medium text-slate-950">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-semibold text-sm ring-2 ring-white shadow-inner">
                            {item.userId?.name ? item.userId.name.charAt(0).toUpperCase() : <UserCircle className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div>
                              <div className="font-semibold text-base">{item.userId?.name || "Unknown"}</div>
                              <div className="text-xs text-slate-500 -mt-0.5">Verified Investor</div>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="py-5 px-6 text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors border border-slate-200">
                             <Building className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">{item.propertyId?.name || "N/A"}</span>
                        </div>
                      </td>

                      {/* Shares */}
                      <td className="py-5 px-6 text-slate-700 font-mono text-sm tabular-nums">
                        {editingId === item._id ? (
                          <input
                            type="number"
                            value={editData.shares}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                shares: e.target.value,
                              })
                            }
                            className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                          />
                        ) : (
                          `${item.shares} Units`
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-5 px-6 font-bold text-slate-950 font-mono text-base tabular-nums">
                        {editingId === item._id ? (
                          <input
                            type="number"
                            value={editData.amount}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                amount: e.target.value,
                              })
                            }
                            className="w-32 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                          />
                        ) : (
                          `₹${item.amount.toLocaleString("en-IN")}`
                        )}
                      </td>

                      {/* Status Badging */}
                      <td className="py-5 px-6">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-right">
                      {item.status === "pending" ? (

editingId === item._id ? (

<div className="flex justify-end gap-2">

<button
onClick={handleSave}
className="bg-green-600 text-white px-3 py-2 rounded-xl"
>
Save
</button>

<button
onClick={()=>{
setEditingId(null);

setEditData({
shares:"",
amount:"",
});
}}
className="bg-gray-200 px-3 py-2 rounded-xl"
>
Cancel
</button>

<button
onClick={()=>
openConfirmation(
"approve",
item._id,
item.userId?.name
)
}
className="bg-blue-600 text-white px-3 py-2 rounded-xl"
>
Approve
</button>

</div>

) : (

<div className="flex justify-end gap-2">

<button
onClick={()=>{
setEditingId(item._id);

setEditData({
shares:item.shares,
amount:item.amount,
});
}}
className="bg-blue-600 text-white px-3 py-2 rounded-xl"
>
Edit
</button>

<button
onClick={()=>
openConfirmation(
"approve",
item._id,
item.userId?.name
)
}
className="bg-green-600 text-white px-3 py-2 rounded-xl"
>
Approve
</button>

<button
onClick={()=>
openConfirmation(
"reject",
item._id,
item.userId?.name
)
}
className="bg-red-600 text-white px-3 py-2 rounded-xl"
>
Reject
</button>

</div>

)

) : (

<StatusBadge status={item.status}/>

)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- CONFIRMATION MODAL (White Theme) --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 transform animate-scale-in">
            <div className="flex items-start gap-5">
              <div className={`p-3.5 rounded-2xl shrink-0 ${modal.type === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {modal.type === 'approve' ? <Check className="w-7 h-7 stroke-[2.5]" /> : <AlertTriangle className="w-7 h-7 stroke-[2.5]" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950 capitalize flex items-center gap-2">
                  Confirm {modal.type}al
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  You are about to <strong className={modal.type === 'approve' ? 'text-emerald-700' : 'text-rose-700'}>{modal.type}</strong> the exit request for <strong>{modal.investorName || 'this investor'}</strong>. Please ensure you have verified all details.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 text-white ${
                  modal.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Yes, {modal.type} request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Keyframe Animations via Style tag */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

// --- STATUS BADGE COMPONENT (White Theme Optimized) ---
function StatusBadge({ status }) {
  const baseClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border";
  
  switch (status?.toLowerCase()) {
    case "approved":
      return (
        <span className={`${baseClass} bg-emerald-50 text-emerald-800 border-emerald-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className={`${baseClass} bg-rose-50 text-rose-800 border-rose-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    default: // Pending
      return (
        <span className={`${baseClass} bg-amber-50 text-amber-900 border-amber-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Review
        </span>
      );
  }
}