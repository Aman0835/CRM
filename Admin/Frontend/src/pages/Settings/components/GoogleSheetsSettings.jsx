import React, { useState, useEffect } from "react";
import {
  FiDatabase,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiCode,
  FiUploadCloud,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { SiGooglesheets } from "react-icons/si";
import toast from "react-hot-toast";
import {
  getSheetConfig,
  saveSheetConfig,
  testConnection,
  syncAllData,
  getScriptCode,
} from "../../../services/googleSheetsService";

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1q1eh5NdebVBcRp31_FrVCBbHhAihqA-VJ1AtmF3I40g/edit?usp=sharing";

export default function GoogleSheetsSettings() {
  const [webAppUrl, setWebAppUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle"); // "idle" | "success" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptCode, setScriptCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const [configRes, scriptRes] = await Promise.all([
          getSheetConfig(),
          getScriptCode().catch(() => ({ code: "" })),
        ]);
        if (configRes?.success && configRes.data?.webAppUrl) {
          setWebAppUrl(configRes.data.webAppUrl);
          setConnectionStatus("success");
          setStatusMessage("Google Sheet URL is saved");
        }
        if (scriptRes?.code) {
          setScriptCode(scriptRes.code);
        }
      } catch (err) {
        console.error("Failed to load Google Sheet config:", err);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleTestConnection = async () => {
    if (!webAppUrl || !webAppUrl.trim().startsWith("http")) {
      toast.error("Please enter a valid Google Apps Script Web App URL first");
      return;
    }
    try {
      setTesting(true);
      setConnectionStatus("idle");
      const res = await testConnection(webAppUrl.trim());
      if (res?.success) {
        setConnectionStatus("success");
        setStatusMessage(res.message || "Connected successfully to Google Sheet!");
        toast.success(res.message || "Connected to Google Sheet Database!");
        // Automatically save the working URL
        await saveSheetConfig({ webAppUrl: webAppUrl.trim(), enabled: true });
      } else {
        setConnectionStatus("error");
        setStatusMessage(res.error || res.message || "Connection failed. Please check your Web App URL.");
        toast.error(res.error || res.message || "Connection failed");
      }
    } catch (err) {
      setConnectionStatus("error");
      const msg = err?.response?.data?.message || err.message || "Connection test failed";
      setStatusMessage(msg);
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!webAppUrl || !webAppUrl.trim().startsWith("http")) {
      toast.error("Please provide a valid Web App URL (starts with https://script.google.com/...)");
      return;
    }
    try {
      setSaving(true);
      const res = await saveSheetConfig({ webAppUrl: webAppUrl.trim(), enabled: true });
      if (res?.success) {
        toast.success("Google Sheet configuration saved!");
        handleTestConnection();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncAll = async () => {
    if (!webAppUrl || !webAppUrl.trim().startsWith("http")) {
      toast.error("Please configure and test your Google Sheet Web App URL first");
      return;
    }

    const confirm = window.confirm(
      "This will push all existing Leads, Site Visits, Attendance records, Employees, and Call logs into your Google Sheet tabs. Continue?"
    );
    if (!confirm) return;

    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await syncAllData(webAppUrl.trim());
      if (res?.success) {
        setSyncResult(res.counts);
        toast.success(
          `All collections synced: ${res.counts?.leads || 0} Leads, ${res.counts?.visits || 0} Visits, ${res.counts?.attendance || 0} Attendance, ${res.counts?.employees || 0} Employees!`
        );
      } else {
        toast.error(res?.message || "Failed to sync data");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Sync failed. Check network or sheet permissions.");
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      toast.success("Google Apps Script code copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Could not copy automatically. Please select all and copy manually.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto mb-2" />
        <p className="text-xs">Loading Google Sheet config...</p>
      </div>
    );
  }

  return (
    <section className="panel-surface rounded-[24px] p-6 shadow-sm text-xs mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 shadow-xs">
            <SiGooglesheets className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Google Sheet Online Database
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  connectionStatus === "success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : connectionStatus === "error"
                    ? "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                    : "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                {connectionStatus === "success" && <FiCheckCircle className="text-emerald-500" />}
                {connectionStatus === "error" && <FiAlertCircle className="text-rose-500" />}
                <span>
                  {connectionStatus === "success"
                    ? "Connected Online"
                    : connectionStatus === "error"
                    ? "Connection Error"
                    : "Not Verified"}
                </span>
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 mt-0.5">
              Live storage for Leads, Site Visits, Attendance, Employees, and Telecalling records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold transition hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
          >
            <SiGooglesheets className="text-xs text-emerald-600 dark:text-emerald-400" />
            <span>Open Google Sheet</span>
            <FiExternalLink className="text-[10px]" />
          </a>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
          >
            <FiCode className="text-emerald-500" />
            <span>Setup Guide</span>
            {showGuide ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>

      {/* Setup Guide Collapsible */}
      {showGuide && (
        <div className="mb-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">
                i
              </span>
              How to Connect Your Google Sheet in 3 Minutes:
            </h4>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition"
            >
              {copied ? <FiCheck /> : <FiCopy />}
              <span>{copied ? "Copied!" : "Copy Apps Script Code"}</span>
            </button>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            <li>
              Open your Google Spreadsheet:{" "}
              <a
                href={SPREADSHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-bold underline inline-flex items-center gap-0.5"
              >
                Open Dosti CRM Spreadsheet <FiExternalLink className="text-[10px]" />
              </a>
            </li>
            <li>
              In the top menu, click <strong>Extensions &gt; Apps Script</strong>.
            </li>
            <li>
              Delete any default text in <code>Code.gs</code>, click the button above to{" "}
              <strong>Copy Apps Script Code</strong>, paste it into the editor, and click <strong>Save</strong> (Ctrl+S / Cmd+S).
            </li>
            <li>
              Click the blue <strong>Deploy</strong> button (top-right) &gt; <strong>New deployment</strong>.
            </li>
            <li>
              Under <em>"Select type"</em> (gear icon), choose <strong>Web app</strong>:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-slate-500 dark:text-slate-400">
                <li>Execute as: <strong>Me (your email)</strong></li>
                <li>Who has access: <strong>Anyone</strong> (critical for CRM server sync)</li>
              </ul>
            </li>
            <li>
              Click <strong>Deploy</strong>, authorize Google permissions when asked, and copy the generated <strong>Web app URL</strong>.
            </li>
            <li>
              Paste the URL in the box below and click <strong>Test Connection</strong>. The script will automatically create and format all 5 database tabs (Leads, Site Visits, Attendance, Employees, Call Logs)!
            </li>
          </ol>
        </div>
      )}

      {/* Web App URL Form */}
      <form onSubmit={handleSaveUrl} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">
            Google Apps Script Web App URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="url"
              value={webAppUrl}
              onChange={(e) => {
                setWebAppUrl(e.target.value);
                setConnectionStatus("idle");
              }}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-mono outline-none focus:border-emerald-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-800"
              required
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !webAppUrl}
                className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {testing ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                ) : (
                  <FiRefreshCw className="text-xs" />
                )}
                <span>{testing ? "Testing..." : "Test Connection"}</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
              >
                {saving ? "Saving..." : "Save URL"}
              </button>
            </div>
          </div>
          {statusMessage && (
            <p
              className={`mt-2 text-[11px] font-medium flex items-center gap-1 ${
                connectionStatus === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : connectionStatus === "error"
                  ? "text-rose-500"
                  : "text-slate-500"
              }`}
            >
              {connectionStatus === "success" && <FiCheckCircle />}
              {connectionStatus === "error" && <FiAlertCircle />}
              <span>{statusMessage}</span>
            </p>
          )}
        </div>

        {/* Database Sync Action Card */}
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <FiUploadCloud className="text-emerald-500 text-sm" />
                Full Database Synchronization
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pushes all existing CRM collections (Leads, Site Visits, Attendance, Employees, Calls) into your online Google Sheet.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncAll}
              disabled={syncing || !webAppUrl}
              className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0 shadow-xs"
            >
              {syncing ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <FiDatabase className="text-xs" />
              )}
              <span>{syncing ? "Syncing Collections..." : "Sync All Data to Sheet"}</span>
            </button>
          </div>

          {syncResult && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700">
                <span className="text-slate-400 block font-semibold">Leads</span>
                <strong className="text-emerald-600 text-xs">{syncResult.leads}</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700">
                <span className="text-slate-400 block font-semibold">Visits</span>
                <strong className="text-emerald-600 text-xs">{syncResult.visits}</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700">
                <span className="text-slate-400 block font-semibold">Attendance</span>
                <strong className="text-emerald-600 text-xs">{syncResult.attendance}</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700">
                <span className="text-slate-400 block font-semibold">Employees</span>
                <strong className="text-emerald-600 text-xs">{syncResult.employees}</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700">
                <span className="text-slate-400 block font-semibold">Call Logs</span>
                <strong className="text-emerald-600 text-xs">{syncResult.calls}</strong>
              </div>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}

