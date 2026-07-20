import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Lazy-loaded pages
const Login       = lazy(() => import("../pages/Login/Login"));
const Dashboard   = lazy(() => import("../pages/Dashboard"));
const Attendance  = lazy(() => import("../pages/Attendance"));
const Leave       = lazy(() => import("../pages/Leave"));
const Payroll     = lazy(() => import("../pages/Payroll"));
const Holidays    = lazy(() => import("../pages/Holidays"));
const Profile     = lazy(() => import("../pages/Profile"));
const Settings    = lazy(() => import("../pages/Settings"));
const NotFound    = lazy(() => import("../pages/NotFound/NotFound"));

function PageLoader() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "var(--color-app-bg, #f5f6fa)",
                gap: "1rem",
            }}
        >
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
            <p
                style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted, #9ca3af)",
                    fontWeight: 500,
                }}
            >
                Loading...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// Prevents authenticated employees from accessing /login
function GuestRoute({ children }) {
    const { employee, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (employee) return <Navigate to="/dashboard" replace />;
    return children;
}

export default function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leave"
                    element={
                        <ProtectedRoute>
                            <Leave />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payroll"
                    element={
                        <ProtectedRoute>
                            <Payroll />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/holidays"
                    element={
                        <ProtectedRoute>
                            <Holidays />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
