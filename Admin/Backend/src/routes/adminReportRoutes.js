import { Router } from "express";

import authMiddleware  from "../middleware/authMiddleware.js";

import {
  getAttendanceReport,
  getCustomReport,
  getEmployeeReport,
  getMonthlyReport,
  getPayrollReport,
} from "../controllers/adminReportController.js";

const router = Router();

// Protect all report routes
router.use(authMiddleware);

// Attendance Report
router.get("/getAttendanceReport", getAttendanceReport);

// Payroll Report
router.get("/getPayrollReport", getPayrollReport);


// Employee Report
router.get("/getEmployeeReport", getEmployeeReport);

// Monthly Report
router.get("/getMonthlyReport", getMonthlyReport);

// Custom Report
router.get("/getCustomReport", getCustomReport);

export default router;
