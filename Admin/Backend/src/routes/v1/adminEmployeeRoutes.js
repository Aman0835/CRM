import { Router } from "express";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus
} from "../../controllers/adminEmployeeController.js";

const router = Router();

router.get("/", getEmployees);
router.get("/:employeeId", getEmployeeById);
router.post("/", createEmployee);
router.put("/:employeeId", updateEmployee);
router.delete("/:employeeId", deleteEmployee);
router.patch("/:employeeId/status", updateEmployeeStatus);

export default router;
