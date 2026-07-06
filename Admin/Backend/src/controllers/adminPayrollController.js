import { asyncHandler } from "../middleware/asyncHandler.js";
import { Employee } from "../models/Employee.js";
import { Payroll } from "../models/Payroll.js";
import { ApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/response.js";

export const generatePayroll = asyncHandler(async (req, res) => {
  const { month, year } = req.body;

  if (!month || !year) {
    throw new ApiError(400, "Month and year are required");
  }

  const employees = await Employee.find();
  const generatedPayrolls = [];

  for (const employee of employees) {
    const baseSalary = employee.monthlySalary || 0;
    const payroll = await Payroll.findOneAndUpdate(
      {
        employeeId: employee.employeeId,
        month,
        year
      },
      {
        employeeId: employee.employeeId,
        month,
        year,
        baseSalary,
        netSalary: baseSalary,
        status: "generated"
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    generatedPayrolls.push(payroll);
  }

  sendResponse(res, 201, "Payroll generated", generatedPayrolls);
});

export const getPayrolls = asyncHandler(async (_req, res) => {
  const payrolls = await Payroll.find().sort({ year: -1, month: -1, createdAt: -1 });
  sendResponse(res, 200, "Payroll records fetched", payrolls);
});

export const getPayrollByEmployee = asyncHandler(async (req, res) => {
  const payrolls = await Payroll.find({ employeeId: req.params.employeeId }).sort({ year: -1, month: -1 });
  sendResponse(res, 200, "Employee payroll fetched", payrolls);
});

export const getPayrollByMonthYear = asyncHandler(async (req, res) => {
  const payrolls = await Payroll.find({
    month: Number(req.params.month),
    year: Number(req.params.year)
  }).sort({ employeeId: 1 });

  sendResponse(res, 200, "Monthly payroll fetched", payrolls);
});

export const updatePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findByIdAndUpdate(req.params.payrollId, req.body, {
    new: true,
    runValidators: true
  });

  if (!payroll) {
    throw new ApiError(404, "Payroll record not found");
  }

  sendResponse(res, 200, "Payroll updated", payroll);
});
