import api from "./api";

export const getEmployeeNotifications = async (employeeId) => {
    const response = await api.get(`/notifications/employee/${employeeId}`);
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await api.patch(`/notifications/read/${id}`);
    return response.data;
};

export const markAllNotificationsRead = async (role = "employee", employeeId = null) => {
    const response = await api.post("/notifications/mark-all-read", { role, employeeId });
    return response.data;
};
