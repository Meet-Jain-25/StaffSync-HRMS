const mongoose = require("mongoose");
const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");

// Create an employee and their associated user account
const createEmployee = async (req, res) => {
  let createdUserId = null;

  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      designation,
      joiningDate,
      phone,
      address,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !employeeId ||
      !department ||
      !designation ||
      !joiningDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, employee ID, department, designation, and joining date are required.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof employeeId !== "string" ||
      typeof department !== "string" ||
      typeof designation !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input format.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmployeeId = employeeId.trim().toUpperCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const parsedJoiningDate = new Date(joiningDate);

    if (Number.isNaN(parsedJoiningDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid joining date.",
      });
    }

    // Prevent duplicate email or employee ID
    const [existingUser, existingEmployee] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Employee.findOne({ employeeId: normalizedEmployeeId }),
    ]);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "This employee ID is already in use.",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // HR-created accounts are Employee accounts
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "Employee",
    });

    createdUserId = user._id;

    // Create employment details
    const employee = await Employee.create({
      user: user._id,
      employeeId: normalizedEmployeeId,
      department: department.trim(),
      designation: designation.trim(),
      joiningDate: parsedJoiningDate,
      phone: typeof phone === "string" ? phone.trim() : "",
      address: typeof address === "string" ? address.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
        phone: employee.phone,
        address: employee.address,
        employmentStatus: employee.employmentStatus,
      },
    });
  } catch (error) {
    // Avoid leaving an orphaned account if employee creation fails
    if (createdUserId) {
      try {
        await User.findByIdAndDelete(createdUserId);
      } catch (cleanupError) {
        console.error("Failed to clean up user account:", cleanupError.message);
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "The email or employee ID is already in use.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create employee error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create employee.",
    });
  }
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("user", "name email role isActive")
      .sort({ createdAt: -1 })
      .lean();

    const results = employees.map((employee) => ({
      id: employee._id,
      employeeId: employee.employeeId,
      name: employee.user?.name || "Unknown",
      email: employee.user?.email || "",
      role: employee.user?.role || "",
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate,
      phone: employee.phone,
      address: employee.address,
      employmentStatus: employee.employmentStatus,
      isActive: employee.user?.isActive ?? false,
    }));

    return res.status(200).json({
      success: true,
      count: results.length,
      employees: results,
    });
  } catch (error) {
    console.error("Get employees error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve employees.",
    });
  }
};

// Update employee details
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee record ID.",
      });
    }

    const allowedFields = [
      "employeeId",
      "department",
      "designation",
      "joiningDate",
      "phone",
      "address",
      "employmentStatus",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.employeeId !== undefined) {
      updates.employeeId = String(updates.employeeId).trim().toUpperCase();

      const duplicate = await Employee.findOne({
        employeeId: updates.employeeId,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "This employee ID is already in use.",
        });
      }
    }

    if (updates.department !== undefined) {
      updates.department = String(updates.department).trim();
    }

    if (updates.designation !== undefined) {
      updates.designation = String(updates.designation).trim();
    }

    if (updates.phone !== undefined) {
      updates.phone = String(updates.phone).trim();
    }

    if (updates.address !== undefined) {
      updates.address = String(updates.address).trim();
    }

    if (
      updates.employmentStatus !== undefined &&
      !["Active", "On Leave", "Inactive"].includes(
        updates.employmentStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid employment status.",
      });
    }

    if (updates.joiningDate !== undefined) {
      const date = new Date(updates.joiningDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid joining date.",
        });
      }

      updates.joiningDate = date;
    }

    const employee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("user", "name email role isActive");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This employee ID is already in use.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update employee.",
    });
  }
};

// Deactivate an employee without deleting their history
const deactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee record not found.",
      });
    }

    const user = await User.findByIdAndUpdate(
      employee.user,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Associated user account not found.",
      });
    }

    employee.employmentStatus = "Inactive";
    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee deactivated successfully.",
    });
  } catch (error) {
    console.error("Deactivate employee error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to deactivate employee.",
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  deactivateEmployee,
};