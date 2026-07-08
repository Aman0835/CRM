import { Router } from "express";

import {
    checkIn,
    checkOut,
    createAttendance,
    deleteAttendance,
    getAttendanceByEmployee,
    getAttendanceList,
    getAttendanceReport,
    getTodayAttendance,
    updateAttendance,
} from "../controllers/adminAttendanceController.js";

import  authMiddleware  from "../middleware/authMiddleware.js";

const router = Router();

// Protect all attendance routes
router.use(authMiddleware);

// Get all attendance
router.get("/getAttendanceList", getAttendanceList);

// Today's attendance
router.get("/getTodayAttendance", getTodayAttendance);

// Attendance Report
router.get("/getAttendanceReport", getAttendanceReport);

// Employee Attendance
router.get("/getAttendanceByEmployee/:employeeId", getAttendanceByEmployee);

// Create Attendance
router.post("/createAttendance", createAttendance);

// Check In
router.post("/check-in", checkIn);

// Check Out
router.post("/check-out", checkOut);

// Update Attendance
router.put("/updateAttendance/:id", updateAttendance);

// Delete Attendance
router.delete("/deleteAttendance/:id", deleteAttendance);

export default router;