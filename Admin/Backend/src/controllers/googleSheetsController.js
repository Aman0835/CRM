import googleSheetsDb from "../services/googleSheetsDb.js";
import Settings from "../models/Settings.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /api/admin/sheets/config
 * Get current Google Sheet connection config
 */
export const getSheetConfig = async (req, res) => {
  try {
    const settings = await Settings.findOne().select("googleSheetWebAppUrl googleSheetEnabled");
    const envUrl = process.env.GOOGLE_SHEET_WEBAPP_URL || "";
    const activeUrl = settings?.googleSheetWebAppUrl || envUrl;

    res.json({
      success: true,
      data: {
        configured: Boolean(activeUrl && activeUrl.startsWith("http")),
        webAppUrl: activeUrl,
        enabled: settings?.googleSheetEnabled ?? true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/sheets/config
 * Save or update Google Sheet Web App URL
 */
export const saveSheetConfig = async (req, res) => {
  try {
    const { webAppUrl, enabled } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});

    if (webAppUrl !== undefined) settings.googleSheetWebAppUrl = (webAppUrl || "").trim();
    if (enabled !== undefined) settings.googleSheetEnabled = Boolean(enabled);

    await settings.save();
    googleSheetsDb.cachedUrl = settings.googleSheetWebAppUrl;

    res.json({
      success: true,
      message: "Google Sheet connection settings saved",
      data: {
        webAppUrl: settings.googleSheetWebAppUrl,
        enabled: settings.googleSheetEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/sheets/test
 * Test connection to the Google Sheet
 */
export const testConnection = async (req, res) => {
  try {
    const { webAppUrl } = req.body;
    const result = await googleSheetsDb.testConnection(webAppUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/sheets/sync-all
 * Batch push all collections into the Google Sheet
 */
export const syncAllData = async (req, res) => {
  try {
    const { webAppUrl } = req.body;
    const result = await googleSheetsDb.syncAllCollectionsToSheet(webAppUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/sheets/script-code
 * Returns the Google Apps Script code to copy-paste
 */
export const getScriptCode = async (req, res) => {
  try {
    const scriptPath = path.resolve(__dirname, "../utils/GoogleAppsScript_Database.js");
    const code = fs.readFileSync(scriptPath, "utf-8");
    res.json({ success: true, code });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
