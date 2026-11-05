import { useEffect, useRef, useState } from "react";
import { FiClock, FiChevronDown } from "react-icons/fi";

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);

const parseTime = (value) => {
    const [rawHours, rawMinutes] = String(value || "09:00").split(":").map(Number);
    const hours = Number.isFinite(rawHours) ? rawHours : 9;
    const minutes = Number.isFinite(rawMinutes) ? rawMinutes : 0;
    return {
        hour12: hours % 12 || 12,
        minutes: Math.min(55, Math.max(0, Math.round(minutes / 5) * 5)),
        period: hours >= 12 ? "PM" : "AM",
    };
};

const to24HourValue = (hour12, minutes, period) => {
    let hours = hour12 % 12;
    if (period === "PM") hours += 12;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const dialPosition = (index, total) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    return {
        left: `${50 + Math.cos(angle) * 39}%`,
        top: `${50 + Math.sin(angle) * 39}%`,
    };
};

export default function TimeClockPicker({ value, onChange, label }) {
    const wrapperRef = useRef(null);
    const parsed = parseTime(value);
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState("hour");
    const [hour, setHour] = useState(parsed.hour12);
    const [minutes, setMinutes] = useState(parsed.minutes);
    const [period, setPeriod] = useState(parsed.period);

    useEffect(() => {
        const next = parseTime(value);
        setHour(next.hour12);
        setMinutes(next.minutes);
        setPeriod(next.period);
    }, [value]);

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", closeOnOutsideClick);
        return () => document.removeEventListener("mousedown", closeOnOutsideClick);
    }, []);

    const selectHour = (nextHour) => {
        setHour(nextHour);
        setStep("minute");
    };

    const selectMinute = (nextMinutes) => {
        setMinutes(nextMinutes);
        setStep("hour");
        onChange(to24HourValue(hour, nextMinutes, period));
        setOpen(false);
    };

    const selectPeriod = (nextPeriod) => {
        setPeriod(nextPeriod);
        onChange(to24HourValue(hour, minutes, nextPeriod));
    };

    const displayValue = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;

    return (
        <div ref={wrapperRef} className="relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{label}</label>
            <button
                type="button"
                onClick={() => { setOpen((current) => !current); setStep("hour"); }}
                className="flex w-full h-10 mt-1.5 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-xs font-semibold text-slate-800 outline-none transition hover:border-blue-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <span>{displayValue}</span>
                <FiClock className="text-slate-400" />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[250px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Choose {step === "hour" ? "hour" : "minutes"}
                            </p>
                            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{displayValue}</p>
                        </div>
                        <FiChevronDown className="rotate-180 text-slate-400" />
                    </div>

                    <div className="relative mx-auto h-[190px] w-[190px] rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="absolute left-1/2 bottom-1/2 z-0 h-[35%] w-0.5 origin-bottom -translate-x-1/2 rounded-full bg-blue-500 transition-transform duration-200"
                            style={{
                                transform: `translateX(-50%) rotate(${(
                                    ((step === "hour" ? HOURS.indexOf(hour) : MINUTES.indexOf(minutes)) /
                                        (step === "hour" ? HOURS.length : MINUTES.length)) *
                                        360
                                )}deg)`,
                            }}
                        />
                        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600" />
                        {(step === "hour" ? HOURS : MINUTES).map((item, index, items) => {
                            const selected = step === "hour" ? item === hour : item === minutes;
                            const text = step === "hour" ? item : String(item).padStart(2, "0");
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => step === "hour" ? selectHour(item) : selectMinute(item)}
                                    className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full text-[11px] font-bold transition ${
                                        selected
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-slate-600 hover:bg-blue-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                    }`}
                                    style={dialPosition(index, items.length)}
                                >
                                    {text}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {["AM", "PM"].map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => selectPeriod(item)}
                                className={`h-8 rounded-lg text-[11px] font-bold transition ${
                                    period === item
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-500 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300"
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
