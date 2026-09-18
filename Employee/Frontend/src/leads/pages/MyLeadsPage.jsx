import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSearch,
  FiPlus,
  FiFilter,
  FiRefreshCw,
  FiUserPlus,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LeadCard from "../components/LeadCard";
import { getMyLeads } from "../services/leadService";
import { LEAD_STATUSES } from "../utils/leadUtils";

export default function MyLeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [summary, setSummary] = useState({ totalActive: 0, todaysFollowUps: 0 });

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyLeads({
        search,
        status: selectedStatus,
        limit: 100,
      });
      if (res && res.data) {
        setLeads(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
      setError(err?.response?.data?.message || "Unable to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLeads();
    }, 250); // slight debounce for search
    return () => clearTimeout(timeoutId);
  }, [search, selectedStatus]);

  const filterTabs = ["all", "Interested", "Follow-up", "Visit Scheduled", "Contacted", "New", "Won", "Lost"];

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-6 pt-1">
        {/* Top App Bar */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#182338] text-[#8ea4cb] hover:text-white transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-[20px] font-black text-white">My Leads</h1>
              <p className="text-[12px] text-[#7d93ba]">
                {leads.length} {leads.length === 1 ? "lead" : "leads"} found
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/leads/new")}
            className="flex items-center gap-1.5 rounded-2xl bg-[#2f6cf6] px-3.5 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(47,108,246,0.35)] active:scale-[0.97]"
          >
            <FiPlus className="h-4 w-4" />
            <span>New Lead</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative px-1">
          <FiSearch className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#60779e] h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, project..."
            className="h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] pl-10 pr-4 text-xs text-white placeholder-[#60779e] outline-none focus:border-[#2f6cf6]"
          />
        </div>

        {/* Horizontal Status Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 px-1 employee-shell-scroll">
          {filterTabs.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#2f6cf6] text-white shadow-[0_4px_12px_rgba(47,108,246,0.4)]"
                    : "border border-[#243552] bg-[#1a253b] text-[#8aa3cb] hover:bg-[#202e48]"
                }`}
              >
                {status === "all" ? "All Leads" : status}
              </button>
            );
          })}
        </div>

        {/* Leads List or State Messages */}
        <div className="space-y-3 px-1">
          {loading ? (
            <div className="rounded-[24px] border border-[#243552] bg-[#1d2840] p-8 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#2f6cf6] border-t-transparent" />
              <p className="mt-3 text-xs font-semibold text-[#8ea4cb]">Loading leads...</p>
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-6 text-center">
              <p className="text-sm font-bold text-red-300">{error}</p>
              <button
                type="button"
                onClick={fetchLeads}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#1d2840] px-3.5 py-1.5 text-xs font-bold text-white border border-[#243552]"
              >
                <FiRefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : leads.length === 0 ? (
            <div className="rounded-[28px] border border-[#243552] bg-[#1d2840] p-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#273857] text-[#8ea4cb]">
                <FiUserPlus className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                {search || selectedStatus !== "all"
                  ? "No matching leads found"
                  : "No leads yet"}
              </h3>
              <p className="mx-auto max-w-xs text-xs text-[#7d93ba]">
                {search || selectedStatus !== "all"
                  ? "Try adjusting your search keywords or filter tab."
                  : "Start growing your client pipeline by adding your first lead."}
              </p>
              {(!search && selectedStatus === "all") && (
                <button
                  type="button"
                  onClick={() => navigate("/leads/new")}
                  className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-[#2f6cf6] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_18px_rgba(47,108,246,0.35)]"
                >
                  <FiPlus className="h-4 w-4" />
                  <span>Create First Lead</span>
                </button>
              )}
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                onClick={() => navigate(`/leads/${lead._id}`)}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
