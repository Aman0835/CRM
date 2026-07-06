import { asyncHandler } from "../middleware/asyncHandler.js";
import { Employee } from "../models/Employee.js";
import { ApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/response.js";

export const getEmployees = asyncHandler(async (_req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  sendResponse(res, 200, "Employees fetched", employees);
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ employeeId: req.params.employeeId });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  sendResponse(res, 200, "Employee fetched", employee);
});

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  sendResponse(res, 201, "Employee created", employee);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndUpdate(
    { employeeId: req.params.employeeId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  sendResponse(res, 200, "Employee updated", employee);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndDelete({ employeeId: req.params.employeeId });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  sendResponse(res, 200, "Employee deleted", employee);
});

export const updateEmployeeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const employee = await Employee.findOneAndUpdate(
    { employeeId: req.params.employeeId },
    { status },
    { new: true, runValidators: true }
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  sendResponse(res, 200, "Employee status updated", employee);
});
