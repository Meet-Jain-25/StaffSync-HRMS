const express = require("express");

const router = express.Router();

const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All authenticated roles can view announcements.
router.get(
  "/",
  protect,
  authorize("HR", "Manager", "Employee"),
  getAnnouncements
);

router.get(
  "/:id",
  protect,
  authorize("HR", "Manager", "Employee"),
  getAnnouncementById
);

// Only HR and Managers can create, edit, or delete announcements.
router.post(
  "/",
  protect,
  authorize("HR", "Manager"),
  createAnnouncement
);

router.patch(
  "/:id",
  protect,
  authorize("HR", "Manager"),
  updateAnnouncement
);

router.delete(
  "/:id",
  protect,
  authorize("HR", "Manager"),
  deleteAnnouncement
);

module.exports = router;