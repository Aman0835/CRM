import React from "react";
import { getStatusStyle } from "../utils/leadUtils";

export default function StatusBadge({ status = "New", size = "sm" }) {
  const style = getStatusStyle(status);

  const sizeClasses =
    size === "xs"
      ? "text-[10px] px-2 py-0.5 gap-1"
      : size === "md"
      ? "text-[13px] px-3 py-1 gap-1.5 font-bold"
      : "text-[11px] px-2.5 py-0.5 gap-1.5 font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span>{status}</span>
    </span>
  );
}
