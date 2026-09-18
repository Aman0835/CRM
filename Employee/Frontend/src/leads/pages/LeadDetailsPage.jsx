import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPhone,
  FiMessageSquare,
  FiMapPin,
  FiMail,
  FiHome,
  FiCalendar,
  FiPlus,
  FiClock,
  FiRefreshCw,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import InteractionTimeline from "../components/InteractionTimeline";
import AddInteractionModal from "../components/AddInteractionModal";
import { getLeadById, getLeadInteractions } from "../services/leadService";
import { formatFollowUp } from "../utils/leadUtils";

export default function LeadDetailsPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeadData = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);
    try {
      const [leadRes, interactionsRes] = await Promise.all([
        getLeadById(leadId),
        getLeadInteractions(leadId),
      ]);

      if (leadRes?.data) {
        setLead(leadRes.data);
      }
      if (interactionsRes?.data) {
        setInteractions(interactionsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch lead details:", err);
      setError(err?.response?.data?.message || "Failed to load lead details");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  const handleInteractionAdded = (newInteraction, updatedLead) => {
    if (newInteraction) {
      setInteractions((prev) => [newInteraction, ...prev]);
    }
    if (updatedLead) {
      setLead((prev) => ({ ...prev, ...updatedLead }));
    }
  };

  const followUp = formatFollowUp(lead?.nextFollowUp?.date, lead?.nextFollowUp?.time);

  const cleanPhoneForWa = (phone = "") => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.length === 10) clean = `91${clean}`;
    return clean;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2f6cf6] border-t-transparent" />
          <p className="text-xs font-semibold text-[#8ea4cb]">Loading lead details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout>
        <div className="rounded-[28px] border border-red-500/30 bg-red-500/10 p-6 text-center space-y-3 mt-8">
          <p className="text-sm font-bold text-red-300">{error || "Lead not found"}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/leads/my")}
              className="rounded-xl border border-[#243552] bg-[#1d2840] px-4 py-2 text-xs font-bold text-white"
            >
              Back to Leads
            </button>
            <button
              type="button"
              onClick={fetchLeadData}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2f6cf6] px-4 py-2 text-xs font-bold text-white"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-20 pt-1">
        {/* Top App Header & Quick Action Buttons */}
        <div className="flex items-center justify-between gap-3 px-1">
          <button
            type="button"
            onClick={() => navigate("/leads/my")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#182338] text-[#8ea4cb] hover:text-white transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {lead.phone && (
              <>
                <a
                  href={`tel:${lead.phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e345e] text-blue-400 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                  title="Call Client"
                >
                  <FiPhone className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16382a] text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors shadow-sm"
                  title="WhatsApp Client"
                >
                  <FiMessageSquare className="h-4 w-4" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Lead Hero Profile Card */}
        <div className="rounded-[28px] border border-[#243552] bg-[#1d2840] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[22px] font-black text-white">
                {lead.name}
              </h1>
              {lead.location && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#7d93ba]">
                  <FiMapPin className="h-3.5 w-3.5 shrink-0 text-[#60a5fa]" />
                  <span>{lead.location}</span>
                </div>
              )}
            </div>
            <StatusBadge status={lead.status} size="md" />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {lead.phone && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#141e31] px-3 py-1.5 text-xs font-semibold text-blue-300 border border-[#233451]">
                <FiPhone className="h-3.5 w-3.5 text-blue-400" />
                <span>{lead.phone}</span>
              </span>
            )}
            {lead.email && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#141e31] px-3 py-1.5 text-xs font-semibold text-[#8ea4cb] border border-[#233451]">
                <FiMail className="h-3.5 w-3.5" />
                <span>{lead.email}</span>
              </span>
            )}
          </div>
        </div>

        {/* Requirements Card */}
        <div className="rounded-[26px] border border-[#243552] bg-[#1d2840] p-4.5 shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2 border-b border-[#23334d] pb-2.5">
            <FiHome className="h-4 w-4 text-[#34d399]" />
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">
              Client Requirements
            </h2>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-[#141e31] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7d93ba]">Project</p>
              <p className="mt-1 font-bold text-white truncate">{lead.project || "Not specified"}</p>
            </div>

            <div className="rounded-xl bg-[#141e31] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7d93ba]">Configuration</p>
              <p className="mt-1 font-bold text-white truncate">{lead.configuration || "Any"}</p>
            </div>

            <div className="rounded-xl bg-[#141e31] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7d93ba]">Budget Range</p>
              <p className="mt-1 font-bold text-[#34d399] truncate">{lead.budget || "Flexible"}</p>
            </div>

            <div className="rounded-xl bg-[#141e31] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7d93ba]">Lead Source</p>
              <p className="mt-1 font-bold text-white truncate">{lead.source || "Direct"}</p>
            </div>
          </div>
        </div>

        {/* Next Follow-up Card */}
        {followUp && (
          <div className="rounded-[24px] border border-[#d97706]/30 bg-[linear-gradient(135deg,#361d08_0%,#291605_100%)] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#fbbf24]">
                <FiCalendar className="h-4 w-4" />
                <span className="text-[12px] font-bold uppercase tracking-wider">Scheduled Follow-up</span>
              </div>
              <span className="rounded-full bg-[#fbbf24]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#fbbf24] border border-[#fbbf24]/30">
                {followUp.date} • {followUp.time}
              </span>
            </div>
            {lead.nextFollowUp?.action && (
              <p className="mt-2 text-xs font-semibold text-[#fde68a]">
                Action: {lead.nextFollowUp.action}
              </p>
            )}
          </div>
        )}

        {/* Interaction History Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-black text-white">Interaction History</h2>
            <span className="text-xs font-semibold text-[#7d93ba]">
              {interactions.length} {interactions.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <InteractionTimeline interactions={interactions} />
        </div>

        {/* Floating/Bottom "+ Add Interaction" Button */}
        <div className="fixed inset-x-0 bottom-18 z-20 mx-auto max-w-[390px] px-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#2f6cf6] text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,108,246,0.5)] active:scale-[0.98] border border-blue-400/30"
          >
            <FiPlus className="h-5 w-5" />
            <span>Add Interaction</span>
          </button>
        </div>

        {/* Add Interaction Modal */}
        <AddInteractionModal
          leadId={lead._id}
          currentStatus={lead.status}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onInteractionAdded={handleInteractionAdded}
        />
      </div>
    </DashboardLayout>
  );
}
