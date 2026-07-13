import React from "react";

export default function AttendanceStats({ presentCount, leaveCount, absentCount, totalBarbers }) {
    return (
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
                <strong className="text-xl font-bold block mt-1.5 text-slate-800 dark:text-slate-250">{totalBarbers} Crew</strong>
            </div>
        </section>
    );
}
