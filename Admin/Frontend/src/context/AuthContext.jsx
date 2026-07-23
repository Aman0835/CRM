import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(() => {
        try {
            const token = localStorage.getItem("token");
            const cached = localStorage.getItem("admin_data");
            if (token && cached) {
                return JSON.parse(cached);
            }
        } catch {}
        return null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const data = await authService.getMe();
                if (data && data.success && data.admin) {
                    setAdmin(data.admin);
                    localStorage.setItem("admin_data", JSON.stringify(data.admin));
                } else if (data && data.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("admin_data");
                    setAdmin(null);
                }
            } catch (error) {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("admin_data");
                    setAdmin(null);
                }
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const loginAdmin = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            if (data && data.success) {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
                if (data.admin) {
                    localStorage.setItem("admin_data", JSON.stringify(data.admin));
                }
                setAdmin(data.admin);
                return data;
            }
        } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("admin_data");
            setAdmin(null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logoutAdmin = async () => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed on server, cleaning client state anyway", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("admin_data");
            setAdmin(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ admin, loading, login: loginAdmin, logout: logoutAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
