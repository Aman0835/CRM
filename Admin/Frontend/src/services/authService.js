import api from "./api";

export const login = async (email, password) => {
    const response = await api.post("/admin/auth/login", { email, password });
    return response.data;
};

export const logout = async () => {
    const response = await api.post("/admin/auth/logout");
    return response.data;
};

export const getMe = async () => {
    const response = await api.get("/admin/auth/me");
    return response.data;
};
