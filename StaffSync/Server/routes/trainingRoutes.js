const express = require("express");
const router = express.Router();

const {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
} = require("../controllers/trainingController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All authenticated roles can view training programs.
router.get(
  "/",
  protect,
  authorize("HR", "Manager", "Employee"),
  getTrainings
);

router.get(
  "/:id",
  protect,
  authorize("HR", "Manager", "Employee"),
  getTrainingById
);

// Only HR and Managers can create, edit, or delete training programs.
router.post(
  "/",
  protect,
  authorize("HR", "Manager"),
  createTraining
);

router.patch(
  "/:id",
  protect,
  authorize("HR", "Manager"),
  updateTraining
);

router.delete(
  "/:id",
  protect,
  authorize("HR", "Manager"),
  deleteTraining
);

module.exports = router;