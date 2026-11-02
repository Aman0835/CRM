import React from "react";
import { FiPhone, FiCalendar, FiArrowRight, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import { formatFollowUp, cleanPhoneForWa } from "../utils/leadUtils";

export default function LeadCard({ lead, onClick, onDelete }) {
  const followUp = formatFollowUp(lead?.nextFollowUp?.date, lead?.nextFollowUp?.time);
  const latestResponse = lead?.latestInteraction?.clientResponse;

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-[#243552] bg-[#1d2840] p-4.5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition-all duration-200 active:scale-[0.98] hover:border-[#38517c]"
    >
      {/* Top Header: Name, Status & Delete */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-black text-white group-hover:text-blue-200">
            {lead.name}
          </h3>
          {lead.location && (
            <p className="mt-0.5 truncate text-[12px] text-[#7d93ba]">
              {lead.location}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={lead.status} />
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead);
              }}
              aria-label="Delete lead"
              title="Delete lead"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/0 border border-transparent text-[#506385] hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 active:scale-95 transition-all"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Project & Requirements */}
      {(lead.project || lead.configuration || lead.budget) && (
        <div className="mt-3 rounded-[16px] bg-[#141d2e] px-3.5 py-2.5">
          {lead.project && (
            <p className="text-[13px] font-bold text-[#9db4db]">
              {lead.project}
            </p>
          )}
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-[#7088ae]">
            {lead.configuration && <span>{lead.configuration}</span>}
            {lead.configuration && lead.budget && <span>•</span>}
            {lead.budget && <span className="font-semibold text-[#cbd5e1]">{lead.budget}</span>}
          </div>
        </div>
      )}

      {/* Phone Call & WhatsApp Action Buttons */}
      {lead.phone && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#233555] px-3 py-1.5 text-[12px] font-semibold text-blue-300 transition-colors hover:bg-blue-600 hover:text-white"
            title="Call Client"
          >
            <FiPhone className="h-3.5 w-3.5 text-blue-400" />
            <span>{lead.phone}</span>
          </a>

          <a
            href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#143d2c] border border-[#1b583f] px-3 py-1.5 text-[12px] font-bold text-emerald-400 transition-all hover:bg-[#25D366] hover:text-slate-950 active:scale-95 shadow-sm"
            title="Chat on WhatsApp"
          >
            <FaWhatsapp className="h-4 w-4 text-[#25D366] group-hover/wa:text-slate-950" />
            <span>WhatsApp</span>
          </a>
        </div>
      )}

      {/* Follow-up & Latest Interaction Box */}
      <div className="mt-3 space-y-2 border-t border-[#23334d] pt-3">
        {followUp && (
          <div className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-1.5 font-semibold text-[#fbbf24]">
              <FiCalendar className="h-3.5 w-3.5" />
              <span>Next Follow-up</span>
            </span>
            <span className="font-bold text-white">
              {followUp.date} • {followUp.time}
            </span>
          </div>
        )}

        {latestResponse && (
          <div className="rounded-xl bg-[#152033] px-3 py-2 text-[12px]">
            <span className="font-semibold text-[#7d93ba]">Latest: </span>
            <span className="italic text-[#cbd5e1]">
              &ldquo;{latestResponse.length > 70 ? `${latestResponse.slice(0, 70)}...` : latestResponse}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* Card arrow footer */}
      <div className="mt-3 flex items-center justify-end text-[11px] font-bold text-[#4f83f8] group-hover:translate-x-1 transition-transform">
        <span className="mr-1">View Details</span>
        <FiArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
