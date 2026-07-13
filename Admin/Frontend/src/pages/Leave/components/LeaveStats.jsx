import React from "react";
import { FiClock, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export default function LeaveStats({ getLeaveCount }) {
    return (
        <section className="grid gap-5 grid-cols-1 sm:grid-cols-3">
            {/* Pending */}
            <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,158,11,0.05)] dark:border-amber-950/30 dark:bg-slate-900/40">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-amber-500/5 blur-xl transition-all duration-300 group-hover:scale-110"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Awaiting Review</span>
                        <span className="mt-2 block text-3xl font-black text-amber-500 tracking-tight">{getLeaveCount("pending")}</span>
                        <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">Pending approval</span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400">
                        <FiClock className="text-xl" />
                    </div>
                </div>
            </div>

            {/* Approved */}
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)] dark:border-emerald-950/30 dark:bg-slate-900/40">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-emerald-500/5 blur-xl transition-all duration-300 group-hover:scale-110"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Approved Leaves</span>
                        <span className="mt-2 block text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{getLeaveCount("approved")}</span>
                        <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">Active / upcoming</span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <FiCheckCircle className="text-xl" />
                    </div>
                </div>
            </div>

            {/* Rejected */}
            <div className="group relative overflow-hidden rounded-2xl border border-red-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(239,68,68,0.05)] dark:border-red-950/30 dark:bg-slate-900/40">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-red-500/5 blur-xl transition-all duration-300 group-hover:scale-110"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rejected Leaves</span>
                        <span className="mt-2 block text-3xl font-black text-red-500 tracking-tight">{getLeaveCount("rejected")}</span>
                        <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">Declined requests</span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400">
                        <FiAlertTriangle className="text-xl" />
                    </div>
                </div>
            </div>
        </section>
    );
}
