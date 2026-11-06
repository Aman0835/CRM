import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getLeads } from "../../services/leadService";
import { getEmployees } from "../../services/employeeService";
import { getCallAnalytics } from "../../services/callService";
import {
  FiPhone,
  FiPhoneCall,
  FiPhoneMissed,
  FiBriefcase,
  FiUser,
  FiCalendar,
  FiClock,
  FiChevronRight,
  FiCheck,
  FiX,
  FiTrendingUp,
} from "react-icons/fi";
import { motion } from "framer-motion";

function maskPhone(phone = "") {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length <= 4) return `•••• ${digits}`;
  return `•••• ${digits.slice(-4)}`;
}

function groupByDay(items) {
  const groups = {};
  items.forEach((it) => {
    const d = it.createdAt
      ? new Date(it.createdAt)
      : new Date(it._id?.toString().slice(0, 8) || Date.now());
    const key = isToday(d)
      ? "Today"
      : isYesterday(d)
        ? "Yesterday"
        : format(d, "yyyy-MM-dd");
    if (!groups[key]) groups[key] = [];
    groups[key].push(it);
  });
  return groups;
}

const StatusBadge = ({ status }) => {
  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  switch (status?.toLowerCase()) {
    case "new": styles = "bg-blue-50 text-blue-600 border-blue-200"; break;
    case "contacted": styles = "bg-purple-50 text-purple-600 border-purple-200"; break;
    case "interested": styles = "bg-emerald-50 text-emerald-600 border-emerald-200"; break;
    case "follow-up": styles = "bg-orange-50 text-orange-600 border-orange-200"; break;
    case "visit scheduled": styles = "bg-teal-50 text-teal-600 border-teal-200"; break;
    case "won": styles = "bg-green-100 text-green-700 border-green-300"; break;
    case "lost": styles = "bg-red-50 text-red-600 border-red-200"; break;
  }
  return (
    <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${styles} uppercase tracking-wider`}>
      {status}
    </span>
  );
};

const SearchableEmployeeSelect = ({ employees, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedEmp = employees.find(e => e._id === value);
  const filteredEmployees = employees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="pl-10 pr-8 h-10 w-48 sm:w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all text-slate-600 dark:text-slate-300 flex items-center cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiUser className="text-slate-400 dark:text-slate-500" />
        </div>
        
        {isOpen ? (
          <input
            type="text"
            className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        ) : (
          <span className="truncate block w-full text-left select-none text-slate-700 dark:text-slate-300">
            {selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : "All Employees"}
          </span>
        )}

        {value && !isOpen ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button 
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={(e) => { e.stopPropagation(); onChange(""); setSearch(""); }}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiChevronRight className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? "-rotate-90" : "rotate-90"}`} />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full sm:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto no-scrollbar py-1">
          <div 
            className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between ${!value ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
            onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
          >
            <span>All Employees</span>
            {!value && <FiCheck className="w-4 h-4" />}
          </div>
          {filteredEmployees.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
              No employees found
            </div>
          ) : (
            filteredEmployees.map(emp => (
              <div 
                key={emp._id}
                className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between ${value === emp._id ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                onClick={() => { onChange(emp._id); setIsOpen(false); setSearch(""); }}
              >
                <span>{emp.firstName} {emp.lastName}</span>
                {value === emp._id && <FiCheck className="w-4 h-4" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function LeadsHub() {
  const [leads, setLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [employees, setEmployees] = useState([]);

  // Callyzer Outbound Call Tracking State
  const [callTimeRange, setCallTimeRange] = useState("today");
  const [callAnalytics, setCallAnalytics] = useState({
    totalDialed: 0,
    totalConnected: 0,
    notConnected: 0,
    connectionRate: 0,
    agentLeaderboard: [],
  });
  const [callLoading, setCallLoading] = useState(false);

  const fetchCallStats = async () => {
    try {
      setCallLoading(true);
      const res = await getCallAnalytics({
        timeRange: callTimeRange,
        employeeId: employeeFilter || undefined,
      });
      if (res?.success && res.data) {
        setCallAnalytics(res.data);
      }
    } catch (err) {
      console.error("Failed to load call analytics", err);
    } finally {
      setCallLoading(false);
    }
  };

  useEffect(() => {
    fetchCallStats();
  }, [callTimeRange, employeeFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, empRes] = await Promise.all([
        getLeads({ limit: 500 }),
        getEmployees().catch(() => ({ data: [] }))
      ]);
      if (leadsRes && leadsRes.data) {
        setLeads(leadsRes.data);
        setAllLeads(leadsRes.data);
      }
      if (empRes && (empRes.data || Array.isArray(empRes))) {
        setEmployees(empRes.data || empRes);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError(err?.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const grouped = useMemo(() => groupByDay(leads), [leads]);
  const groupKeys = useMemo(
    () => Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1)),
    [grouped],
  );

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    let filtered = [...allLeads];

    if (dateFilter) {
      filtered = filtered.filter((l) => {
        const d = l.createdAt ? new Date(l.createdAt) : new Date();
        return format(d, "yyyy-MM-dd") === dateFilter;
      });
    }

    if (employeeFilter) {
      filtered = filtered.filter((l) => l.assignedTo?._id === employeeFilter);
    }

    setLeads(filtered);
  };

  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Leads Pipeline</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track your real estate potential clients</p>
          </div>
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 h-10 w-40 sm:w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-600 dark:text-slate-300"
              />
            </div>
            <SearchableEmployeeSelect 
              employees={employees} 
              value={employeeFilter} 
              onChange={setEmployeeFilter} 
            />
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-sm">
              Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilter("");
                setEmployeeFilter("");
                setLeads(allLeads);
              }}
              className="h-10 px-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              Clear
            </button>
          </form>
        </div>

        {/* Callyzer Outbound Call Tracking & Telecalling Analytics */}
        <div className="mb-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 shadow-xs">
                <FiPhoneCall className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Callyzer Call Analytics</h2>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 border border-blue-200 dark:border-blue-800">
                    Live Telecalling
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track total numbers dialed, successful connected calls, and team connection rate
                </p>
              </div>
            </div>

            {/* Time range pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700 self-start sm:self-auto">
              {[
                { id: "today", label: "Today" },
                { id: "week", label: "This Week" },
                { id: "month", label: "This Month" },
                { id: "all", label: "All Time" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCallTimeRange(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    callTimeRange === pill.id
                      ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {/* 1. Total Dialed */}
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total Dialed
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <FiPhone className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {callAnalytics.totalDialed || 0}
                </span>
                <span className="text-xs text-slate-400">outbound</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Total dials initiated by agents
              </p>
            </div>

            {/* 2. Total Connected */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Total Connected
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/60 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <FiPhoneCall className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {callAnalytics.totalConnected || 0}
                </span>
                <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">answered</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-600/80 dark:text-emerald-400/80 truncate">
                Client answered & conversation held
              </p>
            </div>

            {/* 3. Not Connected */}
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Not Connected
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
                  <FiPhoneMissed className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-500 dark:text-rose-400">
                  {callAnalytics.notConnected || 0}
                </span>
                <span className="text-xs text-slate-400">missed/busy</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Ringing, busy, or unreached
              </p>
            </div>

            {/* 4. Connection Rate */}
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Connection Rate
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <FiTrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                  {callAnalytics.connectionRate || 0}%
                </span>
                <span className="text-xs text-slate-400">efficiency</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, callAnalytics.connectionRate || 0))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mini Agent Leaderboard */}
          {callAnalytics.agentLeaderboard?.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Agent Telecalling Leaderboard
                </span>
                <span className="text-xs text-slate-400">
                  {callAnalytics.agentLeaderboard.length} active agent{callAnalytics.agentLeaderboard.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {callAnalytics.agentLeaderboard.map((agent) => (
                  <div
                    key={agent.employeeId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/60"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {agent.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{agent.totalDialed}</span> dialed · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{agent.totalConnected}</span> connected
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                      {agent.connectionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {groupKeys.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                <p className="text-slate-500 dark:text-slate-400 font-medium">No leads found for this period.</p>
              </div>
            )}
            
            {groupKeys.map((key) => (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {key === "Today" || key === "Yesterday"
                      ? key
                      : format(new Date(key), "dd MMM yyyy")}
                  </h2>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {grouped[key].map((l, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={l._id}
                      onClick={() => navigate(`/leads/${l._id}`)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/20 hover:border-blue-100 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start sm:items-center gap-4 min-w-0">
                        {/* Avatar */}
                        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                          {(l.name || "U").slice(0, 1).toUpperCase()}
                        </div>
                        
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="truncate font-bold text-slate-900 dark:text-slate-100 text-base">
                              {l.name || "Unknown"}
                            </h3>
                            <StatusBadge status={l.status} />
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <FiPhone className="text-slate-400 dark:text-slate-500" />
                              <span>{maskPhone(l.phone)}</span>
                            </div>
                            
                            {l.project && (
                              <div className="flex items-center gap-1.5">
                                <FiBriefcase className="text-slate-400 dark:text-slate-500" />
                                <span className="truncate max-w-[120px]">{l.project}</span>
                              </div>
                            )}

                            {l.assignedTo && (
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 pr-2 pl-1 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                                {l.assignedTo.profileImage ? (
                                  <img 
                                    src={l.assignedTo.profileImage} 
                                    alt={`${l.assignedTo.firstName}`}
                                    className="w-5 h-5 rounded-full object-cover shadow-sm"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                                    <FiUser className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                  </div>
                                )}
                                <span className="font-medium text-[11px]">{l.assignedTo.firstName} {l.assignedTo.lastName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:pl-4 sm:border-l border-slate-100 dark:border-slate-800 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                          <FiClock />
                          {format(new Date(l.createdAt || Date.now()), "hh:mm a")}
                        </div>
                        <FiChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors hidden sm:block" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
