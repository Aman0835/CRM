import { asyncHandler } from "../middleware/asyncHandler.js";
import { Holiday } from "../models/Holiday.js";
import { ApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/response.js";

export const getHolidays = asyncHandler(async (_req, res) => {
  const holidays = await Holiday.find().sort({ date: 1 });
  sendResponse(res, 200, "Holidays fetched", holidays);
});

export const createHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.create(req.body);
  sendResponse(res, 201, "Holiday created", holiday);
});

export const updateHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByIdAndUpdate(req.params.holidayId, req.body, {
    new: true,
    runValidators: true
  });

  if (!holiday) {
    throw new ApiError(404, "Holiday not found");
  }

  sendResponse(res, 200, "Holiday updated", holiday);
});

export const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.holidayId);

  if (!holiday) {
    throw new ApiError(404, "Holiday not found");
  }

  sendResponse(res, 200, "Holiday deleted", holiday);
});
