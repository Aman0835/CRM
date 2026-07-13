import React, { useState, useEffect } from "react";
import { 
    FiCalendar, FiPlus, FiTrash2, FiEdit2, FiX, FiTag
} from "react-icons/fi";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import * as holidayService from "../../services/holidayService";

export default function Holidays() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
    const [selectedHolidayId, setSelectedHolidayId] = useState(null);

    // Form states
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await holidayService.getHolidays();
            if (res.success) {
                const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setHolidays(sorted);
            }
        } catch (err) {
            console.error("Holidays fetch error:", err);
            toast.error("Failed to load holiday roster");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleOpenCreate = () => {
        setModalMode("create");
        setTitle("");
        setDate("");
        setDescription("");
        setIsModalOpen(true);
    };

    const handleOpenEdit = (h) => {
        setModalMode("edit");
        setSelectedHolidayId(h._id);
        setTitle(h.title);
        setDate(h.date ? h.date.split("T")[0] : "");
        setDescription(h.description || "");
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) return;
        try {
            const res = await holidayService.deleteHoliday(id);
            if (res.success) {
                toast.success("Holiday removed successfully");
                fetchHolidays();
            }
        } catch (err) {
            toast.error("Failed to remove holiday");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !date) {
            toast.error("Please fill in title and date");
            return;
        }

        const payload = { title, date, description };

        try {
            let res;
            if (modalMode === "create") {
                res = await holidayService.createHoliday(payload);
            } else {
                res = await holidayService.updateHoliday(selectedHolidayId, payload);
            }

            if (res.success) {
                toast.success(res.message || `Holiday ${modalMode === "create" ? "added" : "updated"} successfully!`);
                setIsModalOpen(false);
                fetchHolidays();
            }
        } catch (err) {
            toast.error("Failed to save holiday");
        }
    };

    const today = new Date();
    today.setHours(0,0,0,0);

    const upcomingHolidays = holidays.filter(h => new Date(h.date) >= today);
    const pastHolidays = holidays.filter(h => new Date(h.date) < today);

    return (
        <DashboardLayout
            title="Holidays"
            subtitle="Configure standard shop closures, national events, and paid holiday periods."
            action={
                <button
                    onClick={handleOpenCreate}
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                >
                    <FiPlus /> Add Holiday
                </button>
            }
        >
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] text-slate-800 dark:text-slate-100">
                {/* Upcoming Holidays */}
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
                                            onClick={() => handleOpenEdit(holiday)}
                                            className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                                            title="Edit Holiday"
                                        >
                                            <FiEdit2 className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(holiday._id)}
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

                {/* Past closures history */}
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
                                        onClick={() => handleDelete(holiday._id)}
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
            </div>

            {/* MODAL: Create / Edit Holiday */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-[390px] rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                                {modalMode === "create" ? "Add Shop Closure" : "Edit Holiday"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
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
            )}
        </DashboardLayout>
    );
}
