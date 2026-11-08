import api from "./api";

/**
 * Get call analytics for Admin (Total dialed, total connected, agent leaderboard)
 */
export const getCallAnalytics = async ({ timeRange = "today", employeeId } = {}) => {
  const params = { timeRange };
  if (employeeId) params.employeeId = employeeId;
  const response = await api.get("/calls/analytics", { params });
  return response.data;
};

