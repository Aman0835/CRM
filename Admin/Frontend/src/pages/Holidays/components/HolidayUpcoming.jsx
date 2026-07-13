import React from "react";
import { FiCalendar, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function HolidayUpcoming({ loading, upcomingHolidays, onEdit, onDelete }) {
    return (
        <section className="panel-surface rounded-[24px] p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-105 mb-4 flex items-center gap-2">
                <FiCalendar className="text-blue-500" /> Upcoming Shop Closures
            </h3>
            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {upcomingHolidays.map((holiday) => (
                        <article
                            key={holiday._id}
                            className="flex flex-col gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 p-4 md:flex-row md:items-center md:justify-between hover:border-slate-200 dark:hover:border-slate-750 transition-all text-slate-800 dark:text-slate-100"
                        >
                            <div className="flex items-start gap-3.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold text-xs shrink-0 mt-0.5">
                                    {new Date(holiday.date).toLocaleDateString("en-US", { day: '2-digit', month: 'short' })}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-850 dark:text-slate-150">{holiday.title}</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                        {new Date(holiday.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    {holiday.description && (
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{holiday.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                                <button
                                    onClick={() => onEdit(holiday)}
                                    className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                                    title="Edit Holiday"
                                >
                                    <FiEdit2 className="text-xs" />
                                </button>
                                <button
                                    onClick={() => onDelete(holiday._id)}
                                    className="h-8 w-8 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 flex items-center justify-center transition-colors"
                                    title="Delete Holiday"
                                >
                                    <FiTrash2 className="text-xs" />
                                </button>
                            </div>
                        </article>
                    ))}
                    {upcomingHolidays.length === 0 && (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-550 py-8">
                            No upcoming closures scheduled.
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
