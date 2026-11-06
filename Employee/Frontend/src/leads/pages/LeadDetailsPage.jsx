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
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import InteractionTimeline from "../components/InteractionTimeline";
import AddInteractionModal from "../components/AddInteractionModal";
import { getLeadById, getLeadInteractions, deleteLead } from "../services/leadService";
import { formatFollowUp, cleanPhoneForWa } from "../utils/leadUtils";
import CallOutcomeModal from "../../components/calls/CallOutcomeModal";
import { useCallTracker } from "../../hooks/useCallTracker";

export default function LeadDetailsPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { activeCall, startCall, closeCall } = useCallTracker(() => {
    fetchLeadData();
  });

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

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteLead(lead._id);
      toast.success("Lead deleted successfully");
      navigate("/leads");
    } catch (err) {
      console.error("Delete Lead Error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete lead");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const followUp = formatFollowUp(lead?.nextFollowUp?.date, lead?.nextFollowUp?.time);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#962A22] border-t-transparent" />
          <p className="text-xs font-semibold text-[#D9C4AA]">Loading lead details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout>
        <div className="rounded-[28px] border border-[#962A22]/40 bg-[#962A22]/10 p-6 text-center space-y-3 mt-8">
          <p className="text-sm font-bold text-red-300">{error || "Lead not found"}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="rounded-xl border border-[#381C14] bg-[#24110c] px-4 py-2 text-xs font-bold text-[#FBFAF6] hover:bg-[#381C14]"
            >
              Back to Leads
            </button>
            <button
              type="button"
              onClick={fetchLeadData}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#962A22] hover:bg-[#7e221b] px-4 py-2 text-xs font-bold text-[#FBFAF6]"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/leads");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-20 pt-1">
        {/* Top App Header & Quick Action Buttons */}
        <div className="flex items-center justify-between gap-3 px-1">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#381C14] bg-[#24110c] text-[#D9C4AA] hover:text-[#FBFAF6] active:scale-95 transition-all"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {lead.phone && (
              <>
                <button
                  type="button"
                  onClick={() => startCall(lead)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#381C14] bg-[#24110c] text-[#D9C4AA] hover:bg-[#962A22] hover:text-[#FBFAF6] transition-colors shadow-sm cursor-pointer"
                  title="Call Client"
                >
                  <FiPhone className="h-4 w-4" />
                </button>
                <a
                  href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#143d2c] text-emerald-400 hover:bg-[#25D366] hover:text-slate-950 transition-all active:scale-95 shadow-sm"
                  title="WhatsApp Client"
                >
                  <FaWhatsapp className="h-4.5 w-4.5 text-[#25D366]" />
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Delete lead"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#962A22]/15 border border-[#962A22]/30 text-red-400 hover:bg-[#962A22]/30 hover:text-red-300 active:scale-95 transition-all"
              title="Delete Lead"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lead Hero Profile Card */}
        <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.4)] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[22px] font-black text-[#FBFAF6]">
                {lead.name}
              </h1>
              {lead.location && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#D9C4AA]">
                  <FiMapPin className="h-3.5 w-3.5 shrink-0 text-[#962A22]" />
                  <span>{lead.location}</span>
                </div>
              )}
            </div>
            <StatusBadge status={lead.status} size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {lead.phone && (
              <>
                <button
                  type="button"
                  onClick={() => startCall(lead)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#381C14] bg-[#1a0d09] px-3 py-1.5 text-xs font-semibold text-[#E9D5BD] hover:border-[#962A22] hover:text-[#FBFAF6] transition-colors cursor-pointer"
                  title="Call Client"
                >
                  <FiPhone className="h-3.5 w-3.5 text-[#D9C4AA]" />
                  <span>{lead.phone}</span>
                </button>

                <a
                  href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#143d2c] border border-[#1b583f] px-3 py-1.5 text-xs font-bold text-emerald-400 transition-all hover:bg-[#25D366] hover:text-slate-950 active:scale-95 shadow-sm"
                  title="Chat on WhatsApp"
                >
                  <FaWhatsapp className="h-3.5 w-3.5 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Requirements Card */}
        <div className="rounded-[26px] border border-[#381C14] bg-[#24110c] p-4.5 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 border-b border-[#381C14] pb-2.5">
            <FiHome className="h-4 w-4 text-[#D9C4AA]" />
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#FBFAF6]">
              Client Requirements
            </h2>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-[#381C14]/60 bg-[#1a0d09] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D9C4AA]">Project</p>
              <p className="mt-1 font-bold text-[#FBFAF6] truncate">{lead.project || "Not specified"}</p>
            </div>

            <div className="rounded-xl border border-[#381C14]/60 bg-[#1a0d09] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D9C4AA]">Configuration</p>
              <p className="mt-1 font-bold text-[#FBFAF6] truncate">{lead.configuration || "Any"}</p>
            </div>

            <div className="rounded-xl border border-[#381C14]/60 bg-[#1a0d09] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D9C4AA]">Budget Range</p>
              <p className="mt-1 font-bold text-[#E9D5BD] truncate">{lead.budget || "Flexible"}</p>
            </div>

            <div className="rounded-xl border border-[#381C14]/60 bg-[#1a0d09] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D9C4AA]">Lead Source</p>
              <p className="mt-1 font-bold text-[#FBFAF6] truncate">{lead.source || "Direct"}</p>
            </div>
          </div>
        </div>

        {/* Next Follow-up Card */}
        {followUp && (
          <div className="rounded-[24px] border border-[#D9C4AA]/30 bg-[linear-gradient(135deg,#381C14_0%,#24110c_100%)] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#D9C4AA]">
                <FiCalendar className="h-4 w-4 text-[#962A22]" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#FBFAF6]">Scheduled Follow-up</span>
              </div>
              <span className="rounded-full bg-[#962A22]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#FBFAF6] border border-[#962A22]/40">
                {followUp.date} • {followUp.time}
              </span>
            </div>
            {lead.nextFollowUp?.action && (
              <p className="mt-2 text-xs font-semibold text-[#E9D5BD]">
                Action: {lead.nextFollowUp.action}
              </p>
            )}
          </div>
        )}

        {/* Interaction History Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-black text-[#FBFAF6]">Interaction History</h2>
            <span className="text-xs font-semibold text-[#D9C4AA]">
              {interactions.length} {interactions.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <InteractionTimeline interactions={interactions} />
        </div>

        {/* Floating/Bottom Action Buttons */}
        <div className="fixed inset-x-0 bottom-24 z-20 mx-auto max-w-[420px] px-4 pointer-events-none flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/visits/new?leadId=${lead._id}`)}
            className="pointer-events-auto flex-1 flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] text-[#FBFAF6] text-xs font-black shadow-[0_12px_28px_rgba(150,42,34,0.4)] active:scale-[0.98] border border-[#D9C4AA]/30 transition-all cursor-pointer"
          >
            <FiMapPin className="h-4 w-4" />
            <span>Fill Visit Form</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="pointer-events-auto flex-1 flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#381C14] hover:bg-[#4a241b] text-[#FBFAF6] text-xs font-bold shadow-[0_12px_28px_rgba(56,28,20,0.5)] active:scale-[0.98] border border-[#D9C4AA]/30 transition-all cursor-pointer"
          >
            <FiPlus className="h-4 w-4" />
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

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm px-4 pb-6">
            <div
              className="w-full max-w-[390px] rounded-[28px] border border-[#962A22]/40 bg-[#24110c] p-6 space-y-4 shadow-[0_-20px_60px_rgba(0,0,0,0.7)]"
              style={{ animation: "slideUp 0.25s ease-out" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#962A22]/20 border border-[#962A22]/40">
                  <FiAlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-[#FBFAF6]">Delete Lead?</h3>
                  <p className="text-[12px] text-[#D9C4AA] mt-0.5">This cannot be undone.</p>
                </div>
              </div>
              <p className="text-[13px] text-[#E9D5BD] leading-relaxed">
                You are about to permanently delete <span className="font-bold text-[#FBFAF6]">{lead.name}</span>'s lead along with all interaction history.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 h-12 rounded-2xl border border-[#381C14] bg-[#1a0d09] text-[13px] font-bold text-[#D9C4AA] hover:text-[#FBFAF6] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 h-12 rounded-2xl bg-[#962A22] text-[13px] font-bold text-[#FBFAF6] shadow-[0_8px_20px_rgba(150,42,34,0.4)] active:scale-[0.98] disabled:opacity-60 transition-all border border-[#D9C4AA]/30"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Callzer Post-Call Outcome Modal */}
      {activeCall && (
        <CallOutcomeModal
          callData={activeCall}
          onClose={closeCall}
          onComplete={() => {
            closeCall();
            fetchLeadData();
          }}
        />
      )}
    </DashboardLayout>
  );
}
