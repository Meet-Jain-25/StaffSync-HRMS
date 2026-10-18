import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import HRAttendance from "../components/hr/HRAttendance";
import HRLeaveManagement from "../components/hr/HRLeaveManagement";

const initialForm = {
  name: "",
  email: "",
  password: "",
  employeeId: "",
  department: "",
  designation: "",
  joiningDate: "",
  phone: "",
  address: "",
};

const initialEditForm = {
  employeeId: "",
  department: "",
  designation: "",
  joiningDate: "",
  phone: "",
  address: "",
  employmentStatus: "Active",
};

function HrDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("staffsync_user") || "null");
    } catch {
      return null;
    }
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [deactivatingId, setDeactivatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const response = await api.get("/employees");
      setEmployees(response.data.employees || response.data.data || []);
    } catch (error) {
      setLoadError(
        error.response?.data?.message ||
          "Unable to load employee records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("staffsync_token") || !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "HR") {
      navigate("/dashboard", { replace: true });
      return;
    }

    fetchEmployees();
  }, [navigate, user, fetchEmployees]);

  const logout = () => {
    localStorage.removeItem("staffsync_token");
    localStorage.removeItem("staffsync_user");
    navigate("/login", { replace: true });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const openModal = () => {
    setForm(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setFormError("");
  };

  const handleAddEmployee = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (form.password.length < 8) {
      setFormError("The temporary password must contain at least 8 characters.");
      return;
    }

    if (form.joiningDate > new Date().toISOString().slice(0, 10)) {
      setFormError("Joining date cannot be in the future.");
      return;
    }

    setSaving(true);

    try {
      await api.post("/employees", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        employeeId: form.employeeId.trim().toUpperCase(),
        department: form.department.trim(),
        designation: form.designation.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });

      setShowModal(false);
      setForm(initialForm);
      setSuccessMessage("Employee created successfully!");
      await fetchEmployees();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Unable to create employee. Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (employee) => {
  setEditingEmployee({
    ...employee,
    _id: employee._id || employee.id,
  });

  setEditError("");

  setEditForm({
    employeeId: employee.employeeId || "",
    department: employee.department || "",
    designation: employee.designation || "",
    joiningDate: employee.joiningDate
      ? new Date(employee.joiningDate).toISOString().slice(0, 10)
      : "",
    phone: employee.phone || "",
    address: employee.address || "",
    employmentStatus: employee.employmentStatus || "Active",
  });
};

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingEmployee(null);
    setEditError("");
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleEditEmployee = async (event) => {
  event.preventDefault();

  if (!editingEmployee) return;

  setEditError("");
  setSuccessMessage("");

  if (
    editForm.joiningDate &&
    editForm.joiningDate > new Date().toISOString().slice(0, 10)
  ) {
    setEditError("Joining date cannot be in the future.");
    return;
  }

  // Check the MongoDB Employee document ID.
  const recordId = editingEmployee._id;

  console.log("Selected employee:", editingEmployee);
  console.log("Employee record ID:", recordId);

  if (!recordId || !/^[a-f\d]{24}$/i.test(String(recordId))) {
    setEditError(
      "Invalid employee record ID. Please refresh the dashboard and try again."
    );
    return;
  }

  setSavingEdit(true);

  try {
    const response = await api.put(`/employees/${recordId}`, {
      ...editForm,
      employeeId: editForm.employeeId.trim().toUpperCase(),
      department: editForm.department.trim(),
      designation: editForm.designation.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
    });

    setEditingEmployee(null);
    setSuccessMessage(
      response.data.message || "Employee updated successfully!"
    );

    await fetchEmployees();
  } catch (error) {
    console.error(
      "Employee update failed:",
      error.response?.data || error.message
    );

    setEditError(
      error.response?.data?.message ||
        "Unable to update employee. Please try again."
    );
  } finally {
    setSavingEdit(false);
  }
};  

  const handleDeactivateEmployee = async (employee) => {
  const employeeName =
    employee.user?.name || employee.name || "this employee";

  const recordId = employee._id || employee.id;

  // Verify that we have the MongoDB Employee record ID.
  if (!recordId || !/^[a-f\d]{24}$/i.test(String(recordId))) {
    console.error("Invalid employee record:", employee);
    setLoadError(
      "Invalid employee record ID. Please refresh the dashboard and try again."
    );
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to deactivate ${employeeName}? Their account will no longer be able to log in.`
  );

  if (!confirmed) return;

  setDeactivatingId(recordId);
  setSuccessMessage("");
  setLoadError("");

  try {
    const response = await api.patch(
      `/employees/${recordId}/deactivate`
    );

    setSuccessMessage(
      response.data.message || `${employeeName} has been deactivated.`
    );

    await fetchEmployees();
  } catch (error) {
    console.error(
      "Employee deactivation failed:",
      error.response?.data || error.message
    );

    setLoadError(
      error.response?.data?.message ||
        "Unable to deactivate this employee. Please try again."
    );
  } finally {
    setDeactivatingId(null);
  }
};

  const activeEmployees = employees.filter(
    (employee) =>
      employee.employmentStatus === "Active" &&
      employee.user?.isActive !== false
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) =>
      employee.employmentStatus === "Inactive" ||
      employee.user?.isActive === false
  ).length;

  const departments = [
    ...new Set(employees.map((employee) => employee.department).filter(Boolean)),
  ];

  const filteredEmployees = employees.filter((employee) => {
    const employeeName = employee.user?.name || employee.name || "";
    const employeeEmail = employee.user?.email || employee.email || "";

    const searchMatches = [
      employeeName,
      employeeEmail,
      employee.employeeId,
      employee.department,
      employee.designation,
    ].some((value) =>
      String(value || "").toLowerCase().includes(search.toLowerCase())
    );

    const departmentMatches =
      departmentFilter === "All" ||
      employee.department === departmentFilter;

    return searchMatches && departmentMatches;
  });

  if (!user || user.role !== "HR") return null;

  return (
    <div className="hr-layout">
      <aside className="hr-sidebar">
        <div className="hr-brand">
          <span className="hr-brand-icon">S</span>
          <strong>StaffSync</strong>
        </div>

        <div className="hr-sidebar-section">WORKSPACE</div>

        <nav className="hr-navigation">
          <button
            type="button"
            className={`hr-nav-link ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <i className="bi bi-grid-fill" /> Dashboard
          </button>

          <button
            type="button"
            className={`hr-nav-link ${activeSection === "employees" ? "active" : ""}`}
            onClick={() => setActiveSection("employees")}
          >
            <i className="bi bi-people-fill" /> Employees
          </button>

          <button
            type="button"
            className={`hr-nav-link ${activeSection === "attendance" ? "active" : ""}`}
            onClick={() => setActiveSection("attendance")}
          >
            <i className="bi bi-calendar-check" /> Attendance
          </button>

          <button
            type="button"
            className={`hr-nav-link ${activeSection === "leave" ? "active" : ""}`}
            onClick={() => setActiveSection("leave")}
          >
            <i className="bi bi-calendar2-week" /> Leave Management
          </button>

          <button
          type="button"
          className={`hr-nav-link ${activeSection === "announcements" ? "active" : ""}`}
          onClick={() => setActiveSection("announcements")}
        >
          <i className="bi bi-megaphone" /> Announcements
          </button>
        </nav>

        <div className="hr-sidebar-bottom">
          <div className="hr-user">
            <span className="hr-avatar">
              {(user.name || "H").charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.name || "StaffSync HR"}</strong>
              <small>Human Resources</small>
            </div>
          </div>

          <button className="hr-logout" onClick={logout}>
            <i className="bi bi-box-arrow-left" /> Sign out
          </button>
        </div>
      </aside>

      <main className="hr-main" id="dashboard">
  {activeSection === "attendance" ? (
    <>
      <header className="hr-topbar">
        <div>
          <small>Workspace / Attendance</small>
          <h1>Attendance Management</h1>
        </div>

        <span className="hr-online">
          <span /> System Online
        </span>
      </header>

      <HRAttendance />

            <footer className="hr-footer">
        StaffSync — Modern Human Resource Management Solution
      </footer>
    </>
  ) : activeSection === "leave" ? (
    <>
      <header className="hr-topbar">
        <div>
          <small>Workspace / Leave Management</small>
          <h1>Leave Management</h1>
        </div>

        <span className="hr-online">
          <span /> System Online
        </span>
      </header>

      <HRLeaveManagement />

      <footer className="hr-footer">
        StaffSync — Modern Human Resource Management Solution
      </footer>
    </>
  ) : (
    <>
        <header className="hr-topbar">
          <div>
            <small>Workspace / Overview</small>
            <h1>HR Dashboard</h1>
          </div>
          <span className="hr-online"><span /> System Online</span>
        </header>

        <section className="hr-welcome">
          <div>
            <span>HUMAN RESOURCES</span>
            <h2>Welcome back, {user.name || "StaffSync HR"}!</h2>
            <p>Here's an overview of your workforce and employee records.</p>
          </div>
          <div className="hr-welcome-icon">
            <i className="bi bi-buildings" />
          </div>
        </section>

        {successMessage && (
          <div className="alert alert-success mt-3" role="status">
            {successMessage}
            <button
              type="button"
              className="btn-close float-end"
              aria-label="Close"
              onClick={() => setSuccessMessage("")}
            />
          </div>
        )}

        <section className="hr-stats">
          <div className="hr-stat-card">
            <div className="hr-stat-icon blue"><i className="bi bi-people-fill" /></div>
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
            <small>Employee records</small>
          </div>
          <div className="hr-stat-card">
            <div className="hr-stat-icon green"><i className="bi bi-person-check-fill" /></div>
            <span>Active Employees</span>
            <strong>{activeEmployees}</strong>
            <small>Currently active</small>
          </div>
          <div className="hr-stat-card">
            <div className="hr-stat-icon purple"><i className="bi bi-diagram-3-fill" /></div>
            <span>Departments</span>
            <strong>{departments.length}</strong>
            <small>Across employee records</small>
          </div>
          <div className="hr-stat-card">
            <div className="hr-stat-icon orange"><i className="bi bi-person-dash-fill" /></div>
            <span>Inactive Employees</span>
            <strong>{inactiveEmployees}</strong>
            <small>Deactivated records</small>
          </div>
        </section>

        <section className="hr-directory" id="employees">
          <div className="hr-directory-header">
            <div>
              <h3>Employee Directory</h3>
              <p>View and manage your employee records.</p>
            </div>
            <button className="hr-add-button" onClick={openModal}>
              <i className="bi bi-plus-lg" /> Add Employee
            </button>
          </div>

          <div className="hr-directory-tools">
            <input
              type="search"
              className="form-control"
              placeholder="Search name, email, ID or designation..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search employees"
            />
            <select
              className="form-select"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              aria-label="Filter by department"
            >
              <option value="All">All departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
            <button
              className="btn btn-outline-primary"
              onClick={fetchEmployees}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise" /> Refresh
            </button>
          </div>

          {loadError && (
            <div className="alert alert-danger m-3" role="alert">
              {loadError}
              <button
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={fetchEmployees}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="hr-empty-state">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading employee records...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="hr-empty-state">
              <i className="bi bi-people hr-empty-icon" />
              <h4>{employees.length === 0 ? "No employee records yet" : "No matching employees"}</h4>
              <p>
                {employees.length === 0
                  ? "Employee records will appear here when HR adds them."
                  : "Try changing your search or department filter."}
              </p>
              {employees.length === 0 && (
                <button className="hr-add-button mt-2" onClick={openModal}>
                  <i className="bi bi-plus-lg" /> Add your first employee
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table hr-employee-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>EMPLOYEE ID</th>
                    <th>DEPARTMENT</th>
                    <th>DESIGNATION</th>
                    <th>JOINING DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => {
                    const employeeName =
                      employee.user?.name || employee.name || "Unknown";
                    const employeeEmail =
                      employee.user?.email || employee.email || "";
                    const inactive =
                      employee.employmentStatus === "Inactive" ||
                      employee.user?.isActive === false;

                    return (
                      <tr key={employee._id}>
                        <td>
                          <div className="hr-employee-person">
                            <span className="hr-employee-avatar">
                              {employeeName.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <strong>{employeeName}</strong>
                              <small>{employeeEmail}</small>
                            </div>
                          </div>
                        </td>
                        <td>{employee.employeeId}</td>
                        <td>{employee.department}</td>
                        <td>{employee.designation}</td>
                        <td>
                          {employee.joiningDate
                            ? new Date(employee.joiningDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <span className={`hr-status ${inactive ? "inactive" : "active"}`}>
                            {inactive ? "Inactive" : employee.employmentStatus || "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="hr-action-buttons">
                            <button
                              className="hr-edit-button"
                              onClick={() => openEditModal(employee)}
                              disabled={inactive}
                              title={inactive ? "Inactive employees cannot be edited" : "Edit employee"}
                            >
                              <i className="bi bi-pencil-square" /> Edit
                            </button>
                            <button
                              className="hr-deactivate-button"
                              onClick={() => handleDeactivateEmployee(employee)}
                              disabled={inactive || deactivatingId === employee._id}
                              title={inactive ? "Employee already inactive" : "Deactivate employee"}
                            >
                              {deactivatingId === employee._id ? "Working..." : (
                                <><i className="bi bi-person-x" /> Deactivate</>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="hr-footer">
          StaffSync — Modern Human Resource Management Solution
        </footer>
      </>
    )}
      </main>

      {showModal && (
        <div
          className="hr-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section className="hr-modal" role="dialog" aria-modal="true" aria-labelledby="hr-modal-title">
            <div className="hr-modal-header">
              <div>
                <span className="hr-modal-eyebrow">HUMAN RESOURCES</span>
                <h2 id="hr-modal-title">Add New Employee</h2>
                <p>Create an employee account and employment record.</p>
              </div>
              <button className="hr-modal-close" onClick={closeModal} disabled={saving} aria-label="Close form">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddEmployee}>
              <div className="hr-form-grid">
                <div className="hr-form-field">
                  <label htmlFor="employee-name">Full Name *</label>
                  <input id="employee-name" className="form-control" name="name" value={form.name} onChange={handleInputChange} required minLength={2} maxLength={100} autoComplete="name" />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="employee-email">Email Address *</label>
                  <input id="employee-email" className="form-control" type="email" name="email" value={form.email} onChange={handleInputChange} required autoComplete="email" />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="employee-password">Temporary Password *</label>
                  <input id="employee-password" className="form-control" type="password" name="password" value={form.password} onChange={handleInputChange} required minLength={8} autoComplete="new-password" />
                  <small>Minimum 8 characters.</small>
                </div>
                <div className="hr-form-field">
                  <label htmlFor="employee-id">Employee ID *</label>
                  <input id="employee-id" className="form-control" name="employeeId" value={form.employeeId} onChange={handleInputChange} required maxLength={50} placeholder="e.g. SS-001" />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="employee-department">Department *</label>
                  <input id="employee-department" className="form-control" name="department" value={form.department} onChange={handleInputChange} required maxLength={100} placeholder="e.g. Engineering" />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="employee-designation">Designation *</label>
                  <input id="employee-designation" className="form-control" name="designation" value={form.designation} onChange={handleInputChange} required maxLength={100} placeholder="e.g. Software Engineer" />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="employee-joining-date">Joining Date *</label>
                  <input id="employee-joining-date" className="form-control" type="date" name="joiningDate" value={form.joiningDate} onChange={handleInputChange} max={new Date().toISOString().slice(0, 10)} required />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="employee-phone">Phone Number</label>
                  <input id="employee-phone" className="form-control" type="tel" name="phone" value={form.phone} onChange={handleInputChange} maxLength={20} autoComplete="tel" />
                </div>
                <div className="hr-form-field full-width">
                  <label htmlFor="employee-address">Address</label>
                  <textarea id="employee-address" className="form-control" name="address" value={form.address} onChange={handleInputChange} maxLength={300} rows={2} />
                </div>
              </div>

              {formError && <div className="alert alert-danger mt-3 mb-0" role="alert">{formError}</div>}

              <div className="hr-modal-actions">
                <button type="button" className="btn btn-light" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="hr-add-button" disabled={saving}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Creating...</>
                  ) : (
                    <><i className="bi bi-person-plus-fill" /> Create Employee</>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editingEmployee && (
        <div
          className="hr-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditModal();
          }}
        >
          <section className="hr-modal" role="dialog" aria-modal="true" aria-labelledby="hr-edit-title">
            <div className="hr-modal-header">
              <div>
                <span className="hr-modal-eyebrow">HUMAN RESOURCES</span>
                <h2 id="hr-edit-title">Edit Employee</h2>
                <p>Update employment information for {editingEmployee.user?.name || "this employee"}.</p>
              </div>
              <button className="hr-modal-close" onClick={closeEditModal} disabled={savingEdit} aria-label="Close edit form">
                &times;
              </button>
            </div>

            <form onSubmit={handleEditEmployee}>
              <div className="hr-form-grid">
                <div className="hr-form-field">
                  <label htmlFor="edit-employee-id">Employee ID *</label>
                  <input id="edit-employee-id" className="form-control" name="employeeId" value={editForm.employeeId} onChange={handleEditInputChange} required maxLength={50} />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="edit-department">Department *</label>
                  <input id="edit-department" className="form-control" name="department" value={editForm.department} onChange={handleEditInputChange} required maxLength={100} />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="edit-designation">Designation *</label>
                  <input id="edit-designation" className="form-control" name="designation" value={editForm.designation} onChange={handleEditInputChange} required maxLength={100} />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="edit-joining-date">Joining Date *</label>
                  <input id="edit-joining-date" className="form-control" type="date" name="joiningDate" value={editForm.joiningDate} onChange={handleEditInputChange} max={new Date().toISOString().slice(0, 10)} required />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="edit-phone">Phone Number</label>
                  <input id="edit-phone" className="form-control" type="tel" name="phone" value={editForm.phone} onChange={handleEditInputChange} maxLength={20} />
                </div>
                <div className="hr-form-field">
                  <label htmlFor="edit-status">Employment Status *</label>
                  <select id="edit-status" className="form-select" name="employmentStatus" value={editForm.employmentStatus} onChange={handleEditInputChange} required>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div className="hr-form-field full-width">
                  <label htmlFor="edit-address">Address</label>
                  <textarea id="edit-address" className="form-control" name="address" value={editForm.address} onChange={handleEditInputChange} maxLength={300} rows={2} />
                </div>
              </div>

              {editError && <div className="alert alert-danger mt-3 mb-0" role="alert">{editError}</div>}

              <div className="hr-modal-actions">
                <button type="button" className="btn btn-light" onClick={closeEditModal} disabled={savingEdit}>Cancel</button>
                <button type="submit" className="hr-add-button" disabled={savingEdit}>
                  {savingEdit ? (
                    <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Saving...</>
                  ) : (
                    <><i className="bi bi-check-lg" /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default HrDashboard;