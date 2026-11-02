import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";
import Settings from "../models/Settings.js";

/**
 * POST /api/admin/attendance/send-reminders
 * Finds all active employees who have NOT checked in today and sends them
 * an in-app attendance reminder notification.
 * This can be called manually by admin or by an external cron/scheduler.
 */
export const sendAttendanceReminders = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // Get all active employees
        const employees = await Employee.find({ status: "active" }).select("employeeId firstName lastName");

        if (!employees.length) {
            return res.status(200).json({ success: true, message: "No active employees found.", sent: 0 });
        }

        // Get today's attendance records that have a checkIn
        const checkedInToday = await Attendance.find({
            date: today,
            checkIn: { $ne: null },
        }).select("employeeId");

        const checkedInIds = new Set(checkedInToday.map((a) => a.employeeId));

        // Filter employees who have NOT checked in
        const notCheckedIn = employees.filter((emp) => !checkedInIds.has(emp.employeeId));

        if (!notCheckedIn.length) {
            return res.status(200).json({ success: true, message: "All employees have already checked in.", sent: 0 });
        }

        // Create a notification for each employee who hasn't checked in
        const notifications = notCheckedIn.map((emp) => ({
            recipientRole: "employee",
            employeeId: emp.employeeId,
            title: "⏰ Don't forget to Check In!",
            message: `Hi ${emp.firstName}, you haven't checked in yet today. Please check in as soon as you arrive.`,
            type: "attendance",
            read: false,
        }));

        await Notification.insertMany(notifications);

        // Emit real-time notifications via socket.io if available
        const io = req.app?.get("io");
        if (io) {
            notCheckedIn.forEach((emp) => {
                io.to(`employee-${emp.employeeId}`).emit("notification", {
                    title: "⏰ Don't forget to Check In!",
                    message: `Hi ${emp.firstName}, you haven't checked in yet today.`,
                    type: "attendance",
                });
            });
        }

        return res.status(200).json({
            success: true,
            message: `Reminder sent to ${notCheckedIn.length} employee(s).`,
            sent: notCheckedIn.length,
            employees: notCheckedIn.map((e) => `${e.firstName} ${e.lastName} (${e.employeeId})`),
        });
    } catch (error) {
        console.error("sendAttendanceReminders error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/admin/attendance/not-checked-in
 * Returns a list of employees who have NOT checked in today.
 * Used by the admin dashboard to display a quick overview.
 */
export const getNotCheckedInToday = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const employees = await Employee.find({ status: "active" }).select("employeeId firstName lastName");

        const checkedInToday = await Attendance.find({
            date: today,
            checkIn: { $ne: null },
        }).select("employeeId");

        const checkedInIds = new Set(checkedInToday.map((a) => a.employeeId));

        const notCheckedIn = employees
            .filter((emp) => !checkedInIds.has(emp.employeeId))
            .map((emp) => ({
                employeeId: emp.employeeId,
                name: `${emp.firstName} ${emp.lastName}`,
            }));

        return res.status(200).json({
            success: true,
            count: notCheckedIn.length,
            total: employees.length,
            data: notCheckedIn,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
