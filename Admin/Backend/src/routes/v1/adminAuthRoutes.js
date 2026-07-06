import { Router } from "express";

import { getCurrentAdmin, loginAdmin, logoutAdmin } from "../../controllers/adminAuthController.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/me", getCurrentAdmin);

export default router;
