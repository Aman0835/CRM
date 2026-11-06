import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiUserPlus,
  FiAlertTriangle,
  FiPhoneCall,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LeadCard from "../components/LeadCard";
import { getMyLeads, deleteLead } from "../services/leadService";
import { getCallAnalytics } from "../../services/callService";
import { LEAD_STATUSES } from "../utils/leadUtils";
import CallOutcomeModal from "../../components/calls/CallOutcomeModal";
import { useCallTracker } from "../../hooks/useCallTracker";

export default function MyLeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [summary, setSummary] = useState({ totalActive: 0, todaysFollowUps: 0 });
  const [callStats, setCallStats] = useState({ totalDialed: 0, totalConnected: 0, connectionRate: 0 });

  const fetchCallStats = async () => {
    try {
      const res = await getCallAnalytics({ timeRange: "today" });
      if (res && res.success) {
        setCallStats({
          totalDialed: res.totalDialed || 0,
          totalConnected: res.totalConnected || 0,
          connectionRate: res.connectionRate || 0,
        });
      }
    } catch {}
  };

  const { activeCall, startCall, closeCall } = useCallTracker(() => {
    fetchLeads();
    fetchCallStats();
  });

  // Delete confirmation state
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    fetchCallStats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [search, selectedStatus]);

  const filterTabs = ["all", "Interested", "Follow-up", "Visit Scheduled", "Contacted", "New", "Won", "Lost"];

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleDeleteRequest = (lead) => {
    setLeadToDelete(lead);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLead(leadToDelete._id);
      // Remove from local state immediately for instant feedback
      setLeads((prev) => prev.filter((l) => l._id !== leadToDelete._id));
      toast.success(`"${leadToDelete.name}" deleted`);
      setLeadToDelete(null);
    } catch (err) {
      console.error("Delete Lead Error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) setLeadToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-6 pt-1">
        {/* Top App Bar */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24110c] text-[#D9C4AA] border border-[#381C14] hover:text-[#FBFAF6] active:scale-95 transition-all"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-[20px] font-black text-[#FBFAF6]">My Leads</h1>
              <p className="text-[12px] text-[#D9C4AA]">
                {leads.length} {leads.length === 1 ? "lead" : "leads"} found
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/leads/new")}
            className="flex items-center gap-1.5 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] px-3.5 py-2 text-xs font-bold text-[#FBFAF6] shadow-[0_8px_18px_rgba(150,42,34,0.35)] active:scale-[0.97] border border-[#D9C4AA]/20 transition-all"
          >
            <FiPlus className="h-4 w-4" />
            <span>New Lead</span>
          </button>
        </div>

        {/* Callzer Today's Calling Strip */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#24110c] border border-[#381C14] shadow-sm text-xs mx-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#962A22]/20 text-[#E9D5BD]">
              <FiPhoneCall className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-[#D9C4AA]">Today's Calling:</span>
          </div>
          <div className="flex items-center gap-2.5 font-mono font-bold">
            <span className="text-[#FBFAF6]">{callStats.totalDialed} <span className="text-[10px] font-sans text-[#AE9475]">Dialed</span></span>
            <span className="text-[#381C14]">•</span>
            <span className="text-[#16e0a0]">{callStats.totalConnected} <span className="text-[10px] font-sans text-emerald-400/80">Connected</span></span>
            <span className="rounded-full bg-[#381C14] px-2 py-0.5 text-[10px] text-[#E9D5BD] border border-[#AE9475]/30">
              {callStats.connectionRate}%
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative px-1">
          <FiSearch className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#AE9475] h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, project..."
            className="h-11 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] pl-10 pr-4 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22] transition-colors"
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
                    ? "bg-[#962A22] text-[#FBFAF6] shadow-[0_4px_12px_rgba(150,42,34,0.4)] border border-[#962A22]"
                    : "border border-[#381C14] bg-[#24110c] text-[#D9C4AA] hover:bg-[#381C14]"
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
            <div className="rounded-[24px] border border-[#381C14] bg-[#24110c] p-8 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#962A22] border-t-transparent" />
              <p className="mt-3 text-xs font-semibold text-[#D9C4AA]">Loading leads...</p>
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-6 text-center">
              <p className="text-sm font-bold text-red-300">{error}</p>
              <button
                type="button"
                onClick={fetchLeads}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#24110c] px-3.5 py-1.5 text-xs font-bold text-[#FBFAF6] border border-[#381C14]"
              >
                <FiRefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : leads.length === 0 ? (
            <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#381C14] text-[#E9D5BD]">
                <FiUserPlus className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-[#FBFAF6]">
                {search || selectedStatus !== "all"
                  ? "No matching leads found"
                  : "No leads yet"}
              </h3>
              <p className="mx-auto max-w-xs text-xs text-[#D9C4AA]">
                {search || selectedStatus !== "all"
                  ? "Try adjusting your search keywords or filter tab."
                  : "Start growing your client pipeline by adding your first lead."}
              </p>
              {(!search && selectedStatus === "all") && (
                <button
                  type="button"
                  onClick={() => navigate("/leads/new")}
                  className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] px-4 py-2.5 text-xs font-bold text-[#FBFAF6] shadow-[0_8px_18px_rgba(150,42,34,0.35)] border border-[#D9C4AA]/20 transition"
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
                onDelete={handleDeleteRequest}
                onCall={startCall}
              />
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6">
          <div
            className="w-full max-w-[390px] rounded-[28px] border border-[#381C14] bg-[#24110c] p-6 space-y-4 shadow-[0_-20px_60px_rgba(0,0,0,0.7)]"
            style={{ animation: "slideUp 0.25s ease-out" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
                <FiAlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-[#FBFAF6]">Delete Lead?</h3>
                <p className="text-[12px] text-[#AE9475] mt-0.5">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-[13px] text-[#D9C4AA] leading-relaxed">
              You are about to permanently delete <span className="font-bold text-[#FBFAF6]">{leadToDelete.name}</span>'s lead along with all interaction history.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 h-12 rounded-2xl border border-[#381C14] bg-[#1a0d09] text-[13px] font-bold text-[#D9C4AA] hover:text-[#FBFAF6] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 h-12 rounded-2xl bg-red-500 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(239,68,68,0.4)] active:scale-[0.98] disabled:opacity-60 transition-all"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Callzer Post-Call Outcome Modal */}
      {activeCall && (
        <CallOutcomeModal
          callData={activeCall}
          onClose={closeCall}
          onComplete={() => {
            closeCall();
            fetchCallStats();
            fetchLeads();
          }}
        />
      )}
    </DashboardLayout>
  );
}
