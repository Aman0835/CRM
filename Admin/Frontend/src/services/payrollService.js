import api from "./api";

export const generatePayroll = async (month, year) => {
    const response = await api.post("/admin/payroll/generatePayroll", { month, year });
    return response.data;
};

export const getPayrolls = async () => {
    const response = await api.get("/admin/payroll/getPayrolls");
    return response.data;
};

export const getPayrollByEmployee = async (employeeId) => {
    const response = await api.get(`/admin/payroll/getPayrollByEmployee/${employeeId}`);
    return response.data;
};

export const deletePayroll = async (id) => {
    const response = await api.delete(`/admin/payroll/deletePayroll/${id}`);
    return response.data;
};

export const getPayrollById = async (id) => {
    const response = await api.get(`/admin/payroll/getPayrollById/${id}`);
    return response.data;
};
