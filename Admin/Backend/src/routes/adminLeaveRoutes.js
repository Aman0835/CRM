import { Router } from "express";

import  authMiddleware  from "../middleware/authMiddleware.js";

import {
    approveLeave,
    createLeave,
    deleteLeave,
    getLeaveById,
    getLeaves,
    rejectLeave,
    updateLeave,
} from "../controllers/adminLeaveController.js";

const router = Router();

// Protect all leave routes
router.use(authMiddleware);

// Get all leave requests
router.get("/getLeaves", getLeaves);

// Get leave by ID
router.get("/getLeaveById/:id", getLeaveById);

// Apply Leave
router.post("/createLeave", createLeave);

// Update Leave
router.put("/updateLeave/:id", updateLeave);

// Approve Leave
router.patch("/approveLeave/:id", approveLeave);

// Reject Leave
router.patch("/rejectLeave/:id", rejectLeave);

// Delete Leave
router.delete("/deleteLeave/:id", deleteLeave);

export default router;