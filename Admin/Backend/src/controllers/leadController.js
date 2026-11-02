import Employee from "../models/Employee.js";
import Interaction from "../models/Interaction.js";
import Lead from "../models/Lead.js";
import { broadcastRealtime } from "../utils/realtime.js";

// Helper: Normalize phone numbers (strip spaces, hyphens, ensure clean format)
const cleanPhone = (phone = "") => phone.replace(/[\s\-()]/g, "").trim();

/**
 * POST /api/employee/leads
 * Create a new lead along with its mandatory first interaction.
 */
export const createLead = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || !employee._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      name,
      phone,
      email,
      location,
      project,
      configuration,
      budget,
      source,
      // First interaction fields
      interactionType = "CALL",
      clientResponse,
      outcome,
      nextAction,
      followUpDate,
      followUpTime,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Client name is required" });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    if (!clientResponse || !clientResponse.trim()) {
      return res.status(400).json({ success: false, message: "First interaction notes (what the client said) are required" });
    }

    if (!outcome || !outcome.trim()) {
      return res.status(400).json({ success: false, message: "Interaction outcome is required" });
    }

    if (!nextAction || !nextAction.trim()) {
      return res.status(400).json({ success: false, message: "Next action is required" });
    }

    const normalizedPhone = cleanPhone(phone);

    // Duplicate prevention: check if client with this phone already exists for this employee
    const existingLead = await Lead.findOne({
      assignedTo: employee._id,
      phone: { $regex: new RegExp(`^\\+?${normalizedPhone.replace(/^\+/, "")}$`, "i") },
    });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: "A lead with this phone number already exists in your leads.",
        existingLeadId: existingLead._id,
      });
    }

    // Fetch employee name for interaction record
    const empDoc = await Employee.findById(employee._id).select("firstName lastName employeeId");
    const employeeFullName = empDoc ? `${empDoc.firstName} ${empDoc.lastName}`.trim() : "Employee";

    // Initial status determined by outcome / requirement
    let initialStatus = "Contacted";
    if (outcome.toLowerCase().includes("interest")) {
      initialStatus = "Interested";
    } else if (outcome.toLowerCase().includes("visit")) {
      initialStatus = "Visit Scheduled";
    }

    const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;

    // 1. Create Lead
    const newLead = new Lead({
      name: name.trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      location: (location || "").trim(),
      project: (project || "").trim(),
      configuration: (configuration || "").trim(),
      budget: (budget || "").trim(),
      source: (source || "Direct Call").trim(),
      status: initialStatus,
      assignedTo: employee._id,
      assignedToEmployeeId: employee.employeeId || empDoc?.employeeId,
      createdBy: employee._id,
      latestInteraction: {
        interactionType: interactionType.toUpperCase(),
        clientResponse: clientResponse.trim(),
        outcome: outcome.trim(),
        nextAction: nextAction.trim(),
        date: new Date(),
      },
      nextFollowUp: {
        date: parsedFollowUpDate,
        time: (followUpTime || "").trim(),
        action: nextAction.trim(),
      },
    });

    const savedLead = await newLead.save();

    // 2. Create Initial Interaction linked to the Lead
    const initialInteraction = new Interaction({
      leadId: savedLead._id,
      employeeId: employee._id,
      employeeName: employeeFullName,
      type: interactionType.toUpperCase(),
      clientResponse: clientResponse.trim(),
      outcome: outcome.trim(),
      nextAction: nextAction.trim(),
      nextActionDate: parsedFollowUpDate,
      nextActionTime: (followUpTime || "").trim(),
    });

    await initialInteraction.save();

    const io = req.app?.get("io");
    if (io) {
      broadcastRealtime(io, {
        type: "LEAD_CREATED",
        leadId: savedLead._id,
        employeeId: employee._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: savedLead,
    });
  } catch (error) {
    console.error("createLead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/employee/leads/my
 * Get all leads for the logged-in employee with optional search, status filter, and summary stats.
 */
export const getMyLeads = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || !employee._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { search = "", status = "all", page = 1, limit = 50 } = req.query;

    const query = { assignedTo: employee._id };

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { phone: { $regex: term, $options: "i" } },
        { project: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
        { "latestInteraction.clientResponse": { $regex: term, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [leads, totalCount] = await Promise.all([
      Lead.find(query)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Lead.countDocuments(query),
    ]);

    // Compute summary metrics for employee
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const [totalLeads, totalActive, totalLost, todaysFollowUps] = await Promise.all([
      Lead.countDocuments({
        assignedTo: employee._id,
      }),
      Lead.countDocuments({
        assignedTo: employee._id,
        status: { $nin: ["Won", "Lost"] },
      }),
      Lead.countDocuments({
        assignedTo: employee._id,
        status: "Lost",
      }),
      Lead.countDocuments({
        assignedTo: employee._id,
        "nextFollowUp.date": { $gte: startOfToday, $lte: endOfToday },
      }),
    ]);

    res.status(200).json({
      success: true,
      count: leads.length,
      totalCount,
      page: Number(page),
      summary: {
        totalLeads,
        totalActive,
        totalLost,
        todaysFollowUps,
      },
      data: leads,
    });
  } catch (error) {
    console.error("getMyLeads error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/employee/leads/reminders
 * Get all active leads for the logged-in employee that have an upcoming or overdue follow-up
 */
export const getMyReminders = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || !employee._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const today = new Date();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const query = {
      assignedTo: employee._id,
      status: { $nin: ["Won", "Lost"] },
      "nextFollowUp.date": { $lte: endOfToday, $ne: null }
    };

    const reminders = await Lead.find(query).sort({ "nextFollowUp.date": 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error("getMyReminders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/leads
 * Admin: Get all leads with optional search/status/page/limit
 */
export const getAllLeads = async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 50 } = req.query;

    const query = {};
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { phone: { $regex: term, $options: "i" } },
        { project: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
        { "latestInteraction.clientResponse": { $regex: term, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [leads, totalCount] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "firstName lastName employeeId profileImage")
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({ success: true, count: leads.length, totalCount, page: Number(page), data: leads });
  } catch (error) {
    console.error("getAllLeads error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/employee/leads/:leadId
 * Get details of a single lead by ID.
 */
export const getLeadById = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || (!employee._id && employee.role !== "admin" && employee.role !== "manager")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { leadId } = req.params;
    const lead = await Lead.findById(leadId).populate(
      "assignedTo",
      "firstName lastName employeeId phone email role profileImage"
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Authorization check: Only assigned employee or admin/manager can access
    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";
    const isAssigned = lead.assignedTo?._id?.toString() === employee._id?.toString();

    if (!isAssigned && !isStaffOrAdmin) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this lead" });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    console.error("getLeadById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || (!employee._id && employee.role !== "admin" && employee.role !== "manager")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";
    const isAssigned = lead.assignedTo.toString() === employee._id?.toString();

    if (!isAssigned && !isStaffOrAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this lead" });
    }

    const allowedFields = [
      "name",
      "phone",
      "email",
      "location",
      "project",
      "configuration",
      "budget",
      "source",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    const updated = await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("updateLead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/employee/leads/:leadId
 * Delete a lead and all its associated interactions.
 * Only the assigned employee or admin/manager can delete a lead.
 */
export const deleteLead = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || !employee._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";
    const isAssigned = lead.assignedTo?.toString() === employee._id?.toString();

    if (!isAssigned && !isStaffOrAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this lead" });
    }

    // Delete all interactions associated with this lead
    await Interaction.deleteMany({ leadId: lead._id });

    // Delete the lead itself
    await Lead.findByIdAndDelete(leadId);

    const io = req.app?.get("io");
    if (io) {
      broadcastRealtime(io, {
        type: "LEAD_DELETED",
        leadId: lead._id,
        employeeId: employee._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("deleteLead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/employee/leads/:leadId/interactions
 * Add a new interaction to an existing lead.
 * Crucial CRM Rule: DOES NOT create a new lead; attaches to the existing lead.
 */
export const addInteraction = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || (!employee._id && employee.role !== "admin" && employee.role !== "manager")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";
    const isAssigned = lead.assignedTo.toString() === employee._id?.toString();

    if (!isAssigned && !isStaffOrAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to add interaction to this lead" });
    }

    const {
      type = "CALL",
      clientResponse,
      outcome,
      nextAction,
      followUpDate,
      followUpTime,
      leadStatus, // optional status change along with interaction
    } = req.body;

    if (!clientResponse || !clientResponse.trim()) {
      return res.status(400).json({ success: false, message: "Client response notes are required" });
    }

    if (!outcome || !outcome.trim()) {
      return res.status(400).json({ success: false, message: "Interaction outcome is required" });
    }

    if (!nextAction || !nextAction.trim()) {
      return res.status(400).json({ success: false, message: "Next action is required" });
    }

    let employeeFullName = "Admin";
    if (employee._id) {
      const empDoc = await Employee.findById(employee._id).select("firstName lastName employeeId");
      employeeFullName = empDoc ? `${empDoc.firstName} ${empDoc.lastName}`.trim() : "Employee";
    }

    const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;

    // 1. Create Interaction record
    const interaction = new Interaction({
      leadId: lead._id,
      employeeId: employee._id || null, // null for admin
      employeeName: employeeFullName,
      type: type.toUpperCase(),
      clientResponse: clientResponse.trim(),
      outcome: outcome.trim(),
      nextAction: nextAction.trim(),
      nextActionDate: parsedFollowUpDate,
      nextActionTime: (followUpTime || "").trim(),
    });

    await interaction.save();

    // 2. Update Lead's latestInteraction and nextFollowUp snapshot
    lead.latestInteraction = {
      interactionType: type.toUpperCase(),
      clientResponse: clientResponse.trim(),
      outcome: outcome.trim(),
      nextAction: nextAction.trim(),
      date: new Date(),
    };

    if (parsedFollowUpDate) {
      lead.nextFollowUp = {
        date: parsedFollowUpDate,
        time: (followUpTime || "").trim(),
        action: nextAction.trim(),
      };
    }

    // Optional status update
    if (leadStatus && leadStatus.trim()) {
      lead.status = leadStatus.trim();
    }

    await lead.save();

    const io = req.app?.get("io");
    if (io) {
      broadcastRealtime(io, {
        type: "INTERACTION_ADDED",
        leadId: lead._id,
        interactionId: interaction._id,
        employeeId: employee._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Interaction recorded successfully",
      data: interaction,
      lead,
    });
  } catch (error) {
    console.error("addInteraction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/employee/leads/:leadId/interactions
 * Get complete chronological interaction history for a lead.
 */
export const getLeadInteractions = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || (!employee._id && employee.role !== "admin" && employee.role !== "manager")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";
    const isAssigned = lead.assignedTo.toString() === employee._id?.toString();

    if (!isAssigned && !isStaffOrAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to view interactions for this lead" });
    }

    const interactions = await Interaction.find({ leadId: lead._id })
      .populate("employeeId", "firstName lastName employeeId profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions,
    });
  } catch (error) {
    console.error("getLeadInteractions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/leads/visits/analytics
 * Retrieve rich visit statistics, trends, and scheduled/completed visits list.
 */
export const getVisitsAnalytics = async (req, res) => {
  try {
    const { timeRange = "all", status = "all", search = "" } = req.query;

    const visitLeadsQuery = {
      $or: [
        { status: { $in: ["Visit Scheduled", "Visit Completed"] } },
        { "latestInteraction.interactionType": "SITE_VISIT" },
        { "nextFollowUp.action": { $regex: /visit/i } },
      ],
    };

    if (search && search.trim()) {
      const term = search.trim();
      visitLeadsQuery.$and = [
        {
          $or: [
            { name: { $regex: term, $options: "i" } },
            { phone: { $regex: term, $options: "i" } },
            { project: { $regex: term, $options: "i" } },
            { location: { $regex: term, $options: "i" } },
          ],
        },
      ];
    }

    if (status && status !== "all") {
      if (status === "scheduled") {
        visitLeadsQuery.status = "Visit Scheduled";
      } else if (status === "completed") {
        visitLeadsQuery.status = "Visit Completed";
      } else if (status === "won") {
        visitLeadsQuery.status = "Won";
      } else if (status === "lost") {
        visitLeadsQuery.status = "Lost";
      } else {
        visitLeadsQuery.status = status;
      }
    }

    const now = new Date();
    if (timeRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      visitLeadsQuery.updatedAt = { $gte: start, $lte: end };
    } else if (timeRange === "week") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      visitLeadsQuery.updatedAt = { $gte: start };
    } else if (timeRange === "month") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      visitLeadsQuery.updatedAt = { $gte: start };
    }

    const [allVisitLeads, totalAllLeads, visitInteractions] = await Promise.all([
      Lead.find(visitLeadsQuery)
        .populate("assignedTo", "firstName lastName employeeId profileImage")
        .sort({ "nextFollowUp.date": 1, updatedAt: -1 }),
      Lead.find().populate("assignedTo", "firstName lastName employeeId profileImage"),
      Interaction.find({ type: "SITE_VISIT" }).populate("employeeId", "firstName lastName employeeId profileImage"),
    ]);

    const scheduled = totalAllLeads.filter((l) => l.status === "Visit Scheduled").length;
    const completed = totalAllLeads.filter((l) => l.status === "Visit Completed").length;
    const wonFromVisits = totalAllLeads.filter(
      (l) => l.status === "Won" && (l.latestInteraction?.interactionType === "SITE_VISIT" || (l.nextFollowUp?.action && /visit/i.test(l.nextFollowUp.action)))
    ).length;

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayScheduled = totalAllLeads.filter((l) => {
      if (l.status !== "Visit Scheduled") return false;
      if (!l.nextFollowUp?.date) return false;
      const d = new Date(l.nextFollowUp.date);
      return d >= startOfToday && d <= endOfToday;
    }).length;

    const conversionRate = completed > 0 ? Math.round((wonFromVisits / completed) * 100) : 0;

    // Trend calculation: last 7 days visits scheduled vs completed
    const daysTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const scheduledCount = totalAllLeads.filter((l) => {
        if (!l.nextFollowUp?.date) return false;
        const vDate = new Date(l.nextFollowUp.date);
        return vDate >= dayStart && vDate <= dayEnd;
      }).length;

      const completedCount = visitInteractions.filter((it) => {
        const cDate = new Date(it.createdAt);
        return cDate >= dayStart && cDate <= dayEnd;
      }).length;

      return {
        date: dayLabel,
        Scheduled: scheduledCount,
        Completed: completedCount,
      };
    });

    // Breakdown by Project
    const byProjectMap = {};
    totalAllLeads.forEach((l) => {
      if (l.status === "Visit Scheduled" || l.status === "Visit Completed") {
        const proj = l.project || l.location || "General In-Store";
        byProjectMap[proj] = (byProjectMap[proj] || 0) + 1;
      }
    });
    const byProject = Object.entries(byProjectMap)
      .map(([project, count]) => ({ project, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Breakdown by Employee
    const byEmpMap = {};
    totalAllLeads.forEach((l) => {
      if (l.status === "Visit Scheduled" || l.status === "Visit Completed") {
        const empName = l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : "Unassigned";
        if (!byEmpMap[empName]) {
          byEmpMap[empName] = {
            name: empName,
            scheduled: 0,
            completed: 0,
            profileImage: l.assignedTo?.profileImage || "",
            employeeId: l.assignedTo?.employeeId || "",
          };
        }
        if (l.status === "Visit Scheduled") byEmpMap[empName].scheduled += 1;
        if (l.status === "Visit Completed") byEmpMap[empName].completed += 1;
      }
    });
    const byEmployee = Object.values(byEmpMap);

    res.status(200).json({
      success: true,
      summary: {
        totalVisits: scheduled + completed,
        scheduled,
        completed,
        todayScheduled,
        wonFromVisits,
        conversionRate,
      },
      trend: daysTrend,
      byProject,
      byEmployee,
      data: allVisitLeads,
    });
  } catch (error) {
    console.error("getVisitsAnalytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/leads/:leadId/visit-status
 * Update status or reschedule a visit directly
 */
export const updateVisitStatus = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status, nextActionDate, nextActionTime, note } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (status) {
      lead.status = status;
    }

    if (nextActionDate) {
      lead.nextFollowUp = {
        date: new Date(nextActionDate),
        time: nextActionTime || lead.nextFollowUp?.time || "",
        action: status === "Visit Scheduled" ? "Site Visit" : lead.nextFollowUp?.action || "Follow-up",
      };
    }

    if (note && note.trim()) {
      const interaction = new Interaction({
        leadId: lead._id,
        employeeId: lead.assignedTo || null,
        employeeName: "Admin",
        type: "SITE_VISIT",
        clientResponse: note.trim(),
        outcome: status === "Visit Completed" ? "Visit Completed" : status || "Visit Update",
        nextAction: status === "Visit Scheduled" ? "Conduct Visit" : "Follow Up Call",
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        nextActionTime: nextActionTime || "",
      });
      await interaction.save();

      lead.latestInteraction = {
        interactionType: "SITE_VISIT",
        clientResponse: note.trim(),
        outcome: status || "Updated",
        nextAction: status === "Visit Scheduled" ? "Conduct Visit" : "Follow Up",
        date: new Date(),
      };
    }

    await lead.save();

    res.status(200).json({ success: true, message: "Visit updated successfully", data: lead });
  } catch (error) {
    console.error("updateVisitStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

