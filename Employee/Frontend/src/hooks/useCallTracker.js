import { useState } from "react";
import { dialCall } from "../services/callService";

export function useCallTracker(onRefresh) {
  const [activeCall, setActiveCall] = useState(null);

  const startCall = async (lead) => {
    if (!lead || !lead.phone) return;
    try {
      const res = await dialCall({
        leadId: lead._id,
        phoneNumber: lead.phone,
        leadName: lead.name,
      });

      setActiveCall({
        callId: res?.callId,
        leadId: lead._id,
        phoneNumber: lead.phone,
        leadName: lead.name,
      });

      // Launch native device dialer
      window.location.href = `tel:${lead.phone}`;
    } catch (err) {
      console.error("Failed to record dial", err);
      window.location.href = `tel:${lead.phone}`;
    }
  };

  const closeCall = () => {
    setActiveCall(null);
    if (onRefresh) onRefresh();
  };

  return {
    activeCall,
    startCall,
    closeCall,
  };
}
