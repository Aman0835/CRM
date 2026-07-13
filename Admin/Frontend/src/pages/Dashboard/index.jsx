import React from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useDashboard } from "./hooks/useDashboard";
import DashboardMetrics from "./components/DashboardMetrics";
import DashboardCharts from "./components/DashboardCharts";
import DashboardBottomRow from "./components/DashboardBottomRow";

const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
});

export default function Dashboard() {
    const { loading, metrics, weeklyData, leaveTypesData, topBarbers, upcomingAppointments } = useDashboard();

    return (
        <DashboardLayout
            title="Overview"
            subtitle={`${formattedDate} · Diva The Salon`}
            action={
                <button
                    type="button"
                    onClick={() => toast.success("Dashboard reports exported.")}
                    className="h-10 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                >
                    Export Report
                </button>
            }
        >
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            ) : (
                <div className="space-y-6 text-slate-800 dark:text-slate-100">
                    <DashboardMetrics metrics={metrics} />
                    <DashboardCharts weeklyData={weeklyData} leaveTypesData={leaveTypesData} />
                    <DashboardBottomRow upcomingAppointments={upcomingAppointments} topBarbers={topBarbers} />
                </div>
            )}
        </DashboardLayout>
    );
}
