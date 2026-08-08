import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardBottomRow from "./components/DashboardBottomRow";
import DashboardCharts from "./components/DashboardCharts";
import DashboardMetrics from "./components/DashboardMetrics";
import { useDashboard } from "./hooks/useDashboard";
import { buildDashboardExportCsv } from "./utils/dashboardExport";

const formattedDate = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function Dashboard() {
  const {
    loading,
    metrics,
    weeklyData,
    leaveTypesData,
    topBarbers,
    upcomingAppointments,
  } = useDashboard();

  const handleExportReport = () => {
    try {
      const csv = buildDashboardExportCsv({
        overview: null,
        payrollSummary: null,
        attendanceSummary: null,
        employees: [],
        attendanceLogs: [],
        leavesList: [],
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Dashboard_Report_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Dashboard reports exported.");
    } catch (error) {
      console.error("Dashboard export error:", error);
      toast.error("Failed to export dashboard report");
    }
  };

  return (
    <DashboardLayout
      title="Overview"
      subtitle={`${formattedDate} · Diva The Salon`}
      action={
        <button
          type="button"
          onClick={handleExportReport}
          className="h-10 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm">
          Export Report
        </button>
      }>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6 text-slate-800 dark:text-slate-100">
          <DashboardMetrics metrics={metrics} />
          <DashboardCharts
            weeklyData={weeklyData}
            leaveTypesData={leaveTypesData}
          />
          <DashboardBottomRow
            upcomingAppointments={upcomingAppointments}
            topBarbers={topBarbers}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
