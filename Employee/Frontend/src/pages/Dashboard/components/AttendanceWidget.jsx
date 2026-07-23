import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock, FiAlertCircle, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { checkIn, checkOut, requestEarlyCheckout } from "../../../services/attendanceService";

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

    // Early checkout request modal state
    const [earlyModalOpen, setEarlyModalOpen] = useState(false);
    const [earlyReason, setEarlyReason] = useState("");

    const isCheckedIn = Boolean(todayAttendance?.checkIn);
    const isCheckedOut = Boolean(todayAttendance?.checkOut);
    const earlyStatus = todayAttendance?.earlyCheckoutStatus || "none";

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
            const data = error?.response?.data;
            if (data?.requiresEarlyApproval || data?.message?.includes("Early Checkout")) {
                toast.error(data.message);
                setEarlyModalOpen(true);
            } else {
                toast.error(data?.message ?? "Check-out failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEarlyRequest = async (e) => {
        e.preventDefault();
        if (!earlyReason.trim()) {
            toast.error("Please enter a reason for early check-out.");
            return;
        }

        setLoading(true);
        try {
            await requestEarlyCheckout(employee.employeeId, earlyReason);
            toast.success("Early checkout request sent to Admin for approval.");
            setEarlyModalOpen(false);
            setEarlyReason("");
            onRefresh?.();
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Request failed");
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
                            : earlyStatus === "requested"
                              ? "bg-amber-500/20 text-amber-400"
                              : isCheckedIn
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-slate-800 text-slate-400",
                    ].join(" ")}
                >
                    {isCheckedOut ? "Completed" : earlyStatus === "requested" ? "Approval Pending" : isCheckedIn ? "Active" : "Idle"}
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

            {earlyStatus === "requested" && !isCheckedOut && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs font-semibold text-amber-500">
                    <FiAlertCircle className="shrink-0 text-base" />
                    <span>Early checkout request submitted. Awaiting Admin Approval.</span>
                </div>
            )}

            {!isCheckedOut && (
                <button
                    type="button"
                    onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                    disabled={loading || earlyStatus === "requested"}
                    className={[
                        "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                        isCheckedIn
                            ? "border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-blue-500 text-white hover:bg-blue-400",
                    ].join(" ")}
                >
                    {isCheckedIn ? <FiCheckCircle className="h-4 w-4" /> : <FiClock className="h-4 w-4" />}
                    {loading ? "Please wait..." : earlyStatus === "requested" ? "Early Checkout Requested" : isCheckedIn ? "Check Out" : "Check In"}
                </button>
            )}

            {/* Early Checkout Request Modal */}
            {earlyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Early Check-out Request
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEarlyModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <FiX className="text-lg" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEarlyRequest} className="mt-4 space-y-4">
                            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Standard shift hours have not completed yet. Provide a reason to send an Early Check-out request to Admin for approval.
                            </p>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Reason for Early Check-out
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={earlyReason}
                                    onChange={(e) => setEarlyReason(e.target.value)}
                                    placeholder="e.g. Personal emergency, doctor's appointment..."
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEarlyModalOpen(false)}
                                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                                >
                                    {loading ? "Submitting..." : "Send Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
