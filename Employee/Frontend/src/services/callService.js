import api from "./api";

/**
 * Log that an agent dialed a phone number (Callzer Outbound Dial)
 */
export const dialCall = async ({ leadId, phoneNumber, leadName }) => {
  const response = await api.post("/employee/calls/dial", {
    leadId,
    phoneNumber,
    leadName,
  });
  return response.data;
};

/**
 * Log whether the call connected and what the outcome was (Callzer Outcome)
 */
export const logCallOutcome = async (callId, outcomeData) => {
  const response = await api.post(`/employee/calls/${callId}/outcome`, outcomeData);
  return response.data;
};

/**
 * Get call analytics (Total dialed, total connected, rate)
 */
export const getCallAnalytics = async ({ timeRange = "today" } = {}) => {
  const response = await api.get("/employee/calls/analytics", {
    params: { timeRange },
  });
  return response.data;
};

