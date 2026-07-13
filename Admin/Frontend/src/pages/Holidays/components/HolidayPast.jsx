import React from "react";
import { FiTag, FiTrash2 } from "react-icons/fi";

export default function HolidayPast({ loading, pastHolidays, onDelete }) {
    return (
        <section className="panel-surface rounded-[24px] p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-105 mb-4 flex items-center gap-2">
                <FiTag className="text-slate-400 dark:text-slate-500" /> Past Closures
            </h3>
            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {pastHolidays.map((holiday) => (
                        <div
                            key={holiday._id}
                            className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0 text-xs"
                        >
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200">{holiday.title}</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                    {new Date(holiday.date).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => onDelete(holiday._id)}
                                className="h-7 w-7 rounded-md bg-slate-50 border border-slate-150 text-slate-400 hover:text-red-500 dark:bg-slate-800 dark:border-slate-700 transition-colors flex items-center justify-center"
                            >
                                <FiTrash2 className="text-xs" />
                            </button>
                        </div>
                    ))}
                    {pastHolidays.length === 0 && (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-550 py-8">
                            No past closures found.
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
