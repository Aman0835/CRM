import React, { useState, useEffect } from "react";
import { FiCheck, FiX, FiBell, FiUsers, FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAttendance } from "./hooks/useAttendance";
import AttendanceStats from "./components/AttendanceStats";
import AttendanceFilters from "./components/AttendanceFilters";
import AttendanceTable from "./components/AttendanceTable";
import AttendanceModal from "./components/AttendanceModal";
import api from "../../services/api";

function NotCheckedInPanel() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/attendance/not-checked-in-today");
            if (res.data?.success) setData(res.data);
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStatus(); }, []);

    const handleSendReminder = async () => {
        setSending(true);
        try {
            const res = await api.post("/admin/attendance/send-reminders");
            if (res.data?.success) {
                toast.success(res.data.message);
                fetchStatus();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to send reminders");
        } finally {
            setSending(false);
        }
    };

    if (loading) return null;
    if (!data) return null;

    const notIn = data.data ?? [];
    const total = data.total ?? 0;
    const allCheckedIn = notIn.length === 0;

    return (
        <div className={[
            "rounded-[20px] border p-5 mb-6",
            allCheckedIn
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20"
        ].join(" ")}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        allCheckedIn ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"
                    ].join(" ")}>
                        {allCheckedIn
                            ? <FiCheck className="text-emerald-600 dark:text-emerald-400" />
                            : <FiAlertTriangle className="text-amber-600 dark:text-amber-400" />
                        }
                    </div>
                    <div>
                        {allCheckedIn ? (
                            <>
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">All employees checked in ✅</p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{total} of {total} employees have checked in today.</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                                    {notIn.length} employee{notIn.length > 1 ? "s" : ""} haven't checked in yet
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                                    {total - notIn.length} of {total} checked in · {notIn.map(e => e.name).join(", ")}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {!allCheckedIn && (
                    <button
                        onClick={handleSendReminder}
                        disabled={sending}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition disabled:opacity-60 shadow-sm"
                    >
                        <FiBell className="text-sm" />
                        {sending ? "Sending..." : "Send Reminder"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Attendance() {
    const {
        employees,
        loading,
        search,
        setSearch,
        dateFilter,
        setDateFilter,
        isActionModalOpen,
        setIsActionModalOpen,
        selectedEmployeeId,
        setSelectedEmployeeId,
        actionType,
        setActionType,
        handleLogDelete,
        handleActionSubmit,
        filteredLogs,
        presentCount,
        absentCount,
        leaveCount,
    } = useAttendance();

    const openModal = (type) => {
        setActionType(type);
        if (employees.length > 0) setSelectedEmployeeId(employees[0].employeeId);
        setIsActionModalOpen(true);
    };

    return (
        <DashboardLayout
            title="Attendance"
            subtitle="Monitor daily attendance rosters, check-in schedules, and clock logs."
            action={
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal("check-in")}
                        type="button"
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                    >
                        <FiCheck className="text-sm" /> Check In
                    </button>
                    <button
                        onClick={() => openModal("check-out")}
                        type="button"
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-605 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <FiX className="text-sm" /> Check Out
                    </button>
                </div>
            }
        >
            {/* Who hasn't checked in today? */}
            <NotCheckedInPanel />

            <AttendanceStats
                presentCount={presentCount}
                leaveCount={leaveCount}
                absentCount={absentCount}
                totalBarbers={employees.length}
            />

            <section className="panel-surface rounded-[24px] p-5 shadow-sm mt-6 text-slate-800 dark:text-slate-100">
                <AttendanceFilters
                    search={search}
                    setSearch={setSearch}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
                <AttendanceTable
                    loading={loading}
                    filteredLogs={filteredLogs}
                    employees={employees}
                    onDelete={handleLogDelete}
                />
            </section>

            <AttendanceModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                actionType={actionType}
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                setSelectedEmployeeId={setSelectedEmployeeId}
                onSubmit={handleActionSubmit}
            />
        </DashboardLayout>
    );
}
