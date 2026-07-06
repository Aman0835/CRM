import { asyncHandler } from "../middleware/asyncHandler.js";
import { Attendance } from "../models/Attendance.js";
import { ApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/response.js";

export const getAttendanceList = asyncHandler(async (_req, res) => {
  const attendance = await Attendance.find().sort({ date: -1, createdAt: -1 });
  sendResponse(res, 200, "Attendance list fetched", attendance);
});

export const getAttendanceByEmployee = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ employeeId: req.params.employeeId }).sort({ date: -1 });
  sendResponse(res, 200, "Employee attendance fetched", attendance);
});

export const getAttendanceByDate = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ date: req.params.date }).sort({ employeeId: 1 });
  sendResponse(res, 200, "Attendance by date fetched", attendance);
});

export const getAttendanceReport = asyncHandler(async (_req, res) => {
  const report = await Attendance.aggregate([
    {
      $group: {
        _id: "$employeeId",
        totalDays: { $sum: 1 },
        totalWorkingHours: { $sum: "$workingHours" },
        totalOvertime: { $sum: "$overtime" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  sendResponse(res, 200, "Attendance report fetched", report);
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findByIdAndUpdate(req.params.attendanceId, req.body, {
    new: true,
    runValidators: true
  });

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  sendResponse(res, 200, "Attendance updated", attendance);
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findByIdAndDelete(req.params.attendanceId);

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  sendResponse(res, 200, "Attendance deleted", attendance);
});
