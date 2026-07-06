import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendResponse } from "../utils/response.js";

const sendExportPlaceholder = (resource, format) =>
  asyncHandler(async (_req, res) => {
    sendResponse(res, 200, `${resource} ${format.toUpperCase()} export placeholder`, {
      resource,
      format,
      implemented: false
    });
  });

export const exportAttendancePdf = sendExportPlaceholder("attendance", "pdf");
export const exportAttendanceExcel = sendExportPlaceholder("attendance", "excel");
export const exportPayrollPdf = sendExportPlaceholder("payroll", "pdf");
export const exportPayrollExcel = sendExportPlaceholder("payroll", "excel");
export const exportEmployeesPdf = sendExportPlaceholder("employees", "pdf");
export const exportEmployeesExcel = sendExportPlaceholder("employees", "excel");
export const exportLeavesPdf = sendExportPlaceholder("leaves", "pdf");
export const exportLeavesExcel = sendExportPlaceholder("leaves", "excel");
