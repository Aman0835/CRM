import React from "react";
import { FiPlus } from "react-icons/fi";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useHolidays } from "./hooks/useHolidays";
import HolidayUpcoming from "./components/HolidayUpcoming";
import HolidayPast from "./components/HolidayPast";
import HolidayModal from "./components/HolidayModal";

export default function Holidays() {
    const {
        loading, isModalOpen, setIsModalOpen, modalMode,
        title, setTitle, date, setDate, description, setDescription,
        upcomingHolidays, pastHolidays,
        handleOpenCreate, handleOpenEdit, handleDelete, handleSubmit,
    } = useHolidays();

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
                <HolidayUpcoming
                    loading={loading}
                    upcomingHolidays={upcomingHolidays}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                />
                <HolidayPast
                    loading={loading}
                    pastHolidays={pastHolidays}
                    onDelete={handleDelete}
                />
            </div>

            <HolidayModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                modalMode={modalMode}
                title={title}
                setTitle={setTitle}
                date={date}
                setDate={setDate}
                description={description}
                setDescription={setDescription}
                onSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
}
