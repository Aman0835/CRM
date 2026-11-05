import React from "react";
import { FiTrash2, FiMapPin, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function AttendanceTable({ loading, filteredLogs, employees, onDelete }) {
    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Emp ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Check In</th>
                        <th className="py-3 px-4">Check Out</th>
                        <th className="py-3 px-4">Working Hours</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.map((log) => {
                        const emp = employees.find(e => e.employeeId === log.employeeId);
                        const hasLocation = Boolean(log.officeName || log.checkInLocation?.verified || log.locationVerified);
                        const checkInDist = log.checkInLocation?.distance;

                        return (
                            <tr key={log._id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                    {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Employee"}
                                </td>
                                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                                    {log.employeeId}
                                </td>
                                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                    {log.date}
                                </td>
                                <td className="py-3.5 px-4">
                                    {hasLocation ? (
                                        <div className="flex items-center gap-1.5" title={`Office: ${log.officeName || "Assigned Office"} | Distance: ${checkInDist !== null && checkInDist !== undefined ? Math.round(checkInDist) + "m" : "N/A"}`}>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                                                <FiCheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                                <span>{log.officeName || "Verified"}</span>
                                            </span>
                                            {checkInDist !== null && checkInDist !== undefined && (
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    ({Math.round(checkInDist)}m)
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-normal">
                                            <span>Manual / Direct</span>
                                        </span>
                                    )}
                                </td>
                                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-500 font-medium">
                                    {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                </td>
                                <td className="py-3.5 px-4 text-orange-500 dark:text-orange-400 font-medium">
                                    {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                    {log.workingHours ? `${log.workingHours.toFixed(1)} hrs` : "-"}
                                </td>
                                <td className="py-3.5 px-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                        log.status === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900" :
                                        log.status === "Absent" ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-450 dark:border-red-900" :
                                        "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-450 dark:border-orange-900"
                                    }`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                    <button
                                        onClick={() => onDelete(log._id)}
                                        className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/20 dark:text-red-450 transition-colors"
                                    >
                                        <FiTrash2 className="text-xs" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredLogs.length === 0 && (
                        <tr>
                            <td colSpan="9" className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                                No logs found for this date.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
