import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const data = await authService.getMe();
                if (data && data.success) {
                    setAdmin(data.admin);
                }
            } catch (error) {
                console.log("Not logged in or token expired");
                setAdmin(null);
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
                setAdmin(data.admin);
                return data;
            }
        } catch (error) {
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
