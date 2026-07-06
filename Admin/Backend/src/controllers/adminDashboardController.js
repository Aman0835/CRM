import { asyncHandler } from "../middleware/asyncHandler.js";
import { Attendance } from "../models/Attendance.js";
import { Employee } from "../models/Employee.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { Payroll } from "../models/Payroll.js";
import { sendResponse } from "../utils/response.js";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const getDashboard = asyncHandler(async (_req, res) => {
  const [totalEmployees, activeEmployees, todayAttendance, pendingLeaves, generatedPayrolls] =
    await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "active" }),
      Attendance.countDocuments({ date: getTodayDate() }),
      LeaveRequest.countDocuments({ status: "pending" }),
      Payroll.countDocuments({ status: "generated" })
    ]);

  sendResponse(res, 200, "Dashboard data fetched", {
    totalEmployees,
    activeEmployees,
    todayAttendance,
    pendingLeaves,
    generatedPayrolls
  });
});

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [employeeCount, leaveCount, payrollCount] = await Promise.all([
    Employee.countDocuments(),
    LeaveRequest.countDocuments(),
    Payroll.countDocuments()
  ]);

  sendResponse(res, 200, "Dashboard stats fetched", {
    employees: employeeCount,
    leaves: leaveCount,
    payrolls: payrollCount
  });
});

export const getAttendanceSummary = asyncHandler(async (_req, res) => {
  const date = getTodayDate();

  const attendance = await Attendance.aggregate([
    { $match: { date } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  sendResponse(res, 200, "Attendance summary fetched", { date, attendance });
});

export const getPayrollSummary = asyncHandler(async (_req, res) => {
  const payrolls = await Payroll.aggregate([
    {
      $group: {
        _id: null,
        totalNetSalary: { $sum: "$netSalary" },
        totalDeductions: { $sum: "$deductions" },
        totalOvertimeAmount: { $sum: "$overtimeAmount" }
      }
    }
  ]);

  sendResponse(res, 200, "Payroll summary fetched", payrolls[0] || {});
});

export const getLeaveSummary = asyncHandler(async (_req, res) => {
  const leaves = await LeaveRequest.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  sendResponse(res, 200, "Leave summary fetched", leaves);
});

export const getRecentActivities = asyncHandler(async (_req, res) => {
  const [recentEmployees, recentLeaves, recentPayrolls] = await Promise.all([
    Employee.find().sort({ createdAt: -1 }).limit(5),
    LeaveRequest.find().sort({ createdAt: -1 }).limit(5),
    Payroll.find().sort({ createdAt: -1 }).limit(5)
  ]);

  sendResponse(res, 200, "Recent activities fetched", {
    recentEmployees,
    recentLeaves,
    recentPayrolls
  });
});
