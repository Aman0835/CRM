import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import { connectDB } from "./config/db.js";

import adminAttendanceRoutes from "./routes/adminAttendanceRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import dashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminEmployeeRoutes from "./routes/adminEmployeeRoutes.js";
import holidayRoutes from "./routes/adminHolidayRoutes.js";
import leaveRoutes from "./routes/adminLeaveRoutes.js";
import payrollRoutes from "./routes/adminPayrollRoutes.js";
import reportRoutes from "./routes/adminReportRoutes.js";
import settingsRoutes from "./routes/adminSettingsRoutes.js";
import employeeAuthRoutes from "./routes/employeeAuthRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

const parseOrigins = (str) =>
  str
    ? str
        .split(",")
        .map((s) => s.trim().replace(/\/+$/, ""))
        .filter(Boolean)
    : [];

const allowedOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.EMPLOYEE_CLIENT_URL),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(cleanOrigin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "CRM Backend Live & Healthy",
  });
});

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/employees", adminEmployeeRoutes);
app.use("/api/admin/attendance", adminAttendanceRoutes);
app.use("/api/admin/leaves", leaveRoutes);
app.use("/api/admin/payroll", payrollRoutes);
app.use("/api/admin/holidays", holidayRoutes);
app.use("/api/admin/reports", reportRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/employee/auth", employeeAuthRoutes);
app.use("/api/employee", employeeRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database Connection Failed:", err);
  });