import Lead from "../models/Lead.js";
import Interaction from "../models/Interaction.js";
import Employee from "../models/Employee.js";
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

    const [totalActive, todaysFollowUps] = await Promise.all([
      Lead.countDocuments({
        assignedTo: employee._id,
        status: { $nin: ["Won", "Lost"] },
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
        totalActive,
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
 * GET /api/employee/leads/:leadId
 * Get details of a single lead by ID.
 */
export const getLeadById = async (req, res) => {
  try {
    const employee = req.employee || req.user;
    if (!employee || !employee._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { leadId } = req.params;
    const lead = await Lead.findById(leadId).populate(
      "assignedTo",
      "firstName lastName employeeId phone email role"
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Authorization check: Only assigned employee or admin/manager can access
    const isAssigned = lead.assignedTo?._id?.toString() === employee._id.toString();
    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";

    if (!isAssigned && !isStaffOrAdmin) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this lead" });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    console.error("getLeadById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/employee/leads/:leadId
 * Update lead properties (status, project, budget, etc.).
 */
export const updateLead = async (req, res) => {
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

    const isAssigned = lead.assignedTo.toString() === employee._id.toString();
    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";

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
 * POST /api/employee/leads/:leadId/interactions
 * Add a new interaction to an existing lead.
 * Crucial CRM Rule: DOES NOT create a new lead; attaches to the existing lead.
 */
export const addInteraction = async (req, res) => {
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

    const isAssigned = lead.assignedTo.toString() === employee._id.toString();
    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";

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

    const empDoc = await Employee.findById(employee._id).select("firstName lastName employeeId");
    const employeeFullName = empDoc ? `${empDoc.firstName} ${empDoc.lastName}`.trim() : "Employee";

    const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;

    // 1. Create Interaction record
    const interaction = new Interaction({
      leadId: lead._id,
      employeeId: employee._id,
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
    if (!employee || !employee._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const isAssigned = lead.assignedTo.toString() === employee._id.toString();
    const isStaffOrAdmin = employee.role === "admin" || employee.role === "manager";

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
