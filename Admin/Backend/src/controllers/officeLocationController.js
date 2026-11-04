import OfficeLocation from "../models/OfficeLocation.js";
import Employee from "../models/Employee.js";
import { isValidCoordinate } from "../utils/geoUtils.js";

/**
 * Get all office locations
 * GET /api/admin/locations
 */
export const getAllLocations = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === "true") {
      filter.isActive = true;
    }

    const locations = await OfficeLocation.find(filter).sort({ createdAt: -1 });

    // Count how many employees are assigned to each location
    const counts = await Employee.aggregate([
      { $match: { assignedOffice: { $ne: null } } },
      { $group: { _id: "$assignedOffice", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const locationsWithCounts = locations.map((loc) => ({
      ...loc.toObject(),
      assignedEmployeesCount: countMap[loc._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      data: locationsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching office locations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch office locations",
      error: error.message,
    });
  }
};

/**
 * Get single office location by ID
 * GET /api/admin/locations/:id
 */
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await OfficeLocation.findById(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Office location not found",
      });
    }

    const assignedCount = await Employee.countDocuments({ assignedOffice: id });

    return res.status(200).json({
      success: true,
      data: {
        ...location.toObject(),
        assignedEmployeesCount: assignedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching office location:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch office location",
      error: error.message,
    });
  }
};

/**
 * Create a new office location
 * POST /api/admin/locations
 */
export const createLocation = async (req, res) => {
  try {
    const { officeName, address, latitude, longitude, allowedRadius, isActive } = req.body;

    if (!officeName || !officeName.trim()) {
      return res.status(400).json({ success: false, message: "Office name is required" });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }

    if (!isValidCoordinate(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude (-90 to 90) and longitude (-180 to 180) are required",
      });
    }

    const radius = Number(allowedRadius) || 100;
    if (radius < 10) {
      return res.status(400).json({
        success: false,
        message: "Allowed radius must be at least 10 meters",
      });
    }

    const newLocation = new OfficeLocation({
      officeName: officeName.trim(),
      address: address.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      allowedRadius: radius,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: req.user?._id || null,
    });

    const saved = await newLocation.save();

    return res.status(201).json({
      success: true,
      message: "Office location created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error creating office location:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create office location",
      error: error.message,
    });
  }
};

/**
 * Update an office location
 * PUT /api/admin/locations/:id
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { officeName, address, latitude, longitude, allowedRadius, isActive } = req.body;

    const location = await OfficeLocation.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Office location not found",
      });
    }

    if (officeName !== undefined) {
      if (!officeName.trim()) {
        return res.status(400).json({ success: false, message: "Office name cannot be empty" });
      }
      location.officeName = officeName.trim();
    }

    if (address !== undefined) {
      if (!address.trim()) {
        return res.status(400).json({ success: false, message: "Address cannot be empty" });
      }
      location.address = address.trim();
    }

    if (latitude !== undefined || longitude !== undefined) {
      const lat = latitude !== undefined ? latitude : location.latitude;
      const lon = longitude !== undefined ? longitude : location.longitude;
      if (!isValidCoordinate(lat, lon)) {
        return res.status(400).json({
          success: false,
          message: "Valid latitude (-90 to 90) and longitude (-180 to 180) are required",
        });
      }
      location.latitude = Number(lat);
      location.longitude = Number(lon);
    }

    if (allowedRadius !== undefined) {
      const radius = Number(allowedRadius);
      if (isNaN(radius) || radius < 10) {
        return res.status(400).json({
          success: false,
          message: "Allowed radius must be at least 10 meters",
        });
      }
      location.allowedRadius = radius;
    }

    if (isActive !== undefined) {
      location.isActive = Boolean(isActive);
    }

    const updated = await location.save();

    return res.status(200).json({
      success: true,
      message: "Office location updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating office location:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update office location",
      error: error.message,
    });
  }
};

/**
 * Delete an office location
 * DELETE /api/admin/locations/:id
 */
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any employee is assigned to this location
    const assignedCount = await Employee.countDocuments({ assignedOffice: id });
    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete location. There are ${assignedCount} employee(s) currently assigned to it. Please reassign them first or deactivate this location.`,
      });
    }

    const deleted = await OfficeLocation.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Office location not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Office location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting office location:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete office location",
      error: error.message,
    });
  }
};
