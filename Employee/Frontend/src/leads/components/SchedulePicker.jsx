import React, { useState, useRef } from "react";
import { FiCalendar, FiClock, FiX } from "react-icons/fi";
import RoundClockModal from "./RoundClockModal";

export function formatTime24To12(time24) {
  if (!time24) return "";
  if (time24.includes("AM") || time24.includes("PM")) return time24;
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${h.toString().padStart(2, "0")}:${m} ${ampm}`;
}

export function time12To24(time12) {
  if (!time12) return "";
  if (!time12.includes("AM") && !time12.includes("PM")) return time12;
  const [time, modifier] = time12.split(" ");
  if (!time) return "";
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = parseInt(hours, 10) + 12;
  return `${hours.toString().padStart(2, "0")}:${minutes || "00"}`;
}

export default function SchedulePicker({
  date = "",
  onDateChange,
  time = "11:00 AM",
  onTimeChange,
  title = "Schedule Follow-up",
  optional = true,
}) {
  const dateInputRef = useRef(null);
  const [isClockOpen, setIsClockOpen] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleDatePreset = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="rounded-2xl border border-[#381C14] bg-[#1a0d09] p-3.5 space-y-3">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA] flex items-center gap-1.5">
          <FiCalendar className="text-[#962A22] text-xs" /> {title}
        </p>
        {date && optional && (
          <button
            type="button"
            onClick={() => onDateChange("")}
            className="text-[10px] text-[#962A22] hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
          >
            <FiX className="text-xs" /> Clear Schedule
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Date Selector (Calendar) */}
        <div>
          <label className="text-[10px] uppercase font-bold text-[#D9C4AA] mb-1 flex items-center gap-1">
            <FiCalendar className="text-[#962A22]" /> Calendar Date
          </label>
          <div
            onClick={() => {
              try {
                dateInputRef.current?.showPicker?.();
              } catch {
                dateInputRef.current?.focus();
              }
            }}
            className={`relative flex items-center gap-2 h-11 w-full rounded-xl border px-3 cursor-pointer transition select-none ${
              date
                ? "border-[#962A22] bg-[#24110c] text-[#FBFAF6] shadow-sm"
                : "border-[#381C14] bg-[#24110c] text-[#AE9475] hover:border-[#962A22]"
            }`}
          >
            <FiCalendar className={`shrink-0 text-sm ${date ? "text-[#962A22]" : "text-[#AE9475]"}`} />
            <span className="text-xs flex-1 truncate font-medium">
              {date ? formattedDate : "Choose Date from Calendar"}
            </span>

            <input
              ref={dateInputRef}
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => handleDatePreset(0)}
              className={`px-2 py-0.5 rounded-md border text-[10px] transition cursor-pointer ${
                date === todayStr
                  ? "bg-[#962A22] border-[#962A22] text-[#FBFAF6] font-bold"
                  : "bg-[#24110c] border-[#381C14] text-[#E9D5BD] hover:text-[#FBFAF6]"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset(1)}
              className="px-2 py-0.5 rounded-md bg-[#24110c] border border-[#381C14] text-[10px] text-[#E9D5BD] hover:text-[#FBFAF6] transition cursor-pointer"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset(2)}
              className="px-2 py-0.5 rounded-md bg-[#24110c] border border-[#381C14] text-[10px] text-[#E9D5BD] hover:text-[#FBFAF6] transition cursor-pointer"
            >
              +2 Days
            </button>
          </div>
        </div>

        {/* Time Selector (Round Clock Trigger) */}
        <div>
          <label className="text-[10px] uppercase font-bold text-[#D9C4AA] mb-1 flex items-center gap-1">
            <FiClock className="text-[#D9C4AA]" /> Clock Time
          </label>
          <button
            type="button"
            onClick={() => setIsClockOpen(true)}
            className="flex items-center gap-2 h-11 w-full rounded-xl border border-[#381C14] bg-[#24110c] px-3 cursor-pointer hover:border-[#962A22] active:scale-[0.99] transition select-none text-[#FBFAF6] text-left"
          >
            <FiClock className="shrink-0 text-sm text-[#D9C4AA]" />
            <span className="text-xs flex-1 truncate font-bold text-[#FBFAF6]">
              {time ? formatTime24To12(time) : "Tap to open clock"}
            </span>
            <span className="text-[10px] font-semibold text-[#D9C4AA] bg-[#381C14] px-2 py-0.5 rounded-lg border border-[#962A22]/40">
              Change
            </span>
          </button>

          {/* Quick Clock Presets */}
          <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
            {["10:00 AM", "12:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTimeChange(t)}
                className={`shrink-0 px-2 py-0.5 rounded-md border text-[10px] transition cursor-pointer ${
                  formatTime24To12(time) === t
                    ? "bg-[#962A22] border-[#962A22] text-[#FBFAF6] font-bold"
                    : "bg-[#24110c] border-[#381C14] text-[#E9D5BD] hover:text-[#FBFAF6]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Round Clock Time Picker Modal */}
      <RoundClockModal
        isOpen={isClockOpen}
        onClose={() => setIsClockOpen(false)}
        initialTime={time}
        onSelectTime={(selected) => onTimeChange(selected)}
      />
    </div>
  );
}
