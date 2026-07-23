import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(() => {
        try {
            const token = localStorage.getItem("emp_token");
            const cached = localStorage.getItem("employee_data");
            if (token && cached) {
                return JSON.parse(cached);
            }
        } catch {}
        return null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem("emp_token");
            if (!token) {
                setEmployee(null);
                localStorage.removeItem("employee_data");
                setLoading(false);
                return;
            }

            try {
                const data = await authService.getMe();
                if (data && data.success && data.employee) {
                    setEmployee(data.employee);
                    localStorage.setItem("employee_data", JSON.stringify(data.employee));
                } else if (data && data.status === 401) {
                    localStorage.removeItem("emp_token");
                    localStorage.removeItem("employee_data");
                    setEmployee(null);
                }
            } catch (error) {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem("emp_token");
                    localStorage.removeItem("employee_data");
                    setEmployee(null);
                }
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (emailOrId, password) => {
        // Do not toggle global loading state so Login component state is never unmounted/cleared
        try {
            const data = await authService.login(emailOrId, password);
            if (data && data.success) {
                if (data.token) {
                    localStorage.setItem("emp_token", data.token);
                }
                if (data.employee) {
                    localStorage.setItem("employee_data", JSON.stringify(data.employee));
                }
                setEmployee(data.employee);
                return data;
            }
        } catch (error) {
            localStorage.removeItem("emp_token");
            localStorage.removeItem("employee_data");
            setEmployee(null);
            throw error;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed on server, cleaning client state anyway", error);
        } finally {
            localStorage.removeItem("emp_token");
            localStorage.removeItem("employee_data");
            setEmployee(null);
            setLoading(false);
        }
    };

    const updateEmployeeState = (updatedEmployee) => {
        setEmployee(updatedEmployee);
        if (updatedEmployee) {
            localStorage.setItem("employee_data", JSON.stringify(updatedEmployee));
        }
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
