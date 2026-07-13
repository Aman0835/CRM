import React from "react";
import { FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function EmployeeCard({ barber, onEdit, onDelete }) {
    const navigate = useNavigate();

    return (
        <article className="panel-surface rounded-[24px] p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-colors text-slate-800 dark:text-slate-100">
            <div>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate(`/employees/${barber._id}`)}>
                        {barber.profileImage ? (
                            <img src={barber.profileImage} alt={barber.firstName}
                                className="h-14 w-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-800" />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-base font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                {barber.firstName[0]}{barber.lastName[0]}
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-bold text-slate-805 dark:text-slate-105 hover:text-blue-600 transition">
                                {barber.firstName} {barber.lastName}
                            </h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                                {barber.role}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-1.5">
                        <button onClick={() => onEdit(barber)} type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                            title="Edit Profile">
                            <FiEdit2 className="text-xs" />
                        </button>
                        <button onClick={() => onDelete(barber._id)} type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition"
                            title="Delete Employee">
                            <FiTrash2 className="text-xs" />
                        </button>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/20 p-2.5 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-semibold">Wage scale</span>
                        <span className="font-bold block mt-1 text-slate-800 dark:text-slate-200">
                            ${barber.monthlySalary?.toLocaleString()}/mo
                        </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/20 p-2.5 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-semibold">Status</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mt-1 ${
                            barber.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900" :
                            barber.status === "on_leave" ? "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900" :
                            "bg-slate-100 text-slate-550 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}>
                            {barber.status || "active"}
                        </span>
                    </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div className="flex items-center gap-2"><FiMail className="text-blue-500 shrink-0" /><span className="truncate">{barber.email}</span></div>
                    <div className="flex items-center gap-2"><FiPhone className="text-blue-500 shrink-0" /><span>{barber.phone}</span></div>
                    {barber.address && (
                        <div className="flex items-center gap-2"><FiMapPin className="text-blue-500 shrink-0" /><span className="truncate">{barber.address}</span></div>
                    )}
                </div>
            </div>

            <button onClick={() => navigate(`/employees/${barber._id}`)}
                className="mt-5 w-full text-xs font-semibold text-blue-600 bg-blue-50/50 py-2 rounded-xl border border-blue-100 hover:bg-blue-50 hover:text-blue-700 transition dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/40">
                View Full Workfile
            </button>
        </article>
    );
}
