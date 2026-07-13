import api from "./api";

export const getAttendanceReport = async () => {
    const response = await api.get("/admin/reports/getAttendanceReport");
    return response.data;
};

export const getPayrollReport = async () => {
    const response = await api.get("/admin/reports/getPayrollReport");
    return response.data;
};

export const getLeaveReport = async () => {
    const response = await api.get("/admin/reports/getLeaveReport");
    return response.data;
};
