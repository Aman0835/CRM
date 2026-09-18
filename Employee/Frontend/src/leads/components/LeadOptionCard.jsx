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
          ? "border border-[#2f6cf6]/30 bg-[linear-gradient(135deg,#132247_0%,#182a57_100%)] shadow-[0_16px_36px_rgba(23,43,90,0.35)] hover:border-[#2f6cf6]/60"
          : "border border-[#243552] bg-[#1d2840] shadow-[0_12px_28px_rgba(0,0,0,0.25)] hover:border-[#384e75]"
      }`}
    >
      {Icon && (
        <div
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
            isPrimary
              ? "bg-[#2f6cf6] text-white shadow-[0_8px_20px_rgba(47,108,246,0.4)]"
              : "bg-[#273857] text-[#8ea8d8]"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold text-white group-hover:text-blue-200">
            {title}
          </h2>
          {badge !== undefined && badge !== null && (
            <span className="rounded-full bg-[#2f6cf6]/20 px-2 py-0.5 text-[11px] font-bold text-[#60a5fa] border border-[#2f6cf6]/30">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-snug text-[#8098c2]">
          {description}
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#8098c2] group-hover:translate-x-1 group-hover:text-white transition-all">
        <FiChevronRight className="h-5 w-5" />
      </div>
    </button>
  );
}