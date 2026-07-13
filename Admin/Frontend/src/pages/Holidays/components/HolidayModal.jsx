import React from "react";
import { FiX } from "react-icons/fi";

export default function HolidayModal({
    isOpen, onClose, modalMode,
    title, setTitle, date, setDate, description, setDescription,
    onSubmit
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 w-full max-w-[390px] rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                        {modalMode === "create" ? "Add Shop Closure" : "Edit Holiday"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <FiX />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="mt-4 space-y-4 text-xs">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Holiday Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Independence Day, Christmas Day"
                            className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Holiday Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-150"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            placeholder="Closure notes..."
                            className="w-full mt-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-855 dark:text-slate-150 resize-none"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full h-11 mt-4 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                    >
                        {modalMode === "create" ? "Add Holiday" : "Update Holiday"}
                    </button>
                </form>
            </div>
        </div>
    );
}
