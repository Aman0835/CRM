import api from "./api";

// Get paginated leads for admin (search, status, page, limit)
export const getLeads = async (params = {}) => {
  const response = await api.get("/leads", { params });
  return response.data;
};

export const getLeadById = async (id) => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

export const updateLead = async (id, data) => {
  const response = await api.patch(`/leads/${id}`, data);
  return response.data;
};

export const getLeadInteractions = async (id) => {
  const response = await api.get(`/leads/${id}/interactions`);
  return response.data;
};
