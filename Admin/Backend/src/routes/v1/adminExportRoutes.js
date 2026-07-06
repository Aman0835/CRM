import { Router } from "express";

import {
  exportAttendanceExcel,
  exportAttendancePdf,
  exportEmployeesExcel,
  exportEmployeesPdf,
  exportLeavesExcel,
  exportLeavesPdf,
  exportPayrollExcel,
  exportPayrollPdf
} from "../../controllers/adminExportController.js";

const router = Router();

router.get("/attendance/pdf", exportAttendancePdf);
router.get("/attendance/excel", exportAttendanceExcel);
router.get("/payroll/pdf", exportPayrollPdf);
router.get("/payroll/excel", exportPayrollExcel);
router.get("/employees/pdf", exportEmployeesPdf);
router.get("/employees/excel", exportEmployeesExcel);
router.get("/leaves/pdf", exportLeavesPdf);
router.get("/leaves/excel", exportLeavesExcel);

export default router;
