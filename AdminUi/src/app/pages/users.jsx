import { useEffect, useState } from "react";
import { getUsers } from "../../api/user";
import { 
  Users, 
  UserPlus, 
  Phone, 
  Calendar, 
  Loader2,
  UserX,
  Clock,
  Sparkles
} from "lucide-react";

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      // Smooth experience ke liye artificial micro-delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Simple Stats Calculation
  const totalUsers = users.length;
  
  // Recent Signups (Joined in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignups = users.filter(u => new Date(u.joinDate) >= thirtyDaysAgo).length;

  return (
    <div className="min-h-screen  text-slate-900 p-6 md:p-10 font-sans selection:bg-blue-50 selection:text-blue-700 relative">
      
      {/* Top Subtle Accent Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-1">
              <Users className="w-4 h-4" />
              Lead Directory
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
              New Signups
            </h1>
            <p className="text-slate-600 text-base mt-1.5 max-w-2xl">
              Directory of registered users who haven't made an investment yet.
            </p>
          </div>

          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="self-start md:self-auto group bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2.5 disabled:opacity-60"
          >
            <Loader2 className={`w-4 h-4 transition-colors ${loading ? "animate-spin text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
            {loading ? "Refreshing..." : "Refresh Users"}
          </button>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Total Registered Leads</span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {totalUsers}
            </div>
            <p className="text-xs text-slate-400 mt-1">Non-investing signed up accounts</p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Joined Recently</span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {recentSignups}
            </div>
            <p className="text-xs text-slate-400 mt-1">In the last 30 days</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl sm:col-span-2 lg:col-span-1 flex items-center gap-4">
             <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 border border-slate-100 shrink-0">
                 <Sparkles className="w-6 h-6" />
             </div>
             <div>
                 <h4 className="font-semibold text-slate-900 text-sm">Lead Conversion Tip</h4>
                 <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Reach out to recent signups via phone to guide them through their first property investment.</p>
             </div>
          </div>

        </div>

        {/* --- USERS TABLE CARD --- */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-5 px-6">User Name</th>
                  <th className="py-5 px-6">Phone Number</th>
                  <th className="py-5 px-6">Joined Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  // Skeleton Loading Rows
                  [...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-44" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-32" /></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded-lg w-28" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-20 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                          <UserX className="w-10 h-10 stroke-[1]" />
                        </div>
                        <p className="text-lg font-semibold text-slate-800">No new signups found</p>
                        <p className="text-sm text-slate-500 max-w-xs">When users create an account, their details will appear here until they make an investment.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user._id} 
                      className="hover:bg-slate-50/50 transition-colors duration-150 group"
                    >
                      {/* Name with Avatar */}
                      <td className="py-5 px-6 font-medium text-slate-950">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm ring-2 ring-white shadow-inner shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                              {user.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-slate-400 font-mono -mt-0.5">ID: {user._id?.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-5 px-6 text-slate-800 font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white transition-colors border border-slate-200">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-900">{user.phone || "Not Provided"}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-5 px-6 text-slate-600">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {user.joinDate 
                              ? new Date(user.joinDate).toLocaleDateString("en-IN", {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                }) 
                              : "N/A"
                            }
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- FOOTER INFO --- */}
        <div className="text-center py-4 text-slate-400 text-xs">
            Showing non-investor signup directory | Admin System
        </div>

      </div>
    </div>
  );
}