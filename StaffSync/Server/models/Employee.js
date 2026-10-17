const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },

    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: 100,
    },

    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      maxlength: 100,
    },

    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },

    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    employmentStatus: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);