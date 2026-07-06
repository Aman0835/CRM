import { Router } from "express";

import {
  generatePayroll,
  getPayrollByEmployee,
  getPayrollByMonthYear,
  getPayrolls,
  updatePayroll
} from "../../controllers/adminPayrollController.js";

const router = Router();

router.post("/generate", generatePayroll);
router.get("/", getPayrolls);
router.get("/month/:month/:year", getPayrollByMonthYear);
router.get("/:employeeId", getPayrollByEmployee);
router.put("/:payrollId", updatePayroll);

export default router;
