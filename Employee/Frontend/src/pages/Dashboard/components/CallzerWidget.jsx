import { useEffect, useState, useCallback } from "react";
import { FiPhone } from "react-icons/fi";
import { getCallAnalytics } from "../../../services/callService";
import { subscribeRealtime } from "../../../services/realtime";

export default function CallzerWidget() {
  const [data, setData] = useState({
    totalDialed: 0,
    totalConnected: 0,
    connectionRate: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await getCallAnalytics({ timeRange: "today" });
      if (res && res.success) {
        setData({
          totalDialed: res.totalDialed || 0,
          totalConnected: res.totalConnected || 0,
          connectionRate: res.connectionRate || 0,
        });
      }
    } catch {}
  }, []);

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
    <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#24110c] border border-[#381C14] text-xs">
      <div className="flex items-center gap-2 text-[#AE9475]">
        <FiPhone className="h-3.5 w-3.5 text-[#AE9475]" />
        <span className="text-[11px] font-medium text-[#D9C4AA]">Calls Today:</span>
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
