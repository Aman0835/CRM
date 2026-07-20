import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true, // sends HTTP-only cookie on every request
});

// Redirect to login on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (!window.location.pathname.includes("/login")) {
                window.location.replace("/login");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
