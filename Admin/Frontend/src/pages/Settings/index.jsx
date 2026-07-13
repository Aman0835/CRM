import React from "react";
import { FiSettings, FiSliders, FiClock, FiDollarSign, FiSave, FiCalendar, FiPlus, FiTrash2 } from "react-icons/fi";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useSettings } from "./hooks/useSettings";

export default function Settings() {
    const {
        shopName, setShopName, contactEmail, setContactEmail,
        checkInTime, setCheckInTime, checkOutTime, setCheckOutTime,
        overtimeRate, setOvertimeRate, leaveDeduction, setLeaveDeduction,
        upcomingHolidays, hTitle, setHTitle, hDate, setHDate, hDesc, setHDesc,
        loadingHolidays, handleSave, handleAddHoliday, handleDeleteHoliday,
    } = useSettings();

    return (
        <DashboardLayout
            title="Settings"
            subtitle="Configure your barbershop parameters, working hours, and wage multipliers."
        >
            <div className="grid gap-6 lg:grid-cols-2 text-slate-805 dark:text-slate-105">
                {/* Column 1: System Config */}
                <section className="panel-surface rounded-[24px] p-6 shadow-sm text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                        <FiSettings className="text-blue-500 text-lg" />
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">System Configuration</h3>
                            <p className="text-slate-405 dark:text-slate-500 mt-0.5">Parameters applied across roster and payroll sheets.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                <FiSliders /> Shop Profile
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500">Shop Name</label>
                                    <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-850" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-500">Contact Email</label>
                                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-855" />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                <FiClock /> Shift Configuration
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-500">Check-in start time</label>
                                    <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} required
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-855" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-500">Standard check-out time</label>
                                    <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} required
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-855" />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                <FiDollarSign /> Wage parameters
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-500">Overtime hourly rate ($/hr)</label>
                                    <input type="number" value={overtimeRate} onChange={(e) => setOvertimeRate(Number(e.target.value))} required
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-855" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-455 dark:text-slate-500">Leave deduction daily rate ($/day)</label>
                                    <input type="number" value={leaveDeduction} onChange={(e) => setLeaveDeduction(Number(e.target.value))} required
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-855" />
                                </div>
                            </div>
                        </div>

                        <button type="submit"
                            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm mt-4">
                            <FiSave /> Save configurations
                        </button>
                    </form>
                </section>

                {/* Column 2: Holiday & Shop Closures Manager */}
                <section className="panel-surface rounded-[24px] p-6 shadow-sm text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                        <FiCalendar className="text-blue-500 text-lg" />
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Holidays & Shop Closures</h3>
                            <p className="text-slate-405 dark:text-slate-500 mt-0.5">Manage scheduled days when the shop is closed.</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddHoliday} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl space-y-3 mb-5">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Add Shop Closure</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Closure Reason</label>
                                <input type="text" value={hTitle} onChange={(e) => setHTitle(e.target.value)} placeholder="e.g. Christmas Day" required
                                    className="w-full h-8.5 mt-1 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" />
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-bold text-slate-455 dark:text-slate-500">Closure Date</label>
                                <input type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} required
                                    className="w-full h-8.5 mt-1 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] uppercase font-bold text-slate-455 dark:text-slate-500">Description (Optional)</label>
                            <input type="text" value={hDesc} onChange={(e) => setHDesc(e.target.value)} placeholder="Details or notes..."
                                className="w-full h-8.5 mt-1 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" />
                        </div>
                        <button type="submit"
                            className="inline-flex h-8.5 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition shadow-sm">
                            <FiPlus className="text-xs" /> Register Closure
                        </button>
                    </form>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Upcoming Closures ({upcomingHolidays.length})
                        </h4>
                        {loadingHolidays ? (
                            <div className="flex h-24 items-center justify-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-0.5">
                                {upcomingHolidays.map((h) => (
                                    <div key={h._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/10 text-xs">
                                        <div>
                                            <p className="font-bold text-slate-750 dark:text-slate-200">{h.title}</p>
                                            <p className="text-[9px] text-slate-400 mt-0.5">
                                                {new Date(h.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => handleDeleteHoliday(h._id)}
                                            className="h-7 w-7 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 dark:bg-red-955/20 dark:border-red-900/30 dark:text-red-400 flex items-center justify-center transition-colors"
                                            title="Delete Closure">
                                            <FiTrash2 className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                                {upcomingHolidays.length === 0 && (
                                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 py-6">No upcoming shop closures scheduled.</p>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
