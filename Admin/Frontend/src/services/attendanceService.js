import api from "./api";

export const getAttendanceList = async () => {
    const response = await api.get("/admin/attendance/getAttendanceList");
    return response.data;
};

export const getAttendanceByEmployee = async (employeeId) => {
    const response = await api.get(`/admin/attendance/getAttendanceByEmployee/${employeeId}`);
    return response.data;
};

export const checkIn = async (employeeId) => {
    const response = await api.post("/admin/attendance/check-in", { employeeId });
    return response.data;
};

export const checkOut = async (employeeId) => {
    const response = await api.post("/admin/attendance/check-out", { employeeId });
    return response.data;
};

export const deleteAttendance = async (id) => {
    const response = await api.delete(`/admin/attendance/deleteAttendance/${id}`);
    return response.data;
};
