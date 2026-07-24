import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import * as employeeService from "../../services/employeeService";
import * as attendanceService from "../../services/attendanceService";
import * as leaveService from "../../services/leaveService";
import * as payrollService from "../../services/payrollService";
import toast from "react-hot-toast";
import { 
    FiHome, FiCalendar, FiFileText, FiDollarSign, FiUser, 
    FiCheckCircle, FiClock, FiPlus, FiAlertTriangle, FiLogOut, FiBriefcase
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function EmployeeApp() {
    const { logout } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [activeTab, setActiveTab] = useState("home");

    // Simulation states
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [todayStatus, setTodayStatus] = useState(null);

    // Apply Leave Form
    const [leaveType, setLeaveType] = useState("sick");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [submittingLeave, setSubmittingLeave] = useState(false);

    // Fetch employee list on mount
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await employeeService.getEmployees({ limit: 100 });
                if (res.success && res.data.length > 0) {
                    setEmployees(res.data);
                    setSelectedEmp(res.data[0]);
                }
            } catch (err) {
                console.error("Error fetching employees:", err);
                toast.error("Failed to load employees for simulation");
            }
        };
        fetchEmployees();
    }, []);

    // Fetch details when selected employee changes
    useEffect(() => {
        if (!selectedEmp) return;
        fetchEmployeeDetails();
    }, [selectedEmp]);

    const fetchEmployeeDetails = async () => {
        const empId = selectedEmp.employeeId;
        try {
            // Fetch Attendance
            const attRes = await attendanceService.getAttendanceByEmployee(empId);
            if (attRes.success) {
                setAttendanceLogs(attRes.data);
                const todayStr = new Date().toISOString().split("T")[0];
                const todayLog = attRes.data.find(log => log.date === todayStr);
                setTodayStatus(todayLog || null);
            }

            // Fetch Leaves
            const leaveRes = await leaveService.getLeaves();
            if (leaveRes.success) {
                const empLeaves = leaveRes.data.filter(l => l.employeeId === empId);
                setLeaves(empLeaves);
            }

            // Fetch Payroll
            const payrollRes = await payrollService.getPayrollByEmployee(empId);
            if (payrollRes.success) {
                setPayrolls(payrollRes.data);
            }
        } catch (err) {
            console.error("Error fetching simulated employee data:", err);
        }
    };

    const handleCheckIn = async () => {
        if (!selectedEmp) return;
        try {
            const res = await attendanceService.checkIn(selectedEmp.employeeId);
            if (res.success) {
                toast.success("Checked in successfully!");
                fetchEmployeeDetails();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Already checked in today or failed");
        }
    };

    const handleCheckOut = async () => {
        if (!selectedEmp) return;
        try {
            const res = await attendanceService.checkOut(selectedEmp.employeeId);
            if (res.success) {
                toast.success("Checked out successfully!");
                fetchEmployeeDetails();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to check out");
        }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        if (!selectedEmp) return;
        if (!fromDate || !toDate || !reason) {
            toast.error("Please fill in all leave fields");
            return;
        }

        setSubmittingLeave(true);
        try {
            const res = await leaveService.createLeave({
                employeeId: selectedEmp.employeeId,
                fromDate,
                toDate,
                reason,
                status: "pending"
            });
            if (res.success) {
                toast.success("Leave request submitted!");
                setFromDate("");
                setToDate("");
                setReason("");
                fetchEmployeeDetails();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit leave request");
        } finally {
            setSubmittingLeave(false);
        }
    };

    // Calculate working stats
    const totalWorkingHours = attendanceLogs.reduce((acc, log) => acc + (log.workingHours || 0), 0);
    const overtimeHours = attendanceLogs.reduce((acc, log) => acc + (log.overtime || 0), 0);
    const leaveDays = leaves.filter(l => l.status === "approved").length;

    return (
        <DashboardLayout
            title="Employee Mobile View"
            subtitle="Test and simulate how your staff interacts with the roster portal."
            action={
                <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                        Simulate Barber:
                    </label>
                    <select
                        value={selectedEmp ? selectedEmp._id : ""}
                        onChange={(e) => {
                            const emp = employees.find(emp => emp._id === e.target.value);
                            if (emp) setSelectedEmp(emp);
                        }}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-650 outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                    >
                        {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>
                                {emp.firstName} {emp.lastName} ({emp.role})
                            </option>
                        ))}
                    </select>
                </div>
            }
        >
            <div className="flex justify-center py-4">
                {/* Mobile Viewport Wrapper */}
                <div className="relative w-full max-w-[370px] min-h-[660px] rounded-[42px] border-[8px] border-slate-800 bg-[#f8f9fa] dark:bg-slate-950 shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
                    {/* Speaker & Bezel */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
                        <div className="h-0.5 w-8 bg-slate-700 rounded-full"></div>
                    </div>

                    {/* App Header */}
                    <header className="pt-7 pb-3 px-5 border-b border-slate-100 bg-white sticky top-0 z-10 flex items-center justify-between dark:bg-slate-900 dark:border-slate-800">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.16em] text-slate-400 font-bold dark:text-slate-500">
                                Diva Portal
                            </p>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                                {selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : "Loading..."}
                            </h3>
                        </div>
                        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900">
                            {selectedEmp ? selectedEmp.firstName[0] + selectedEmp.lastName[0] : "AJ"}
                        </div>
                    </header>

                    {/* App Content */}
                    <main className="flex-1 p-4 overflow-y-auto pb-20 text-slate-700 dark:text-slate-200">
                        {selectedEmp ? (
                            <>
                                {/* TAB: HOME */}
                                {activeTab === "home" && (
                                    <div className="space-y-4 animate-fadeIn text-xs">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                                Welcome, {selectedEmp.firstName}!
                                            </h2>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>

                                        {/* Check In / Out Card */}
                                        <div className="panel-surface rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-100">
                                            <h4 className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-550 font-bold">
                                                Shift Status
                                            </h4>
                                            
                                            {todayStatus ? (
                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900">
                                                            <FiCheckCircle className="text-base" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-805 dark:text-slate-205">Checked In</p>
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                                At {new Date(todayStatus.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    {todayStatus.checkOut ? (
                                                        <div className="text-right">
                                                            <p className="text-[9px] text-slate-450 dark:text-slate-500">Shift ended</p>
                                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                {new Date(todayStatus.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={handleCheckOut}
                                                            className="rounded-lg bg-orange-50 px-3 py-1.5 text-[10px] font-bold text-orange-600 border border-orange-100 hover:bg-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900 transition-colors"
                                                        >
                                                            Check Out
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-450 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center">
                                                            <FiClock className="text-base" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Not Clocked In</p>
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Start daily attendance</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={handleCheckIn}
                                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 transition shadow-sm"
                                                    >
                                                        Clock In
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Monthly Quick Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2.5 text-slate-800 dark:text-slate-100">
                                            <div className="panel-surface rounded-xl p-2.5 text-center">
                                                <span className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-550 block">Worked</span>
                                                <strong className="text-sm block mt-1 text-slate-800 dark:text-slate-200">{attendanceLogs.length} days</strong>
                                            </div>
                                            <div className="panel-surface rounded-xl p-2.5 text-center">
                                                <span className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-550 block">Leave</span>
                                                <strong className="text-sm block mt-1 text-slate-800 dark:text-slate-200">{leaveDays} days</strong>
                                            </div>
                                            <div className="panel-surface rounded-xl p-2.5 text-center">
                                                <span className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-550 block">Hours</span>
                                                <strong className="text-sm block mt-1 text-slate-800 dark:text-slate-200">{totalWorkingHours.toFixed(1)}h</strong>
                                            </div>
                                        </div>

                                        {/* Recent activity log */}
                                        <div className="panel-surface rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-100">
                                            <h4 className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-550 font-bold">
                                                Attendance Logs
                                            </h4>
                                            <div className="mt-3 space-y-3">
                                                {attendanceLogs.slice(0, 3).map((log, i) => (
                                                    <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{log.date}</p>
                                                                <p className="text-[9px] text-slate-405 dark:text-slate-500 mt-0.5">
                                                                    Clock In: {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-slate-555 dark:text-slate-400 font-bold">
                                                            {log.workingHours ? `${log.workingHours.toFixed(1)} hrs` : "-"}
                                                        </span>
                                                    </div>
                                                ))}
                                                {attendanceLogs.length === 0 && (
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-2">No shift records</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: ATTENDANCE */}
                                {activeTab === "attendance" && (
                                    <div className="space-y-4 animate-fadeIn text-xs">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-805 dark:text-slate-105">Shift Roster Logs</h2>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Simulated calendar entries.</p>
                                        </div>

                                        <div className="panel-surface rounded-2xl overflow-hidden shadow-sm">
                                            <table className="w-full text-left text-[11px]">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                        <th className="p-2.5">Date</th>
                                                        <th className="p-2.5">In</th>
                                                        <th className="p-2.5">Out</th>
                                                        <th className="p-2.5 text-right">Hours</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendanceLogs.map((log, i) => (
                                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-850/10 transition-colors">
                                                            <td className="p-2.5 font-bold text-slate-700 dark:text-slate-350">{log.date}</td>
                                                            <td className="p-2.5 text-slate-500 dark:text-slate-400">
                                                                {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                            </td>
                                                            <td className="p-2.5 text-slate-500 dark:text-slate-400">
                                                                {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                            </td>
                                                            <td className="p-2.5 text-right font-bold text-slate-800 dark:text-slate-200">
                                                                {log.workingHours ? log.workingHours.toFixed(1) : "0.0"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {attendanceLogs.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="p-4 text-center text-slate-400 dark:text-slate-500">No shift history</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: LEAVE */}
                                {activeTab === "leave" && (
                                    <div className="space-y-4 animate-fadeIn text-xs">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-805 dark:text-slate-105">Leave Applications</h2>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Submit sick or casual leave requests.</p>
                                        </div>

                                        {/* Apply Form */}
                                        <form onSubmit={handleApplyLeave} className="panel-surface rounded-2xl p-4 shadow-sm space-y-3 text-slate-800 dark:text-slate-100">
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Apply for Leave</h4>
                                            
                                            <div className="space-y-2.5">
                                                <div>
                                                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Leave Type</label>
                                                    <select
                                                        value={leaveType}
                                                        onChange={(e) => setLeaveType(e.target.value)}
                                                        className="w-full h-9 mt-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:focus:bg-slate-855"
                                                    >
                                                        <option value="sick">Sick Leave</option>
                                                        <option value="casual">Casual Leave</option>
                                                        <option value="annual">Annual Leave</option>
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">From Date</label>
                                                        <input
                                                            type="date"
                                                            value={fromDate}
                                                            onChange={(e) => setFromDate(e.target.value)}
                                                            className="w-full h-9 mt-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:focus:bg-slate-855"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">To Date</label>
                                                        <input
                                                            type="date"
                                                            value={toDate}
                                                            onChange={(e) => setToDate(e.target.value)}
                                                            className="w-full h-9 mt-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:focus:bg-slate-855"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Reason</label>
                                                    <textarea
                                                        value={reason}
                                                        onChange={(e) => setReason(e.target.value)}
                                                        rows="2"
                                                        placeholder="Provide explanation..."
                                                        className="w-full mt-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-150 dark:focus:bg-slate-855 resize-none"
                                                        required
                                                    ></textarea>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submittingLeave}
                                                className="w-full h-9 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1 disabled:opacity-50"
                                            >
                                                {submittingLeave ? "Submitting..." : "Submit Leave"}
                                            </button>
                                        </form>

                                        {/* History */}
                                        <div className="panel-surface rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-100">
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Leave Roster</h4>
                                            <div className="space-y-2.5">
                                                {leaves.map((l, i) => (
                                                    <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                                                        <div>
                                                            <p className="font-bold text-slate-700 dark:text-slate-300">
                                                                {new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-0.5">"{l.reason}"</p>
                                                        </div>
                                                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                            l.status === "approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900" :
                                                            l.status === "rejected" ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-450 dark:border-red-900" :
                                                            "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-450 dark:border-orange-900"
                                                        }`}>
                                                            {l.status}
                                                        </span>
                                                    </div>
                                                ))}
                                                {leaves.length === 0 && (
                                                    <p className="text-slate-400 dark:text-slate-500 text-center py-2">No leave requests found</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: SALARY */}
                                {activeTab === "salary" && (
                                    <div className="space-y-4 animate-fadeIn text-xs">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-805 dark:text-slate-105">Wage statements</h2>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Review payroll releases.</p>
                                        </div>

                                        <div className="panel-surface rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-100">
                                            <h4 className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Standard Base Pay</h4>
                                            <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-200">${selectedEmp.monthlySalary?.toLocaleString()}</p>
                                            
                                            <div className="mt-3.5 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                                                <div className="flex justify-between">
                                                    <span>Basic pay:</span>
                                                    <span className="text-slate-800 dark:text-slate-200 font-semibold">${selectedEmp.monthlySalary?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Overtime (est):</span>
                                                    <span className="text-emerald-600 dark:text-emerald-500 font-semibold">+${(overtimeHours * 25).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Deductions:</span>
                                                    <span className="text-red-500 dark:text-red-455 font-semibold">-${(leaveDays * 100).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    <span>Estimated Net Salary:</span>
                                                    <span className="text-blue-600 dark:text-blue-400">
                                                        ${(selectedEmp.monthlySalary + (overtimeHours * 25) - (leaveDays * 100)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pay Statement History */}
                                        <div className="panel-surface rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-100">
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Payslip Ledger</h4>
                                            <div className="space-y-2.5">
                                                {payrolls.map((p, i) => (
                                                    <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                                                        <div>
                                                            <p className="font-bold text-slate-700 dark:text-slate-350">
                                                                Month: {p.month}/{p.year}
                                                            </p>
                                                            <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-0.5">Base: ${p.baseSalary}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">${p.netSalary}</span>
                                                            <span className="text-[8px] uppercase tracking-wider text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900 px-1.5 py-0.5 rounded border border-emerald-100 mt-1 inline-block">Paid</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {payrolls.length === 0 && (
                                                    <p className="text-slate-400 dark:text-slate-550 text-center py-2">No payroll statements found</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: PROFILE */}
                                {activeTab === "profile" && (
                                    <div className="space-y-4 animate-fadeIn text-xs">
                                        <div className="flex flex-col items-center text-center py-3 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-4">
                                            <div className="h-16 w-16 rounded-full bg-blue-100 text-lg font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center shadow-sm">
                                                {selectedEmp.firstName[0] + selectedEmp.lastName[0]}
                                            </div>
                                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-3">{selectedEmp.firstName} {selectedEmp.lastName}</h2>
                                            <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-semibold mt-0.5">
                                                {selectedEmp.role}
                                            </span>
                                            <span className="mt-2 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900 px-2.5 py-0.5 rounded-full font-bold capitalize">
                                                {selectedEmp.status}
                                            </span>
                                        </div>

                                        <div className="panel-surface rounded-2xl p-4 shadow-sm space-y-3 text-[11px] text-slate-800 dark:text-slate-100">
                                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                                <span className="text-slate-400 dark:text-slate-500">Employee ID</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-350">{selectedEmp.employeeId}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                                <span className="text-slate-400 dark:text-slate-500">Email</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-350">{selectedEmp.email}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                                <span className="text-slate-400 dark:text-slate-500">Phone</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-350">{selectedEmp.phone}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                                <span className="text-slate-400 dark:text-slate-500">Gender</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-350 capitalize">{selectedEmp.gender}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                                <span className="text-slate-400 dark:text-slate-500">Joining Date</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-350">{new Date(selectedEmp.joiningDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 dark:text-slate-500">Address</span>
                                                <span className="font-semibold text-slate-850 dark:text-slate-350 text-right max-w-[160px] truncate">{selectedEmp.address || "Not set"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[360px] text-slate-400 dark:text-slate-500 text-xs animate-pulse">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2"></div>
                                Loading mobile portal...
                            </div>
                        )}
                    </main>

                    {/* App Bottom Navigation Bar */}
                    <nav className="absolute bottom-0 inset-x-0 h-14 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-10 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab("home")}
                            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "home" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
                        >
                            <FiHome className="text-base" />
                            <span className="text-[8px] uppercase tracking-wider font-semibold">Home</span>
                        </button>
                        
                        <button
                            onClick={() => setActiveTab("attendance")}
                            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "attendance" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
                        >
                            <FiCalendar className="text-base" />
                            <span className="text-[8px] uppercase tracking-wider font-semibold">Logs</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("leave")}
                            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "leave" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
                        >
                            <FiFileText className="text-base" />
                            <span className="text-[8px] uppercase tracking-wider font-semibold">Leave</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("salary")}
                            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "salary" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
                        >
                            <FiDollarSign className="text-base" />
                            <span className="text-[8px] uppercase tracking-wider font-semibold">Pay</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "profile" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"}`}
                        >
                            <FiUser className="text-base" />
                            <span className="text-[8px] uppercase tracking-wider font-semibold">Profile</span>
                        </button>
                    </nav>
                </div>
            </div>
        </DashboardLayout>
    );
}
