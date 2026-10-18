const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// Get today's date range using the Asia/Kolkata timezone.
const getTodayRange = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const dateParts = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      dateParts[part.type] = part.value;
    }
  }

  const year = Number(dateParts.year);
  const month = Number(dateParts.month);
  const day = Number(dateParts.day);

  // IST is UTC+05:30. Convert Indian midnight to UTC.
  const start = new Date(
    Date.UTC(year, month - 1, day) - 330 * 60 * 1000
  );

  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
};

// Employee check-in
const checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee || employee.employmentStatus !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Active employee profile not found.",
      });
    }

    const { start, end } = getTodayRange();

    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lt: end },
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "You have already checked in today.",
      });
    }

    const now = new Date();

    const attendance = await Attendance.create({
      employee: employee._id,
      date: start,
      checkIn: now,
      status: "Present",
    });

    return res.status(201).json({
      success: true,
      message: "Check-in successful.",
      attendance,
    });
  } catch (error) {
    // The unique database index also prevents duplicate daily records.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance has already been recorded for today.",
      });
    }

    console.error("Check-in error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to record check-in.",
    });
  }
};

// Employee check-out
const checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    const { start, end } = getTodayRange();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lt: end },
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "You must check in before checking out.",
      });
    }

    if (attendance.checkOut) {
      return res.status(409).json({
        success: false,
        message: "You have already checked out today.",
      });
    }

    const now = new Date();

    if (now <= attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Check-out time must be after check-in time.",
      });
    }

    attendance.checkOut = now;

    const durationMs = now.getTime() - attendance.checkIn.getTime();

    attendance.totalHours = Number(
      (durationMs / (1000 * 60 * 60)).toFixed(2)
    );

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Check-out successful.",
      attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to record check-out.",
    });
  }
};

// Employee: Get personal attendance history
const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    const attendance = await Attendance.find({
      employee: employee._id,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Attendance history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch attendance history.",
    });
  }
};

// HR: Get attendance records with optional filters
const getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId, status } = req.query;
    const filter = {};

    if (date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                    message: "Invalid date. Use YYYY-MM-DD.",
                });
            }

            const [year, month, day] = date.split("-").map(Number);

            const isValidDate =
                month >= 1 &&
                month <= 12 &&
                day >= 1 &&
                day <= new Date(Date.UTC(year, month, 0)).getUTCDate();

            if (!isValidDate) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid calendar date.",
                });
            }

            // Interpret the selected date as an Indian calendar date.
            const start = new Date(
                Date.UTC(year, month - 1, day) - 330 * 60 * 1000
            );

            const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

            filter.date = { $gte: start, $lt: end };
        }

    if (employeeId) {
      if (!mongoose.isValidObjectId(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID.",
        });
      }

      filter.employee = employeeId;
    }

    if (status) {
      const validStatuses = ["Present", "Absent", "Late", "Half Day"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance status.",
        });
      }

      filter.status = status;
    }

    const attendance = await Attendance.find(filter)
      .populate({
        path: "employee",
        select: "employeeId department designation user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ date: -1, checkIn: -1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("All attendance error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch attendance records.",
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
};