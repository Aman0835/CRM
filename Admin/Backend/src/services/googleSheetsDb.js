import Settings from "../models/Settings.js";
import Lead from "../models/Lead.js";
import Visit from "../models/Visit.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import CallLog from "../models/CallLog.js";

class GoogleSheetsDb {
  constructor() {
    this.cachedUrl = null;
    this.lastChecked = 0;
  }

  /**
   * Retrieves the Google Sheet WebApp URL from Settings or process.env
   */
  async getUrl() {
    // If set in environment, prefer it or use as default
    if (process.env.GOOGLE_SHEET_WEBAPP_URL && process.env.GOOGLE_SHEET_WEBAPP_URL.trim()) {
      return process.env.GOOGLE_SHEET_WEBAPP_URL.trim();
    }

    const now = Date.now();
    // Cache for 30 seconds to avoid hitting MongoDB repeatedly
    if (this.cachedUrl && now - this.lastChecked < 30000) {
      return this.cachedUrl;
    }

    try {
      const settings = await Settings.findOne().select("googleSheetWebAppUrl googleSheetEnabled");
      this.cachedUrl = settings?.googleSheetWebAppUrl || null;
      this.lastChecked = now;
      return this.cachedUrl;
    } catch {
      return null;
    }
  }

  /**
   * Sends a payload to the Google Apps Script Web App
   */
  async sendPayload(payload, overrideUrl = null) {
    const url = overrideUrl || (await this.getUrl());
    if (!url || !url.startsWith("http")) {
      return { success: false, message: "Google Sheet WebApp URL not configured" };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { success: response.ok, raw: text };
      }
    } catch (err) {
      console.error("[GoogleSheetsDb] Sync error:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Test connection to Google Sheet
   */
  async testConnection(url) {
    const targetUrl = url || (await this.getUrl());
    if (!targetUrl) {
      return { success: false, message: "No Google Sheet URL provided" };
    }
    const res = await this.sendPayload({ action: "ping" }, targetUrl);
    if (res.success) {
      // Also initialize schema if needed
      await this.sendPayload({ action: "initSchema" }, targetUrl).catch(() => {});
    }
    return res;
  }

  /**
   * Sync a Lead record (insert or update)
   */
  async syncLead(lead, action = "insert") {
    if (!lead) return;
    const plain = lead.toObject ? lead.toObject() : lead;
    // Format lead fields
    const data = {
      id: String(plain._id || plain.id || ""),
      name: plain.name || "",
      phone: plain.phone || "",
      project: plain.project || "",
      configuration: plain.configuration || "",
      status: plain.status || "New",
      assignedAgent: plain.assignedTo?.name || (plain.assignedTo?.firstName ? `${plain.assignedTo.firstName} ${plain.assignedTo.lastName || ""}`.trim() : ""),
      budget: plain.budget || "",
      notes: plain.notes || "",
      createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : new Date().toISOString(),
    };

    // Fire-and-forget in background
    this.sendPayload({ action, sheet: "Leads", id: data.id, data }).catch((err) => {
      console.warn("[GoogleSheetsDb] Lead sync failed:", err.message);
    });
  }

  /**
   * Sync a Site Visit record
   */
  async syncVisit(visit, action = "insert") {
    if (!visit) return;
    const plain = visit.toObject ? visit.toObject() : visit;
    const data = {
      id: String(plain._id || plain.id || ""),
      svNumber: plain.svNumber || "",
      clientName: plain.clientName || "",
      clientNumberLast4: plain.clientNumberLast4 || "",
      project: plain.projectName || "",
      clientType: plain.clientType || "",
      callerName: plain.callerName || "",
      smName: plain.smName || "",
      cpFirmName: plain.cpFirmName || "",
      topology: Array.isArray(plain.topology) ? plain.topology.join(", ") : (plain.topology || ""),
      visitDate: plain.visitDate ? String(plain.visitDate).split("T")[0] : "",
      createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : new Date().toISOString(),
    };

    this.sendPayload({ action, sheet: "Site Visits", id: data.id, data }).catch((err) => {
      console.warn("[GoogleSheetsDb] Visit sync failed:", err.message);
    });
  }

  /**
   * Sync an Attendance record
   */
  async syncAttendance(att, action = "insert") {
    if (!att) return;
    const plain = att.toObject ? att.toObject() : att;
    const data = {
      id: String(plain._id || plain.id || ""),
      employeeId: plain.employeeId || "",
      employeeName: plain.employeeName || "",
      date: plain.date ? String(plain.date).split("T")[0] : "",
      status: plain.status || "",
      checkIn: plain.checkIn ? new Date(plain.checkIn).toISOString() : "",
      checkOut: plain.checkOut ? new Date(plain.checkOut).toISOString() : "",
      workingHours: plain.workingHours || 0,
      locationVerified: plain.locationVerified ? "Yes (GPS)" : "No",
      createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : new Date().toISOString(),
    };

    this.sendPayload({ action, sheet: "Attendance", id: data.id, data }).catch((err) => {
      console.warn("[GoogleSheetsDb] Attendance sync failed:", err.message);
    });
  }

  /**
   * Sync an Employee record
   */
  async syncEmployee(emp, action = "insert") {
    if (!emp) return;
    const plain = emp.toObject ? emp.toObject() : emp;
    const data = {
      id: String(plain._id || plain.id || ""),
      employeeCode: plain.employeeId || "",
      name: plain.name || `${plain.firstName || ""} ${plain.lastName || ""}`.trim(),
      phone: plain.phone || "",
      email: plain.email || "",
      role: plain.role || "employee",
      sourcingManager: plain.sourcingManager || "",
      perDayPayout: plain.perDayPayout || (plain.monthlySalary ? Math.round(plain.monthlySalary / 30) : 0),
      status: plain.status || "active",
      assignedOffice: plain.assignedOffice?.officeName || "",
      joiningDate: plain.joiningDate ? String(plain.joiningDate).split("T")[0] : "",
    };

    this.sendPayload({ action, sheet: "Employees", id: data.id, data }).catch((err) => {
      console.warn("[GoogleSheetsDb] Employee sync failed:", err.message);
    });
  }

  /**
   * Sync a Call log
   */
  async syncCall(call, action = "insert") {
    if (!call) return;
    const plain = call.toObject ? call.toObject() : call;
    const data = {
      id: String(plain._id || plain.id || ""),
      leadName: plain.leadName || "",
      phoneNumber: plain.phoneNumber || "",
      agentName: plain.employeeName || "",
      status: plain.status || "dialed",
      durationSeconds: plain.durationSeconds || 0,
      outcome: plain.outcome || "",
      notes: plain.notes || "",
      dialedAt: plain.dialedAt ? new Date(plain.dialedAt).toISOString() : new Date().toISOString(),
    };

    this.sendPayload({ action, sheet: "Call Logs", id: data.id, data }).catch((err) => {
      console.warn("[GoogleSheetsDb] Call sync failed:", err.message);
    });
  }

  /**
   * Delete record from sheet by ID
   */
  async deleteFromSheet(sheet, id) {
    if (!id) return;
    this.sendPayload({ action: "delete", sheet, id: String(id) }).catch((err) => {
      console.warn("[GoogleSheetsDb] Delete failed:", err.message);
    });
  }

  /**
   * Bulk sync all CRM collections into Google Sheet
   */
  async syncAllCollectionsToSheet(overrideUrl = null) {
    const targetUrl = overrideUrl || (await this.getUrl());
    if (!targetUrl) {
      throw new Error("Google Sheet URL is not configured");
    }

    // 1. Initialize schema first
    await this.sendPayload({ action: "initSchema" }, targetUrl);

    // 2. Fetch all collections in parallel
    const [leads, visits, attendances, employees, calls] = await Promise.all([
      Lead.find().populate("assignedTo", "name firstName lastName").lean(),
      Visit.find().lean(),
      Attendance.find().lean(),
      Employee.find().populate("assignedOffice", "officeName").lean(),
      CallLog.find().lean(),
    ]);

    const results = {};

    // 3. Batch sync Leads
    const leadsData = leads.map((l) => ({
      id: String(l._id),
      name: l.name || "",
      phone: l.phone || "",
      project: l.project || "",
      configuration: l.configuration || "",
      status: l.status || "New",
      assignedAgent: l.assignedTo?.name || (l.assignedTo?.firstName ? `${l.assignedTo.firstName} ${l.assignedTo.lastName || ""}`.trim() : ""),
      budget: l.budget || "",
      notes: l.notes || "",
      createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : "",
      updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : "",
    }));
    results.leads = await this.sendPayload({ action: "batchSync", sheet: "Leads", records: leadsData }, targetUrl);

    // 4. Batch sync Visits
    const visitsData = visits.map((v) => ({
      id: String(v._id),
      svNumber: v.svNumber || "",
      clientName: v.clientName || "",
      clientNumberLast4: v.clientNumberLast4 || "",
      project: v.projectName || "",
      clientType: v.clientType || "",
      callerName: v.callerName || "",
      smName: v.smName || "",
      cpFirmName: v.cpFirmName || "",
      topology: Array.isArray(v.topology) ? v.topology.join(", ") : (v.topology || ""),
      visitDate: v.visitDate ? String(v.visitDate).split("T")[0] : "",
      createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : "",
    }));
    results.visits = await this.sendPayload({ action: "batchSync", sheet: "Site Visits", records: visitsData }, targetUrl);

    // 5. Batch sync Attendance
    const attendancesData = attendances.map((a) => ({
      id: String(a._id),
      employeeId: a.employeeId || "",
      employeeName: a.employeeName || "",
      date: a.date ? String(a.date).split("T")[0] : "",
      status: a.status || "",
      checkIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "",
      checkOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "",
      workingHours: a.workingHours || 0,
      locationVerified: a.locationVerified ? "Yes (GPS)" : "No",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : "",
    }));
    results.attendance = await this.sendPayload({ action: "batchSync", sheet: "Attendance", records: attendancesData }, targetUrl);

    // 6. Batch sync Employees
    const employeesData = employees.map((e) => ({
      id: String(e._id),
      employeeCode: e.employeeId || "",
      name: e.name || `${e.firstName || ""} ${e.lastName || ""}`.trim(),
      phone: e.phone || "",
      email: e.email || "",
      role: e.role || "employee",
      sourcingManager: e.sourcingManager || "",
      perDayPayout: e.perDayPayout || (e.monthlySalary ? Math.round(e.monthlySalary / 30) : 0),
      status: e.status || "active",
      assignedOffice: e.assignedOffice?.officeName || "",
      joiningDate: e.joiningDate ? String(e.joiningDate).split("T")[0] : "",
    }));
    results.employees = await this.sendPayload({ action: "batchSync", sheet: "Employees", records: employeesData }, targetUrl);

    // 7. Batch sync Call Logs
    const callsData = calls.map((c) => ({
      id: String(c._id),
      leadName: c.leadName || "",
      phoneNumber: c.phoneNumber || "",
      agentName: c.employeeName || "",
      status: c.status || "dialed",
      durationSeconds: c.durationSeconds || 0,
      outcome: c.outcome || "",
      notes: c.notes || "",
      dialedAt: c.dialedAt ? new Date(c.dialedAt).toISOString() : "",
    }));
    results.calls = await this.sendPayload({ action: "batchSync", sheet: "Call Logs", records: callsData }, targetUrl);

    return {
      success: true,
      message: "All CRM collections synced to Google Sheet successfully",
      counts: {
        leads: leads.length,
        visits: visits.length,
        attendance: attendances.length,
        employees: employees.length,
        calls: calls.length,
      },
      results,
    };
  }
}

const googleSheetsDb = new GoogleSheetsDb();
export default googleSheetsDb;

