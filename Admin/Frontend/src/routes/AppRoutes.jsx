import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Lazy-loaded pages — each is a separate JS chunk
const Dashboard     = lazy(() => import("../pages/Dashboard"));
const Employees     = lazy(() => import("../pages/Employees"));
const EmployeeDetail = lazy(() => import("../pages/Employees/EmployeeDetail"));
const Attendance    = lazy(() => import("../pages/Attendance"));
const Leave         = lazy(() => import("../pages/Leave"));
const Holidays      = lazy(() => import("../pages/Holidays"));
const Payroll       = lazy(() => import("../pages/Payroll"));
const PayrollDetail = lazy(() => import("../pages/Payroll/PayrollDetail"));
const Reports       = lazy(() => import("../pages/Reports"));
const Settings      = lazy(() => import("../pages/Settings"));
const Login         = lazy(() => import("../pages/Login/Login"));
const NotFound      = lazy(() => import("../pages/NotFound/NotFound"));
const AdminProfile  = lazy(() => import("../pages/Profile"));

// Shared loading fallback shown while a chunk is being downloaded
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-app-bg, #0f1117)",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "4px solid var(--color-gold, #c9a84c)",
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

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute>
              <EmployeeDetail />
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
          path="/holidays"
          element={
            <ProtectedRoute>
              <Holidays />
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
          path="/payroll/:id"
          element={
            <ProtectedRoute>
              <PayrollDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
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

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

