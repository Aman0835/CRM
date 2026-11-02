import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUser,
  FiPhone,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiX,
  FiEdit3,
  FiExternalLink,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getVisitsAnalytics, updateVisitStatus } from "../../services/leadService";

function maskPhone(phone = "") {
  const digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length <= 4) return digits || "—";
  return `•••• ${digits.slice(-4)}`;
}

const VISIT_STATUS_STYLES = {
  "Visit Scheduled": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "Visit Completed": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "Won": "bg-green-500/10 text-green-400 border-green-500/30",
  "Lost": "bg-red-500/10 text-red-400 border-red-500/30",
  "Negotiation": "bg-orange-500/10 text-orange-400 border-orange-500/30",
  "Booking": "bg-teal-500/10 text-teal-400 border-teal-500/30",
};

export default function VisitsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalVisits: 0,
      scheduled: 0,
      completed: 0,
      todayScheduled: 0,
      wonFromVisits: 0,
      conversionRate: 0,
    },
    trend: [],
    byProject: [],
    byEmployee: [],
    data: [],
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [selectedVisitForModal, setSelectedVisitForModal] = useState(null);
  const [modalStatus, setModalStatus] = useState("Visit Completed");
  const [modalDate, setModalDate] = useState("");
  const [modalTime, setModalTime] = useState("");
  const [modalNote, setModalNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getVisitsAnalytics({
        search,
        status: statusFilter,
        timeRange,
      });
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load visit analytics:", err);
      toast.error("Failed to load visit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, timeRange]);

  const visitsList = data?.data || [];

  const handleOpenUpdateModal = (visit) => {
    setSelectedVisitForModal(visit);
    setModalStatus(visit.status === "Visit Scheduled" ? "Visit Completed" : visit.status);
    setModalDate(
      visit.nextFollowUp?.date ? new Date(visit.nextFollowUp.date).toISOString().split("T")[0] : ""
    );
    setModalTime(visit.nextFollowUp?.time || "");
    setModalNote("");
  };

  const handleSaveVisitStatus = async (e) => {
    e.preventDefault();
    if (!selectedVisitForModal) return;

    try {
      setIsUpdating(true);
      await updateVisitStatus(selectedVisitForModal._id, {
        status: modalStatus,
        nextActionDate: modalDate || undefined,
        nextActionTime: modalTime || undefined,
        note: modalNote || undefined,
      });

      toast.success("Visit status updated successfully");
      setSelectedVisitForModal(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update visit status:", err);
      toast.error(err?.response?.data?.message || "Failed to update visit status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
                <FiMapPin className="text-lg" />
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Visit Analytics & Schedule
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Track in-person client tours, analyze site visit completion, and measure conversion pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
            >
              <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <FiBriefcase className="h-3.5 w-3.5" />
              <span>Manage Leads</span>
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Visits */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Visits
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
                <FiMapPin className="text-lg" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              {data.summary.totalVisits}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Scheduled + Completed records
            </p>
          </div>

          {/* Card 2: Visits Scheduled */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Visits Scheduled
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                <FiCalendar className="text-lg" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-blue-600 dark:text-blue-400">
              {data.summary.scheduled}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-blue-500">{data.summary.todayScheduled} today</span>
              <span>• Active pipeline</span>
            </div>
          </div>

          {/* Card 3: Visits Completed */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Visits Completed
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                <FiCheckCircle className="text-lg" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {data.summary.completed}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              In-person site visits held
            </p>
          </div>

          {/* Card 4: Conversion Rate */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Visit-to-Won Ratio
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                <FiTrendingUp className="text-lg" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-amber-500">
              {data.summary.conversionRate}%
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {data.summary.wonFromVisits} won conversions post-visit
            </p>
          </div>
        </div>

        {/* Analytics Charts & Breakdowns (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Bar Chart (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  7-Day Visit Momentum
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Comparison of scheduled vs completed client visits
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Scheduled
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed
                </span>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="Scheduled" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown by Projects / Branches */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Top Destinations / Projects
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Visits organized by property or location
                </p>
              </div>

              <div className="space-y-3">
                {data.byProject?.length > 0 ? (
                  data.byProject.map((item, index) => {
                    const percent = data.summary.totalVisits > 0
                      ? Math.round((item.count / data.summary.totalVisits) * 100)
                      : 0;

                    return (
                      <div key={item.project} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                            {item.project}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {item.count} <span className="text-[10px] text-slate-400">({percent}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No project visit breakdowns yet.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Agent Leaderboard snippet */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                Active Agents Handling Visits: {data.byEmployee?.length || 0}
              </span>
              <div className="flex -space-x-2 overflow-hidden">
                {data.byEmployee?.slice(0, 5).map((emp, i) => (
                  <div
                    key={emp.name || i}
                    title={`${emp.name}: ${emp.scheduled} scheduled, ${emp.completed} completed`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white ring-2 ring-white dark:ring-slate-900"
                  >
                    {emp.name?.[0] || "A"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visits by client, project, location..."
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
              />
            </div>

            {/* Status & Time Range Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-1">
                {[
                  { id: "all", label: "All Visits" },
                  { id: "scheduled", label: "Scheduled" },
                  { id: "completed", label: "Completed" },
                  { id: "won", label: "Won" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      statusFilter === tab.id
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visits Master Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Client & Contact</th>
                  <th className="px-5 py-3.5">Project & Requirements</th>
                  <th className="px-5 py-3.5">Assigned Agent</th>
                  <th className="px-5 py-3.5">Scheduled Date & Time</th>
                  <th className="px-5 py-3.5">Visit Status</th>
                  <th className="px-5 py-3.5">Latest Update</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-2" />
                      <p>Loading visit records...</p>
                    </td>
                  </tr>
                ) : visitsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                      <FiMapPin className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No visits matching your filters</p>
                      <p className="text-[11px]">Visits scheduled by agents in the employee portal will appear here automatically.</p>
                    </td>
                  </tr>
                ) : (
                  visitsList.map((visit) => {
                    const statusClass = VISIT_STATUS_STYLES[visit.status] || "bg-slate-100 text-slate-700 border-slate-200";
                    const followDate = visit.nextFollowUp?.date
                      ? new Date(visit.nextFollowUp.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      : "Date not specified";

                    return (
                      <tr key={visit._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        {/* Client & Phone */}
                        <td className="px-5 py-4 font-medium">
                          <Link
                            to={`/leads/${visit._id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-500 transition block"
                          >
                            {visit.name}
                          </Link>
                          <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                            {maskPhone(visit.phone)}
                          </p>
                        </td>

                        {/* Project & Requirements */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {visit.project || "General Tour"}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {visit.configuration || "—"} {visit.budget ? `• ${visit.budget}` : ""}
                          </p>
                        </td>

                        {/* Assigned Employee */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 font-bold text-[10px]">
                              {visit.assignedTo?.firstName?.[0] || "A"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                {visit.assignedTo ? `${visit.assignedTo.firstName} ${visit.assignedTo.lastName}` : "Unassigned"}
                              </p>
                              {visit.assignedTo?.employeeId && (
                                <span className="text-[10px] text-slate-400">{visit.assignedTo.employeeId}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Scheduled Date & Time */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                            <FiCalendar className="text-purple-400" />
                            <span>{followDate}</span>
                          </div>
                          {visit.nextFollowUp?.time && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                              <FiClock className="text-slate-500" />
                              <span>{visit.nextFollowUp.time}</span>
                            </div>
                          )}
                        </td>

                        {/* Visit Status Badge */}
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusClass}`}>
                            {visit.status}
                          </span>
                        </td>

                        {/* Latest Update Notes */}
                        <td className="px-5 py-4 max-w-xs truncate">
                          <p className="truncate text-slate-700 dark:text-slate-300">
                            {visit.latestInteraction?.clientResponse || "—"}
                          </p>
                          {visit.latestInteraction?.outcome && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Outcome: {visit.latestInteraction.outcome}
                            </span>
                          )}
                        </td>

                        {/* Quick Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenUpdateModal(visit)}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-500 transition"
                              title="Update Status / Reschedule"
                            >
                              <FiEdit3 className="h-3.5 w-3.5" />
                            </button>

                            <Link
                              to={`/leads/${visit._id}`}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-500 transition"
                              title="View Full Lead Details"
                            >
                              <FiExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Status & Reschedule Modal */}
      {selectedVisitForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Update Visit for {selectedVisitForModal.name}
                </h3>
                <p className="text-xs text-slate-400">Modify visit outcome, completion, or reschedule</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitForModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveVisitStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                  Visit Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 px-3 font-semibold text-slate-800 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="Visit Scheduled">Visit Scheduled</option>
                  <option value="Visit Completed">Visit Completed</option>
                  <option value="Won">Won (Deal Closed)</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Follow-up">Follow-up Call</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 px-3 text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 11:00 AM"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 px-3 text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                  Visit Notes / Client Feedback
                </label>
                <textarea
                  rows={3}
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="e.g. Client arrived on time, loved the premises, discussed quotation..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVisitForModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Save Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
