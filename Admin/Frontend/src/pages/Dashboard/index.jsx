import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MonthPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  const [year, month] = value.split("-").map(Number);
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-slate-800"
      >
        <FiCalendar className="text-blue-500" />
        <span>Month</span>
        <span className="text-slate-400 dark:text-slate-500">|</span>
        <span>{MONTHS[month - 1]} {year}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onChange(`${year - 1}-${String(month).padStart(2, "0")}`)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
              aria-label="Previous year"
            >
              <FiChevronLeft />
            </button>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{year}</span>
            <button
              type="button"
              onClick={() => onChange(`${year + 1}-${String(month).padStart(2, "0")}`)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
              aria-label="Next year"
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3">
            {MONTHS.map((monthName, index) => {
              const monthValue = `${year}-${String(index + 1).padStart(2, "0")}`;
              const isSelected = monthValue === value;
              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => {
                    onChange(monthValue);
                    setIsOpen(false);
                  }}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  }`}
                >
                  {monthName.slice(0, 3)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onChange(currentMonth);
                setIsOpen(false);
              }}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800"
            >
              This month
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FiX /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const {
    loading,
    metrics,
    selectedMonth,
    setSelectedMonth,
    weeklyData,
    monthlyVisits,
    allEmployees,
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
      subtitle={`${formattedDate} · Dosti Real Estate`}
      action={
        <div className="flex items-center gap-2">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          <button
            type="button"
            onClick={handleExportReport}
            className="h-10 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm">
            Export Report
          </button>
        </div>
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
            selectedMonth={selectedMonth}
          />
          <DashboardBottomRow
            upcomingAppointments={upcomingAppointments}
            monthlyVisits={monthlyVisits}
            allEmployees={allEmployees}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
