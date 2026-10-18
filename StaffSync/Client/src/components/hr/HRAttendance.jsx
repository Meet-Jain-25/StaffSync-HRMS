import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const formatTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function HRAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/attendance");

      const records = response.data.attendance
        ?? response.data.records
        ?? response.data;

      if (!Array.isArray(records)) {
        throw new Error("Unexpected attendance response from server.");
      }

      setAttendance(records);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const filteredAttendance = attendance.filter((record) => {
    const employee = record.employee || {};
    const employeeUser = employee.user || {};

    const searchText = [
      employeeUser.name,
      employeeUser.email,
      employee.employeeId,
      employee.department,
      employee.designation,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const recordDate = record.date
      ? new Date(record.date)
      : null;

    const recordDateKey = recordDate
      ? [
          recordDate.getFullYear(),
          String(recordDate.getMonth() + 1).padStart(2, "0"),
          String(recordDate.getDate()).padStart(2, "0"),
        ].join("-")
      : "";

    const matchesDate =
      !selectedDate || recordDateKey === selectedDate;

    const matchesStatus =
      selectedStatus === "All" ||
      record.status === selectedStatus;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const presentCount = filteredAttendance.filter(
    (record) => record.status === "Present"
  ).length;

  const lateCount = filteredAttendance.filter(
    (record) => record.status === "Late"
  ).length;

  const completedCount = filteredAttendance.filter(
    (record) => Boolean(record.checkOut)
  ).length;

  const totalHours = filteredAttendance.reduce(
    (total, record) => total + Number(record.totalHours || 0),
    0
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "text-bg-success";
      case "Late":
        return "text-bg-warning";
      case "Absent":
        return "text-bg-danger";
      case "Half Day":
        return "text-bg-info";
      default:
        return "text-bg-secondary";
    }
  };

  return (
    <div className="hr-attendance-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Attendance Management</h2>
          <p className="text-secondary mb-0">
            Monitor employee attendance and working hours.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadAttendance}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={loadAttendance}
          >
            Retry
          </button>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary mb-1">Total Records</p>
                  <h3 className="fw-bold mb-0">
                    {filteredAttendance.length}
                  </h3>
                </div>
                <i className="bi bi-people fs-2 text-primary"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary mb-1">Present</p>
                  <h3 className="fw-bold mb-0">{presentCount}</h3>
                </div>
                <i className="bi bi-person-check fs-2 text-success"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary mb-1">Late Arrivals</p>
                  <h3 className="fw-bold mb-0">{lateCount}</h3>
                </div>
                <i className="bi bi-clock-history fs-2 text-warning"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary mb-1">Working Hours</p>
                  <h3 className="fw-bold mb-0">
                    {totalHours.toFixed(2)}
                  </h3>
                  <small className="text-secondary">Hours recorded</small>
                </div>
                <i className="bi bi-hourglass-split fs-2 text-info"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h5 className="fw-bold mb-1">Employee Attendance Records</h5>
              <p className="text-secondary mb-0">
                Search, filter, and review attendance.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearch("");
                setSelectedDate("");
                setSelectedStatus("All");
              }}
            >
              Clear Filters
            </button>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-5">
              <label htmlFor="attendanceSearch" className="form-label">
                Search Employee
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  id="attendanceSearch"
                  type="text"
                  className="form-control"
                  placeholder="Name, email, employee ID..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <label htmlFor="attendanceDate" className="form-label">
                Filter by Date
              </label>
              <input
                id="attendanceDate"
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <div className="col-lg-4 col-md-6">
              <label htmlFor="attendanceStatus" className="form-label">
                Attendance Status
              </label>
              <select
                id="attendanceStatus"
                className="form-select"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value)
                }
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-secondary mt-3 mb-0">
                Loading attendance records...
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map((record) => {
                    const employee = record.employee || {};
                    const employeeUser = employee.user || {};

                    return (
                      <tr key={record._id}>
                        <td>
                          <div className="fw-semibold">
                            {employeeUser.name || "Unknown Employee"}
                          </div>
                          <small className="text-secondary">
                            {employeeUser.email || "—"}
                          </small>
                        </td>

                        <td>{employee.employeeId || "—"}</td>
                        <td>{formatDate(record.date)}</td>
                        <td>{formatTime(record.checkIn)}</td>
                        <td>{formatTime(record.checkOut)}</td>
                        <td>
                          {record.checkOut
                            ? `${Number(record.totalHours || 0).toFixed(2)} hrs`
                            : "In progress"}
                        </td>
                        <td>
                          <span
                            className={`badge ${getStatusClass(record.status)}`}
                          >
                            {record.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredAttendance.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <i className="bi bi-calendar-x fs-2 text-secondary"></i>
                        <p className="fw-semibold mt-2 mb-1">
                          No attendance records found
                        </p>
                        <p className="text-secondary small mb-0">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredAttendance.length > 0 && (
            <div className="d-flex flex-wrap justify-content-between gap-2 mt-3">
              <small className="text-secondary">
                Showing {filteredAttendance.length} record(s)
              </small>
              <small className="text-secondary">
                Completed check-outs: {completedCount}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRAttendance;