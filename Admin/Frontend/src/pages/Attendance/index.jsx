import React from "react";
import { FiCheck, FiX } from "react-icons/fi";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAttendance } from "./hooks/useAttendance";
import AttendanceStats from "./components/AttendanceStats";
import AttendanceFilters from "./components/AttendanceFilters";
import AttendanceTable from "./components/AttendanceTable";
import AttendanceModal from "./components/AttendanceModal";

export default function Attendance() {
    const {
        employees,
        loading,
        search,
        setSearch,
        dateFilter,
        setDateFilter,
        isActionModalOpen,
        setIsActionModalOpen,
        selectedEmployeeId,
        setSelectedEmployeeId,
        actionType,
        setActionType,
        handleLogDelete,
        handleActionSubmit,
        filteredLogs,
        presentCount,
        absentCount,
        leaveCount,
    } = useAttendance();

    const openModal = (type) => {
        setActionType(type);
        if (employees.length > 0) setSelectedEmployeeId(employees[0].employeeId);
        setIsActionModalOpen(true);
    };

    return (
        <DashboardLayout
            title="Attendance"
            subtitle="Monitor daily attendance rosters, check-in schedules, and clock logs."
            action={
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal("check-in")}
                        type="button"
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                    >
                        <FiCheck className="text-sm" /> Check In
                    </button>
                    <button
                        onClick={() => openModal("check-out")}
                        type="button"
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-605 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <FiX className="text-sm" /> Check Out
                    </button>
                </div>
            }
        >
            <AttendanceStats
                presentCount={presentCount}
                leaveCount={leaveCount}
                absentCount={absentCount}
                totalBarbers={employees.length}
            />

            <section className="panel-surface rounded-[24px] p-5 shadow-sm mt-6 text-slate-800 dark:text-slate-100">
                <AttendanceFilters
                    search={search}
                    setSearch={setSearch}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
                <AttendanceTable
                    loading={loading}
                    filteredLogs={filteredLogs}
                    employees={employees}
                    onDelete={handleLogDelete}
                />
            </section>

            <AttendanceModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                actionType={actionType}
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                setSelectedEmployeeId={setSelectedEmployeeId}
                onSubmit={handleActionSubmit}
            />
        </DashboardLayout>
    );
}
