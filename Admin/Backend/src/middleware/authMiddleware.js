import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = (process.env.JWT_SECRET || "secretkey").trim();

const authMiddleware = (req, res, next) => {
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
      token = req.cookies?.token || req.cookies?.emp_token || null;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

export default authMiddleware;