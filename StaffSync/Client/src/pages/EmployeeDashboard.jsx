import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Attendance from "../components/employee/Attendance";
import LeaveManagement from "../components/employee/LeaveManagement";
import Announcements from "../components/employee/Announcements";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");

  const user = JSON.parse(
    localStorage.getItem("staffsync_user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("staffsync_token");
    localStorage.removeItem("staffsync_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="container py-5">
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Employee Dashboard</h1>

          <p className="text-secondary mb-0">
            Welcome back, {user.name || "Employee"}!
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>

      {/* Dashboard Navigation */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          className={`btn ${
            activeSection === "dashboard"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setActiveSection("dashboard")}
        >
          <i className="bi bi-grid me-2"></i>
          Dashboard
        </button>

        <button
          type="button"
          className={`btn ${
            activeSection === "attendance"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setActiveSection("attendance")}
        >
          <i className="bi bi-calendar-check me-2"></i>
          My Attendance
        </button>

        <button
          type="button"
          className={`btn ${
            activeSection === "leave"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setActiveSection("leave")}
        >
          <i className="bi bi-calendar2-week me-2"></i>
          Leave Management
        </button>

        {/* Announcements Navigation */}
        <button
          type="button"
          className={`btn ${
            activeSection === "announcements"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setActiveSection("announcements")}
        >
          <i className="bi bi-megaphone me-2"></i>
          Announcements
        </button>
      </div>

      {/* Main Content Sections */}
      {activeSection === "attendance" ? (
        <Attendance />
      ) : activeSection === "leave" ? (
        <LeaveManagement />
      ) : activeSection === "announcements" ? (
        <Announcements />
      ) : (
        <>
          {/* Welcome Message */}
          <div className="alert alert-primary">
            <i className="bi bi-person-check me-2"></i>
            You are successfully logged in to StaffSync.
          </div>

          {/* Dashboard Feature Cards */}
          <div className="row g-4 mt-2">
            {/* Attendance Card */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <i className="bi bi-calendar-check fs-2 text-primary"></i>

                  <h5 className="mt-3">Attendance</h5>

                  <p className="text-secondary">
                    Record your working hours and view attendance history.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveSection("attendance")}
                  >
                    Manage Attendance
                  </button>
                </div>
              </div>
            </div>

            {/* Leave Management Card */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <i className="bi bi-calendar2-week fs-2 text-success"></i>

                  <h5 className="mt-3">Leave Management</h5>

                  <p className="text-secondary">
                    Apply for leave and track your applications.
                  </p>

                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => setActiveSection("leave")}
                  >
                    Manage Leave
                  </button>
                </div>
              </div>
            </div>

            {/* Announcements Card */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <i className="bi bi-megaphone fs-2 text-warning"></i>

                  <h5 className="mt-3">Announcements</h5>

                  <p className="text-secondary">
                    Stay updated with company announcements.
                  </p>

                  <button
                    type="button"
                    className="btn btn-warning btn-sm"
                    onClick={() => setActiveSection("announcements")}
                  >
                    <i className="bi bi-megaphone me-2"></i>
                    View Announcements
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body p-4">
              <h5>My Account</h5>

              <p className="mb-2">
                <strong>Name:</strong>{" "}
                {user.name || "Not available"}
              </p>

              <p className="mb-2">
                <strong>Email:</strong>{" "}
                {user.email || "Not available"}
              </p>

              <p className="mb-0">
                <strong>Role:</strong>{" "}
                {user.role || "Employee"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EmployeeDashboard;