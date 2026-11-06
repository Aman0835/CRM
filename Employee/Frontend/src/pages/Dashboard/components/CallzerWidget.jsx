import { useEffect, useState, useCallback } from "react";
import { FiPhone, FiPhoneCall, FiPhoneOff, FiTrendingUp } from "react-icons/fi";
import { getCallAnalytics } from "../../../services/callService";
import { subscribeRealtime } from "../../../services/realtime";

export default function CallzerWidget({ onOpenDialModal }) {
  const [timeRange, setTimeRange] = useState("today"); // "today" | "month"
  const [data, setData] = useState({
    totalDialed: 0,
    totalConnected: 0,
    notConnected: 0,
    connectionRate: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCallAnalytics({ timeRange });
      if (res && res.success) {
        setData({
          totalDialed: res.totalDialed || 0,
          totalConnected: res.totalConnected || 0,
          notConnected: res.notConnected || 0,
          connectionRate: res.connectionRate || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch call analytics", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
    const unsubscribe = subscribeRealtime((event) => {
      if (event?.type === "CALL_DIALED" || event?.type === "CALL_OUTCOME_LOGGED") {
        fetchStats();
      }
    });
    return () => unsubscribe();
  }, [fetchStats]);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#962A22]/50 bg-[#962A22]/20 text-[#E9D5BD]">
            <FiPhoneCall className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#FBFAF6]">Calling Performance</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#D9C4AA]">
              Callzer Outbound Tracker
            </p>
          </div>
        </div>

        {/* Time Filter Toggle */}
        <div className="flex rounded-xl border border-[#381C14] bg-[#1a0d09] p-1 text-[11px]">
          <button
            type="button"
            onClick={() => setTimeRange("today")}
            className={[
              "rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer",
              timeRange === "today"
                ? "bg-[#962A22] text-[#FBFAF6] shadow-sm"
                : "text-[#AE9475] hover:text-[#FBFAF6]",
            ].join(" ")}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("month")}
            className={[
              "rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer",
              timeRange === "month"
                ? "bg-[#962A22] text-[#FBFAF6] shadow-sm"
                : "text-[#AE9475] hover:text-[#FBFAF6]",
            ].join(" ")}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Total Dialed vs Total Connected */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Total Number Dialed */}
        <div className="rounded-2xl border border-[#381C14] bg-[#1a0d09] p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D9C4AA]">
              Total Dialed
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#381C14] text-[#E9D5BD]">
              <FiPhone className="h-3 w-3" />
            </div>
          </div>
          <p className="mt-2 font-mono text-[28px] font-black leading-none text-[#FBFAF6]">
            {data.totalDialed}
          </p>
          <p className="mt-1 text-[11px] text-[#AE9475]">Numbers called</p>
        </div>

        {/* Total Number Connected */}
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
              Total Connected
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <FiPhoneCall className="h-3 w-3" />
            </div>
          </div>
          <p className="mt-2 font-mono text-[28px] font-black leading-none text-[#16e0a0]">
            {data.totalConnected}
          </p>
          <p className="mt-1 text-[11px] text-emerald-400/80">Spoke with client</p>
        </div>
      </div>

      {/* Secondary Row: Connection Rate Progress & Unanswered */}
      <div className="mt-3.5 rounded-2xl border border-[#381C14] bg-[#1a0d09] p-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <FiTrendingUp className="h-3.5 w-3.5 text-[#E9D5BD]" />
            <span className="font-bold text-[#D9C4AA]">Connection Rate:</span>
            <span className="font-mono font-black text-[#FBFAF6]">{data.connectionRate}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#AE9475]">
            <FiPhoneOff className="h-3 w-3 text-rose-400" />
            <span>Not Connected: <strong className="text-rose-300">{data.notConnected}</strong></span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#381C14]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#962A22] via-[#E9D5BD] to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, data.connectionRate))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
