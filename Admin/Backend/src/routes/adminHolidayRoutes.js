import { Router } from "express";

import authMiddleware  from "../middleware/authMiddleware.js";

import {
    createHoliday,
    deleteHoliday,
    getHolidayById,
    getHolidays,
    updateHoliday,
} from "../controllers/adminHolidayController.js";

const router = Router();

// Protect all holiday routes
router.use(authMiddleware);

// Get all holidays
router.get("/getHolidays", getHolidays);

// Get holiday by ID
router.get("/getHolidayById/:id", getHolidayById);

// Create holiday
router.post("/createHoliday", createHoliday);

// Update holiday
router.put("/updateHoliday/:id", updateHoliday);

// Delete holiday
router.delete("/deleteHoliday/:id", deleteHoliday);

export default router;