import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiClock, FiCheck, FiX } from "react-icons/fi";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const CLOCK_SIZE = 240;
const CENTER = CLOCK_SIZE / 2;
const RADIUS = 86;

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function parseTimeString(timeStr) {
  if (!timeStr) return { hour: 11, minute: 0, ampm: "AM" };
  const str = String(timeStr).trim();
  const ampmMatch = str.match(/(AM|PM)/i);
  let ampm = ampmMatch ? ampmMatch[1].toUpperCase() : "AM";
  const clean = str.replace(/[^\d:]/g, "");
  const [hStr, mStr] = clean.split(":");
  let hour = parseInt(hStr, 10);
  let minute = parseInt(mStr, 10) || 0;

  if (isNaN(hour)) hour = 11;
  if (!ampmMatch && hour >= 12) {
    ampm = "PM";
    if (hour > 12) hour = hour - 12;
  } else if (!ampmMatch && hour === 0) {
    hour = 12;
    ampm = "AM";
  } else if (ampmMatch) {
    if (hour > 12) hour = hour % 12 || 12;
    if (hour === 0) hour = 12;
  }

  return { hour, minute, ampm };
}

export function formatTimeObject({ hour, minute, ampm }) {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

export default function RoundClockModal({
  isOpen,
  onClose,
  initialTime = "11:00 AM",
  onSelectTime,
}) {
  const parsed = parseTimeString(initialTime);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState(parsed.ampm);
  const [mode, setMode] = useState("hours"); // "hours" | "minutes"
  const [isDragging, setIsDragging] = useState(false);

  const clockRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const p = parseTimeString(initialTime);
      setHour(p.hour);
      setMinute(p.minute);
      setAmpm(p.ampm);
      setMode("hours");
    }
  }, [isOpen, initialTime]);

  // Calculate coordinates based on angle
  const calculateAngleFromPointer = useCallback((clientX, clientY) => {
    if (!clockRef.current) return 0;
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle in degrees where 12 o'clock is 0 deg
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    handlePointerMove(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging && e.type !== "pointerdown") return;
    const angle = calculateAngleFromPointer(e.clientX, e.clientY);

    if (mode === "hours") {
      let rawH = Math.round(angle / 30);
      if (rawH === 0) rawH = 12;
      setHour(rawH);
    } else {
      let rawM = Math.round(angle / 6) % 60;
      setMinute(rawM);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // If was selecting hour, automatically progress to minute mode
      if (mode === "hours") {
        setTimeout(() => setMode("minutes"), 180);
      }
    }
  };

  if (!isOpen) return null;

  // Selected angle for hand
  const currentHandAngle = mode === "hours" ? hour * 30 : minute * 6;
  const handPoint = polarToCartesian(CENTER, CENTER, RADIUS, currentHandAngle);

  const handleConfirm = () => {
    const formatted = formatTimeObject({ hour, minute, ampm });
    onSelectTime(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[320px] overflow-hidden rounded-[32px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Label */}
        <div className="flex items-center justify-between pb-1">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D9C4AA] flex items-center gap-1.5">
            <FiClock className="text-[#962A22]" /> Select Follow-up Time
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#381C14] bg-[#1a0d09] text-[#D9C4AA] hover:text-[#FBFAF6] transition-colors"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Digital Time Header Display */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {/* Hour Box */}
          <button
            type="button"
            onClick={() => setMode("hours")}
            className={`flex h-14 min-w-[62px] items-center justify-center rounded-2xl border text-3xl font-black transition-all ${
              mode === "hours"
                ? "border-[#962A22] bg-[#381C14] text-[#FBFAF6] shadow-[0_4px_16px_rgba(150,42,34,0.35)]"
                : "border-[#381C14] bg-[#1a0d09] text-[#AE9475] hover:text-[#FBFAF6]"
            }`}
          >
            {String(hour).padStart(2, "0")}
          </button>

          <span className="text-2xl font-black text-[#AE9475]">:</span>

          {/* Minute Box */}
          <button
            type="button"
            onClick={() => setMode("minutes")}
            className={`flex h-14 min-w-[62px] items-center justify-center rounded-2xl border text-3xl font-black transition-all ${
              mode === "minutes"
                ? "border-[#962A22] bg-[#381C14] text-[#FBFAF6] shadow-[0_4px_16px_rgba(150,42,34,0.35)]"
                : "border-[#381C14] bg-[#1a0d09] text-[#AE9475] hover:text-[#FBFAF6]"
            }`}
          >
            {String(minute).padStart(2, "0")}
          </button>

          {/* AM / PM Pills */}
          <div className="flex flex-col gap-1 ml-1">
            <button
              type="button"
              onClick={() => setAmpm("AM")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                ampm === "AM"
                  ? "bg-[#962A22] text-[#FBFAF6] shadow-sm"
                  : "bg-[#1a0d09] border border-[#381C14] text-[#AE9475] hover:text-[#FBFAF6]"
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setAmpm("PM")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                ampm === "PM"
                  ? "bg-[#962A22] text-[#FBFAF6] shadow-sm"
                  : "bg-[#1a0d09] border border-[#381C14] text-[#AE9475] hover:text-[#FBFAF6]"
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Mode subtitle switcher tab */}
        <div className="mt-2 flex justify-center gap-4 text-xs font-bold text-[#AE9475]">
          <span
            onClick={() => setMode("hours")}
            className={`cursor-pointer pb-0.5 transition-colors ${
              mode === "hours" ? "text-[#FBFAF6] border-b-2 border-[#962A22]" : "hover:text-[#FBFAF6]"
            }`}
          >
            Set Hour
          </span>
          <span className="text-[#381C14]">•</span>
          <span
            onClick={() => setMode("minutes")}
            className={`cursor-pointer pb-0.5 transition-colors ${
              mode === "minutes" ? "text-[#FBFAF6] border-b-2 border-[#962A22]" : "hover:text-[#FBFAF6]"
            }`}
          >
            Set Minute
          </span>
        </div>

        {/* Circular Clock Dial */}
        <div className="mt-4 flex justify-center">
          <div
            ref={clockRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative h-[240px] w-[240px] rounded-full border border-[#381C14] bg-[#1a0d09] shadow-[inset_0_4px_16px_rgba(0,0,0,0.6)] touch-none cursor-pointer"
          >
            {/* Minute tick notches around perimeter */}
            <div className="absolute inset-0 rounded-full pointer-events-none">
              {[...Array(12)].map((_, i) => {
                const angle = i * 30;
                const pt = polarToCartesian(CENTER, CENTER, RADIUS + 18, angle);
                return (
                  <span
                    key={i}
                    style={{ left: `${pt.x}px`, top: `${pt.y}px` }}
                    className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#381C14]"
                  />
                );
              })}
            </div>

            {/* Hand SVG layer */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              {/* Hand connecting line */}
              <line
                x1={CENTER}
                y1={CENTER}
                x2={handPoint.x}
                y2={handPoint.y}
                stroke="#962A22"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Hand tip circle accent */}
              <circle
                cx={handPoint.x}
                cy={handPoint.y}
                r="17"
                fill="#962A22"
                className="transition-all duration-75 shadow-lg"
              />

              {/* Center pivot point */}
              <circle cx={CENTER} cy={CENTER} r="4.5" fill="#D9C4AA" />
              <circle cx={CENTER} cy={CENTER} r="2" fill="#FBFAF6" />
            </svg>

            {/* Dial Number Badges */}
            {mode === "hours"
              ? HOURS.map((h) => {
                  const angle = h * 30;
                  const pos = polarToCartesian(CENTER, CENTER, RADIUS, angle);
                  const isSelected = hour === h;

                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHour(h);
                        setTimeout(() => setMode("minutes"), 200);
                      }}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                      }}
                      className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[13px] font-bold transition-all z-10 ${
                        isSelected
                          ? "font-black text-[#FBFAF6]"
                          : "text-[#D9C4AA] hover:text-[#FBFAF6]"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })
              : MINUTES.map((m) => {
                  const angle = m * 6;
                  const pos = polarToCartesian(CENTER, CENTER, RADIUS, angle);
                  const isSelected = minute === m;

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMinute(m);
                      }}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                      }}
                      className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[12px] font-bold transition-all z-10 ${
                        isSelected
                          ? "font-black text-[#FBFAF6]"
                          : "text-[#D9C4AA] hover:text-[#FBFAF6]"
                      }`}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Quick presets row */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
          {["10:00 AM", "12:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const p = parseTimeString(preset);
                setHour(p.hour);
                setMinute(p.minute);
                setAmpm(p.ampm);
              }}
              className="rounded-lg border border-[#381C14] bg-[#1a0d09] px-2 py-1 text-[10px] font-semibold text-[#D9C4AA] hover:border-[#962A22] hover:text-[#FBFAF6] transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#381C14] bg-[#1a0d09] py-2.5 text-xs font-bold text-[#AE9475] hover:text-[#FBFAF6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#962A22] hover:bg-[#7e221b] border border-[#D9C4AA]/20 py-2.5 text-xs font-bold text-[#FBFAF6] shadow-[0_6px_16px_rgba(150,42,34,0.35)] active:scale-[0.98] transition-all"
          >
            <FiCheck className="h-4 w-4" />
            <span>Set Time</span>
          </button>
        </div>
      </div>
    </div>
  );
}
