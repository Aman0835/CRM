import LeaveRequest from "../models/LeaveRequest.js";
import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";

const formatDateLabel = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Get All Leave Requests
export const getLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Leave By ID
export const getLeaveById = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Leave Request
export const createLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.create(req.body);

    const emp = await Employee.findOne({ employeeId: { $regex: new RegExp(`^${(leave.employeeId || "").trim()}$`, "i") } });
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : `Employee (${leave.employeeId})`;
    const fromStr = formatDateLabel(leave.fromDate);
    const toStr = formatDateLabel(leave.toDate);

    // Notify Admin of new leave request
    try {
      await Notification.create({
        recipientRole: "admin",
        title: "New Leave Request",
        message: `${empName} requested leave${fromStr ? ` from ${fromStr} to ${toStr}` : ""}.`,
        type: "leave",
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: leave,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve Leave
export const approveLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedBy: req.body.approvedBy || "admin",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    const fromStr = formatDateLabel(leave.fromDate);
    const toStr = formatDateLabel(leave.toDate);

    // Notify Employee of Approval
    try {
      await Notification.create({
        recipientRole: "employee",
        employeeId: leave.employeeId,
        title: "Leave Request Approved",
        message: `Your leave request${fromStr ? ` for ${fromStr} to ${toStr}` : ""} has been approved.`,
        type: "leave",
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: "Leave approved successfully",
      data: leave,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject Leave
export const rejectLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        approvedBy: req.body.approvedBy || "admin",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    const fromStr = formatDateLabel(leave.fromDate);
    const toStr = formatDateLabel(leave.toDate);

    // Notify Employee of Rejection
    try {
      await Notification.create({
        recipientRole: "employee",
        employeeId: leave.employeeId,
        title: "Leave Request Rejected",
        message: `Your leave request${fromStr ? ` for ${fromStr} to ${toStr}` : ""} was rejected.`,
        type: "leave",
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: "Leave rejected successfully",
      data: leave,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Leave
export const updateLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      data: leave,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Leave
export const deleteLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndDelete(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};