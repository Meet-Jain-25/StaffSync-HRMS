const express = require("express");

const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deactivateEmployee,
} = require("../controllers/employeeController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below require an authenticated HR user
router.use(protect, authorize("HR"));

// Create a new employee
router.post("/", createEmployee);

// Get all employees
router.get("/", getEmployees);

// Update an employee's employment details
router.put("/:id", updateEmployee);

// Deactivate an employee account
router.patch("/:id/deactivate", deactivateEmployee);

module.exports = router;