import React, { useState } from "react";
import {
  FiX,
  FiPhone,
  FiMessageSquare,
  FiUsers,
  FiMapPin,
  FiFileText,
  FiCalendar,
  FiClock,
  FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  INTERACTION_TYPES,
  OUTCOME_OPTIONS,
  NEXT_ACTION_OPTIONS,
  QUICK_RESPONSES,
  LEAD_STATUSES,
} from "../utils/leadUtils";
import { addInteraction } from "../services/leadService";

export default function AddInteractionModal({
  leadId,
  currentStatus,
  isOpen,
  onClose,
  onInteractionAdded,
}) {
  const [type, setType] = useState("CALL");
  const [clientResponse, setClientResponse] = useState("");
  const [outcome, setOutcome] = useState("Connected");
  const [nextAction, setNextAction] = useState("Follow Up Call");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("11:00 AM");
  const [leadStatus, setLeadStatus] = useState(currentStatus || "Contacted");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuickChip = (text) => {
    if (!clientResponse) {
      setClientResponse(text);
    } else {
      setClientResponse((prev) => `${prev}. ${text}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientResponse.trim()) {
      toast.error("Please enter what the client said");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type,
        clientResponse: clientResponse.trim(),
        outcome,
        nextAction,
        followUpDate: followUpDate || undefined,
        followUpTime: followUpDate ? followUpTime : undefined,
        leadStatus,
      };

      const result = await addInteraction(leadId, payload);
      toast.success("Interaction logged successfully!");
      if (onInteractionAdded) {
        onInteractionAdded(result.data, result.lead);
      }
      onClose();
    } catch (error) {
      console.error("Failed to add interaction:", error);
      toast.error(error?.response?.data?.message || "Failed to record interaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] border border-[#263756] bg-[#101827] p-5 text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#1f2d47] pb-3">
          <div>
            <h2 className="text-[17px] font-black text-white">Add Interaction</h2>
            <p className="text-[12px] text-[#7d93ba]">Attach touchpoint to this lead</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e293b] text-[#94a3b8] hover:text-white"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Interaction Type Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
              Interaction Type
            </label>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {INTERACTION_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2 text-center transition-all ${
                      isSelected
                        ? "bg-[#2f6cf6] text-white shadow-[0_4px_12px_rgba(47,108,246,0.35)]"
                        : "bg-[#182338] text-[#7d93ba] hover:bg-[#202e48]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="mt-1 text-[10px] font-bold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Response */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
              What did the client say? <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={clientResponse}
              onChange={(e) => setClientResponse(e.target.value)}
              placeholder="e.g., Client visited site, liked 2 BHK layout, requested final discount..."
              className="mt-1.5 w-full resize-none rounded-2xl border border-[#2a3c5a] bg-[#162136] px-3.5 py-2.5 text-sm text-white placeholder-[#506385] outline-none focus:border-[#2f6cf6]"
              required
            />

            {/* Quick chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_RESPONSES.slice(0, 5).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickChip(chip)}
                  className="rounded-full border border-[#2b3c58] bg-[#1a253a] px-2.5 py-1 text-[11px] text-[#93aacf] hover:border-[#3b5278] hover:text-white"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome & Next Action */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                Outcome <span className="text-red-400">*</span>
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-2xl border border-[#2a3c5a] bg-[#162136] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
              >
                {OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#101827] text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                Next Action <span className="text-red-400">*</span>
              </label>
              <select
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-2xl border border-[#2a3c5a] bg-[#162136] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
              >
                {NEXT_ACTION_OPTIONS.map((act) => (
                  <option key={act} value={act} className="bg-[#101827] text-white">
                    {act}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Update Lead Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
              Update Lead Status
            </label>
            <select
              value={leadStatus}
              onChange={(e) => setLeadStatus(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-2xl border border-[#2a3c5a] bg-[#162136] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
            >
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st} className="bg-[#101827] text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Next Follow-up Date & Time */}
          <div className="rounded-2xl border border-[#253652] bg-[#141e30] p-3.5 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#fbbf24]">
              Schedule Follow-up (Optional)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#2a3c5a] bg-[#162136] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
              />
              <input
                type="text"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                placeholder="e.g. 11:00 AM"
                className="h-10 w-full rounded-xl border border-[#2a3c5a] bg-[#162136] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-2xl border border-[#2e405e] bg-[#172236] text-sm font-bold text-[#8ba2c8] hover:bg-[#202d44]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 flex-[2] rounded-2xl bg-[#2f6cf6] text-sm font-bold text-white shadow-[0_12px_24px_rgba(47,108,246,0.35)] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                "Saving..."
              ) : (
                <>
                  <FiCheck className="h-4 w-4" />
                  <span>Save Interaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
