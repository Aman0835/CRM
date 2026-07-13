import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { admin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-app-bg)] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-gold)] border-t-transparent"></div>
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">Checking session...</p>
                </div>
            </div>
        );
    }

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    return children;
}