import { useState } from "react";
import { FiCheck, FiPhone, FiPhoneCall, FiPhoneOff, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { logCallOutcome } from "../../services/callService";

const CONNECTED_OUTCOMES = [
  "Interested",
  "Requested Visit",
  "Follow Up Call",
  "Requested Details",
  "Call Later",
  "Negotiation",
];

const NOT_CONNECTED_REASONS = [
  "No Answer / Ringing",
  "Busy / Call Waiting",
  "Switched Off",
  "Wrong Number",
];

export default function CallOutcomeModal({ callData, onClose, onComplete }) {
  const [status, setStatus] = useState("connected"); // "connected" | "not_connected"
  const [outcome, setOutcome] = useState("Interested");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!callData) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!callData.callId) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      await logCallOutcome(callData.callId, {
        status: status === "connected" ? "connected" : "not_connected",
        outcome: outcome || (status === "connected" ? "Connected" : "No Answer"),
        notes: notes.trim(),
      });
      toast.success(
        status === "connected"
          ? "Call marked as Connected! 📞"
          : "Call logged as Not Connected",
        {
          style: {
            background: "#24110c",
            color: "#FBFAF6",
            border: "1px solid #381C14",
          },
        }
      );
      if (onComplete) onComplete();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save call outcome");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 px-4 pb-6 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-[32px] border border-[#381C14] bg-[#24110c] p-6 text-[#FBFAF6] shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#962A22]/50 bg-[#962A22]/20 text-[#E9D5BD]">
              <FiPhoneCall className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                Call Outcome
              </p>
              <h3 className="truncate text-base font-black text-[#FBFAF6]">
                {callData.leadName || "Call Outcome"}
              </h3>
              <p className="text-[11px] text-[#AE9475]">{callData.phoneNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#381C14] bg-[#1a0d09] p-2 text-[#D9C4AA] transition hover:text-[#FBFAF6]"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Question: Did the call connect? */}
        <p className="mb-2 text-center text-xs font-bold text-[#E9D5BD]">
          Did the client answer the call?
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setStatus("connected");
              setOutcome("Interested");
            }}
            className={[
              "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3.5 transition-all cursor-pointer",
              status === "connected"
                ? "border-emerald-500/60 bg-emerald-950/50 text-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
                : "border-[#381C14] bg-[#1a0d09] text-[#AE9475] hover:text-[#FBFAF6]",
            ].join(" ")}
          >
            <FiCheck className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-wider">Connected</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatus("not_connected");
              setOutcome("No Answer / Ringing");
            }}
            className={[
              "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3.5 transition-all cursor-pointer",
              status === "not_connected"
                ? "border-rose-500/60 bg-rose-950/50 text-rose-400 shadow-[0_4px_16px_rgba(244,63,94,0.25)]"
                : "border-[#381C14] bg-[#1a0d09] text-[#AE9475] hover:text-[#FBFAF6]",
            ].join(" ")}
          >
            <FiPhoneOff className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-wider">Not Connected</span>
          </button>
        </div>

        {/* Outcome Selector */}
        <div className="mt-4">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9C4AA]">
            {status === "connected" ? "Call Outcome" : "Unconnected Reason"}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(status === "connected" ? CONNECTED_OUTCOMES : NOT_CONNECTED_REASONS).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setOutcome(opt)}
                className={[
                  "rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer",
                  outcome === opt
                    ? status === "connected"
                      ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                      : "border border-rose-500/50 bg-rose-500/20 text-rose-300"
                    : "border border-[#381C14] bg-[#1a0d09] text-[#D9C4AA] hover:text-[#FBFAF6]",
                ].join(" ")}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Remarks Input */}
        <div className="mt-3">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9C4AA]">
            Call Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={status === "connected" ? "e.g. Discussed 2 BHK West County" : "e.g. Call rang, no answer"}
            className="h-10 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] px-3.5 text-xs text-[#FBFAF6] outline-none placeholder:text-[#AE9475]/60 focus:border-[#962A22]"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-2xl border border-[#381C14] bg-[#1a0d09] text-xs font-bold text-[#D9C4AA] hover:text-[#FBFAF6] transition"
          >
            Skip / Later
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-11 flex-1 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] border border-[#D9C4AA]/20 text-xs font-black text-[#FBFAF6] shadow-[0_8px_20px_rgba(150,42,34,0.35)] disabled:opacity-60 transition cursor-pointer"
          >
            {submitting ? "Saving..." : "Save Call Log"}
          </button>
        </div>
      </div>
    </div>
  );
}

