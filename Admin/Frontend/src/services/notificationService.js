import api from "./api";

export const getAdminNotifications = async () => {
    const response = await api.get("/notifications/admin");
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await api.patch(`/notifications/read/${id}`);
    return response.data;
};

export const markAllNotificationsRead = async (role = "admin", employeeId = null) => {
    const response = await api.post("/notifications/mark-all-read", { role, employeeId });
    return response.data;
};
