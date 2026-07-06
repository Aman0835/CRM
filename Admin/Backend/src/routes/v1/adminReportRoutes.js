import { Router } from "express";

import {
  getAttendanceReportData,
  getCustomReportData,
  getEmployeesReportData,
  getLeavesReportData,
  getMonthlyReportData,
  getPayrollReportData
} from "../../controllers/adminReportController.js";

const router = Router();

router.get("/attendance", getAttendanceReportData);
router.get("/payroll", getPayrollReportData);
router.get("/leaves", getLeavesReportData);
router.get("/employees", getEmployeesReportData);
router.get("/monthly", getMonthlyReportData);
router.get("/custom", getCustomReportData);

export default router;
