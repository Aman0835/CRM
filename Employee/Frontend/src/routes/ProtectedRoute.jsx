import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { employee, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-app-bg)]">
                <div className="flex flex-col items-center gap-4">
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            border: "4px solid #3b82f6",
                            borderTopColor: "transparent",
                            animation: "spin 0.8s linear infinite",
                        }}
                    />
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">
                        Checking session...
                    </p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (!employee) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
