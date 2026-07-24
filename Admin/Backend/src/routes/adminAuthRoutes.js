import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Helper: extract token from cookie OR Authorization header
const extractToken = (req) => {
  // 1. Try Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // 2. Fallback: cookie (works if same-site)
  return req.cookies?.token || null;
};

// Login (supports / and /login)
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      { email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      admin: { email, role: "admin" },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

router.post("/", handleLogin);
router.post("/login", handleLogin);

// Current Admin (supports / and /me)
const handleGetMe = (req, res) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ success: true, admin: decoded });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

router.get("/", handleGetMe);
router.get("/me", handleGetMe);

// Logout (supports DELETE / and POST /logout)
const handleLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({ success: true, message: "Logout Successful" });
};

router.delete("/", handleLogout);
router.post("/logout", handleLogout);

export default router;