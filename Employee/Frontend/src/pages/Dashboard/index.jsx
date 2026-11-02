import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    FiActivity,
    FiArrowRight,
    FiCalendar,
    FiCheck,
    FiClock,
    FiLogIn,
    FiLogOut,
    FiWifi,
    FiPhone,
    FiBriefcase,
    FiUser,
    FiBell,
    FiPlusCircle,
    FiList
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { checkIn, checkOut } from "../../services/attendanceService";
import { useDashboard } from "./hooks/useDashboard";
import { cleanPhoneForWa } from "../../leads/utils/leadUtils";

function formatTime(value) {
    if (!value) return "--:--";
    return new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatHourMinutes(totalHours = 0) {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
}

function formatMoney(value) {
    if (!value) return "₹0.0k";
    return `₹${(Number(value) / 1000).toFixed(1)}k`;
}

function formatDateLabel(value = new Date()) {
    return value.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

function formatMonthLabel(month, year) {
    if (!month || !year) {
        return formatDateLabel(new Date()).split(",").slice(1).join(",").trim();
    }

    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
}

function ActionButton({ icon: Icon, label, tone, onClick, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={[
                "flex h-[88px] flex-1 flex-col items-center justify-center rounded-[20px] text-center shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition",
                disabled ? "cursor-not-allowed opacity-70" : "active:scale-[0.98]",
                tone,
            ].join(" ")}
        >
            <Icon className="mb-3 h-7 w-7 text-white" />
            <span className="text-[15px] font-bold text-white">{label}</span>
        </button>
    );
}

function SummaryCard({ value, label, note, valueColor, tone }) {
    return (
        <div className={["flex-1 rounded-[22px] border p-4", tone].join(" ")}>
            <div className={["text-[22px] font-black leading-none", valueColor].join(" ")}>{value}</div>
            <div className="mt-3 text-[13px] font-bold text-white">{label}</div>
            <div className="mt-1 text-[12px] text-[#6f88b1]">{note}</div>
        </div>
    );
}

function ActivityRow({ icon: Icon, title, time, tone }) {
    return (
        <div className="flex items-center gap-4 rounded-[20px] bg-[#1a2438] px-4 py-4">
            <div className={["flex h-11 w-11 items-center justify-center rounded-full", tone].join(" ")}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <p className="text-[15px] font-bold text-white">{title}</p>
            </div>
            <p className="text-[13px] text-[#6f88b1]">{time}</p>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { employee } = useAuth();
    const [attendanceAction, setAttendanceAction] = useState("");
    const {
        todayAttendance,
        presentDays,
        latestPayroll,
        recentAttendance,
        recentLeads,
        leadsSummary,
        reminders,
        fetchAll,
    } = useDashboard();

    const checkedIn = Boolean(todayAttendance?.checkIn);
    const checkedOut = Boolean(todayAttendance?.checkOut);
    const workedHours = todayAttendance?.workingHours ?? 0;
    const overtime = Math.max(workedHours - 8, 0);
    const currentTime = new Date();
    const initials = `${employee?.firstName?.[0] ?? ""}${employee?.lastName?.[0] ?? ""}`.toUpperCase() || "EM";

    const activityItems = useMemo(() => {
        const records = recentAttendance.flatMap((item) => {
            const entry = [];

            if (item.checkIn) {
                entry.push({
                    key: `${item._id}-in`,
                    icon: FiLogIn,
                    title: "Checked In",
                    time: formatTime(item.checkIn),
                    tone: "bg-[#113946] text-[#11d39a]",
                });
            }

            if (item.checkOut) {
                entry.push({
                    key: `${item._id}-out`,
                    icon: FiActivity,
                    title: "Checked Out",
                    time: formatTime(item.checkOut),
                    tone: "bg-[#162f53] text-[#50a0ff]",
                });
            }

            if (!item.checkIn && item.status === "Absent") {
                entry.push({
                    key: `${item._id}-absent`,
                    icon: FiClock,
                    title: "Marked Absent",
                    time: new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    }),
                    tone: "bg-[#3b1f27] text-[#ff6b78]",
                });
            }

            return entry;
        });

        if (records.length) return records.slice(0, 3);

        return [
            {
                key: "empty",
                icon: FiCheck,
                title: "No recent activity yet",
                time: "--:--",
                tone: "bg-[#1f3250] text-[#79a7ff]",
            },
        ];
    }, [recentAttendance]);

    const handleCheckIn = async () => {
        if (!employee?.employeeId || checkedIn) return;

        setAttendanceAction("check-in");
        try {
            await checkIn(employee.employeeId);
            toast.success("Checked in successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Check-in failed");
        } finally {
            await fetchAll();
            setAttendanceAction("");
        }
    };

    const handleCheckOut = async () => {
        if (!employee?.employeeId || !checkedIn || checkedOut) return;

        setAttendanceAction("check-out");
        try {
            await checkOut(employee.employeeId);
            toast.success("Checked out successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Check-out failed");
        } finally {
            await fetchAll();
            setAttendanceAction("");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-5 pb-4 pt-2">
                <div className="px-1">
                    <p className="text-[14px] text-[#7d93ba]">{getGreeting()}</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#1d2840]"
                            >
                                {employee?.profileImage ? (
                                    <img
                                        src={employee.profileImage}
                                        alt={`${employee?.firstName ?? "Employee"} profile`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#374764] text-sm font-bold text-white">
                                        {initials}
                                    </div>
                                )}
                            </button>
                            <div>
                                <h1 className="text-[22px] font-black text-white">
                                    {employee?.firstName} {employee?.lastName}
                                </h1>
                                <p className="text-[14px] text-[#7d93ba]">{formatDateLabel(currentTime)}</p>
                            </div>
                        </div>
                        <span className="text-[22px]">👋</span>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#2d63ea_0%,#4e8cf6_100%)] px-6 py-6 shadow-[0_22px_50px_rgba(47,108,246,0.35)] cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate("/leads")}>
                    <div className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-white/12">
                        <FiBriefcase className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#bfd2ff]">Pipeline Summary</p>
                    <div className="mt-3 flex items-center gap-3">
                        <span className="text-[28px] font-black text-white leading-none">
                            {leadsSummary?.totalLeads || 0}
                        </span>
                        <span className="text-[14px] font-bold text-[#d5e2ff] mt-1">Total Leads</span>
                    </div>
                    <div className="mt-7 grid grid-cols-2 gap-y-5 gap-x-4">
                        <div className="border-r border-white/20 pr-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d5e2ff]">Active</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="h-2 w-2 rounded-full bg-[#1de58e]" />
                                <p className="text-[16px] font-black text-white leading-none">{leadsSummary?.totalActive || 0}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d5e2ff]">Lost</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="h-2 w-2 rounded-full bg-[#ff2e3b]" />
                                <p className="text-[16px] font-black text-white leading-none">{leadsSummary?.totalLost || 0}</p>
                            </div>
                        </div>
                        <div className="border-r border-white/20 pr-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d5e2ff]">Follow-ups Today</p>
                            <p className="mt-2 text-[16px] font-black text-white leading-none">{leadsSummary?.todaysFollowUps || 0}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d5e2ff]">Pending Reminders</p>
                            <p className="mt-2 text-[16px] font-black text-white leading-none">{reminders?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <ActionButton
                        icon={FiPlusCircle}
                        label="New Lead"
                        tone="bg-[#10bf85]"
                        onClick={() => navigate("/leads/new")}
                    />
                    <ActionButton
                        icon={FiList}
                        label="View Leads"
                        tone="bg-[#4e8cf6]"
                        onClick={() => navigate("/leads")}
                    />
                    <ActionButton
                        icon={FiBell}
                        label="Follow-ups"
                        tone="bg-[#f9a20c]"
                        onClick={() => navigate("/follow-ups")}
                    />
                </div>

                {/* ── Attendance Card ── */}
                {checkedOut ? (
                    /* ✅ STATE 3: Day is done */
                    <div className="rounded-[22px] bg-[#082f36] border border-[#0e5c4e] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#1de58e]">✅ Shift Complete</p>
                            <span className="rounded-full bg-[#0d6c63] px-3 py-1 text-[12px] font-bold text-[#17e0a0]">
                                {todayAttendance?.status ?? "Present"}
                            </span>
                        </div>
                        <p className="text-[13px] text-[#7cbbaa] mb-4">You've completed your shift for today. See you tomorrow!</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-[16px] bg-[#0d3d34] px-3 py-3 text-center">
                                <p className="text-[15px] font-black text-[#16e0a0]">{formatTime(todayAttendance?.checkIn)}</p>
                                <p className="mt-1 text-[11px] text-[#5a9e8a]">Checked In</p>
                            </div>
                            <div className="rounded-[16px] bg-[#0d3d34] px-3 py-3 text-center">
                                <p className="text-[15px] font-black text-[#50a0ff]">{formatTime(todayAttendance?.checkOut)}</p>
                                <p className="mt-1 text-[11px] text-[#5a9e8a]">Checked Out</p>
                            </div>
                            <div className="rounded-[16px] bg-[#0d3d34] px-3 py-3 text-center">
                                <p className="text-[15px] font-black text-[#ffc400]">{formatHourMinutes(todayAttendance?.workingHours ?? 0)}</p>
                                <p className="mt-1 text-[11px] text-[#5a9e8a]">Hours</p>
                            </div>
                        </div>
                    </div>
                ) : checkedIn ? (
                    /* 🟡 STATE 2: Checked in, not yet out */
                    <div className="rounded-[22px] bg-[#1a2438] border border-[#4e8cf6]/30 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#6f88b1]">You're Clocked In</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="h-2 w-2 rounded-full bg-[#1de58e] animate-pulse" />
                                    <p className="text-[15px] font-bold text-white">Since {formatTime(todayAttendance?.checkIn)}</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-[#0d6c63] px-3 py-1 text-[12px] font-bold text-[#17e0a0]">
                                {todayAttendance?.status ?? "Present"}
                            </span>
                        </div>
                        <p className="text-[12px] text-[#6f88b1] mb-4">Remember to check out before you leave.</p>
                        <button
                            onClick={handleCheckOut}
                            disabled={attendanceAction !== ""}
                            className="w-full py-3 rounded-[14px] bg-[#ff2e3b] text-white text-[14px] font-bold shadow-md hover:bg-[#db232f] transition-colors disabled:opacity-50"
                        >
                            {attendanceAction === "check-out" ? "Saving..." : "⬇ Check Out"}
                        </button>
                    </div>
                ) : (
                    /* 🔴 STATE 1: Not started */
                    <div className="rounded-[22px] bg-[#1a2438] border border-[#334766] p-5">
                        <div className="mb-3">
                            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#6f88b1]">Attendance Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-2 w-2 rounded-full bg-[#f8bf24]" />
                                <p className="text-[15px] font-bold text-white">Not Checked In Yet</p>
                            </div>
                        </div>
                        <p className="text-[12px] text-[#6f88b1] mb-4">Tap below to mark your attendance for today.</p>
                        <button
                            onClick={handleCheckIn}
                            disabled={attendanceAction !== ""}
                            className="w-full py-3 rounded-[14px] bg-[#10bf85] text-white text-[14px] font-bold shadow-md hover:bg-[#0da673] transition-colors disabled:opacity-50"
                        >
                            {attendanceAction === "check-in" ? "Checking in..." : "⬆ Check In"}
                        </button>
                    </div>
                )}



                <div className="grid grid-cols-2 gap-3">
                    <SummaryCard value={presentDays} label="Present" note="days this month" valueColor="text-[#16e0a0]" tone="border-[#114f4d] bg-[#082f36]" />
                    <SummaryCard value={formatMoney(latestPayroll?.netSalary)} label="Net Pay" note={formatMonthLabel(latestPayroll?.month, latestPayroll?.year)} valueColor="text-[#4591ff]" tone="border-[#1f4584] bg-[#101f3c]" />
                </div>

                <div>
                    <div className="mb-4 flex items-center justify-between px-1">
                        <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[#93abd4]">Recent Activity</p>
                        <button
                            type="button"
                            onClick={() => navigate("/attendance")}
                            className="flex items-center gap-1 text-[12px] font-bold text-[#4f86ff]"
                        >
                            View all
                            <FiArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {activityItems.map((item) => {
                            const { key, ...props } = item;
                            return <ActivityRow key={key} {...props} />;
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {/* Recent Leads Widget */}
                    <div>
                        <div className="mb-4 flex items-center justify-between px-1">
                            <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[#93abd4]">My Recent Leads</p>
                            <button
                                type="button"
                                onClick={() => navigate("/leads")}
                                className="flex items-center gap-1 text-[12px] font-bold text-[#4f86ff]"
                            >
                                View all
                                <FiArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentLeads?.length > 0 ? (
                                recentLeads.map((lead) => (
                                    <div key={lead._id} className="flex items-center gap-4 rounded-[20px] bg-[#1a2438] px-4 py-4 cursor-pointer hover:bg-[#202c45] transition-colors" onClick={() => navigate(`/leads/${lead._id}`)}>
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#113946] text-[#11d39a]">
                                            <FiUser className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[15px] font-bold text-white">{lead.name}</p>
                                            <p className="text-[12px] text-[#6f88b1]">{lead.phone.replace(/[^0-9]/g, "").slice(-4)}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            {lead.phone && (
                                                <a
                                                    href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#143d2c] text-emerald-400 hover:bg-[#25D366] hover:text-slate-950 transition-all active:scale-95 shadow-sm"
                                                    title="Chat on WhatsApp"
                                                >
                                                    <FaWhatsapp className="h-4 w-4" />
                                                </a>
                                            )}
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d5e2ff] bg-[#162f53] px-2 py-1 rounded-full">{lead.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <ActivityRow icon={FiBriefcase} title="No recent leads" time="--" tone="bg-[#1f3250] text-[#79a7ff]" />
                            )}
                        </div>
                    </div>

                    {/* Today's Follow-ups & Reminders Widget */}
                    <div>
                        <div className="mb-4 flex items-center justify-between px-1">
                            <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[#93abd4]">Today&apos;s Follow-ups</p>
                        </div>
                        <div className="space-y-3">
                            {reminders?.length > 0 ? (
                                reminders.map((lead) => (
                                    <div key={lead._id} className="flex items-center gap-4 rounded-[20px] bg-[#1a2438] border border-[#ffb13b]/20 px-4 py-4 cursor-pointer hover:bg-[#202c45] transition-colors" onClick={() => navigate(`/leads/${lead._id}`)}>
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3b2b1f] text-[#ffb13b]">
                                            <FiBell className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[15px] font-bold text-white">{lead.name}</p>
                                            <p className="text-[12px] text-[#6f88b1]">{lead.nextFollowUp?.action || "Follow up"}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            {lead.phone && (
                                                <a
                                                    href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#143d2c] text-emerald-400 hover:bg-[#25D366] hover:text-slate-950 transition-all active:scale-95 shadow-sm"
                                                    title="Chat on WhatsApp"
                                                >
                                                    <FaWhatsapp className="h-4 w-4" />
                                                </a>
                                            )}
                                            <p className="text-[14px] font-bold text-[#ffb13b]">{lead.nextFollowUp?.time || "Today"}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <ActivityRow icon={FiCheck} title="All caught up!" time="No follow-ups" tone="bg-[#113946] text-[#11d39a]" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
