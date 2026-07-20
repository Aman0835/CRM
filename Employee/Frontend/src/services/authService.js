import api from "./api";

export const login = async (emailOrId, password) => {
    const response = await api.post("/employee/auth/login", { emailOrId, password });
    return response.data;
};

export const logout = async () => {
    const response = await api.post("/employee/auth/logout");
    return response.data;
};

export const getMe = async () => {
    const response = await api.get("/employee/auth/me");
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.patch("/employee/auth/change-password", {
        currentPassword,
        newPassword,
    });
    return response.data;
};
