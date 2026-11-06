import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { getCallAnalytics, logDial, logOutcome } from "../controllers/callController.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = (process.env.JWT_SECRET || "secretkey").trim();

const callAuth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    let token = null;

    if (
      authHeader &&
      authHeader.startsWith("Bearer ") &&
      authHeader !== "Bearer null" &&
      authHeader !== "Bearer undefined"
    ) {
      token = authHeader.slice(7);
    } else {
      token = req.cookies?.emp_token || req.cookies?.token || null;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.employee = decoded;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
};

router.use(callAuth);

router.post("/dial", logDial);
router.post("/:callId/outcome", logOutcome);
router.get("/analytics", getCallAnalytics);

export default router;
