import { Router } from "express";

import authMiddleware  from "../middleware/authMiddleware.js";

import {
    deletePayroll,
    generatePayroll,
    getPayrollByEmployee,
    getPayrollById,
    getPayrollByMonthYear,
    getPayrolls,
    updatePayroll,
} from "../controllers/adminPayrollController.js";

const router = Router();

// Protect all payroll routes
router.use(authMiddleware);

// Generate Payroll
router.post("/generatePayroll", generatePayroll);

// Get All Payrolls
router.get("/getPayrolls", getPayrolls);

// Get Payroll By Month & Year
router.get("/getPayrollByMonthYear/:month/:year", getPayrollByMonthYear);

// Get Payroll By Employee
router.get("/getPayrollByEmployee/:employeeId", getPayrollByEmployee);

// Get Payroll By ID
router.get("/getPayrollById/:id", getPayrollById);

// Update Payroll
router.put("/updatePayroll/:id", updatePayroll);

// Delete Payroll
router.delete("/deletePayroll/:id", deletePayroll);

export default router;