const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    leaveType: {
      type: String,
      required: [true, "Leave type is required"],
      enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Other"],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    reason: {
      type: String,
      required: [true, "Leave reason is required"],
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewRemarks: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently retrieve an employee's leave requests.
leaveSchema.index({ employee: 1, createdAt: -1 });

// Validate the date range.
leaveSchema.pre("validate", function () {
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

module.exports = mongoose.model("Leave", leaveSchema);