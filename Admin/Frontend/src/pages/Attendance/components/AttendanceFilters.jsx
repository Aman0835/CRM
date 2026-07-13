import React from "react";
import { FiSearch } from "react-icons/fi";

const todayStr = () => new Date().toISOString().split("T")[0];
const yesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
};

export default function AttendanceFilters({ search, setSearch, dateFilter, setDateFilter }) {
    const isToday = dateFilter === todayStr();
    const isYesterday = dateFilter === yesterdayStr();

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Daily Logs</h3>

            <div className="flex flex-wrap gap-2 sm:flex-row sm:items-center">
                {/* Quick date pills */}
                <button
                    type="button"
                    onClick={() => setDateFilter(todayStr())}
                    className={`h-9 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                        isToday
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                >
                    Today
                </button>
                <button
                    type="button"
                    onClick={() => setDateFilter(yesterdayStr())}
                    className={`h-9 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                        isYesterday
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                >
                    Yesterday
                </button>

                {/* Search */}
                <div className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 focus-within:border-blue-500 focus-within:bg-white transition-all dark:bg-slate-800 dark:border-slate-700 dark:focus-within:bg-slate-850">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search barber..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 w-36"
                    />
                </div>

                {/* Date picker */}
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-350"
                />
            </div>
        </div>
    );
}
