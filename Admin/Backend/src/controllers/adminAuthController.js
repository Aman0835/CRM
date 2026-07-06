import { asyncHandler } from "../middleware/asyncHandler.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/response.js";

export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  const user = await User.findOne({ username, role: "admin", isActive: true });

  if (!user) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  user.lastLogin = new Date();
  await user.save();

  sendResponse(res, 200, "Admin login successful", {
    id: user._id,
    username: user.username,
    role: user.role,
    lastLogin: user.lastLogin
  });
});

export const logoutAdmin = asyncHandler(async (_req, res) => {
  sendResponse(res, 200, "Admin logout successful");
});

export const getCurrentAdmin = asyncHandler(async (_req, res) => {
  sendResponse(res, 200, "Admin profile fetched", {
    message: "Hook authenticated admin context here once JWT auth is added"
  });
});
