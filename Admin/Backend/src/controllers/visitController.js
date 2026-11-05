import Visit from "../models/Visit.js";
import Lead from "../models/Lead.js";
import Interaction from "../models/Interaction.js";
import { submitToGoogleForm, buildPreFilledGoogleFormUrl } from "../utils/googleFormSync.js";
import { broadcastRealtime } from "../utils/realtime.js";

/**
 * POST /api/employee/visits
 * Submit a visit form (submits to Google Form + saves to MongoDB + updates Lead if linked)
 */
export const submitVisit = async (req, res) => {
  try {
    const {
      projectName,
      callerName,
      smName,
      clientName,
      clientType,
      svNumber,
      clientNumberLast4,
      visitDate,
      cpFirmName,
      topology,
      leadId,
      notes,
    } = req.body;

    if (!projectName || !callerName || !smName || !clientName || !svNumber || !visitDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required visit form fields. Please fill project, caller, SM, client name, SV number, and date.",
      });
    }

    const employeeId = req.employee?._id || req.body.employeeId;
    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to submit visit form.",
      });
    }

    // Submit to Google Form endpoint
    const formSubmission = await submitToGoogleForm({
      projectName,
      callerName,
      smName,
      clientName,
      clientType: clientType || "FAMILY",
      svNumber,
      clientNumberLast4: clientNumberLast4 || "",
      visitDate,
      cpFirmName: cpFirmName || "Dosti Realty",
      topology: topology || ["2BHK"],
    });

    // Save record to database
    const visit = await Visit.create({
      projectName,
      callerName,
      smName,
      clientName,
      clientType: clientType || "FAMILY",
      svNumber,
      clientNumberLast4: clientNumberLast4 || "",
      visitDate,
      cpFirmName: cpFirmName || "Dosti Realty",
      topology: Array.isArray(topology) ? topology : [topology].filter(Boolean),
      leadId: leadId || null,
      employeeId,
      googleFormSubmitted: formSubmission.success,
      googleFormResponseStatus: formSubmission.status || 0,
      notes: notes || "",
    });

    // If linked to a lead, update lead status & record an interaction
    if (leadId) {
      try {
        const lead = await Lead.findById(leadId);
        if (lead) {
          lead.status = "Visit Completed";
          lead.project = projectName || lead.project;
          lead.latestInteraction = {
            interactionType: "SITE_VISIT",
            clientResponse: `Site visit conducted at ${projectName}. SV Number: ${svNumber}`,
            outcome: "Visit Completed",
            nextAction: "Follow Up Call",
            date: new Date(),
          };
          await lead.save();

          await Interaction.create({
            leadId,
            employeeId,
            employeeName: callerName,
            type: "SITE_VISIT",
            clientResponse: `Site visit completed at ${projectName}. SV Number: ${svNumber}`,
            outcome: "Visit Completed",
            nextAction: "Follow Up Call",
            nextActionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
        }
      } catch (leadErr) {
        console.error("Error linking visit to lead:", leadErr.message);
      }
    }

    const preFilledUrl = buildPreFilledGoogleFormUrl(visit);

    // Broadcast real-time update
    const io = req.app?.get("io");
    if (io) {
      broadcastRealtime(io, {
        type: "visit",
        subType: "created",
        visitId: visit._id,
        employeeId,
      });
    }

    res.status(201).json({
      success: true,
      message: formSubmission.success
        ? "Visit form submitted successfully and synced to Google Forms!"
        : "Visit logged successfully in CRM. (Google Form sync recorded).",
      data: visit,
      googleFormSynced: formSubmission.success,
      preFilledUrl,
    });
  } catch (error) {
    console.error("submitVisit error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/employee/visits
 * List visits submitted by the authenticated employee
 */
export const getEmployeeVisits = async (req, res) => {
  try {
    const employeeId = req.employee?._id || req.query.employeeId;
    const query = employeeId ? { employeeId } : {};

    if (req.query.search) {
      const s = req.query.search.trim();
      query.$or = [
        { clientName: { $regex: s, $options: "i" } },
        { svNumber: { $regex: s, $options: "i" } },
        { projectName: { $regex: s, $options: "i" } },
      ];
    }

    const visits = await Visit.find(query)
      .populate("leadId", "name phone status project")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    console.error("getEmployeeVisits error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/visits/all
 * List all visits with employee details for the admin portal
 */
export const getAllVisits = async (req, res) => {
  try {
    const query = {};
    if (req.query.search) {
      const s = req.query.search.trim();
      query.$or = [
        { clientName: { $regex: s, $options: "i" } },
        { svNumber: { $regex: s, $options: "i" } },
        { projectName: { $regex: s, $options: "i" } },
        { callerName: { $regex: s, $options: "i" } },
        { smName: { $regex: s, $options: "i" } },
      ];
    }

    const visits = await Visit.find(query)
      .populate("employeeId", "firstName lastName employeeId")
      .populate("leadId", "name phone status project")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    console.error("getAllVisits error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

