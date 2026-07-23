import express from "express";
import {
  getAdminNotifications,
  getEmployeeNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/admin", getAdminNotifications);
router.get("/employee/:employeeId", getEmployeeNotifications);
router.patch("/read/:id", markNotificationRead);
router.post("/mark-all-read", markAllNotificationsRead);

export default router;
