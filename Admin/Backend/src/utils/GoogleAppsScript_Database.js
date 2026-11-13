/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: CRM DATABASE BRIDGE
 * ============================================================================
 * Instructions to install in your Google Spreadsheet:
 * 1. Open your Google Sheet in browser: https://sheets.google.com
 * 2. Click "Extensions" > "Apps Script" in the top menu.
 * 3. Delete any default code in Code.gs, paste this ENTIRE script, and click "Save" (Ctrl+S / Cmd+S).
 * 4. Click the blue "Deploy" button (top right) > "New deployment".
 * 5. Click the gear icon next to "Select type" and choose "Web app".
 * 6. Set settings:
 *    - Description: CRM Online Database
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone"
 * 7. Click "Deploy", authorize permissions when prompted, and copy the "Web app URL" 
 *    (e.g., https://script.google.com/macros/s/.../exec).
 * 8. Paste this URL in your CRM Admin Settings > Google Sheet Database section!
 * ============================================================================
 */

const SCHEMAS = {
  "Leads": [
    "ID",
    "Name",
    "Phone",
    "Project",
    "Configuration",
    "Status",
    "Assigned Agent",
    "Budget",
    "Notes",
    "Created At",
    "Last Updated"
  ],
  "Site Visits": [
    "ID",
    "SV Number",
    "Client Name",
    "Phone (Last 4)",
    "Project",
    "Client Type",
    "Caller Name",
    "Sourcing Manager",
    "CP Firm Name",
    "Topology",
    "Visit Date",
    "Tagged At"
  ],
  "Attendance": [
    "ID",
    "Employee ID",
    "Employee Name",
    "Date",
    "Status",
    "Check In",
    "Check Out",
    "Working Hours",
    "Location Verified",
    "Logged At"
  ],
  "Employees": [
    "ID",
    "Employee Code",
    "Name",
    "Phone",
    "Email",
    "Role",
    "Sourcing Manager",
    "Per Day Payout",
    "Status",
    "Assigned Office",
    "Joined Date"
  ],
  "Call Logs": [
    "ID",
    "Lead Name",
    "Phone Number",
    "Agent Name",
    "Status",
    "Duration (Sec)",
    "Outcome",
    "Notes",
    "Dialed At"
  ]
};

function doGet(e) {
  try {
    const action = e?.parameter?.action || "ping";
    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Google Sheet CRM Database is ONLINE",
        spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
        sheets: SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName()),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "getAll") {
      const sheetName = e.parameter.sheet;
      if (!sheetName) throw new Error("Missing sheet parameter");
      const rows = getSheetData(sheetName);
      return jsonResponse({ success: true, sheet: sheetName, count: rows.length, data: rows });
    }

    return jsonResponse({ success: true, message: "CRM Database Ready" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No post body received");
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || "ping";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Ping / Health check
    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Google Sheet Database connection verified successfully!",
        spreadsheetTitle: ss.getName(),
        sheets: ss.getSheets().map(s => s.getName()),
        timestamp: new Date().toISOString()
      });
    }

    // 2. Initialize or verify all sheet tables
    if (action === "initSchema") {
      initAllSheets(ss);
      return jsonResponse({
        success: true,
        message: "All database sheets initialized and formatted with schemas",
        sheets: Object.keys(SCHEMAS)
      });
    }

    // 3. Insert record
    if (action === "insert") {
      const sheetName = payload.sheet;
      const data = payload.data;
      if (!sheetName || !data) throw new Error("Missing sheet name or record data");
      ensureSheetExists(ss, sheetName);
      const sheet = ss.getSheetByName(sheetName);
      const headers = SCHEMAS[sheetName] || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const row = mapObjectToRow(data, headers);
      sheet.appendRow(row);
      return jsonResponse({ success: true, message: "Record inserted into " + sheetName, id: data.id || data._id });
    }

    // 4. Update record by ID
    if (action === "update") {
      const sheetName = payload.sheet;
      const data = payload.data;
      const recordId = String(payload.id || data.id || data._id || "");
      if (!sheetName || !recordId) throw new Error("Missing sheet name or record ID for update");
      ensureSheetExists(ss, sheetName);
      const sheet = ss.getSheetByName(sheetName);
      const headers = SCHEMAS[sheetName] || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const allRows = sheet.getDataRange().getValues();
      let updated = false;

      for (let i = 1; i < allRows.length; i++) {
        if (String(allRows[i][0]) === recordId) {
          const updatedRow = mapObjectToRow(data, headers, allRows[i]);
          sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
          updated = true;
          break;
        }
      }

      if (!updated) {
        // If not found, insert as new row
        const newRow = mapObjectToRow(data, headers);
        sheet.appendRow(newRow);
      }
      return jsonResponse({ success: true, message: "Record updated in " + sheetName, id: recordId });
    }

    // 5. Delete record by ID
    if (action === "delete") {
      const sheetName = payload.sheet;
      const recordId = String(payload.id || "");
      if (!sheetName || !recordId) throw new Error("Missing sheet name or record ID for delete");
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return jsonResponse({ success: true, message: "Sheet not found" });

      const allRows = sheet.getDataRange().getValues();
      for (let i = 1; i < allRows.length; i++) {
        if (String(allRows[i][0]) === recordId) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ success: true, message: "Record deleted from " + sheetName, id: recordId });
        }
      }
      return jsonResponse({ success: true, message: "Record not found to delete" });
    }

    // 6. Batch sync / replace collection
    if (action === "batchSync") {
      const sheetName = payload.sheet;
      const records = payload.records || [];
      ensureSheetExists(ss, sheetName);
      const sheet = ss.getSheetByName(sheetName);
      const headers = SCHEMAS[sheetName];
      
      // Clear existing data rows except headers
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }

      if (records.length > 0) {
        const rows = records.map(r => mapObjectToRow(r, headers));
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }

      return jsonResponse({
        success: true,
        message: "Batch synced " + records.length + " records into " + sheetName,
        count: records.length
      });
    }

    throw new Error("Unknown action: " + action);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ----------------- HELPERS -----------------

function ensureSheetExists(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    formatSheetHeader(sheet, SCHEMAS[sheetName] || ["ID"]);
  }
  return sheet;
}

function initAllSheets(ss) {
  Object.keys(SCHEMAS).forEach(name => {
    ensureSheetExists(ss, name);
  });
  // If there is an empty default "Sheet1", remove it if not needed
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

function formatSheetHeader(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#381C14"); // Dark luxury header
  headerRange.setFontColor("#FBFAF6");
  sheet.setFrozenRows(1);
  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
}

function mapObjectToRow(obj, headers, existingRow = null) {
  return headers.map((header, idx) => {
    const val = getFieldValue(obj, header);
    if (val !== undefined && val !== null) {
      if (Array.isArray(val)) return val.join(", ");
      if (typeof val === "object") return JSON.stringify(val);
      return String(val);
    }
    return existingRow && existingRow[idx] !== undefined ? existingRow[idx] : "";
  });
}

function getFieldValue(obj, header) {
  const norm = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm === "id") return obj.id || obj._id || "";
  if (norm === "name") return obj.name || (obj.firstName ? (obj.firstName + " " + (obj.lastName || "")).trim() : "");
  if (norm === "phone" || norm === "phonenumber") return obj.phone || obj.phoneNumber || "";
  if (norm === "phonelast4") return obj.clientNumberLast4 || (obj.phone ? String(obj.phone).slice(-4) : "");
  if (norm === "project") return obj.project || obj.projectName || "";
  if (norm === "configuration" || norm === "topology") return obj.topology || obj.configuration || "";
  if (norm === "status") return obj.status || "";
  if (norm === "assignedagent") return obj.assignedTo?.name || (obj.assignedTo?.firstName ? (obj.assignedTo.firstName + " " + (obj.assignedTo.lastName || "")).trim() : (obj.assignedAgent || ""));
  if (norm === "budget") return obj.budget || "";
  if (norm === "notes") return obj.notes || "";
  if (norm === "createdat" || norm === "taggedat" || norm === "loggedat" || norm === "dialedat") return obj.createdAt || obj.taggedAt || obj.dialedAt || new Date().toISOString();
  if (norm === "lastupdated") return obj.updatedAt || new Date().toISOString();
  if (norm === "svnumber") return obj.svNumber || "";
  if (norm === "clientname") return obj.clientName || obj.name || "";
  if (norm === "clienttype") return obj.clientType || "";
  if (norm === "callername") return obj.callerName || "";
  if (norm === "sourcingmanager") return obj.smName || obj.sourcingManager || "";
  if (norm === "cpfirmname") return obj.cpFirmName || "";
  if (norm === "visitdate") return obj.visitDate || "";
  if (norm === "employeeid" || norm === "employeecode") return obj.employeeId || obj.employeeCode || "";
  if (norm === "employeename") return obj.employeeName || (obj.firstName ? (obj.firstName + " " + (obj.lastName || "")).trim() : "");
  if (norm === "date") return obj.date ? String(obj.date).split("T")[0] : "";
  if (norm === "checkin") return obj.checkIn ? new Date(obj.checkIn).toLocaleTimeString() : "";
  if (norm === "checkout") return obj.checkOut ? new Date(obj.checkOut).toLocaleTimeString() : "";
  if (norm === "workinghours") return obj.workingHours || 0;
  if (norm === "locationverified") return obj.locationVerified ? "Yes (GPS)" : "No";
  if (norm === "email") return obj.email || "";
  if (norm === "role") return obj.role || "";
  if (norm === "perdaypayout") return obj.perDayPayout || "";
  if (norm === "assignedoffice") return obj.assignedOffice?.officeName || "";
  if (norm === "joineddate") return obj.joiningDate || "";
  if (norm === "leadname") return obj.leadName || "";
  if (norm === "agentname") return obj.employeeName || obj.agentName || "";
  if (norm === "durationsec") return obj.durationSeconds || 0;
  if (norm === "outcome") return obj.outcome || "";

  // Direct match fallback
  for (let key in obj) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === norm) {
      return obj[key];
    }
  }
  return "";
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  const headers = rows[0];
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item = {};
    headers.forEach((h, idx) => {
      item[h] = row[idx];
    });
    list.push(item);
  }
  return list;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
