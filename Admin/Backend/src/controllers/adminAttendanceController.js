import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";
import Settings from "../models/Settings.js";
import { broadcastRealtime } from "../utils/realtime.js";
import { calculateDistance, isValidCoordinate, isAccuracyAcceptable } from "../utils/geoUtils.js";

const format12HourTime = (timeStr) => {
  if (!timeStr) return "08:00 PM";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
};

// Create Attendance
export const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);

    res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check In with Shift Start Time Evaluation & Server-Side Geofencing
export const checkIn = async (req, res) => {
  try {
    const rawId = (req.body.employeeId || req.employee?.employeeId || "").trim();
    if (!rawId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const searchRegex = new RegExp(`^${rawId}$`, "i");
    const today = new Date().toISOString().split("T")[0];

    // Verify employee and assigned office location
    const employee = await Employee.findOne({ employeeId: { $regex: searchRegex } }).populate("assignedOffice");
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const { latitude, longitude, accuracy } = req.body;
    let checkInLocData = {
      latitude: null,
      longitude: null,
      accuracy: null,
      distance: null,
      verified: false,
      timestamp: null,
    };
    let officeLocationId = null;
    let officeName = "";

    // If request comes from an employee (or contains GPS coordinates), strictly validate geofence
    // req.employee is set when called via employee portal route
    const isEmployeeCaller = Boolean(req.employee) || (latitude !== undefined && longitude !== undefined);

    if (isEmployeeCaller) {
      if (!employee.assignedOffice) {
        return res.status(400).json({
          success: false,
          message: "No office location assigned. Please contact your administrator.",
        });
      }

      if (!employee.assignedOffice.isActive) {
        return res.status(400).json({
          success: false,
          message: "Assigned office location is currently inactive. Please contact your administrator.",
        });
      }

      if (latitude === undefined || longitude === undefined || !isValidCoordinate(latitude, longitude)) {
        return res.status(400).json({
          success: false,
          message: "Valid GPS coordinates are required for check-in.",
        });
      }

      if (!isAccuracyAcceptable(accuracy)) {
        return res.status(400).json({
          success: false,
          message: `GPS accuracy too low (reported accuracy: ${Math.round(accuracy)}m). High-accuracy GPS is required.`,
        });
      }

      const office = employee.assignedOffice;
      const distance = calculateDistance(latitude, longitude, office.latitude, office.longitude);
      const allowedRadius = office.allowedRadius || 100;

      if (distance > allowedRadius) {
        return res.status(400).json({
          success: false,
          message: `Outside permitted office area. You are ${Math.round(distance)}m away from ${office.officeName} (allowed radius: ${allowedRadius}m).`,
        });
      }

      officeLocationId = office._id;
      officeName = office.officeName;
      checkInLocData = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: accuracy !== undefined && accuracy !== null ? Number(accuracy) : null,
        distance,
        verified: true,
        timestamp: new Date(),
      };
    }

    let attendance = await Attendance.findOne({
      employeeId: { $regex: searchRegex },
      date: today,
    });

    if (attendance) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    // Retrieve active shift settings
    const settings = (await Settings.findOne()) || { checkInTime: "09:00", checkOutTime: "20:00", lateGraceMinutes: 15 };

    const now = new Date();
    const [targetHour, targetMin] = (settings.checkInTime || "09:00").split(":").map(Number);
    const graceMinutes = settings.lateGraceMinutes ?? 15;

    // Deadline = configured check-in time + grace buffer
    const deadlineDate = new Date(now);
    deadlineDate.setHours(targetHour || 9, (targetMin || 0) + graceMinutes, 0, 0);

    // Flag as "Late" only if checked in AFTER configured check-in time + grace period
    const status = now > deadlineDate ? "Late" : "Present";

    attendance = await Attendance.create({
      employeeId: rawId,
      date: today,
      checkIn: now,
      status,
      officeLocation: officeLocationId || (employee.assignedOffice ? employee.assignedOffice._id : null),
      officeName: officeName || (employee.assignedOffice ? employee.assignedOffice.officeName : ""),
      checkInLocation: checkInLocData,
      locationVerified: checkInLocData.verified,
    });

    if (status === "Late") {
      try {
        await Notification.create({
          recipientRole: "admin",
          title: "Late Check-in Alert",
          message: `Employee (${rawId}) checked in late at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: "attendance",
        });
      } catch (notifError) {
        console.error("Failed to create late check-in notification:", notifError);
      }
    }

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "attendance", action: "updated", entity: "attendance", data: attendance });

    res.status(201).json({
      success: true,
      message: status === "Late" ? "Check In Successful (Marked Late)" : "Check In Successful",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check Out with Standard Working Hours Enforcement & Server-Side Geofencing
export const checkOut = async (req, res) => {
  try {
    const rawId = (req.body.employeeId || req.employee?.employeeId || "").trim();
    if (!rawId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const searchRegex = new RegExp(`^${rawId}$`, "i");
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeId: { $regex: searchRegex },
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found for today",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already checked out for today",
      });
    }

    // Verify employee and assigned office location for check-out
    const employee = await Employee.findOne({ employeeId: { $regex: searchRegex } }).populate("assignedOffice");

    const { latitude, longitude, accuracy } = req.body;
    const isEmployeeCaller = Boolean(req.employee) || (latitude !== undefined && longitude !== undefined);

    let checkOutLocData = {
      latitude: null,
      longitude: null,
      accuracy: null,
      distance: null,
      verified: false,
      timestamp: null,
    };

    if (isEmployeeCaller && employee?.assignedOffice) {
      if (!employee.assignedOffice.isActive) {
        return res.status(400).json({
          success: false,
          message: "Assigned office location is currently inactive. Please contact your administrator.",
        });
      }

      if (latitude === undefined || longitude === undefined || !isValidCoordinate(latitude, longitude)) {
        return res.status(400).json({
          success: false,
          message: "Valid GPS coordinates are required for check-out.",
        });
      }

      if (!isAccuracyAcceptable(accuracy)) {
        return res.status(400).json({
          success: false,
          message: `GPS accuracy too low (reported accuracy: ${Math.round(accuracy)}m). High-accuracy GPS is required.`,
        });
      }

      const office = employee.assignedOffice;
      const distance = calculateDistance(latitude, longitude, office.latitude, office.longitude);
      const allowedRadius = office.allowedRadius || 100;

      if (distance > allowedRadius) {
        return res.status(400).json({
          success: false,
          message: `Outside permitted office area. You are ${Math.round(distance)}m away from ${office.officeName} (allowed radius: ${allowedRadius}m).`,
        });
      }

      checkOutLocData = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: accuracy !== undefined && accuracy !== null ? Number(accuracy) : null,
        distance,
        verified: true,
        timestamp: new Date(),
      };
    }

    const now = new Date();
    const settings = (await Settings.findOne()) || { checkOutTime: "20:00" };
    const [targetOutHour, targetOutMin] = (settings.checkOutTime || "20:00").split(":").map(Number);
    const targetCheckOutDate = new Date(now);
    targetCheckOutDate.setHours(targetOutHour || 20, targetOutMin || 0, 0, 0);

    // Checkout allowed
    attendance.checkOut = now;
    attendance.checkOutLocation = checkOutLocData;
    if (checkOutLocData.verified) {
      attendance.locationVerified = true;
    }

    // Calculate total working hours
    const totalWorkingHours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    attendance.workingHours = Math.max(0, Number(totalWorkingHours.toFixed(2)));

    // Calculate overtime hours if check-out time is past standard check-out time
    if (now > targetCheckOutDate) {
      const overtimeDiff = (now - targetCheckOutDate) / (1000 * 60 * 60);
      attendance.overtime = Math.max(0, Number(overtimeDiff.toFixed(2)));
    } else {
      attendance.overtime = 0;
    }

    await attendance.save();

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "attendance", action: "updated", entity: "attendance", data: attendance });

    res.status(200).json({
      success: true,
      message: "Check Out Successful",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employee Request Early Checkout
export const requestEarlyCheckout = async (req, res) => {
  try {
    const { employeeId, reason } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({ employeeId, date: today });
    if (!attendance) {
      return res.status(404).json({ success: false, message: "No active check-in found for today." });
    }

    attendance.earlyCheckoutStatus = "requested";
    attendance.earlyCheckoutReason = reason || "Personal reason";
    await attendance.save();

    // Create Notification for Admin
    try {
      await Notification.create({
        recipientRole: "admin",
        title: "Early Checkout Request",
        message: `Employee (${employeeId}) requested early checkout: "${reason || 'Personal reason'}".`,
        type: "attendance",
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "attendance", action: "updated", entity: "attendance", data: attendance });

    res.status(200).json({
      success: true,
      message: "Early checkout request submitted to Admin for approval.",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Approve Early Checkout
export const approveEarlyCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    const now = new Date();
    attendance.earlyCheckoutStatus = "approved";
    attendance.checkOut = now;

    // Calculate working hours
    const totalWorkingHours = (now - attendance.checkIn) / (1000 * 60 * 60);
    attendance.workingHours = Math.max(0, Number(totalWorkingHours.toFixed(2)));
    if (attendance.workingHours < 5) {
      attendance.status = "Half Day";
    }

    await attendance.save();

    // Notify Employee
    try {
      await Notification.create({
        recipientRole: "employee",
        employeeId: attendance.employeeId,
        title: "Early Checkout Approved",
        message: "Your early checkout request has been approved by admin. You are now checked out.",
        type: "attendance",
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "attendance", action: "updated", entity: "attendance", data: attendance });

    res.status(200).json({
      success: true,
      message: "Early checkout approved and employee checked out.",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Reject Early Checkout
export const rejectEarlyCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    attendance.earlyCheckoutStatus = "rejected";
    await attendance.save();

    // Notify Employee
    try {
      await Notification.create({
        recipientRole: "employee",
        employeeId: attendance.employeeId,
        title: "Early Checkout Request Rejected",
        message: "Your early checkout request was rejected by admin. Please complete your full shift.",
        type: "attendance",
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "attendance", action: "updated", entity: "attendance", data: attendance });

    res.status(200).json({
      success: true,
      message: "Early checkout request rejected.",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Attendance
export const getAttendanceList = async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Today Attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const attendance = await Attendance.find({ date: today });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Attendance By Employee
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const attendance = await Attendance.find({ employeeId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Attendance Report
export const getAttendanceReport = async (req, res) => {
  try {
    const attendance = await Attendance.find();
    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Attendance
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Attendance
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};