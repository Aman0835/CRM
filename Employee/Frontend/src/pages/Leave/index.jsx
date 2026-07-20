import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  applyLeave,
  cancelLeave,
  getMyLeaves,
} from "../../services/leaveService";

const leaveOptions = ["Sick Leave", "Casual Leave", "Annual Leave"];

export default function Leave() {
  const { employee } = useAuth();
  const [tab, setTab] = useState("apply");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leaveType: "Sick Leave",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const fetchLeaves = useCallback(async () => {
    if (!employee?.employeeId) return;
    setLoading(true);
    try {
      const result = await getMyLeaves(employee.employeeId);
      setLeaves(result?.data ?? []);
    } catch (error) {
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }, [employee?.employeeId]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!employee?.employeeId) {
      toast.error("Employee not found. Please log in again.");
      return;
    }
    if (!form.fromDate || !form.toDate) {
      toast.error("Please select leave dates");
      return;
    }
    if (new Date(form.toDate) < new Date(form.fromDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }
    if (!form.reason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        employeeId: employee.employeeId,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
        leaveType: form.leaveType,
      };

      await applyLeave(payload);

      toast.success("Leave request submitted");
      setForm({
        leaveType: "Sick Leave",
        fromDate: "",
        toDate: "",
        reason: "",
      });
      await fetchLeaves();
      setTab("history");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? "Failed to submit leave request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (
      !window.confirm("Are you sure you want to cancel this leave request?")
    ) {
      return;
    }
    try {
      await cancelLeave(leaveId);
      toast.success("Leave request cancelled.");
      fetchLeaves();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ?? "Failed to cancel leave request",
      );
    }
  };

  // Sort leaves by most recent first
  const sortedLeaves = [...leaves].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-4 pt-2">
        <div className="px-1">
          <h1 className="text-[22px] font-black text-white">Leave</h1>
          <p className="mt-1 text-[14px] text-[#7d93ba]">
            Request &amp; track your leaves
          </p>
        </div>

        <div className="rounded-full bg-[#1d2840] p-1">
          <div className="grid grid-cols-2 gap-1">
            {["apply", "history"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={[
                  "h-11 rounded-full text-[15px] font-bold transition",
                  tab === item ? "bg-[#356ef6] text-white" : "text-[#9db4d7]",
                ].join(" ")}>
                {item === "apply" ? "Apply Leave" : "History"}
              </button>
            ))}
          </div>
        </div>

        {tab === "apply" ? (
          <>
            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] bg-[#1d2840] p-6">
              <div>
                <label className="mb-3 block text-[12px] font-black uppercase tracking-[0.18em] text-[#8aa3ca]">
                  Leave Type
                </label>
                <select
                  value={form.leaveType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      leaveType: event.target.value,
                    }))
                  }
                  className="h-14 w-full rounded-[18px] bg-[#374764] px-5 text-[16px] font-semibold text-white outline-none">
                  {leaveOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-3 block text-[12px] font-black uppercase tracking-[0.18em] text-[#8aa3ca]">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.fromDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        fromDate: event.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-[18px] bg-[#374764] px-5 pr-4 text-[16px] font-semibold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-3 block text-[12px] font-black uppercase tracking-[0.18em] text-[#8aa3ca]">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.toDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        toDate: event.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-[18px] bg-[#374764] px-5 pr-4 text-[16px] font-semibold text-white outline-none"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-3 block text-[12px] font-black uppercase tracking-[0.18em] text-[#8aa3ca]">
                  Reason
                </label>
                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reason: event.target.value }))
                  }
                  placeholder="Briefly describe your reason..."
                  className="w-full rounded-[22px] bg-[#374764] px-5 py-4 text-[16px] text-white outline-none placeholder:text-[#667b9f]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-7 h-15 w-full rounded-[20px] bg-[#356ef6] text-[17px] font-black text-white shadow-[0_18px_36px_rgba(53,110,246,0.28)]">
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-[24px] bg-[#1d2840] px-5 py-8 text-center text-[14px] text-[#86a0c6]">
                Loading history...
              </div>
            ) : sortedLeaves.length > 0 ? (
              sortedLeaves.map((leave) => {
                const fromDate = new Date(leave.fromDate);
                const toDate = new Date(leave.toDate);
                const totalDays = Math.ceil((toDate - fromDate) / 86400000) + 1;
                const status = leave.status?.toLowerCase() || "pending";

                const statusClasses = {
                  approved: "bg-[#0d6c63] text-[#17e0a0]",
                  pending: "bg-[#5a4a1f] text-[#ffc400]",
                  rejected: "bg-[#632b2b] text-[#ff6b6b]",
                  cancelled: "bg-[#4a5568] text-[#cbd5e1]",
                };

                return (
                  <div
                    key={leave._id}
                    className="rounded-[24px] bg-[#1d2840] px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-black text-white">
                          {leave.leaveType || "Leave"}
                        </p>
                        <p className="mt-3 text-[14px] text-[#86a0c6]">
                          {fromDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {" – "}
                          {toDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {" · "}
                          {totalDays} day{totalDays > 1 ? "s" : ""}
                        </p>
                        <p className="mt-2 text-[13px] text-[#667b9f]">
                          &quot;{leave.reason}&quot;
                        </p>
                      </div>
                      <span
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold ${
                          statusClasses[status] || statusClasses.pending
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    {leave.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(leave._id)}
                        className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-red-400">
                        <FiX className="h-4 w-4" />
                        Cancel request
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-[24px] bg-[#1d2840] px-5 py-8 text-center text-[14px] text-[#86a0c6]">
                No leave requests found yet.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
