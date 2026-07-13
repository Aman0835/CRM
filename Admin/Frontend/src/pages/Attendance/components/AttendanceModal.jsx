import React from "react";
import { FiX } from "react-icons/fi";

export default function AttendanceModal({
    isOpen,
    onClose,
    actionType,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    onSubmit
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 capitalize">
                        Admin {actionType} Roster
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
                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550">
                            Select Employee
                        </label>
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-700 outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:focus:bg-slate-850"
                            required
                        >
                            {employees.map(emp => (
                                <option key={emp._id} value={emp.employeeId}>
                                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full h-11 mt-4 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition capitalize shadow-sm"
                    >
                        Confirm {actionType}
                    </button>
                </form>
            </div>
        </div>
    );
}
