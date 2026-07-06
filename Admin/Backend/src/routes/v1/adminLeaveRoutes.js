import { Router } from "express";

import {
  approveLeave,
  deleteLeave,
  getLeaveById,
  getLeaves,
  rejectLeave
} from "../../controllers/adminLeaveController.js";

const router = Router();

router.get("/", getLeaves);
router.get("/:leaveId", getLeaveById);
router.patch("/:leaveId/approve", approveLeave);
router.patch("/:leaveId/reject", rejectLeave);
router.delete("/:leaveId", deleteLeave);

export default router;
