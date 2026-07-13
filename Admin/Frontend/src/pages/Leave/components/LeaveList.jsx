import React from "react";
import { FiCalendar, FiCheck, FiX, FiTrash2, FiInbox } from "react-icons/fi";

const getAvatarBg = (name) => {
    const colors = [
        "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30",
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30",
        "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-100/50 dark:border-violet-900/30",
        "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30",
        "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100/50 dark:border-pink-900/30"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function LeaveList({ loading, filteredRequests, employees, activeTab, onApprove, onReject, onDelete }) {
    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {filteredRequests.map((request) => {
                const emp = employees.find(e => e.employeeId === request.employeeId);
                const duration = Math.ceil(
                    (new Date(request.toDate) - new Date(request.fromDate)) / (1000 * 60 * 60 * 24)
                ) + 1;
                const fullName = emp ? `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Unknown Barber" : "Unknown Barber";
                const initials = (emp && emp.firstName && emp.lastName)
                    ? `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase()
                    : "UB";
                const avatarColorClass = getAvatarBg(fullName);

                return (
                    <article
                        key={request._id}
                        className="group relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 md:flex-row md:items-center md:justify-between hover:border-slate-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/10 dark:hover:border-slate-700/80"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-xs tracking-wider shadow-sm transition-transform duration-300 group-hover:scale-105 ${avatarColorClass}`}>
                                {initials}
                            </div>
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">{fullName}</h4>
                                    <span className="inline-flex items-center rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border border-slate-100 dark:border-slate-800">
                                        ID: {request.employeeId}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                        <FiCalendar className="text-slate-400 shrink-0" />
                                        <span>{new Date(request.fromDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span className="text-slate-300 dark:text-slate-700">→</span>
                                        <span>{new Date(request.toDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                    <span className="inline-flex items-center rounded-md bg-blue-50/50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                        {duration} Day{duration > 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="relative mt-3 pl-3 border-l-2 border-slate-200 dark:border-slate-850">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                                        "{request.reason || "No reason provided."}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                            {request.status === "pending" ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onApprove(request._id)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all font-bold px-4 text-xs dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                                    >
                                        <FiCheck className="text-sm" /> Approve
                                    </button>
                                    <button
                                        onClick={() => onReject(request._id)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all font-bold px-4 text-xs dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                                    >
                                        <FiX className="text-sm" /> Reject
                                    </button>
                                </div>
                            ) : (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                                    request.status === "approved"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/50"
                                        : "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900/50"
                                }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${request.status === "approved" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                                    {request.status}
                                </span>
                            )}
                            <button
                                onClick={() => onDelete(request._id)}
                                className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 border border-slate-150 hover:bg-red-50 hover:text-red-650 hover:border-red-200 transition-all flex items-center justify-center dark:bg-slate-800/40 dark:border-slate-800 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50 cursor-pointer"
                                title="Delete Request"
                            >
                                <FiTrash2 className="text-xs" />
                            </button>
                        </div>
                    </article>
                );
            })}
            {filteredRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/10">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-555 mb-4 shadow-inner">
                        <div className="absolute inset-0 rounded-2xl bg-blue-500/5 blur-md animate-pulse"></div>
                        <FiInbox className="text-2xl relative" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">
                        {activeTab === "pending"
                            ? "No Pending Requests"
                            : activeTab === "approved"
                                ? "No Approved Leaves"
                                : activeTab === "rejected"
                                    ? "No Rejected Leaves"
                                    : "No Requests Found"}
                    </h3>
                    <p className="mt-1 max-w-[280px] text-xs text-slate-400 dark:text-slate-500 leading-normal">
                        {activeTab === "pending"
                            ? "All employee leave applications have been reviewed. Good job!"
                            : `There are currently no leave requests categorized under "${activeTab}".`}
                    </p>
                </div>
            )}
        </div>
    );
}
