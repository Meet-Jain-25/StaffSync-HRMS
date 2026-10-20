import { useState } from "react";
import { useNavigate } from "react-router-dom";

import HRLeaveManagement from "../components/hr/HRLeaveManagement";
import TrainingManagement from "../components/manager/TrainingManagement";

function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("staffsync_user") || "{}");
  } catch {
    user = {};
  }

  const handleLogout = () => {
    localStorage.removeItem("staffsync_token");
    localStorage.removeItem("staffsync_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="container py-5">
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold">Manager Dashboard</h1>

          <p className="text-secondary mb-0">
            Welcome back, {user.name || "Manager"}!
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

      {/* Navigation */}
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
            activeSection === "leave"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setActiveSection("leave")}
        >
          <i className="bi bi-calendar2-week me-2"></i>
          Leave Management
        </button>

        <button
          type="button"
          className={`btn ${
            activeSection === "training"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setActiveSection("training")}
        >
          <i className="bi bi-mortarboard me-2"></i>
          Training Management
        </button>
      </div>

      {/* Main Content */}
      {activeSection === "leave" ? (
        <HRLeaveManagement />
      ) : activeSection === "training" ? (
        <TrainingManagement />
      ) : (
        <>
          <div className="alert alert-primary" role="status">
            <i className="bi bi-person-check me-2"></i>
            You are successfully logged in to the StaffSync Manager Portal.
          </div>

          {/* Dashboard Cards */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <i className="bi bi-calendar2-week fs-2 text-primary"></i>

                  <h5 className="mt-3">Leave Management</h5>

                  <p className="text-secondary">
                    Review employee leave applications, make decisions,
                    and provide review remarks.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveSection("leave")}
                  >
                    Manage Leave
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <i className="bi bi-mortarboard fs-2 text-success"></i>

                  <h5 className="mt-3">Training Management</h5>

                  <p className="text-secondary">
                    Create training programs, update their details,
                    and manage their status.
                  </p>

                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => setActiveSection("training")}
                  >
                    Manage Training
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
                <strong>Name:</strong> {user.name || "Not available"}
              </p>

              <p className="mb-2">
                <strong>Email:</strong> {user.email || "Not available"}
              </p>

              <p className="mb-0">
                <strong>Role:</strong> {user.role || "Manager"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ManagerDashboard;