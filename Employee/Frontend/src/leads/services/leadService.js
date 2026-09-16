import api from "../../services/api";

/**
 * Create a new lead with its initial interaction.
 */
export const createLead = async (leadData) => {
  const response = await api.post("/employee/leads", leadData);
  return response.data;
};

/**
 * Get leads assigned to the current employee, with optional search and status filters.
 */
export const getMyLeads = async ({ search = "", status = "all", page = 1, limit = 50 } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const response = await api.get("/employee/leads/my", { params });
  return response.data;
};

/**
 * Get single lead details.
 */
export const getLeadById = async (leadId) => {
  const response = await api.get(`/employee/leads/${leadId}`);
  return response.data;
};

/**
 * Update lead details (e.g. status, project, budget).
 */
export const updateLead = async (leadId, data) => {
  const response = await api.patch(`/employee/leads/${leadId}`, data);
  return response.data;
};

/**
 * Add a new interaction to an existing lead.
 */
export const addInteraction = async (leadId, interactionData) => {
  const response = await api.post(`/employee/leads/${leadId}/interactions`, interactionData);
  return response.data;
};

/**
 * Get interaction history for a lead.
 */
export const getLeadInteractions = async (leadId) => {
  const response = await api.get(`/employee/leads/${leadId}/interactions`);
  return response.data;
};
