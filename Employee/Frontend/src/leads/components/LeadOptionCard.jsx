import React from "react";
import { FiChevronRight } from "react-icons/fi";

export default function LeadOptionCard({
  title,
  description,
  icon: Icon,
  badge,
  onClick,
  tone = "primary",
}) {
  const isPrimary = tone === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 rounded-[26px] p-5 text-left transition-all duration-200 active:scale-[0.98] ${
        isPrimary
          ? "border border-[#D9C4AA]/30 bg-[linear-gradient(135deg,#962A22_0%,#5a1610_100%)] shadow-[0_16px_36px_rgba(150,42,34,0.35)] hover:border-[#D9C4AA]/60"
          : "border border-[#381C14] bg-[#24110c] shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:border-[#962A22]"
      }`}
    >
      {Icon && (
        <div
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
            isPrimary
              ? "bg-[#381C14] text-[#FBFAF6] shadow-[0_8px_20px_rgba(56,28,20,0.4)] border border-[#D9C4AA]/20"
              : "bg-[#1a0d09] border border-[#381C14] text-[#D9C4AA]"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold text-[#FBFAF6] group-hover:text-[#D9C4AA] transition-colors">
            {title}
          </h2>
          {badge !== undefined && badge !== null && (
            <span className="rounded-full bg-[#962A22]/20 px-2 py-0.5 text-[11px] font-bold text-[#FBFAF6] border border-[#962A22]/40">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-snug text-[#D9C4AA]">
          {description}
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#D9C4AA] group-hover:translate-x-1 group-hover:text-[#FBFAF6] transition-all">
        <FiChevronRight className="h-5 w-5" />
      </div>
    </button>
  );
}