const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
} = require("../controllers/leaveController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Employee: Submit a leave request
router.post("/", protect, authorize("Employee"), applyLeave);

// Employee: View own leave requests
router.get("/my", protect, authorize("Employee"), getMyLeaves);

// HR and Manager: View all leave requests
router.get("/", protect, authorize("HR", "Manager"), getAllLeaves);

// HR and Manager: Approve or reject a leave request
router.patch(
  "/:id/review",
  protect,
  authorize("HR", "Manager"),
  reviewLeave
);

module.exports = router;