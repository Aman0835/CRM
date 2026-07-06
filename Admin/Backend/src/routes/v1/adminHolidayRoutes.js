import { Router } from "express";

import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  updateHoliday
} from "../../controllers/adminHolidayController.js";

const router = Router();

router.get("/", getHolidays);
router.post("/", createHoliday);
router.put("/:holidayId", updateHoliday);
router.delete("/:holidayId", deleteHoliday);

export default router;
