import express from "express";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/officeLocationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin location routes require authentication
router.use(authMiddleware);

router.get("/", getAllLocations);
router.get("/:id", getLocationById);
router.post("/", createLocation);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);

export default router;
