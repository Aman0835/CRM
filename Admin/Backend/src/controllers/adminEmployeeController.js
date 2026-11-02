import bcrypt from "bcrypt";
import Employee from "../models/Employee.js";
import Settings from "../models/Settings.js";
import { broadcastRealtime } from "../utils/realtime.js";

const generateEmployeeId = () => `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

// Get All Employees
export const getEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
    } = req.query;

    const query = {};

    if (search) {
      const trimmed = search.trim();
      const words = trimmed.split(/\s+/);
      if (words.length === 1) {
        query.$or = [
          { name: { $regex: trimmed, $options: "i" } },
          { firstName: { $regex: trimmed, $options: "i" } },
          { lastName: { $regex: trimmed, $options: "i" } },
          { employeeId: { $regex: trimmed, $options: "i" } },
          { email: { $regex: trimmed, $options: "i" } },
          { phone: { $regex: trimmed, $options: "i" } },
          { vendor: { $regex: trimmed, $options: "i" } },
          { sourcing: { $regex: trimmed, $options: "i" } },
          { sourcingManager: { $regex: trimmed, $options: "i" } },
        ];
      } else {
        query.$and = words.map((word) => ({
          $or: [
            { name: { $regex: word, $options: "i" } },
            { firstName: { $regex: word, $options: "i" } },
            { lastName: { $regex: word, $options: "i" } },
            { phone: { $regex: word, $options: "i" } },
            { vendor: { $regex: word, $options: "i" } },
            { sourcing: { $regex: word, $options: "i" } },
            { sourcingManager: { $regex: word, $options: "i" } },
          ],
        }));
      }
    }

    if (status) {
      query.status = status;
    }

    const employees = await Employee.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const formattedEmployees = employees.map((emp) => {
      const obj = emp.toObject();
      if (!obj.visiblePassword) {
        obj.visiblePassword = "Pass1234!";
      }
      obj.name = obj.name || `${obj.firstName || ""} ${obj.lastName || ""}`.trim();
      obj.sourcing = obj.sourcing || obj.sourcingManager || "";
      obj.sourcingManager = obj.sourcing;
      return obj;
    });

    const totalEmployees = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      totalEmployees,
      page: Number(page),
      totalPages: Math.ceil(totalEmployees / limit),
      data: formattedEmployees,
    });
  } catch (error) {
    console.error("getEmployees error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Employee Status
export const updateEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const obj = employee.toObject();
    if (!obj.visiblePassword) {
      obj.visiblePassword = "Pass1234!";
    }

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "employee", action: "updated", entity: "employee", data: obj });

    res.status(200).json({
      success: true,
      message: "Employee status updated successfully",
      data: obj,
    });
  } catch (error) {
    console.error("updateEmployeeStatus error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Employee By ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Auto-repair missing visiblePassword in DB if legacy document
    if (!employee.visiblePassword) {
      employee.visiblePassword = "Pass1234!";
      await employee.save().catch(() => {});
    }

    const empObj = employee.toObject();
    empObj.name = empObj.name || `${empObj.firstName || ""} ${empObj.lastName || ""}`.trim();
    empObj.sourcing = empObj.sourcing || empObj.sourcingManager || "";
    empObj.sourcingManager = empObj.sourcing;

    res.status(200).json({
      success: true,
      data: empObj,
    });
  } catch (error) {
    console.error("getEmployeeById error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Employee
export const createEmployee = async (req, res) => {
  try {
    const rawPassword = typeof req.body.password === "string" ? req.body.password.trim() : "";
    const finalPassword = rawPassword || "Pass1234!";
    const finalEmployeeId = (req.body.employeeId || "").trim() || generateEmployeeId();
    const rawSourcing = (req.body.sourcing || req.body.sourcingManager || "").trim();
    const rawVendor = (req.body.vendor || "").trim();
    const rawPerDay = req.body.perDayPayout !== undefined ? Number(req.body.perDayPayout) || 0 : 0;

    const employeeData = {
      ...req.body,
      employeeId: finalEmployeeId,
      password: finalPassword,
      visiblePassword: finalPassword,
      vendor: rawVendor,
      sourcing: rawSourcing,
      sourcingManager: rawSourcing,
      perDayPayout: rawPerDay,
    };

    if (rawPerDay > 0 && (!employeeData.monthlySalary || Number(employeeData.monthlySalary) === 0)) {
      employeeData.monthlySalary = rawPerDay * 30;
    }

    if (req.body.name && typeof req.body.name === "string" && req.body.name.trim()) {
      const parts = req.body.name.trim().split(/\s+/);
      employeeData.name = req.body.name.trim();
      employeeData.firstName = parts[0] || req.body.name.trim();
      employeeData.lastName = parts.slice(1).join(" ") || "";
    }

    const employee = await Employee.create(employeeData);
    const employeeResponse = employee.toObject();
    employeeResponse.name = employeeResponse.name || `${employeeResponse.firstName || ""} ${employeeResponse.lastName || ""}`.trim();
    employeeResponse.sourcing = employeeResponse.sourcing || employeeResponse.sourcingManager || "";
    employeeResponse.sourcingManager = employeeResponse.sourcing;

    // Auto-save any new vendor or sourcing to Settings for future dropdowns
    if (rawVendor || rawSourcing) {
      Settings.findOne().then((settings) => {
        if (!settings) return;
        let changed = false;
        if (rawVendor && !settings.vendors.includes(rawVendor)) {
          settings.vendors.push(rawVendor);
          changed = true;
        }
        if (rawSourcing && !settings.sourcingManagers.includes(rawSourcing)) {
          settings.sourcingManagers.push(rawSourcing);
          changed = true;
        }
        if (changed) settings.save().catch(() => {});
      }).catch(() => {});
    }

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "employee", action: "created", entity: "employee", data: employeeResponse });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employeeResponse,
      credentials: {
        employeeId: employeeResponse.employeeId,
        password: finalPassword,
      },
    });
  } catch (error) {
    console.error("createEmployee error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Employee
export const updateEmployee = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.password && typeof updates.password === "string" && updates.password.trim()) {
      const plainPassword = updates.password.trim();
      updates.visiblePassword = plainPassword;
      updates.password = await bcrypt.hash(plainPassword, 12);
    } else {
      delete updates.password;
      delete updates.visiblePassword;
    }

    if (updates.name && typeof updates.name === "string" && updates.name.trim()) {
      const parts = updates.name.trim().split(/\s+/);
      updates.firstName = parts[0] || updates.name.trim();
      updates.lastName = parts.slice(1).join(" ") || "";
    }

    if (updates.sourcing !== undefined || updates.sourcingManager !== undefined) {
      const sourcingVal = (updates.sourcing || updates.sourcingManager || "").trim();
      updates.sourcing = sourcingVal;
      updates.sourcingManager = sourcingVal;
    }

    if (updates.perDayPayout !== undefined) {
      updates.perDayPayout = Number(updates.perDayPayout) || 0;
      if (updates.perDayPayout > 0) {
        updates.monthlySalary = updates.perDayPayout * 30;
      }
    }

    const rawVendor = updates.vendor?.trim();
    const rawSourcing = updates.sourcing?.trim();
    if (rawVendor || rawSourcing) {
      Settings.findOne().then((settings) => {
        if (!settings) return;
        let changed = false;
        if (rawVendor && !settings.vendors.includes(rawVendor)) {
          settings.vendors.push(rawVendor);
          changed = true;
        }
        if (rawSourcing && !settings.sourcingManagers.includes(rawSourcing)) {
          settings.sourcingManagers.push(rawSourcing);
          changed = true;
        }
        if (changed) settings.save().catch(() => {});
      }).catch(() => {});
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Ensure visiblePassword persists on the document
    if (!employee.visiblePassword) {
      employee.visiblePassword = "Pass1234!";
      await employee.save().catch(() => {});
    }

    const empObj = employee.toObject();
    empObj.name = empObj.name || `${empObj.firstName || ""} ${empObj.lastName || ""}`.trim();
    empObj.sourcing = empObj.sourcing || empObj.sourcingManager || "";
    empObj.sourcingManager = empObj.sourcing;

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "employee", action: "updated", entity: "employee", data: empObj });

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: empObj,
    });
  } catch (error) {
    console.error("updateEmployee error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    req.app.get("io") && broadcastRealtime(req.app.get("io"), { type: "employee", action: "deleted", entity: "employee", data: { id: req.params.id } });

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("deleteEmployee error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};