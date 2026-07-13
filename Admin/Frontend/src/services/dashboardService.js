import api from "./api";

export const getDashboardOverview = async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
};

export const getAttendanceSummary = async () => {
    const response = await api.get("/admin/dashboard/attendance-summary");
    return response.data;
};

export const getPayrollSummary = async () => {
    const response = await api.get("/admin/dashboard/payroll-summary");
    return response.data;
};