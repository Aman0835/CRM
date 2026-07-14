import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import EmployeeDetail from "../pages/Employees/EmployeeDetail";
import Attendance from "../pages/Attendance";
import Leave from "../pages/Leave";
import Holidays from "../pages/Holidays";
import Payroll from "../pages/Payroll";
import PayrollDetail from "../pages/Payroll/PayrollDetail";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import AdminProfile from "../pages/Profile";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
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
  );
}
