const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");

const allowedCategories = [
  "General",
  "HR",
  "Event",
  "Policy",
  "Urgent",
];

// GET /api/announcements
// HR, Manager, and Employee can view announcements.
const getAnnouncements = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      if (!allowedCategories.includes(req.query.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid announcement category.",
        });
      }

      filter.category = req.query.category;
    }

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve announcements.",
    });
  }
};

// GET /api/announcements/:id
// HR, Manager, and Employee can view an announcement.
const getAnnouncementById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID.",
      });
    }

    const announcement = await Announcement.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .lean();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error("Get announcement by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the announcement.",
    });
  }
};

// POST /api/announcements
// Only HR and Manager can create announcements.
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, category } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Announcement title and message are required.",
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 150 characters.",
      });
    }

    if (message.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters.",
      });
    }

    if (category !== undefined && !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement category.",
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      ...(category ? { category } : {}),
      createdBy: req.user.id,
    });

    const populatedAnnouncement = await Announcement.findById(
      announcement._id
    )
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      announcement: populatedAnnouncement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create the announcement.",
    });
  }
};

// PATCH /api/announcements/:id
// Only HR and Manager can update announcements.
const updateAnnouncement = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID.",
      });
    }

    const allowedFields = ["title", "message", "category"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    for (const field of ["title", "message"]) {
      if (
        updates[field] !== undefined &&
        (typeof updates[field] !== "string" || !updates[field].trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} cannot be empty.`,
        });
      }

      if (typeof updates[field] === "string") {
        updates[field] = updates[field].trim();
      }
    }

    if (updates.title !== undefined && updates.title.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 150 characters.",
      });
    }

    if (updates.message !== undefined && updates.message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters.",
      });
    }

    if (
      updates.category !== undefined &&
      !allowedCategories.includes(updates.category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement category.",
      });
    }

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    Object.assign(announcement, updates);
    announcement.updatedBy = req.user.id;

    await announcement.save();

    const updatedAnnouncement = await Announcement.findById(
      announcement._id
    )
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully.",
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update the announcement.",
    });
  }
};

// DELETE /api/announcements/:id
// Only HR and Manager can delete announcements.
const deleteAnnouncement = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID.",
      });
    }

    const announcement = await Announcement.findByIdAndDelete(
      req.params.id
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the announcement.",
    });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};