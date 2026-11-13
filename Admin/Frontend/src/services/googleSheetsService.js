import api from "./api";

export const getSheetConfig = async () => {
  const response = await api.get("/admin/sheets/config");
  return response.data;
};

export const saveSheetConfig = async (payload) => {
  const response = await api.post("/admin/sheets/config", payload);
  return response.data;
};

export const testConnection = async (webAppUrl) => {
  const response = await api.post("/admin/sheets/test", { webAppUrl });
  return response.data;
};

export const syncAllData = async (webAppUrl) => {
  const response = await api.post("/admin/sheets/sync-all", { webAppUrl });
  return response.data;
};

export const getScriptCode = async () => {
  const response = await api.get("/admin/sheets/script-code");
  return response.data;
};

