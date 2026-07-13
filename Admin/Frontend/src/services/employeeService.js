import api from "./api";

export const getEmployees = async (params) => {
    const response = await api.get("/admin/employees/getEmployees", { params });
    return response.data;
};

export const createEmployee = async (data) => {
    const response = await api.post("/admin/employees/createEmployee", data);
    return response.data;
};

export const updateEmployee = async (id, data) => {
    const response = await api.put(`/admin/employees/updateEmployee/${id}`, data);
    return response.data;
};

export const deleteEmployee = async (id) => {
    const response = await api.delete(`/admin/employees/deleteEmployee/${id}`);
    return response.data;
};

export const getEmployeeById = async (id) => {
    const response = await api.get(`/admin/employees/getEmployeeById/${id}`);
    return response.data;
};