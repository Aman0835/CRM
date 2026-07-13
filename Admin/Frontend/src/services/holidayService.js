import api from "./api";

export const getHolidays = async () => {
    const response = await api.get("/admin/holidays/getHolidays");
    return response.data;
};

export const createHoliday = async (data) => {
    const response = await api.post("/admin/holidays/createHoliday", data);
    return response.data;
};

export const updateHoliday = async (id, data) => {
    const response = await api.put(`/admin/holidays/updateHoliday/${id}`, data);
    return response.data;
};

export const deleteHoliday = async (id) => {
    const response = await api.delete(`/admin/holidays/deleteHoliday/${id}`);
    return response.data;
};
