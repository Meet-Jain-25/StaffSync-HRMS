const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    message: {
      type: String,
      required: [true, "Announcement message is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },

    category: {
      type: String,
      enum: ["General", "HR", "Event", "Policy", "Urgent"],
      default: "General",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently retrieve announcements in chronological order.
announcementSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Announcement", announcementSchema);