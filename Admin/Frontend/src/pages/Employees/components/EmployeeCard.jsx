import React from "react";
import { FiEdit2, FiTrash2, FiPhone, FiBriefcase, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function EmployeeCard({ employee, barber, onEdit, onDelete }) {
    const navigate = useNavigate();
    const emp = employee || barber || {};

    const displayName = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.employeeId;
    const initials = displayName
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const dailyPay = emp.perDayPayout || (emp.monthlySalary ? Math.round(emp.monthlySalary / 30) : 0);

    return (
        <article className="panel-surface rounded-[24px] p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-colors text-slate-800 dark:text-slate-100">
            <div>
                {/* Header: Avatar, Name & Action buttons */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => navigate(`/employees/${emp._id}`)}>
                        {emp.profileImage && !emp.profileImage.includes("unsplash") ? (
                            <img
                                src={emp.profileImage}
                                alt={displayName}
                                className="h-12 w-12 shrink-0 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
                            />
                        ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                {initials || "EM"}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate hover:text-blue-600 transition">
                                {displayName}
                            </h3>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                {emp.employeeId}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                        <button
                            onClick={() => onEdit(emp)}
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                            title="Edit Employee"
                        >
                            <FiEdit2 className="text-xs" />
                        </button>
                        <button
                            onClick={() => onDelete(emp._id)}
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition"
                            title="Delete Employee"
                        >
                            <FiTrash2 className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Stat Tiles: Per Day Payment & Status */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/20 p-2.5 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-semibold">
                            Per Day Payout
                        </span>
                        <span className="font-bold block mt-1 text-slate-900 dark:text-slate-100 text-sm">
                            ₹{dailyPay.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/day</span>
                        </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/20 p-2.5 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-semibold">
                            Status
                        </span>
                        <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mt-1.5 ${
                                emp.status === "active"
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                                    : "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            }`}
                        >
                            {emp.status || "active"}
                        </span>
                    </div>
                </div>

                {/* Meta details: Mobile, Vendor, Sourcing Manager */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div className="flex items-center gap-2">
                        <FiPhone className="text-emerald-500 shrink-0 text-xs" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{emp.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiBriefcase className="text-amber-500 shrink-0 text-xs" />
                        <span className="text-slate-400 text-[11px]">Vendor:</span>
                        <span className="font-medium truncate text-slate-700 dark:text-slate-300">
                            {emp.vendor || "Direct / Internal"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiUsers className="text-indigo-500 shrink-0 text-xs" />
                        <span className="text-slate-400 text-[11px]">Sourced by:</span>
                        <span className="font-medium truncate text-slate-700 dark:text-slate-300">
                            {emp.sourcingManager || "Self / Direct"}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => navigate(`/employees/${emp._id}`)}
                className="mt-5 w-full text-xs font-semibold text-blue-600 bg-blue-50/50 py-2.5 rounded-xl border border-blue-100 hover:bg-blue-50 hover:text-blue-700 transition dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
                View Full Workfile
            </button>
        </article>
    );
}
