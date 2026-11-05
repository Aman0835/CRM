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
    FiList,
    FiMapPin
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { checkIn, checkOut } from "../../services/attendanceService";
import { getCurrentPosition } from "../../utils/geoUtils";
import { useDashboard } from "./hooks/useDashboard";
import { cleanPhoneForWa } from "../../leads/utils/leadUtils";
import StatusBadge from "../../leads/components/StatusBadge";

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
                "flex h-[88px] flex-1 flex-col items-center justify-center rounded-[20px] text-center shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition px-1",
                disabled ? "cursor-not-allowed opacity-70" : "active:scale-[0.98]",
                tone,
            ].join(" ")}
        >
            <Icon className="mb-2 h-6 w-6 text-white" />
            <span className="text-[13px] font-bold text-white leading-tight">{label}</span>
        </button>
    );
}

function SummaryCard({ value, label, note, valueColor, tone }) {
    return (
        <div className={["flex-1 rounded-[22px] border p-4 shadow-[0_8px_20px_rgba(0,0,0,0.3)]", tone].join(" ")}>
            <div className={["text-[22px] font-black leading-none", valueColor].join(" ")}>{value}</div>
            <div className="mt-3 text-[13px] font-bold text-[#FBFAF6]">{label}</div>
            <div className="mt-1 text-[12px] text-[#D9C4AA]">{note}</div>
        </div>
    );
}

function ActivityRow({ icon: Icon, title, time, tone }) {
    return (
        <div className="flex items-center gap-4 rounded-[22px] bg-[#24110c] border border-[#381C14] px-4 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
            <div className={["flex h-11 w-11 items-center justify-center rounded-full", tone].join(" ")}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <p className="text-[15px] font-bold text-[#FBFAF6]">{title}</p>
            </div>
            <p className="text-[13px] text-[#D9C4AA]">{time}</p>
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
        totalVisits,
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
                    tone: "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30",
                });
            }

            if (item.checkOut) {
                entry.push({
                    key: `${item._id}-out`,
                    icon: FiActivity,
                    title: "Checked Out",
                    time: formatTime(item.checkOut),
                    tone: "bg-[#962A22]/20 text-[#E9D5BD] border border-[#962A22]/40",
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
                    tone: "bg-rose-950/60 text-rose-400 border border-rose-500/30",
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
                tone: "bg-[#381C14] text-[#D9C4AA] border border-[#D9C4AA]/20",
            },
        ];
    }, [recentAttendance]);

    const [locationStatusText, setLocationStatusText] = useState("");

    const handleCheckIn = async () => {
        if (!employee?.employeeId || checkedIn) return;

        setAttendanceAction("check-in");
        setLocationStatusText("Requesting GPS location...");
        try {
            let locationData = {};
            try {
                const pos = await getCurrentPosition();
                locationData = {
                    latitude: pos.latitude,
                    longitude: pos.longitude,
                    accuracy: pos.accuracy,
                };
            } catch (geoErr) {
                toast.error(geoErr.message || "Could not retrieve GPS coordinates");
                setAttendanceAction("");
                setLocationStatusText("");
                return;
            }

            setLocationStatusText("Verifying geofence with server...");
            await checkIn(employee.employeeId, locationData);
            toast.success("Checked in successfully (Location Verified)");
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Check-in failed");
        } finally {
            await fetchAll();
            setAttendanceAction("");
            setLocationStatusText("");
        }
    };

    const handleCheckOut = async () => {
        if (!employee?.employeeId || !checkedIn || checkedOut) return;

        setAttendanceAction("check-out");
        setLocationStatusText("Requesting GPS location...");
        try {
            let locationData = {};
            try {
                const pos = await getCurrentPosition();
                locationData = {
                    latitude: pos.latitude,
                    longitude: pos.longitude,
                    accuracy: pos.accuracy,
                };
            } catch (geoErr) {
                toast.error(geoErr.message || "Could not retrieve GPS coordinates");
                setAttendanceAction("");
                setLocationStatusText("");
                return;
            }

            setLocationStatusText("Verifying geofence with server...");
            await checkOut(employee.employeeId, locationData);
            toast.success("Checked out successfully (Location Verified)");
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Check-out failed");
        } finally {
            await fetchAll();
            setAttendanceAction("");
            setLocationStatusText("");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-5 pb-4 pt-2">
                <div className="px-1">
                    <p className="text-[14px] text-[#D9C4AA]">{getGreeting()}</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#D9C4AA]/30 bg-[#962A22] shadow-[0_8px_16px_rgba(150,42,34,0.3)]"
                            >
                                {employee?.profileImage ? (
                                    <img
                                        src={employee.profileImage}
                                        alt={`${employee?.firstName ?? "Employee"} profile`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#962A22] text-sm font-bold text-[#FBFAF6]">
                                        {initials}
                                    </div>
                                )}
                            </button>
                            <div>
                                <h1 className="text-[22px] font-black text-[#FBFAF6]">
                                    {employee?.firstName} {employee?.lastName}
                                </h1>
                                <p className="text-[14px] text-[#D9C4AA]">{formatDateLabel(currentTime)}</p>
                            </div>
                        </div>
                        <span className="text-[22px]">👋</span>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#962A22_0%,#5a1610_100%)] p-5.5 shadow-[0_22px_50px_rgba(150,42,34,0.35)] border border-[#D9C4AA]/30">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#E9D5BD]">Pipeline & Visits Summary</p>
                        <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-white/12 text-[#FBFAF6]">
                            <FiBriefcase className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Dual KPI Row: Total Leads & Total Visits at the Same Place */}
                    <div className="mt-3.5 grid grid-cols-2 divide-x divide-[#D9C4AA]/25 rounded-2xl bg-black/25 p-3.5 backdrop-blur-sm border border-[#D9C4AA]/20">
                        <div 
                            onClick={() => navigate("/leads")} 
                            className="pr-3 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#E9D5BD]">Total Leads</p>
                            <div className="mt-1.5 flex items-baseline gap-1.5">
                                <span className="text-[30px] font-black leading-none text-[#FBFAF6]">
                                    {leadsSummary?.totalLeads || 0}
                                </span>
                                <span className="text-[11px] font-bold text-[#D9C4AA]">Leads</span>
                            </div>
                        </div>

                        <div 
                            onClick={() => navigate("/visits")} 
                            className="pl-3.5 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#E9D5BD]">Total Visits</p>
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#D9C4AA]/20 text-[#FBFAF6] border border-[#D9C4AA]/40">
                                    SV Tagged
                                </span>
                            </div>
                            <div className="mt-1.5 flex items-baseline gap-1.5">
                                <span className="text-[30px] font-black leading-none text-[#D9C4AA]">
                                    {totalVisits}
                                </span>
                                <span className="text-[11px] font-bold text-[#E9D5BD]/90">Visits</span>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Metrics Row */}
                    <div className="mt-4 grid grid-cols-4 gap-2 text-center border-t border-[#D9C4AA]/20 pt-3.5">
                        <div onClick={() => navigate("/leads")} className="cursor-pointer">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#D9C4AA]">Active</p>
                            <div className="mt-1.5 flex items-center justify-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#1de58e]" />
                                <span className="text-[15px] font-black text-[#FBFAF6]">{leadsSummary?.totalActive || 0}</span>
                            </div>
                        </div>

                        <div onClick={() => navigate("/leads")} className="border-l border-[#D9C4AA]/20 cursor-pointer">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#D9C4AA]">Lost</p>
                            <div className="mt-1.5 flex items-center justify-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#ff4d4d]" />
                                <span className="text-[15px] font-black text-[#FBFAF6]">{leadsSummary?.totalLost || 0}</span>
                            </div>
                        </div>

                        <div onClick={() => navigate("/follow-ups")} className="border-l border-[#D9C4AA]/20 cursor-pointer">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#D9C4AA]">Follow-ups</p>
                            <p className="mt-1.5 text-[15px] font-black text-[#FBFAF6]">{leadsSummary?.todaysFollowUps || 0}</p>
                        </div>

                        <div onClick={() => navigate("/follow-ups")} className="border-l border-[#D9C4AA]/20 cursor-pointer">
                            <p className="text-[9px] font-black uppercase tracking-wider text-[#D9C4AA]">Reminders</p>
                            <p className="mt-1.5 text-[15px] font-black text-[#FBFAF6]">{reminders?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    <ActionButton
                        icon={FiPlusCircle}
                        label="New Lead"
                        tone="bg-[#962A22] text-[#FBFAF6] border border-[#D9C4AA]/20 shadow-[0_12px_24px_rgba(150,42,34,0.35)]"
                        onClick={() => navigate("/leads/new")}
                    />
                    <ActionButton
                        icon={FiList}
                        label="Leads"
                        tone="bg-[#381C14] text-[#E9D5BD] border border-[#AE9475]/30 hover:border-[#D9C4AA]/50"
                        onClick={() => navigate("/leads")}
                    />
                    <ActionButton
                        icon={FiMapPin}
                        label="Visits"
                        tone="bg-[#4a2219] text-[#FBFAF6] border border-[#D9C4AA]/30"
                        onClick={() => navigate("/visits")}
                    />
                    <ActionButton
                        icon={FiBell}
                        label="Follow-ups"
                        tone="bg-[#AE9475] text-[#381C14] font-black border border-[#D9C4AA]/40"
                        onClick={() => navigate("/follow-ups")}
                    />
                </div>

                {/* ── Mandatory Site Visit Tagging Quick Card ── */}
                <div
                    onClick={() => navigate("/visits/new")}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#381C14] via-[#4d2218] to-[#2b140e] border border-[#962A22]/50 cursor-pointer active:scale-[0.99] transition-all shadow-lg shadow-black/40"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#962A22]/25 text-[#E9D5BD] border border-[#962A22]/50">
                            <FiMapPin className="text-xl" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-[#FBFAF6] truncate">Site Visit Tagging Form</p>
                                <span className="text-[9px] bg-[#962A22]/30 text-[#E9D5BD] border border-[#962A22]/50 font-bold px-1.5 py-0.5 rounded-full shrink-0">Mandatory</span>
                            </div>
                            <p className="text-[11px] text-[#D9C4AA] truncate mt-0.5">Fill SV Number & tag client visit</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-[#E9D5BD] shrink-0 pl-2">Fill →</span>
                </div>

                {/* ── Attendance Card ── */}
                {checkedOut ? (
                    /* ✅ STATE 3: Day is done */
                    <div className="rounded-[22px] bg-[#24110c] border border-[#381C14] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#E9D5BD]">✅ Shift Complete</p>
                            <span className="rounded-full bg-[#381C14] px-3 py-1 text-[12px] font-bold text-[#FBFAF6] border border-[#D9C4AA]/30">
                                {todayAttendance?.status ?? "Present"}
                            </span>
                        </div>
                        <p className="text-[13px] text-[#D9C4AA] mb-4">You've completed your shift for today. See you tomorrow!</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-[16px] bg-[#1a0d09] px-3 py-3 text-center border border-[#381C14]">
                                <p className="text-[15px] font-black text-[#FBFAF6]">{formatTime(todayAttendance?.checkIn)}</p>
                                <p className="mt-1 text-[11px] text-[#AE9475]">Checked In</p>
                            </div>
                            <div className="rounded-[16px] bg-[#1a0d09] px-3 py-3 text-center border border-[#381C14]">
                                <p className="text-[15px] font-black text-[#E9D5BD]">{formatTime(todayAttendance?.checkOut)}</p>
                                <p className="mt-1 text-[11px] text-[#AE9475]">Checked Out</p>
                            </div>
                            <div className="rounded-[16px] bg-[#1a0d09] px-3 py-3 text-center border border-[#381C14]">
                                <p className="text-[15px] font-black text-[#D9C4AA]">{formatHourMinutes(todayAttendance?.workingHours ?? 0)}</p>
                                <p className="mt-1 text-[11px] text-[#AE9475]">Hours</p>
                            </div>
                        </div>
                    </div>
                ) : checkedIn ? (
                    /* 🟡 STATE 2: Checked in, not yet out */
                    <div className="rounded-[22px] bg-[#24110c] border border-[#D9C4AA]/30 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#AE9475]">You're Clocked In</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="h-2 w-2 rounded-full bg-[#1de58e] animate-pulse" />
                                    <p className="text-[15px] font-bold text-[#FBFAF6]">Since {formatTime(todayAttendance?.checkIn)}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="rounded-full bg-[#381C14] px-3 py-1 text-[12px] font-bold text-[#E9D5BD] border border-[#D9C4AA]/30">
                                    {todayAttendance?.status ?? "Present"}
                                </span>
                                {todayAttendance?.locationVerified && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#D9C4AA]">
                                        <FiCheck className="w-3 h-3 text-[#1de58e]" /> Location Verified
                                    </span>
                                )}
                            </div>
                        </div>

                        {employee?.assignedOffice && (
                            <div className="mb-3 flex items-center gap-1.5 text-xs text-[#D9C4AA] bg-[#1a0d09] px-3 py-1.5 rounded-xl border border-[#381C14]">
                                <FiMapPin className="text-[#962A22] shrink-0" />
                                <span className="truncate">
                                    Office: <strong className="text-[#FBFAF6]">{employee.assignedOffice.officeName || "Assigned Office"}</strong> ({employee.assignedOffice.allowedRadius || 100}m radius)
                                </span>
                            </div>
                        )}

                        <p className="text-[12px] text-[#AE9475] mb-4">
                            {locationStatusText || "Remember to check out before you leave."}
                        </p>
                        <button
                            onClick={handleCheckOut}
                            disabled={attendanceAction !== ""}
                            className="w-full py-3 rounded-[14px] bg-[#962A22] hover:bg-[#7e221b] text-[#FBFAF6] text-[14px] font-bold shadow-md shadow-[#962A22]/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <FiMapPin className="w-4 h-4" />
                            {attendanceAction === "check-out" ? (locationStatusText || "Saving...") : "⬇ Check Out (GPS Verified)"}
                        </button>
                    </div>
                ) : (
                    /* 🔴 STATE 1: Not started */
                    <div className="rounded-[22px] bg-[#24110c] border border-[#381C14] p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#AE9475]">Attendance Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="h-2 w-2 rounded-full bg-[#f8bf24]" />
                                    <p className="text-[15px] font-bold text-[#FBFAF6]">Not Checked In Yet</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-[#381C14] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D9C4AA] border border-[#381C14]">
                                Geofenced
                            </span>
                        </div>

                        {employee?.assignedOffice ? (
                            <div className="mb-3 flex items-center gap-1.5 text-xs text-[#D9C4AA] bg-[#1a0d09] px-3 py-1.5 rounded-xl border border-[#381C14]">
                                <FiMapPin className="text-[#962A22] shrink-0" />
                                <span className="truncate">
                                    Assigned Office: <strong className="text-[#FBFAF6]">{employee.assignedOffice.officeName}</strong> ({employee.assignedOffice.allowedRadius}m radius)
                                </span>
                            </div>
                        ) : (
                            <div className="mb-3 text-[11px] text-[#E9D5BD] bg-[#381C14] px-3 py-1.5 rounded-xl border border-[#962A22]/40">
                                No office assigned yet. Contact admin to assign your work location.
                            </div>
                        )}

                        <p className="text-[12px] text-[#AE9475] mb-4">
                            {locationStatusText || "Tap below to verify GPS and mark your attendance."}
                        </p>
                        <button
                            onClick={handleCheckIn}
                            disabled={attendanceAction !== ""}
                            className="w-full py-3 rounded-[14px] bg-[#962A22] hover:bg-[#7e221b] text-[#FBFAF6] text-[14px] font-bold shadow-md shadow-[#962A22]/40 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <FiMapPin className="w-4 h-4" />
                            {attendanceAction === "check-in" ? (locationStatusText || "Verifying Location...") : "⬆ Check In (GPS Verified)"}
                        </button>
                    </div>
                )}



                <div className="grid grid-cols-2 gap-3">
                    <SummaryCard value={presentDays} label="Present" note="days this month" valueColor="text-[#FBFAF6]" tone="border-[#381C14] bg-[#24110c]" />
                    <SummaryCard value={formatMoney(latestPayroll?.netSalary)} label="Net Pay" note={formatMonthLabel(latestPayroll?.month, latestPayroll?.year)} valueColor="text-[#E9D5BD]" tone="border-[#381C14] bg-[#24110c]" />
                </div>

                <div>
                    <div className="mb-4 flex items-center justify-between px-1">
                        <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[#D9C4AA]">Recent Activity</p>
                        <button
                            type="button"
                            onClick={() => navigate("/attendance")}
                            className="flex items-center gap-1 text-[12px] font-bold text-[#E9D5BD] hover:text-[#FBFAF6]"
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
                            <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[#D9C4AA]">My Recent Leads</p>
                            <button
                                type="button"
                                onClick={() => navigate("/leads")}
                                className="flex items-center gap-1 text-[12px] font-bold text-[#E9D5BD] hover:text-[#FBFAF6]"
                            >
                                View all
                                <FiArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentLeads?.length > 0 ? (
                                recentLeads.map((lead) => (
                                    <div
                                        key={lead._id}
                                        className="flex items-center gap-4 rounded-[22px] bg-[#24110c] border border-[#381C14] hover:border-[#AE9475]/40 px-4 py-4 cursor-pointer hover:bg-[#2d160f] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
                                        onClick={() => navigate(`/leads/${lead._id}`)}
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#381C14] text-[#E9D5BD] border border-[#D9C4AA]/20">
                                            <FiUser className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[15px] font-bold text-[#FBFAF6]">{lead.name}</p>
                                            <p className="text-[12px] text-[#D9C4AA]">{lead.phone.replace(/[^0-9]/g, "").slice(-4)}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            {lead.phone && (
                                                <a
                                                    href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-[#25D366] hover:text-slate-950 transition-all active:scale-95 shadow-sm"
                                                    title="Chat on WhatsApp"
                                                >
                                                    <FaWhatsapp className="h-4 w-4" />
                                                </a>
                                            )}
                                            <StatusBadge status={lead.status} size="xs" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <ActivityRow icon={FiBriefcase} title="No recent leads" time="--" tone="bg-[#381C14] text-[#D9C4AA] border border-[#D9C4AA]/20" />
                            )}
                        </div>
                    </div>

                    {/* Today's Follow-ups & Reminders Widget */}
                    <div>
                        <div className="mb-4 flex items-center justify-between px-1">
                            <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[#D9C4AA]">Today&apos;s Follow-ups</p>
                        </div>
                        <div className="space-y-3">
                            {reminders?.length > 0 ? (
                                reminders.map((lead) => (
                                    <div
                                        key={lead._id}
                                        className="flex items-center gap-4 rounded-[22px] bg-[#24110c] border border-[#381C14] hover:border-[#AE9475]/40 px-4 py-4 cursor-pointer hover:bg-[#2d160f] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
                                        onClick={() => navigate(`/leads/${lead._id}`)}
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#381C14] text-[#E9D5BD] border border-[#D9C4AA]/20">
                                            <FiBell className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[15px] font-bold text-[#FBFAF6]">{lead.name}</p>
                                            <p className="text-[12px] text-[#D9C4AA]">{lead.nextFollowUp?.action || "Follow up"}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-2">
                                            {lead.phone && (
                                                <a
                                                    href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-[#25D366] hover:text-slate-950 transition-all active:scale-95 shadow-sm"
                                                    title="Chat on WhatsApp"
                                                >
                                                    <FaWhatsapp className="h-4 w-4" />
                                                </a>
                                            )}
                                            <p className="text-[14px] font-bold text-[#E9D5BD]">{lead.nextFollowUp?.time || "Today"}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <ActivityRow icon={FiCheck} title="All caught up!" time="No follow-ups" tone="bg-[#381C14] text-emerald-400 border border-emerald-500/20" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
