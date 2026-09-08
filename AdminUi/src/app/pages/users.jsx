import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../../api/user";
import {
  Users,
  UserPlus,
  Mail,
  Loader2,
  UserX,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 5;

  // ============================================================
  // FETCH USERS
  // ============================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await getUsers();

      // Smooth experience ke liye artificial micro-delay
      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

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

  // ============================================================
  // STATS
  // ============================================================

  const totalUsers = users.length;

  // Recent Signups — last 30 days
  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30
  );

  const recentSignups = users.filter(
    (u) =>
      u.joinDate &&
      new Date(u.joinDate) >= thirtyDaysAgo
  ).length;

  // ============================================================
  // PAGINATION CALCULATION
  // ============================================================

  const totalPages = Math.ceil(
    users.length / usersPerPage
  );

  const paginatedUsers = useMemo(() => {
    const startIndex =
      (currentPage - 1) * usersPerPage;

    const endIndex =
      startIndex + usersPerPage;

    return users.slice(
      startIndex,
      endIndex
    );
  }, [users, currentPage]);

  // ============================================================
  // RESET PAGE IF DATA CHANGES
  // ============================================================

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [users.length, totalPages, currentPage]);

  // ============================================================
  // PAGINATION RANGE
  // ============================================================

  const startUser =
    users.length === 0
      ? 0
      : (currentPage - 1) * usersPerPage + 1;

  const endUser = Math.min(
    currentPage * usersPerPage,
    users.length
  );

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 p-6 md:p-10 font-sans selection:bg-blue-50 selection:text-blue-700 relative">

      {/* Top Subtle Accent Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200 pb-8">

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

            <Loader2
              className={`w-4 h-4 transition-colors ${
                loading
                  ? "animate-spin text-blue-600"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            />

            {loading
              ? "Refreshing..."
              : "Refresh Users"}

          </button>

        </div>

        {/* ================================================== */}
        {/* STATS CARDS */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* TOTAL USERS */}

          <div className="relative overflow-hidden bg-white border border-blue-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50" />

            <div className="relative flex items-center justify-between">

              <span className="text-slate-500 text-sm font-medium">
                Total Registered Leads
              </span>

              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Users className="w-5 h-5" />
              </div>

            </div>

            <div className="relative text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {totalUsers}
            </div>

            <p className="relative text-xs text-slate-400 mt-1">
              Non-investing signed up accounts
            </p>

          </div>

          {/* RECENT SIGNUPS */}

          <div className="relative overflow-hidden bg-white border border-indigo-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-50" />

            <div className="relative flex items-center justify-between">

              <span className="text-slate-500 text-sm font-medium">
                Joined Recently
              </span>

              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <UserPlus className="w-5 h-5" />
              </div>

            </div>

            <div className="relative text-4xl font-extrabold tracking-tight mt-4 text-slate-950">
              {recentSignups}
            </div>

            <p className="relative text-xs text-slate-400 mt-1">
              In the last 30 days
            </p>

          </div>

          {/* TIP */}

          <div className="relative overflow-hidden bg-violet-50/70 border border-violet-100 p-6 rounded-3xl sm:col-span-2 lg:col-span-1 flex items-center gap-4">

            <div className="p-3 bg-white rounded-2xl shadow-sm text-violet-600 border border-violet-100 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>

              <h4 className="font-semibold text-slate-900 text-sm">
                Lead Conversion Tip
              </h4>

              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Reach out to recent signups via email to guide them through their first property investment.
              </p>

            </div>

          </div>

        </div>

        {/* ================================================== */}
        {/* USERS TABLE CARD */}
        {/* ================================================== */}

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-slate-100">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-base font-bold text-slate-900">
                  New Signup Directory
                </h2>

                {!loading && (
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    {users.length}
                  </span>
                )}

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Registered users who have not made an investment yet
              </p>

            </div>

            {!loading && users.length > 0 && (
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startUser}
                </span>
                {" "}to{" "}
                <span className="font-semibold text-slate-700">
                  {endUser}
                </span>
                {" "}of{" "}
                <span className="font-semibold text-slate-700">
                  {users.length}
                </span>
              </div>
            )}

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-semibold">

                  <th className="py-5 px-6">
                    User Name
                  </th>

                  <th className="py-5 px-6">
                    Email
                  </th>

                  <th className="py-5 px-6">
                    Joined Date
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">

                {/* ================================================= */}
                {/* LOADING */}
                {/* ================================================= */}

                {loading ? (

                  [...Array(5)].map((_, idx) => (

                    <tr
                      key={idx}
                      className="animate-pulse"
                    >

                      <td className="p-6">
                        <div className="h-5 bg-slate-100 rounded-lg w-44" />
                      </td>

                      <td className="p-6">
                        <div className="h-5 bg-slate-100 rounded-lg w-52" />
                      </td>

                      <td className="p-6">
                        <div className="h-5 bg-slate-100 rounded-lg w-28" />
                      </td>

                    </tr>

                  ))

                ) : users.length === 0 ? (

                  /* ================================================= */
                  /* EMPTY */
                  /* ================================================= */

                  <tr>

                    <td
                      colSpan={3}
                      className="text-center py-20 text-slate-500"
                    >

                      <div className="flex flex-col items-center justify-center gap-3">

                        <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                          <UserX className="w-10 h-10 stroke-[1]" />
                        </div>

                        <p className="text-lg font-semibold text-slate-800">
                          No new signups found
                        </p>

                        <p className="text-sm text-slate-500 max-w-xs">
                          When users create an account, their details will appear here until they make an investment.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  /* ================================================= */
                  /* USERS */
                  /* ================================================= */

                  paginatedUsers.map((user) => (

                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/60 transition-colors duration-150 group"
                    >

                      {/* USER NAME */}

                      <td className="py-5 px-6 font-medium text-slate-950">

                        <div className="flex items-center gap-3.5">

                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm ring-2 ring-white shadow-inner shrink-0">

                            {user.name
                              ? user.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}

                          </div>

                          <div>

                            <div className="font-semibold text-base text-slate-900 group-hover:text-blue-600 transition-colors">

                              {user.name ||
                                "Unknown User"}

                            </div>

                            <div className="text-xs text-slate-400 font-mono -mt-0.5">

                              ID:{" "}
                              {user._id?.substring(
                                0,
                                8
                              )}
                              ...

                            </div>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="py-5 px-6 text-slate-800 text-sm">

                        <div className="flex items-center gap-2">

                          <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-white transition-colors border border-blue-100">

                            <Mail className="w-3.5 h-3.5" />

                          </div>

                          <span className="font-semibold text-slate-900">
                            {user.email ||
                              "Not Provided"}
                          </span>

                        </div>

                      </td>

                      {/* JOINED DATE */}

                      <td className="py-5 px-6 text-slate-600">

                        <div className="flex items-center gap-2 text-sm">

                          <Clock className="w-4 h-4 text-slate-400" />

                          <span className="font-medium text-slate-700">

                            {user.joinDate
                              ? new Date(
                                  user.joinDate
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}

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

        {/* ================================================== */}
        {/* PAGINATION */}
        {/* ================================================== */}

        {!loading &&
          users.length > 0 &&
          totalPages > 1 && (

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

              {/* RESULTS */}

              <p className="text-xs text-slate-500">

                Showing{" "}

                <span className="font-semibold text-slate-700">
                  {startUser}
                </span>

                {" "}to{" "}

                <span className="font-semibold text-slate-700">
                  {endUser}
                </span>

                {" "}of{" "}

                <span className="font-semibold text-slate-700">
                  {users.length}
                </span>

                {" "}users

              </p>

              {/* BUTTONS */}

              <div className="flex items-center gap-1.5">

                {/* PREVIOUS */}

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.max(
                          prev - 1,
                          1
                        )
                    )
                  }
                  className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  <ChevronLeft
                    className="h-4 w-4"
                  />

                  <span className="hidden sm:inline">
                    Previous
                  </span>

                </button>

                {/* PAGE NUMBERS */}

              {/* PAGE NUMBERS */}

<div className="flex items-center gap-1">

{/* FIRST PAGE */}

{totalPages > 0 && (
  <button
    type="button"
    onClick={() => setCurrentPage(1)}
    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
      currentPage === 1
        ? "bg-blue-600 text-white shadow-sm"
        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
    }`}
  >
    1
  </button>
)}

{/* LEFT DOTS */}

{currentPage > 3 && totalPages > 5 && (
  <span className="flex h-9 min-w-7 items-center justify-center text-xs font-semibold text-slate-400">
    ...
  </span>
)}

{/* MIDDLE PAGES */}

{Array.from(
  { length: totalPages },
  (_, index) => index + 1
)
  .filter((page) => {
    if (totalPages <= 5) {
      return true;
    }

    return (
      page !== 1 &&
      page !== totalPages &&
      Math.abs(page - currentPage) <= 1
    );
  })
  .map((page) => (
    <button
      key={page}
      type="button"
      onClick={() =>
        setCurrentPage(page)
      }
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
        currentPage === page
          ? "bg-blue-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {page}
    </button>
  ))}

{/* RIGHT DOTS */}

{currentPage < totalPages - 2 &&
  totalPages > 5 && (
    <span className="flex h-9 min-w-7 items-center justify-center text-xs font-semibold text-slate-400">
      ...
    </span>
  )}

{/* LAST PAGE */}

{totalPages > 1 && (
  <button
    type="button"
    onClick={() =>
      setCurrentPage(totalPages)
    }
    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
      currentPage === totalPages
        ? "bg-blue-600 text-white shadow-sm"
        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
    }`}
  >
    {totalPages}
  </button>
)}

</div>

                {/* NEXT */}

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        Math.min(
                          prev + 1,
                          totalPages
                        )
                    )
                  }
                  className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  <span className="hidden sm:inline">
                    Next
                  </span>

                  <ChevronRight
                    className="h-4 w-4"
                  />

                </button>

              </div>

            </div>
          )}

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-2 px-1 py-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <span>
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {loading
                ? 0
                : paginatedUsers.length}
            </span>
            {" "}users on this page
          </span>

          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Admin Lead Directory
          </span>

        </div>

      </div>
    </div>
  );
}