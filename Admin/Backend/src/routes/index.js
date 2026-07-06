import { Router } from "express";

import adminAuthRoutes from "./v1/adminAuthRoutes.js";
import adminDashboardRoutes from "./v1/adminDashboardRoutes.js";
import adminEmployeeRoutes from "./v1/adminEmployeeRoutes.js";
import adminAttendanceRoutes from "./v1/adminAttendanceRoutes.js";
import adminLeaveRoutes from "./v1/adminLeaveRoutes.js";
import adminPayrollRoutes from "./v1/adminPayrollRoutes.js";
import adminHolidayRoutes from "./v1/adminHolidayRoutes.js";
import adminReportRoutes from "./v1/adminReportRoutes.js";
import adminExportRoutes from "./v1/adminExportRoutes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API healthy"
  });
});

router.use("/auth", adminAuthRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/employees", adminEmployeeRoutes);
router.use("/admin/attendance", adminAttendanceRoutes);
router.use("/admin/leaves", adminLeaveRoutes);
router.use("/admin/payroll", adminPayrollRoutes);
router.use("/admin/holidays", adminHolidayRoutes);
router.use("/admin/reports", adminReportRoutes);
router.use("/admin/export", adminExportRoutes);

export default router;
