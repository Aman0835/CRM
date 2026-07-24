import axios from "axios";

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl) {
        return "http://localhost:5000/api";
    }
    const cleanUrl = envUrl.replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
});

// Attach JWT from localStorage as Authorization header on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("emp_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default api;
