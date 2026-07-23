import express from "express";
import { getSettings, updateSettings } from "../controllers/adminSettingsController.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
