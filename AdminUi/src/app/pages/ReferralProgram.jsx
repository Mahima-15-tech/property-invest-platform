import { useEffect, useState } from "react";
import {
  Gift,
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  Save,
  Send,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import axios from "../../api/axios";

export function ReferralProgram() {
  const [program, setProgram] = useState({
    enabled: true,
    giftName: "",
    giftDescription: "",
  });

  const [rewards, setRewards] = useState([]);

  const [loadingProgram, setLoadingProgram] = useState(true);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const fetchProgram = async () => {
    try {
      setLoadingProgram(true);

      const res = await axios.get("/admin/referral-program");

      setProgram({
        enabled: res.data?.program?.enabled ?? true,
        giftName: res.data?.program?.giftName || "",
        giftDescription: res.data?.program?.giftDescription || "",
      });
    } catch (error) {
      console.error("REFERRAL PROGRAM ERROR:", error);
    } finally {
      setLoadingProgram(false);
    }
  };

  const fetchRewards = async () => {
    try {
      setLoadingRewards(true);

      const res = await axios.get("/admin/referral-rewards");

      setRewards(res.data?.rewards || []);
    } catch (error) {
      console.error("REFERRAL REWARDS ERROR:", error);
    } finally {
      setLoadingRewards(false);
    }
  };

  useEffect(() => {
    fetchProgram();
    fetchRewards();
  }, []);

  const handleSaveProgram = async () => {
    if (!program.giftName.trim()) {
      alert("Please enter a gift name.");
      return;
    }

    try {
      setSaving(true);

      const res = await axios.put("/admin/referral-program", {
        enabled: program.enabled,
        giftName: program.giftName.trim(),
        giftDescription: program.giftDescription.trim(),
      });

      setProgram({
        enabled: res.data?.program?.enabled ?? program.enabled,
        giftName: res.data?.program?.giftName || program.giftName,
        giftDescription:
          res.data?.program?.giftDescription || program.giftDescription,
      });

      alert("Referral program updated successfully.");
    } catch (error) {
      console.error("SAVE REFERRAL PROGRAM ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update referral program."
      );
    } finally {
      setSaving(false);
    }
  };

  const approveReward = async (id) => {
    try {
      setActionLoading(id);

      await axios.put(`/admin/referral-rewards/${id}/approve`);

      await fetchRewards();
    } catch (error) {
      console.error("APPROVE REWARD ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Unable to approve referral reward."
      );
    } finally {
      setActionLoading("");
    }
  };

  const rejectReward = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this referral reward?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);

      await axios.put(`/admin/referral-rewards/${id}/reject`);

      await fetchRewards();
    } catch (error) {
      console.error("REJECT REWARD ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Unable to reject referral reward."
      );
    } finally {
      setActionLoading("");
    }
  };

  const issueGift = async (id) => {
    const giftCode = window.prompt(
      "Enter gift code (optional):"
    );

    if (giftCode === null) return;

    try {
      setActionLoading(id);

      await axios.put(`/admin/referral-rewards/${id}/issue`, {
        giftCode: giftCode.trim(),
      });

      await fetchRewards();
    } catch (error) {
      console.error("ISSUE GIFT ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Unable to issue gift."
      );
    } finally {
      setActionLoading("");
    }
  };

  const pendingCount = rewards.filter(
    (reward) => reward.status === "pending"
  ).length;

  const approvedCount = rewards.filter(
    (reward) => reward.status === "approved"
  ).length;

  const issuedCount = rewards.filter(
    (reward) => reward.giftStatus === "issued"
  ).length;

  const rejectedCount = rewards.filter(
    (reward) => reward.status === "rejected"
  ).length;

  const statusBadge = (status) => {
    if (status === "approved") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }

    if (status === "rejected") {
      return (
        <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">
        <Clock3 className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Referral Program
              </h1>

              <p className="text-xs text-slate-500 mt-0.5">
                Manage investor referrals and gift rewards
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            fetchProgram();
            fetchRewards();
          }}
          className="rounded-xl text-xs gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* PROGRAM SETTINGS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Program Settings
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Configure the gift investors receive for successful referrals.
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
              program.enabled
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {program.enabled ? "Program Active" : "Program Disabled"}
          </div>
        </div>

        <div className="p-6">
          {loadingProgram ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-24 bg-slate-100 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-5">

              {/* ENABLE */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
  <div>
    <p className="text-sm font-semibold text-slate-800">
      Referral Program
    </p>

    <p className="mt-1 text-xs text-slate-500">
      Enable or disable investor referral rewards.
    </p>
  </div>

  <button
    type="button"
    onClick={() =>
      setProgram((prev) => ({
        ...prev,
        enabled: !prev.enabled,
      }))
    }
    aria-pressed={program.enabled}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 ${
      program.enabled
        ? "bg-blue-600 shadow-sm shadow-blue-200 focus:ring-blue-500/20"
        : "bg-slate-200 shadow-inner focus:ring-slate-400/20"
    }`}
  >
    <span
      className={`h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-300 ease-out ${
        program.enabled
          ? "translate-x-5"
          : "translate-x-0"
      }`}
    />
  </button>
</div>

              {/* GIFT NAME */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Gift Name
                </label>

                <Input
                  value={program.giftName}
                  onChange={(e) =>
                    setProgram((prev) => ({
                      ...prev,
                      giftName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Amazon Gift Voucher"
                  className="mt-2 h-10 rounded-xl text-sm"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Gift Description
                </label>

                <textarea
                  value={program.giftDescription}
                  onChange={(e) =>
                    setProgram((prev) => ({
                      ...prev,
                      giftDescription: e.target.value,
                    }))
                  }
                  placeholder="Describe the reward..."
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleSaveProgram}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Pending
            </p>

            <Clock3 className="w-4 h-4 text-amber-500" />
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-3">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Approved
            </p>

            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-3">
            {approvedCount}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Gifts Issued
            </p>

            <Send className="w-4 h-4 text-blue-500" />
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-3">
            {issuedCount}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Rejected
            </p>

            <XCircle className="w-4 h-4 text-red-500" />
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-3">
            {rejectedCount}
          </p>
        </div>

      </div>

      {/* REWARD TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Referral Rewards
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Review and manage rewards generated after successful investments.
              </p>
            </div>
          </div>
        </div>

        {loadingRewards ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Loading referral rewards...
          </div>
        ) : rewards.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Gift className="w-5 h-5" />
            </div>

            <p className="text-sm font-semibold text-slate-700 mt-4">
              No referral rewards yet
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Rewards will appear here after a referred investor successfully completes an investment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Referral By
                  </th>

                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Referred Investor
                  </th>

                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Gift
                  </th>

                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reward Status
                  </th>

                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Gift Status
                  </th>

                  <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rewards.map((reward) => {
                  const busy = actionLoading === reward._id;

                  return (
                    <tr
                      key={reward._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* REFERRER */}
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-800">
                          {reward.referrer?.name || "-"}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {reward.referralCode || "-"}
                        </p>
                      </td>

                      {/* REFERRED INVESTOR */}
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-800">
                          {reward.referredInvestor?.name || "-"}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {reward.referredInvestor?.email || "-"}
                        </p>
                      </td>

                      {/* GIFT */}
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-800">
                          {reward.giftName || "-"}
                        </p>

                        {reward.giftDescription && (
                          <p className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate">
                            {reward.giftDescription}
                          </p>
                        )}
                      </td>

                      {/* REWARD STATUS */}
                      <td className="px-6 py-4">
                        {statusBadge(reward.status)}
                      </td>

                      {/* GIFT STATUS */}
                      <td className="px-6 py-4">
                        {reward.giftStatus === "issued" ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Issued
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-50">
                            Not Issued
                          </Badge>
                        )}

                        {reward.giftCode && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            Code: {reward.giftCode}
                          </p>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">

                          {reward.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  approveReward(reward._id)
                                }
                                disabled={busy}
                                className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[10px]"
                              >
                                {busy ? "..." : "Approve"}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  rejectReward(reward._id)
                                }
                                disabled={busy}
                                className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-[10px]"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {reward.status === "approved" &&
                            reward.giftStatus !== "issued" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  issueGift(reward._id)
                                }
                                disabled={busy}
                                className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] gap-1.5"
                              >
                                <Send className="w-3 h-3" />
                                {busy ? "Issuing..." : "Issue Gift"}
                              </Button>
                            )}

                          {reward.status === "rejected" && (
                            <span className="text-[10px] text-slate-400">
                              No action
                            </span>
                          )}

                          {reward.giftStatus === "issued" && (
                            <span className="text-[10px] font-semibold text-emerald-600">
                              Gift Issued
                            </span>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}