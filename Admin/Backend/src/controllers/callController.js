import CallLog from "../models/CallLog.js";
import Employee from "../models/Employee.js";
import Interaction from "../models/Interaction.js";
import Lead from "../models/Lead.js";
import { broadcastRealtime } from "../utils/realtime.js";

function getDateRange(timeRange = "today") {
  const now = new Date();
  let start;
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (timeRange) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      break;
    case "week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    case "all":
    default:
      start = new Date(2020, 0, 1);
      break;
  }

  return { start, end };
}

/**
 * POST /api/calls/dial
 * Log an outbound call initiation (Number Dialed)
 */
export const logDial = async (req, res) => {
  try {
    const user = req.employee || req.user;
    if (!user || !user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { leadId, phoneNumber, leadName } = req.body;
    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    let empName = "Agent";
    const empDoc = await Employee.findById(user._id).select("firstName lastName name");
    if (empDoc) {
      empName = empDoc.name || `${empDoc.firstName || ""} ${empDoc.lastName || ""}`.trim() || "Agent";
    }

    let resolvedLeadName = leadName || "";
    if (leadId && !resolvedLeadName) {
      const leadDoc = await Lead.findById(leadId).select("name");
      if (leadDoc) resolvedLeadName = leadDoc.name;
    }

    const callLog = new CallLog({
      leadId: leadId || null,
      leadName: resolvedLeadName,
      phoneNumber: phoneNumber.trim(),
      employeeId: user._id,
      employeeName: empName,
      status: "dialed",
      dialedAt: new Date(),
    });

    await callLog.save();

    const io = req.app?.get("io");
    if (io) {
      broadcastRealtime(io, {
        type: "CALL_DIALED",
        callId: callLog._id,
        employeeId: user._id,
        phoneNumber: callLog.phoneNumber,
        leadName: callLog.leadName,
      });
    }

    res.status(201).json({
      success: true,
      message: "Call dial recorded",
      callId: callLog._id,
      call: callLog,
    });
  } catch (error) {
    console.error("logDial error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/calls/:callId/outcome
 * Record whether the call connected, outcome, and notes (Callyzer post-call workflow)
 */
export const logOutcome = async (req, res) => {
  try {
    const user = req.employee || req.user;
    if (!user || !user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { callId } = req.params;
    const {
      status = "connected", // "connected" | "not_connected" | "busy" | "wrong_number"
      durationSeconds = 0,
      outcome = "",
      notes = "",
      nextAction = "",
      followUpDate = null,
      followUpTime = "",
      leadStatus = "",
    } = req.body;

    const callLog = await CallLog.findById(callId);
    if (!callLog) {
      return res.status(404).json({ success: false, message: "Call log record not found" });
    }

    callLog.status = status;
    callLog.durationSeconds = Number(durationSeconds) || 0;
    callLog.outcome = outcome.trim();
    callLog.notes = notes.trim();
    await callLog.save();

    // If attached to a lead and outcome/notes were entered, synchronize with lead interaction
    if (callLog.leadId && (outcome || notes)) {
      const lead = await Lead.findById(callLog.leadId);
      if (lead) {
        const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;

        const interaction = new Interaction({
          leadId: lead._id,
          employeeId: user._id,
          employeeName: callLog.employeeName,
          type: "CALL",
          clientResponse: notes.trim() || (status === "connected" ? "Call connected successfully" : `Call ${status}`),
          outcome: outcome.trim() || (status === "connected" ? "Connected" : "No Answer"),
          nextAction: nextAction.trim() || (status === "connected" ? "Follow Up Call" : "Retry Call Later"),
          nextActionDate: parsedFollowUpDate,
          nextActionTime: (followUpTime || "").trim(),
        });

        await interaction.save();

        lead.latestInteraction = {
          interactionType: "CALL",
          clientResponse: interaction.clientResponse,
          outcome: interaction.outcome,
          nextAction: interaction.nextAction,
          date: new Date(),
        };

        if (parsedFollowUpDate) {
          lead.nextFollowUp = {
            date: parsedFollowUpDate,
            time: (followUpTime || "").trim(),
            action: interaction.nextAction,
          };
        }

        if (leadStatus && leadStatus.trim()) {
          lead.status = leadStatus.trim();
        } else if (status === "connected" && lead.status === "New") {
          lead.status = "Contacted";
        }

        await lead.save();
      }
    }

    const io = req.app?.get("io");
    if (io) {
      broadcastRealtime(io, {
        type: "CALL_OUTCOME_LOGGED",
        callId: callLog._id,
        status: callLog.status,
        employeeId: user._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Call outcome logged successfully",
      call: callLog,
    });
  } catch (error) {
    console.error("logOutcome error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/calls/analytics
 * Total number dialed, total number connected, connection rate, and agent leaderboard (Callzer-style)
 */
export const getCallAnalytics = async (req, res) => {
  try {
    const user = req.employee || req.user;
    if (!user || !user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { timeRange = "today", employeeId } = req.query;
    const { start, end } = getDateRange(timeRange);

    const filter = {
      dialedAt: { $gte: start, $lte: end },
    };

    // If specific employee requested or non-admin user
    const isAdmin = user.role === "admin" || user.role === "manager";
    if (employeeId) {
      filter.employeeId = employeeId;
    } else if (!isAdmin) {
      filter.employeeId = user._id;
    }

    const [callLogs, callInteractions] = await Promise.all([
      CallLog.find(filter).sort({ dialedAt: -1 }).limit(100),
      // Also query CALL interactions in the time window for any legacy or directly logged calls
      Interaction.find({
        type: "CALL",
        createdAt: { $gte: start, $lte: end },
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      }),
    ]);

    // Count calls from CallLog
    let totalDialed = callLogs.length;
    let totalConnected = callLogs.filter((c) => c.status === "connected").length;

    // Supplement with CALL interactions that might not have a CallLog
    const existingLogTimes = new Set(
      callLogs.map((c) => `${c.employeeId}-${new Date(c.dialedAt).getMinutes()}`)
    );

    for (const inter of callInteractions) {
      const key = `${inter.employeeId}-${new Date(inter.createdAt).getMinutes()}`;
      if (!existingLogTimes.has(key)) {
        totalDialed += 1;
        const outcomeLower = (inter.outcome || "").toLowerCase();
        const isNotConnected =
          outcomeLower.includes("no answer") ||
          outcomeLower.includes("wrong number") ||
          outcomeLower.includes("busy") ||
          outcomeLower.includes("switched off");
        if (!isNotConnected) {
          totalConnected += 1;
        }
      }
    }

    const notConnected = Math.max(0, totalDialed - totalConnected);
    const connectionRate = totalDialed > 0 ? Math.round((totalConnected / totalDialed) * 100) : 0;

    // Agent leaderboard for admin
    let agentLeaderboard = [];
    if (isAdmin) {
      const allEmployees = await Employee.find().select("firstName lastName name employeeId");
      agentLeaderboard = allEmployees.map((emp) => {
        const empCalls = callLogs.filter((c) => c.employeeId?.toString() === emp._id.toString());
        const dialed = empCalls.length;
        const connected = empCalls.filter((c) => c.status === "connected").length;
        const rate = dialed > 0 ? Math.round((connected / dialed) * 100) : 0;
        return {
          employeeId: emp.employeeId,
          _id: emp._id,
          name: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
          totalDialed: dialed,
          totalConnected: connected,
          connectionRate: rate,
        };
      });

      agentLeaderboard.sort((a, b) => b.totalDialed - a.totalDialed);
    }

    res.status(200).json({
      success: true,
      timeRange,
      totalDialed,
      totalConnected,
      notConnected,
      connectionRate,
      recentCalls: callLogs.slice(0, 10),
      agentLeaderboard,
    });
  } catch (error) {
    console.error("getCallAnalytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

