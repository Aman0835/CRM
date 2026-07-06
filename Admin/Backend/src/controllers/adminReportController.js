import { asyncHandler } from "../middleware/asyncHandler.js";
import { Attendance } from "../models/Attendance.js";
import { Employee } from "../models/Employee.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { Payroll } from "../models/Payroll.js";
import { sendResponse } from "../utils/response.js";

export const getAttendanceReportData = asyncHandler(async (_req, res) => {
  const data = await Attendance.find().sort({ date: -1 });
  sendResponse(res, 200, "Attendance report fetched", data);
});

export const getPayrollReportData = asyncHandler(async (_req, res) => {
  const data = await Payroll.find().sort({ year: -1, month: -1 });
  sendResponse(res, 200, "Payroll report fetched", data);
});

export const getLeavesReportData = asyncHandler(async (_req, res) => {
  const data = await LeaveRequest.find().sort({ createdAt: -1 });
  sendResponse(res, 200, "Leave report fetched", data);
});

export const getEmployeesReportData = asyncHandler(async (_req, res) => {
  const data = await Employee.find().sort({ createdAt: -1 });
  sendResponse(res, 200, "Employee report fetched", data);
});

export const getMonthlyReportData = asyncHandler(async (req, res) => {
  const month = Number(req.query.month);
  const year = Number(req.query.year);

  const [attendance, payrolls, leaves] = await Promise.all([
    Attendance.find(month && year ? { date: new RegExp(`^${year}-(0?${month}|${month})`) } : {}),
    Payroll.find(month && year ? { month, year } : {}),
    LeaveRequest.find()
  ]);

  sendResponse(res, 200, "Monthly report fetched", {
    month: month || null,
    year: year || null,
    attendance,
    payrolls,
    leaves
  });
});

export const getCustomReportData = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Custom report filters received", {
    filters: req.query
  });
});
