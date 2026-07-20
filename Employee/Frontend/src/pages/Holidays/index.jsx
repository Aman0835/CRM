import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getHolidays } from "../../services/holidayService";
import { FiSun, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Holidays() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await getHolidays();
                setHolidays(res?.data ?? []);
            } catch (err) {
                toast.error("Failed to load holidays");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const now = new Date();
    const filtered = holidays.filter((h) => new Date(h.date).getFullYear() === filterYear);

    const upcoming = filtered.filter((h) => new Date(h.date) >= now);
    const past = filtered.filter((h) => new Date(h.date) < now);

    const years = [...new Set(holidays.map((h) => new Date(h.date).getFullYear()))].sort((a, b) => b - a);
    if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear());

    return (
        <DashboardLayout title="Holidays" subtitle="Salon holiday calendar — plan your time off">
            <div className="space-y-6">
                {/* Header controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiSun className="text-amber-500 text-lg" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {filtered.length} Holiday{filtered.length !== 1 ? "s" : ""} in {filterYear}
                        </span>
                    </div>
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                        className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="skeleton h-20 rounded-2xl" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 py-20 text-center">
                        <FiCalendar className="mx-auto text-4xl text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-sm text-slate-400">No holidays found for {filterYear}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Upcoming */}
                        {upcoming.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                                    Upcoming
                                </h3>
                                <div className="space-y-3">
                                    {upcoming.map((h) => {
                                        const d = new Date(h.date);
                                        const daysAway = Math.ceil((d - now) / 86400000);
                                        return (
                                            <div
                                                key={h._id}
                                                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 flex items-center gap-5 hover:shadow-md transition"
                                            >
                                                {/* Date Badge */}
                                                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shrink-0 shadow-lg shadow-blue-500/20">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                                                        {SHORT_MONTHS[d.getMonth()]}
                                                    </span>
                                                    <span className="text-2xl font-extrabold leading-none">{d.getDate()}</span>
                                                    <span className="text-[9px] opacity-70">{d.getFullYear()}</span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                                        {h.title}
                                                    </p>
                                                    {h.description && (
                                                        <p className="text-xs text-slate-400 mt-0.5 truncate">{h.description}</p>
                                                    )}
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {d.toLocaleDateString("en-US", { weekday: "long" })}
                                                    </p>
                                                </div>

                                                {/* Days away */}
                                                <div className="shrink-0 text-right">
                                                    <span className="inline-block px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                                                        {daysAway === 0 ? "Today!" : daysAway === 1 ? "Tomorrow" : `${daysAway} days`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Past */}
                        {past.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                                    Past Holidays
                                </h3>
                                <div className="space-y-2">
                                    {past.reverse().map((h) => {
                                        const d = new Date(h.date);
                                        return (
                                            <div
                                                key={h._id}
                                                className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 flex items-center gap-4 opacity-60 hover:opacity-80 transition"
                                            >
                                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 shrink-0">
                                                    <span className="text-[9px] font-bold">{SHORT_MONTHS[d.getMonth()]}</span>
                                                    <span className="text-base font-extrabold leading-tight">{d.getDate()}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-through">
                                                        {h.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
