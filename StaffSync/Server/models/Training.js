const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Training title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Training description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    trainer: {
      type: String,
      required: [true, "Trainer name is required"],
      trim: true,
      maxlength: [100, "Trainer name cannot exceed 100 characters"],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [100, "Department cannot exceed 100 characters"],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    location: {
      type: String,
      required: [true, "Training location is required"],
      trim: true,
      maxlength: [150, "Location cannot exceed 150 characters"],
    },

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

trainingSchema.pre("validate", function () {
  if (
    this.startDate &&
    this.endDate &&
    this.endDate < this.startDate
  ) {
    this.invalidate(
      "endDate",
      "End date cannot be earlier than start date."
    );
  }
});

module.exports = mongoose.model("Training", trainingSchema);