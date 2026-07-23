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
    requestEarlyCheckout,
    approveEarlyCheckout,
    rejectEarlyCheckout,
} from "../controllers/adminAttendanceController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Public / Employee access for check-in/out and early request
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.post("/request-early-checkout", requestEarlyCheckout);

// Protect admin management routes
router.use(authMiddleware);

// Admin approval/rejection for early checkout
router.patch("/approve-early-checkout/:id", approveEarlyCheckout);
router.patch("/reject-early-checkout/:id", rejectEarlyCheckout);

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

// Update Attendance
router.put("/updateAttendance/:id", updateAttendance);

// Delete Attendance
router.delete("/deleteAttendance/:id", deleteAttendance);

export default router;