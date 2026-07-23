import React, { useState, useEffect } from "react";
import { 
     FiCheck, FiX, FiTrash2, FiSearch
} from "react-icons/fi";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import * as attendanceService from "../../services/attendanceService";
import * as employeeService from "../../services/employeeService";

export default function Attendance() {
    const [attendanceList, setAttendanceList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

    // Check-in modal states
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [actionType, setActionType] = useState("check-in"); // "check-in" | "check-out"

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const listRes = await attendanceService.getAttendanceList();
            if (listRes.success) {
                setAttendanceList(listRes.data);
            }
            const empRes = await employeeService.getEmployees({ limit: 100 });
            if (empRes.success) {
                setEmployees(empRes.data);
            }
        } catch (err) {
            console.error("Attendance fetch error:", err);
            toast.error("Failed to load attendance logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleLogDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this attendance log?")) return;
        try {
            const res = await attendanceService.deleteAttendance(id);
            if (res.success) {
                toast.success("Attendance log deleted");
                fetchAttendance();
            }
        } catch (err) {
            toast.error("Failed to delete log");
        }
    };

    const handleApproveEarlyCheckout = async (id) => {
        try {
            const res = await attendanceService.approveEarlyCheckout(id);
            if (res.success) {
                toast.success("Early checkout approved successfully!");
                fetchAttendance();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to approve early checkout");
        }
    };

    const handleRejectEarlyCheckout = async (id) => {
        try {
            const res = await attendanceService.rejectEarlyCheckout(id);
            if (res.success) {
                toast.success("Early checkout request rejected.");
                fetchAttendance();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject request");
        }
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployeeId) {
            toast.error("Please select a barber");
            return;
        }

        try {
            let res;
            if (actionType === "check-in") {
                res = await attendanceService.checkIn(selectedEmployeeId);
            } else {
                res = await attendanceService.checkOut(selectedEmployeeId);
            }

            if (res.success) {
                toast.success(res.message || "Attendance log updated successfully");
                setIsActionModalOpen(false);
                fetchAttendance();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to perform ${actionType}`);
        }
    };

    // Filter attendance logs by date and name search
    const filteredLogs = attendanceList.filter(log => {
        const matchesDate = !dateFilter || log.date === dateFilter;
        const emp = employees.find(e => e.employeeId === log.employeeId);
        const fullName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : "";
        const matchesSearch = !search || fullName.includes(search.toLowerCase()) || log.employeeId.toLowerCase().includes(search.toLowerCase());
        return matchesDate && matchesSearch;
    });

    // Stats calculations
    const todayLogs = attendanceList.filter(l => l.date === new Date().toISOString().split("T")[0]);
    const presentCount = todayLogs.filter(l => l.status === "Present").length;
    const absentCount = todayLogs.filter(l => l.status === "Absent").length;
    const leaveCount = todayLogs.filter(l => l.status === "Leave").length;

    return (
        <DashboardLayout
            title="Attendance"
            subtitle="Monitor daily attendance rosters, check-in schedules, and clock logs."
            action={
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setActionType("check-in");
                            if (employees.length > 0) setSelectedEmployeeId(employees[0].employeeId);
                            setIsActionModalOpen(true);
                        }}
                        type="button"
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                    >
                        <FiCheck className="text-sm" /> Check In
                    </button>
                    <button
                        onClick={() => {
                            setActionType("check-out");
                            if (employees.length > 0) setSelectedEmployeeId(employees[0].employeeId);
                            setIsActionModalOpen(true);
                        }}
                        type="button"
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-605 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <FiX className="text-sm" /> Check Out
                    </button>
                </div>
            }
        >
            {/* Quick Metrics */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4 text-slate-800 dark:text-slate-100">
                <div className="panel-surface rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Present Today</span>
                    <strong className="text-xl font-bold block mt-1.5 text-emerald-650 dark:text-emerald-500">{presentCount} Barbers</strong>
                </div>
                <div className="panel-surface rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">On Leave Today</span>
                    <strong className="text-xl font-bold block mt-1.5 text-orange-500">{leaveCount} Barbers</strong>
                </div>
                <div className="panel-surface rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Absent Today</span>
                    <strong className="text-xl font-bold block mt-1.5 text-red-500">{absentCount} Barbers</strong>
                </div>
                <div className="panel-surface rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Rostered Staff</span>
                    <strong className="text-xl font-bold block mt-1.5 text-slate-800 dark:text-slate-250">{employees.length} Crew</strong>
                </div>
            </section>

            {/* Logs Table Section */}
            <section className="panel-surface rounded-[24px] p-5 shadow-sm mt-6 text-slate-800 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Daily Logs</h3>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {/* Search */}
                        <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 focus-within:border-blue-500 focus-within:bg-white transition-all dark:bg-slate-800 dark:border-slate-700 dark:focus-within:bg-slate-850">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search barber..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Date Filter */}
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">Barber</th>
                                    <th className="py-3 px-4">Emp ID</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Check In</th>
                                    <th className="py-3 px-4">Check Out</th>
                                    <th className="py-3 px-4">Working Hours</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => {
                                    const emp = employees.find(e => e.employeeId === log.employeeId);
                                    return (
                                        <tr key={log._id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-850/10 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                                {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Barber"}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                                                {log.employeeId}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                                {log.date}
                                            </td>
                                            <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-500 font-medium">
                                                {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-orange-500 dark:text-orange-400 font-medium">
                                                {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                                {(() => {
                                                    const val = log.workingHours;
                                                    if (!val || isNaN(val) || val <= 0) return "-";
                                                    const mins = Math.round(val * 60);
                                                    if (mins < 1) return "< 1 min";
                                                    if (mins < 60) return `${mins} mins`;
                                                    const h = Math.floor(mins / 60);
                                                    const m = mins % 60;
                                                    if (m === 0) return `${h} hr${h > 1 ? "s" : ""}`;
                                                    return `${h} hr${h > 1 ? "s" : ""} ${m} min${m > 1 ? "s" : ""}`;
                                                })()}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                        log.status === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900" :
                                                        log.status === "Absent" ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-450 dark:border-red-900" :
                                                        "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-450 dark:border-orange-900"
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                    {log.earlyCheckoutStatus === "requested" && (
                                                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900">
                                                            Early Req: {log.earlyCheckoutReason || 'Personal'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {log.earlyCheckoutStatus === "requested" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApproveEarlyCheckout(log._id)}
                                                                title="Approve Early Checkout"
                                                                className="px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-100 transition flex items-center gap-1 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400"
                                                            >
                                                                <FiCheck className="text-xs" /> Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRejectEarlyCheckout(log._id)}
                                                                title="Reject Early Checkout"
                                                                className="px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 transition flex items-center gap-1 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
                                                            >
                                                                <FiX className="text-xs" /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleLogDelete(log._id)}
                                                        className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/20 dark:text-red-450 transition-colors"
                                                    >
                                                        <FiTrash2 className="text-xs" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                                            No logs found for this date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ACTION MODAL: Check In / Out on behalf of employee */}
            {isActionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 capitalize">
                                Admin {actionType} Roster
                            </h3>
                            <button
                                onClick={() => setIsActionModalOpen(false)}
                                className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleActionSubmit} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550">
                                    Select Employee
                                </label>
                                <select
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-700 outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:focus:bg-slate-850"
                                    required
                                >
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp.employeeId}>
                                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full h-11 mt-4 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition capitalize shadow-sm"
                            >
                                Confirm {actionType}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
