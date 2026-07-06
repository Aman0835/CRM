import { Router } from "express";

import {
  deleteAttendance,
  getAttendanceByDate,
  getAttendanceByEmployee,
  getAttendanceList,
  getAttendanceReport,
  updateAttendance
} from "../../controllers/adminAttendanceController.js";

const router = Router();

router.get("/", getAttendanceList);
router.get("/report", getAttendanceReport);
router.get("/date/:date", getAttendanceByDate);
router.get("/:employeeId", getAttendanceByEmployee);
router.put("/:attendanceId", updateAttendance);
router.delete("/:attendanceId", deleteAttendance);

export default router;
