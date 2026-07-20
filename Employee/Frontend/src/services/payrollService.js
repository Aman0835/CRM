import api from "./api";

// Get my payroll records
export const getMyPayroll = async (employeeId) => {
    const response = await api.get(`/admin/payroll/getPayrollByEmployee/${employeeId}`);
    return response.data;
};

// Get payroll by ID
export const getPayrollById = async (id) => {
    const response = await api.get(`/admin/payroll/getPayrollById/${id}`);
    return response.data;
};
