import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  submitVisit,
  getEmployeeVisits,
  getAllVisits,
} from "../controllers/visitController.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = (process.env.JWT_SECRET || "secretkey").trim();

const flexibleAuth = (req, res, next) => {
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
      // Allow fallback if employeeId passed in body
      if (req.body?.employeeId) {
        req.employee = { _id: req.body.employeeId };
        return next();
      }
      return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.employee = decoded;
    req.user = decoded;
    next();
  } catch (error) {
    if (req.body?.employeeId) {
      req.employee = { _id: req.body.employeeId };
      return next();
    }
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
};

router.use(flexibleAuth);

// Employee visit routes
router.post("/", submitVisit);
router.get("/my", getEmployeeVisits);
router.get("/all", getAllVisits);

export default router;

