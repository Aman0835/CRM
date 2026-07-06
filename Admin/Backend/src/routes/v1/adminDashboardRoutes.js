import { Router } from "express";

import {
  getAttendanceSummary,
  getDashboard,
  getDashboardStats,
  getLeaveSummary,
  getPayrollSummary,
  getRecentActivities
} from "../../controllers/adminDashboardController.js";

const router = Router();

router.get("/", getDashboard);
router.get("/stats", getDashboardStats);
router.get("/attendance-summary", getAttendanceSummary);
router.get("/payroll-summary", getPayrollSummary);
router.get("/leave-summary", getLeaveSummary);
router.get("/recent-activities", getRecentActivities);

export default router;
