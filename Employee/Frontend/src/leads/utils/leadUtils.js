import {
  FiPhone,
  FiMessageSquare,
  FiUsers,
  FiFileText,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up",
  "Visit Scheduled",
  "Visit Completed",
  "Negotiation",
  "Booking",
  "Won",
  "Lost",
];

export const CONFIG_OPTIONS = [
  "1 RK",
  "1 BHK",
  "1.5 BHK",
  "2 BHK",
  "2.5 BHK",
  "3 BHK",
  "4+ BHK",
  "Penthouse",
  "Villa",
  "Commercial / Office",
  "Plot",
];

export const BUDGET_OPTIONS = [
  "Under ₹50 Lakhs",
  "₹50L – ₹1 Cr",
  "₹1 Cr – ₹1.5 Cr",
  "₹1.5 Cr – ₹2 Cr",
  "₹2 Cr – ₹3 Cr",
  "₹3 Cr – ₹5 Cr",
  "Above ₹5 Cr",
];

export const INTERACTION_TYPES = [
  { id: "CALL", label: "Call", icon: FiPhone, color: "text-[#FBFAF6] bg-[#962A22]" },
  { id: "WHATSAPP", label: "WhatsApp", icon: FiMessageSquare, color: "text-[#10b981] bg-[#12382c]" },
  { id: "MEETING", label: "Meeting", icon: FiUsers, color: "text-[#D9C4AA] bg-[#381C14]" },
  { id: "SITE_VISIT", label: "Site Visit", icon: FiMapPin, color: "text-[#E9D5BD] bg-[#4a241b]" },
  { id: "NOTE", label: "Note", icon: FiFileText, color: "text-[#AE9475] bg-[#24110c]" },
];

export const OUTCOME_OPTIONS = [
  "Interested",
  "Requested Visit",
  "Requested Details",
  "Family Discussion",
  "Price Concern",
  "Call Later",
  "Connected",
  "No Answer",
  "Wrong Number",
  "Not Interested",
];

export const NEXT_ACTION_OPTIONS = [
  "Call Client",
  "Schedule Site Visit",
  "Send Brochure / Details",
  "Follow Up Call",
  "Send Quotation",
  "Wait for Client Response",
  "Negotiate Terms",
  "Booking Token Collection",
  "Close Lead",
];

export const QUICK_RESPONSES = [
  "Interested in 2 BHK",
  "Requested brochure & price sheet",
  "Wants to visit site this weekend",
  "Family discussion needed",
  "Price is on higher side",
  "Call back tomorrow afternoon",
  "Looking for ready-to-move only",
  "No answer, will retry",
];

export function getStatusStyle(status = "New") {
  switch (status) {
    case "New":
      return {
        bg: "bg-[#381C14]",
        text: "text-[#D9C4AA]",
        border: "border-[#381C14]",
        dot: "bg-[#D9C4AA]",
      };
    case "Contacted":
      return {
        bg: "bg-[#381C14]",
        text: "text-[#E9D5BD]",
        border: "border-[#D9C4AA]/30",
        dot: "bg-[#E9D5BD]",
      };
    case "Interested":
      return {
        bg: "bg-[#064e3b]/50",
        text: "text-[#34d399]",
        border: "border-[#059669]/40",
        dot: "bg-[#10b981]",
      };
    case "Follow-up":
      return {
        bg: "bg-[#451a03]/60",
        text: "text-[#fbbf24]",
        border: "border-[#d97706]/40",
        dot: "bg-[#f59e0b]",
      };
    case "Visit Scheduled":
      return {
        bg: "bg-[#3b0764]/60",
        text: "text-[#c084fc]",
        border: "border-[#9333ea]/40",
        dot: "bg-[#a855f7]",
      };
    case "Visit Completed":
      return {
        bg: "bg-[#14532d]/60",
        text: "text-[#4ade80]",
        border: "border-[#16a34a]/40",
        dot: "bg-[#22c55e]",
      };
    case "Negotiation":
      return {
        bg: "bg-[#431407]/60",
        text: "text-[#fb923c]",
        border: "border-[#ea580c]/40",
        dot: "bg-[#f97316]",
      };
    case "Booking":
    case "Won":
      return {
        bg: "bg-[#064e3b]",
        text: "text-[#10b981]",
        border: "border-[#10b981]",
        dot: "bg-[#10b981]",
      };
    case "Lost":
      return {
        bg: "bg-[#450a0a]/60",
        text: "text-[#f87171]",
        border: "border-[#dc2626]/40",
        dot: "bg-[#ef4444]",
      };
    default:
      return {
        bg: "bg-[#1e293b]",
        text: "text-[#cbd5e1]",
        border: "border-[#334155]",
        dot: "bg-[#94a3b8]",
      };
  }
}

export function formatRelativeDate(dateString) {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "--";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatFollowUp(dateString, timeString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return {
    date: monthDay,
    time: timeString || "11:00 AM",
  };
}

export function cleanPhoneForWa(phone = "") {
  let clean = String(phone).replace(/[^0-9]/g, "");
  if (clean.length === 10) clean = `91${clean}`;
  if (clean.length === 11 && clean.startsWith("0")) clean = `91${clean.slice(1)}`;
  return clean;
}

