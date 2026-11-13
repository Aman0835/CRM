import express from "express";
import {
  getSheetConfig,
  saveSheetConfig,
  testConnection,
  syncAllData,
  getScriptCode,
} from "../controllers/googleSheetsController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.use(adminAuth);

router.get("/config", getSheetConfig);
router.post("/config", saveSheetConfig);
router.post("/test", testConnection);
router.post("/sync-all", syncAllData);
router.get("/script-code", getScriptCode);

export default router;
