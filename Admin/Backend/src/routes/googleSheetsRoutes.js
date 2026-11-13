import express from "express";
import {
  getSheetConfig,
  saveSheetConfig,
  testConnection,
  syncAllData,
  getScriptCode,
} from "../controllers/googleSheetsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/config", getSheetConfig);
router.post("/config", saveSheetConfig);
router.post("/test", testConnection);
router.post("/sync-all", syncAllData);
router.get("/script-code", getScriptCode);

export default router;

