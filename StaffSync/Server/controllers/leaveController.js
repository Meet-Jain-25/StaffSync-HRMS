const mongoose = require("mongoose");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Employee: Submit a leave request
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Leave type, dates, and reason are required.",
      });
    }

    const validLeaveTypes = [
      "Casual Leave",
      "Sick Leave",
      "Earned Leave",
      "Other",
    ];

    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type.",
      });
    }

    const isValidDate = (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
      new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) ===
        value;

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Dates must be valid calendar dates in YYYY-MM-DD format.",
      });
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be earlier than start date.",
      });
    }

    const employee = await Employee.findOne({ user: req.user.id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate("employee", "employeeId firstName lastName department")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      leave: populatedLeave,
    });
  } catch (error) {
    console.error("Apply leave error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit leave request.",
    });
  }
};

// Employee: View own leave requests
const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id }).select("_id");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    const leaves = await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 })
      .populate("employee", "employeeId firstName lastName department")
      .lean();

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get my leaves error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your leave requests.",
    });
  }
};

// HR/Manager: View leave requests
const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      const validStatuses = ["Pending", "Approved", "Rejected"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave status.",
        });
      }

      filter.status = status;
    }

    const leaves = await Leave.find(filter)
      .sort({ createdAt: -1 })
      .populate("employee", "employeeId firstName lastName department")
      .populate("reviewedBy", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get all leaves error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve leave requests.",
    });
  }
};

// HR/Manager: Approve or reject a leave request
const reviewLeave = async (req, res) => {
  try {
    const { status, reviewRemarks = "" } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave request ID.",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Approved or Rejected.",
      });
    }

    if (typeof reviewRemarks !== "string" || reviewRemarks.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Review remarks must be 500 characters or fewer.",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "This leave request has already been reviewed.",
      });
    }

    leave.status = status;
    leave.reviewRemarks = reviewRemarks.trim();
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate("employee", "employeeId firstName lastName department")
      .populate("reviewedBy", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
      leave: updatedLeave,
    });
  } catch (error) {
    console.error("Review leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review leave request.",
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
};