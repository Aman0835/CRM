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
    color: "text-[#FBFAF6] bg-[#962A22]/30 border-[#962A22]/50",
  },
  WHATSAPP: {
    icon: FiMessageSquare,
    label: "WhatsApp",
    color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  },
  MEETING: {
    icon: FiUsers,
    label: "Meeting",
    color: "text-[#D9C4AA] bg-[#381C14] border-[#AE9475]/30",
  },
  SITE_VISIT: {
    icon: FiMapPin,
    label: "Site Visit",
    color: "text-[#E9D5BD] bg-[#4a241b] border-[#D9C4AA]/30",
  },
  NOTE: {
    icon: FiFileText,
    label: "Note",
    color: "text-[#AE9475] bg-[#24110c] border-[#381C14]",
  },
};

export default function InteractionTimeline({ interactions = [] }) {
  if (!interactions.length) {
    return (
      <div className="rounded-[22px] border border-[#381C14] bg-[#24110c] p-6 text-center">
        <p className="text-sm font-semibold text-[#D9C4AA]">
          No interactions recorded yet.
        </p>
        <p className="mt-1 text-xs text-[#AE9475]">
          Add your first interaction using the button below.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 before:absolute before:bottom-3 before:left-2.5 before:top-3 before:w-0.5 before:bg-[#381C14]">
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
              <div className="rounded-[20px] border border-[#381C14] bg-[#24110c] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                {/* Header: Type, Time, Employee */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${config.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </span>
                    <span className="text-[11px] text-[#D9C4AA]">
                      by {employeeName}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#AE9475]">
                    {formatRelativeDate(interaction.createdAt)}
                  </span>
                </div>

                {/* Client Response Quote */}
                <div className="mt-3 rounded-xl border border-[#381C14]/60 bg-[#1a0d09] px-3.5 py-2.5">
                  <p className="text-[13px] italic leading-relaxed text-[#FBFAF6]">
                    &ldquo;{interaction.clientResponse}&rdquo;
                  </p>
                </div>

                {/* Outcome & Next Action */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#381C14] pt-2.5 text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#D9C4AA]">
                      Outcome:
                    </span>
                    <span className="font-bold text-[#FBFAF6]">
                      {interaction.outcome}
                    </span>
                  </div>

                  {interaction.nextAction && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-[#D9C4AA]">
                        Next:
                      </span>
                      <span className="font-bold text-[#E9D5BD]">
                        {interaction.nextAction}
                      </span>
                    </div>
                  )}
                </div>

                {/* Follow-up reminder if set */}
                {interaction.nextActionDate && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-[#381C14] bg-[#381C14]/50 px-2.5 py-1 text-[11px] font-semibold text-[#D9C4AA]">
                    <FiCalendar className="h-3 w-3 text-[#962A22]" />
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
