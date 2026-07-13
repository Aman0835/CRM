import React from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useLeave } from "./hooks/useLeave";
import LeaveStats from "./components/LeaveStats";
import LeaveTabs from "./components/LeaveTabs";
import LeaveList from "./components/LeaveList";

export default function Leave() {
    const {
        leaves,
        employees,
        loading,
        activeTab,
        setActiveTab,
        handleApprove,
        handleReject,
        handleDelete,
        filteredRequests,
        getLeaveCount,
    } = useLeave();

    return (
        <DashboardLayout
            title="Leave Management"
            subtitle="Review and process time-off applications, check leave request histories, and schedule staff resources."
        >
            <LeaveStats getLeaveCount={getLeaveCount} />

            <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:border-slate-800/80 dark:bg-slate-900/20 text-slate-800 dark:text-slate-100">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800/50 pb-5 mb-5">
                    <LeaveTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        leaves={leaves}
                        getLeaveCount={getLeaveCount}
                    />
                </div>
                <LeaveList
                    loading={loading}
                    filteredRequests={filteredRequests}
                    employees={employees}
                    activeTab={activeTab}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                />
            </section>
        </DashboardLayout>
    );
}
