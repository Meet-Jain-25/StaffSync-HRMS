const express = require("express");

const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
} = require("../controllers/attendanceController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All attendance routes require authentication.
router.use(protect);

// Employee: Check in.
router.post(
  "/check-in",
  authorize("Employee"),
  checkIn
);

// Employee: Check out.
router.post(
  "/check-out",
  authorize("Employee"),
  checkOut
);

// Employee: View their own attendance history.
router.get(
  "/my",
  authorize("Employee"),
  getMyAttendance
);

// HR: View all employees' attendance records.
router.get(
  "/",
  authorize("HR"),
  getAllAttendance
);

module.exports = router;