import { asyncHandler } from "../middleware/asyncHandler.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { ApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/response.js";

export const getLeaves = asyncHandler(async (_req, res) => {
  const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
  sendResponse(res, 200, "Leave requests fetched", leaves);
});

export const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.leaveId);

  if (!leave) {
    throw new ApiError(404, "Leave request not found");
  }

  sendResponse(res, 200, "Leave request fetched", leave);
});

const updateLeaveStatus = async (leaveId, status, approvedBy) => {
  const leave = await LeaveRequest.findByIdAndUpdate(
    leaveId,
    { status, approvedBy },
    { new: true, runValidators: true }
  );

  if (!leave) {
    throw new ApiError(404, "Leave request not found");
  }

  return leave;
};

export const approveLeave = asyncHandler(async (req, res) => {
  const leave = await updateLeaveStatus(req.params.leaveId, "approved", req.body.approvedBy || "admin");
  sendResponse(res, 200, "Leave approved", leave);
});

export const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await updateLeaveStatus(req.params.leaveId, "rejected", req.body.approvedBy || "admin");
  sendResponse(res, 200, "Leave rejected", leave);
});

export const deleteLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findByIdAndDelete(req.params.leaveId);

  if (!leave) {
    throw new ApiError(404, "Leave request not found");
  }

  sendResponse(res, 200, "Leave deleted", leave);
});
