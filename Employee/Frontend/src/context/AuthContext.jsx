import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const data = await authService.getMe();
                if (data && data.success) {
                    setEmployee(data.employee);
                } else {
                    setEmployee(null);
                }
            } catch (error) {
                // 401 = not logged in — that's expected
                setEmployee(null);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (emailOrId, password) => {
        setLoading(true);
        try {
            const data = await authService.login(emailOrId, password);
            if (data && data.success) {
                setEmployee(data.employee);
                return data;
            }
        } catch (error) {
            setEmployee(null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed on server, cleaning client state anyway", error);
        } finally {
            setEmployee(null);
            setLoading(false);
        }
    };

    const updateEmployeeState = (updatedEmployee) => {
        setEmployee(updatedEmployee);
    };

    return (
        <AuthContext.Provider value={{ employee, loading, login, logout, updateEmployeeState }}>
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
