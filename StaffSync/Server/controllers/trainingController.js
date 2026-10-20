const mongoose = require("mongoose");
const Training = require("../models/Training");

const allowedStatuses = [
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
];

// GET /api/training
// HR, Manager, and Employee can view training programs.
const getTrainings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid training status.",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.department) {
      filter.department = req.query.department;
    }

    const trainings = await Training.find(filter)
      .populate("createdBy", "name email role")
      .sort({ startDate: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error) {
    console.error("Get trainings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve training programs.",
    });
  }
};

// GET /api/training/:id
const getTrainingById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training ID.",
      });
    }

    const training = await Training.findById(req.params.id)
      .populate("createdBy", "name email role")
      .lean();

    if (!training) {
      return res.status(404).json({
        success: false,
        message: "Training program not found.",
      });
    }

    return res.status(200).json({
      success: true,
      training,
    });
  } catch (error) {
    console.error("Get training by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the training program.",
    });
  }
};

// POST /api/training
// Only HR and Manager can create training programs.
const createTraining = async (req, res) => {
  try {
    const {
      title,
      description,
      trainer,
      department,
      startDate,
      endDate,
      location,
      status,
    } = req.body;

    const requiredFields = {
      title,
      description,
      trainer,
      department,
      startDate,
      endDate,
      location,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`,
        });
      }
    }

    const validDate = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (!validDate(startDate) || !validDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Enter valid start and end dates in YYYY-MM-DD format.",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be earlier than start date.",
      });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training status.",
      });
    }

    const training = await Training.create({
      title: title.trim(),
      description: description.trim(),
      trainer: trainer.trim(),
      department: department.trim(),
      startDate: new Date(`${startDate}T00:00:00.000Z`),
      endDate: new Date(`${endDate}T00:00:00.000Z`),
      location: location.trim(),
      ...(status ? { status } : {}),
      createdBy: req.user.id,
    });

    const populatedTraining = await Training.findById(training._id)
      .populate("createdBy", "name email role")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Training program created successfully.",
      training: populatedTraining,
    });
  } catch (error) {
    console.error("Create training error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create the training program.",
    });
  }
};

// PATCH /api/training/:id
// Only HR and Manager can update training programs.
const updateTraining = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training ID.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "trainer",
      "department",
      "startDate",
      "endDate",
      "location",
      "status",
    ];

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

    for (const field of [
      "title",
      "description",
      "trainer",
      "department",
      "location",
    ]) {
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

    if (updates.status && !allowedStatuses.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training status.",
      });
    }

    for (const field of ["startDate", "endDate"]) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(updates[field])
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must use YYYY-MM-DD format.`,
          });
        }

        const parsedDate = new Date(`${updates[field]}T00:00:00.000Z`);

        if (
          Number.isNaN(parsedDate.getTime()) ||
          parsedDate.toISOString().slice(0, 10) !== updates[field]
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`,
          });
        }

        updates[field] = parsedDate;
      }
    }

    const existingTraining = await Training.findById(req.params.id);

    if (!existingTraining) {
      return res.status(404).json({
        success: false,
        message: "Training program not found.",
      });
    }

    const effectiveStartDate =
      updates.startDate ?? existingTraining.startDate;

    const effectiveEndDate =
      updates.endDate ?? existingTraining.endDate;

    if (effectiveEndDate < effectiveStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be earlier than start date.",
      });
    }

    Object.assign(existingTraining, updates);

    await existingTraining.save();

    const training = await Training.findById(existingTraining._id)
      .populate("createdBy", "name email role")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Training program updated successfully.",
      training,
    });
  } catch (error) {
    console.error("Update training error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update the training program.",
    });
  }
};

// DELETE /api/training/:id
// Only HR and Manager can delete training programs.
const deleteTraining = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training ID.",
      });
    }

    const training = await Training.findByIdAndDelete(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: "Training program not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Training program deleted successfully.",
    });
  } catch (error) {
    console.error("Delete training error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the training program.",
    });
  }
};

module.exports = {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
};