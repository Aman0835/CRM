import React from "react";
import {
  FiPhone,
  FiMessageSquare,
  FiUsers,
  FiFileText,
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiClock,
} from "react-icons/fi";
import { formatRelativeDate } from "../utils/leadUtils";

const typeConfig = {
  CALL: {
    icon: FiPhone,
    label: "Call",
    color: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  },
  WHATSAPP: {
    icon: FiMessageSquare,
    label: "WhatsApp",
    color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  },
  MEETING: {
    icon: FiUsers,
    label: "Meeting",
    color: "text-purple-400 bg-purple-500/20 border-purple-500/30",
  },
  SITE_VISIT: {
    icon: FiMapPin,
    label: "Site Visit",
    color: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  },
  NOTE: {
    icon: FiFileText,
    label: "Note",
    color: "text-slate-400 bg-slate-500/20 border-slate-500/30",
  },
};

export default function InteractionTimeline({ interactions = [] }) {
  if (!interactions.length) {
    return (
      <div className="rounded-[22px] border border-[#243552] bg-[#1d2840] p-6 text-center">
        <p className="text-sm font-semibold text-[#7d93ba]">
          No interactions recorded yet.
        </p>
        <p className="mt-1 text-xs text-[#597198]">
          Add your first interaction using the button below.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 before:absolute before:bottom-3 before:left-2.5 before:top-3 before:w-0.5 before:bg-[#253550]">
      <div className="space-y-4">
        {interactions.map((interaction, index) => {
          const config = typeConfig[interaction.type] || typeConfig.NOTE;
          const Icon = config.icon;
          const employeeName =
            interaction.employeeName ||
            `${interaction.employeeId?.firstName || ""} ${
              interaction.employeeId?.lastName || ""
            }`.trim() ||
            "Employee";

          return (
            <div key={interaction._id || index} className="relative">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border ${config.color} shadow-[0_0_12px_rgba(0,0,0,0.5)]`}
              >
                <Icon className="h-2.5 w-2.5" />
              </div>

              {/* Interaction Card */}
              <div className="rounded-[20px] border border-[#243552] bg-[#1d2840] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                {/* Header: Type, Time, Employee */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${config.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </span>
                    <span className="text-[11px] text-[#7d93ba]">
                      by {employeeName}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#7d93ba]">
                    {formatRelativeDate(interaction.createdAt)}
                  </span>
                </div>

                {/* Client Response Quote */}
                <div className="mt-3 rounded-xl bg-[#141d2e] px-3.5 py-2.5">
                  <p className="text-[13px] italic leading-relaxed text-[#e2e8f0]">
                    &ldquo;{interaction.clientResponse}&rdquo;
                  </p>
                </div>

                {/* Outcome & Next Action */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#23334d] pt-2.5 text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#7d93ba]">
                      Outcome:
                    </span>
                    <span className="font-bold text-[#38bdf8]">
                      {interaction.outcome}
                    </span>
                  </div>

                  {interaction.nextAction && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-[#7d93ba]">
                        Next:
                      </span>
                      <span className="font-bold text-[#fbbf24]">
                        {interaction.nextAction}
                      </span>
                    </div>
                  )}
                </div>

                {/* Follow-up reminder if set */}
                {interaction.nextActionDate && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#24324c] px-2.5 py-1 text-[11px] font-semibold text-[#fcd34d]">
                    <FiCalendar className="h-3 w-3" />
                    <span>
                      Follow-up:{" "}
                      {new Date(interaction.nextActionDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}{" "}
                      {interaction.nextActionTime &&
                        `• ${interaction.nextActionTime}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
