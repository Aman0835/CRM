import { useEffect, useState, useCallback } from "react";
import { FiPhone } from "react-icons/fi";
import { getCallAnalytics } from "../../../services/callService";
import { getDeviceCallStats, syncDeviceCallsToBackend, isNativeApp } from "../../../services/deviceCallLog";
import { subscribeRealtime } from "../../../services/realtime";
import { useAuth } from "../../../context/AuthContext";

export default function CallzerWidget() {
  const { employee } = useAuth();
  const [data, setData] = useState({
    totalDialed: 0,
    totalConnected: 0,
    connectionRate: 0,
  });
  const [isDeviceLog, setIsDeviceLog] = useState(false);

  const fetchStats = useCallback(async () => {
    // 1. If running inside the Android APK, query real phone call log directly
    if (isNativeApp()) {
      const nativeStats = await getDeviceCallStats();
      if (nativeStats && nativeStats.success) {
        setData({
          totalDialed: nativeStats.totalDialed,
          totalConnected: nativeStats.totalConnected,
          connectionRate: nativeStats.connectionRate,
        });
        setIsDeviceLog(true);
        if (employee?.employeeId) {
          syncDeviceCallsToBackend(employee.employeeId);
        }
        return;
      }
    }

    // 2. Fall back to backend database
    try {
      const res = await getCallAnalytics({ timeRange: "today" });
      if (res && res.success) {
        setData({
          totalDialed: res.totalDialed || 0,
          totalConnected: res.totalConnected || 0,
          connectionRate: res.connectionRate || 0,
        });
        setIsDeviceLog(false);
      }
    } catch {}
  }, [employee?.employeeId]);

  useEffect(() => {
    fetchStats();

    // Re-check whenever the app regains focus (e.g. employee finishes a call and returns)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchStats();
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    const unsubscribe = subscribeRealtime((event) => {
      if (event?.type === "CALL_DIALED" || event?.type === "CALL_OUTCOME_LOGGED") {
        fetchStats();
      }
    });

    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      unsubscribe();
    };
  }, [fetchStats]);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#24110c] border border-[#381C14] text-xs">
      <div className="flex items-center gap-2 text-[#AE9475]">
        <FiPhone className="h-3.5 w-3.5 text-[#AE9475]" />
        <span className="text-[11px] font-medium text-[#D9C4AA]">Calls Today:</span>
        {isDeviceLog && (
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold">
            Phone Log
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-[#FBFAF6]">{data.totalDialed} dialed</span>
        <span className="text-[#381C14]">•</span>
        <span className="font-semibold text-[#D9C4AA]">{data.totalConnected} connected</span>
        {data.totalDialed > 0 && (
          <span className="text-[10px] text-[#AE9475]">({data.connectionRate}%)</span>
        )}
      </div>
    </div>
  );
}
