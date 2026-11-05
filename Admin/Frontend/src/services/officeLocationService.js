import api from "./api";

export const getOfficeLocations = async (params = {}) => {
  const response = await api.get("/admin/locations", { params });
  return response.data;
};

export const getOfficeLocationById = async (id) => {
  const response = await api.get(`/admin/locations/${id}`);
  return response.data;
};

export const createOfficeLocation = async (data) => {
  const response = await api.post("/admin/locations", data);
  return response.data;
};

export const updateOfficeLocation = async (id, data) => {
  const response = await api.put(`/admin/locations/${id}`, data);
  return response.data;
};

export const deleteOfficeLocation = async (id) => {
  const response = await api.delete(`/admin/locations/${id}`);
  return response.data;
};
