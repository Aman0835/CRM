import React, { useState, useEffect } from "react";
import { FiSettings, FiSliders, FiClock, FiSave, FiShield } from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

export default function Settings() {
    const [shopName, setShopName] = useState("Diva The Salon");
    const [contactEmail, setContactEmail] = useState("admin@divathesalon.com");
    const [checkInTime, setCheckInTime] = useState("09:00");
    const [checkOutTime, setCheckOutTime] = useState("20:00");
    const [lateGraceMinutes, setLateGraceMinutes] = useState(15);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/admin/settings");
                if (res.data?.success && res.data?.data) {
                    const s = res.data.data;
                    setShopName(s.shopName ?? "Diva The Salon");
                    setContactEmail(s.contactEmail ?? "admin@divathesalon.com");
                    setCheckInTime(s.checkInTime ?? "09:00");
                    setCheckOutTime(s.checkOutTime ?? "20:00");
                    setLateGraceMinutes(s.lateGraceMinutes ?? 15);
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/admin/settings", {
                shopName,
                contactEmail,
                checkInTime,
                checkOutTime,
                lateGraceMinutes,
            });
            if (res.data?.success) {
                toast.success("Settings saved successfully!");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const graceDeadline = (() => {
        try {
            const [h, m] = checkInTime.split(":").map(Number);
            const d = new Date();
            d.setHours(h, m + lateGraceMinutes);
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "--";
        }
    })();

    if (loading) {
        return (
            <DashboardLayout title="Settings">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Settings"
            subtitle="Configure your salon parameters, working hours, and attendance rules."
        >
            <div className="max-w-2xl text-slate-800 dark:text-slate-100">
                <section className="panel-surface rounded-[24px] p-6 shadow-sm text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                        <FiSettings className="text-blue-500 text-lg" />
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">System Configuration</h3>
                            <p className="text-slate-400 dark:text-slate-500 mt-0.5">Parameters applied across roster and attendance sheets.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-5">
                        {/* Shop Profile */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                <FiSliders /> Shop Profile
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Shop Name</label>
                                    <input
                                        type="text"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Contact Email</label>
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Shift Configuration */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                <FiClock /> Shift Configuration
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Check-in Start Time</label>
                                    <input
                                        type="time"
                                        value={checkInTime}
                                        onChange={(e) => setCheckInTime(e.target.value)}
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Standard Check-out Time</label>
                                    <input
                                        type="time"
                                        value={checkOutTime}
                                        onChange={(e) => setCheckOutTime(e.target.value)}
                                        className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Attendance Rules */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                <FiShield /> Attendance Rules
                            </h4>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                                    Late Check-in Grace Period (mins)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={120}
                                    value={lateGraceMinutes}
                                    onChange={(e) => setLateGraceMinutes(Number(e.target.value))}
                                    className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                    required
                                />
                                <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                                    Employees checking in up to <strong>{lateGraceMinutes} mins</strong> after the configured time won't be marked late.
                                    With current settings, checking in by <strong>{graceDeadline}</strong> is still considered on time.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm mt-4 disabled:opacity-60"
                        >
                            {saving ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <FiSave />
                            )}
                            {saving ? "Saving..." : "Save Configurations"}
                        </button>
                    </form>
                </section>
            </div>
        </DashboardLayout>
    );
}
