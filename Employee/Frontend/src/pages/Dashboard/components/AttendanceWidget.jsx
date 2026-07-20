import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { checkIn, checkOut } from "../../../services/attendanceService";

function formatTime(dateStr) {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function LiveTimer({ checkInTime }) {
    const [elapsed, setElapsed] = useState("00:00:00");

    useEffect(() => {
        if (!checkInTime) return undefined;

        const tick = () => {
            const diff = Date.now() - new Date(checkInTime).getTime();
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setElapsed(
                `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
            );
        };

        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, [checkInTime]);

    return <span className="font-mono text-3xl font-black text-white">{elapsed}</span>;
}

export default function AttendanceWidget({ todayAttendance, onRefresh }) {
    const { employee } = useAuth();
    const [loading, setLoading] = useState(false);

    const isCheckedIn = Boolean(todayAttendance?.checkIn);
    const isCheckedOut = Boolean(todayAttendance?.checkOut);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await checkIn(employee.employeeId);
            toast.success("Checked in successfully");
            onRefresh?.();
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Check-in failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            await checkOut(employee.employeeId);
            toast.success("Checked out successfully");
            onRefresh?.();
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Check-out failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-900/85 dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Today&apos;s Attendance</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {isCheckedOut ? "Day completed" : isCheckedIn ? "Shift in progress" : "Ready to start"}
                    </p>
                </div>
                <span
                    className={[
                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
                        isCheckedOut
                            ? "bg-emerald-500/20 text-emerald-400"
                            : isCheckedIn
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-slate-800 text-slate-400",
                    ].join(" ")}
                >
                    {isCheckedOut ? "Completed" : isCheckedIn ? "Active" : "Idle"}
                </span>
            </div>

                <div className="mt-5 rounded-[24px] bg-slate-100 px-5 py-6 text-center dark:bg-[linear-gradient(135deg,#111827_0%,#1e293b_100%)]">
                    {isCheckedIn && !isCheckedOut ? (
                        <LiveTimer checkInTime={todayAttendance.checkIn} />
                    ) : isCheckedOut ? (
                    <span className="font-mono text-3xl font-black text-emerald-400">
                        {(todayAttendance.workingHours ?? 0).toFixed(2)}h
                    </span>
                ) : (
                    <span className="font-mono text-3xl font-black text-slate-600">00:00:00</span>
                )}
                <p className="mt-2 text-xs text-slate-400">
                    {isCheckedOut ? "Total hours today" : isCheckedIn ? "Time since check-in" : "No punch recorded yet"}
                </p>
            </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800/80">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Check In</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{formatTime(todayAttendance?.checkIn)}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800/80">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Check Out</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{formatTime(todayAttendance?.checkOut)}</p>
                </div>
            </div>

            {!isCheckedOut && (
                <button
                    type="button"
                    onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                    disabled={loading}
                    className={[
                        "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                        isCheckedIn
                            ? "border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-blue-500 text-white hover:bg-blue-400",
                    ].join(" ")}
                >
                    {isCheckedIn ? <FiCheckCircle className="h-4 w-4" /> : <FiClock className="h-4 w-4" />}
                    {loading ? "Please wait..." : isCheckedIn ? "Check Out" : "Check In"}
                </button>
            )}
        </div>
    );
}
