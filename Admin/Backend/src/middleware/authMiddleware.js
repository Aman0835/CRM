import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 1. Try Authorization: Bearer <token> (localStorage approach)
    const authHeader = req.headers["authorization"];
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      // 2. Fallback: cookie
      token = req.cookies?.token || null;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

export default authMiddleware;