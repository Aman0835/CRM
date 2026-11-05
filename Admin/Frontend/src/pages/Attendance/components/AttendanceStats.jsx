import React from "react";

export default function AttendanceStats({
    presentCount = 0,
    leaveCount,
    absentCount,
    totalEmployees,
    totalBarbers
}) {
    const total = totalEmployees ?? totalBarbers ?? 0;
    const absentOrLeave = (absentCount !== undefined && absentCount !== 0)
        ? absentCount
        : (leaveCount !== undefined && leaveCount !== 0)
        ? leaveCount
        : Math.max(0, total - presentCount);

    const turnoutRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    return (
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4 text-slate-800 dark:text-slate-100">
            <div className="panel-surface rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Present Today</span>
                <strong className="text-xl font-bold block mt-1.5 text-emerald-650 dark:text-emerald-500">
                    {presentCount} {presentCount === 1 ? "Employee" : "Employees"}
                </strong>
            </div>
            <div className="panel-surface rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">On Leave / Absent</span>
                <strong className="text-xl font-bold block mt-1.5 text-rose-500">
                    {absentOrLeave} {absentOrLeave === 1 ? "Employee" : "Employees"}
                </strong>
            </div>
            <div className="panel-surface rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Turnout Rate</span>
                <strong className="text-xl font-bold block mt-1.5 text-cyan-600 dark:text-cyan-400">
                    {turnoutRate}%
                </strong>
            </div>
            <div className="panel-surface rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Total Employees</span>
                <strong className="text-xl font-bold block mt-1.5 text-blue-600 dark:text-blue-400">
                    {total} {total === 1 ? "Employee" : "Employees"}
                </strong>
            </div>
        </section>
    );
}
