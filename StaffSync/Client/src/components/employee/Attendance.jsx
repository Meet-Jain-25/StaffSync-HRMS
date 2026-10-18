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

const formatHours = (hours) => {
  if (hours === null || hours === undefined) return "—";

  return `${Number(hours).toFixed(2)} hrs`;
};

function Attendance() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/attendance/my");
      const records = response.data.attendance || [];

      setAttendanceHistory(records);

      // Match today's calendar date using the browser's local timezone.
      const today = new Date();
      const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      const todayRecord = records.find((record) => {
        const date = new Date(record.date);

        const recordKey = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-");

        return recordKey === todayKey;
      });

      setTodayAttendance(todayRecord || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleAttendanceAction = async (action) => {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(`/attendance/${action}`);

      setMessage(response.data.message || "Attendance updated successfully.");

      // Refresh attendance history and today's status.
      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update attendance. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="attendance-page">
        <div className="attendance-loading">
          <div className="attendance-spinner" />
          <p>Loading your attendance...</p>
        </div>
      </section>
    );
  }

  const checkedIn = Boolean(todayAttendance?.checkIn);
  const checkedOut = Boolean(todayAttendance?.checkOut);

  return (
    <section className="attendance-page">
      <header className="attendance-header">
        <div>
          <span className="attendance-eyebrow">EMPLOYEE SELF-SERVICE</span>
          <h1>My Attendance</h1>
          <p>Manage your daily attendance and review your work hours.</p>
        </div>

        <div className="attendance-date">
          <span>Today's Date</span>
          <strong>
            {new Date().toLocaleDateString([], {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
      </header>

      {error && (
        <div className="attendance-alert attendance-alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {message && (
        <div
          className="attendance-alert attendance-alert-success"
          role="status"
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <div className="attendance-summary-grid">
        <article className="attendance-summary-card">
          <span className="attendance-card-label">Today's Status</span>

          <div className="attendance-status-row">
            <span
              className={`attendance-status-dot ${
                checkedOut
                  ? "is-complete"
                  : checkedIn
                    ? "is-active"
                    : "is-pending"
              }`}
            />

            <strong>
              {checkedOut
                ? "Completed"
                : checkedIn
                  ? "Checked In"
                  : "Not Checked In"}
            </strong>
          </div>

          <p>
            {checkedOut
              ? "Your attendance is complete for today."
              : checkedIn
                ? "Remember to check out before leaving."
                : "Check in when you begin your workday."}
          </p>
        </article>

        <article className="attendance-summary-card">
          <span className="attendance-card-label">Check-In Time</span>
          <strong className="attendance-card-value">
            {formatTime(todayAttendance?.checkIn)}
          </strong>
          <p>Your recorded start time</p>
        </article>

        <article className="attendance-summary-card">
          <span className="attendance-card-label">Check-Out Time</span>
          <strong className="attendance-card-value">
            {formatTime(todayAttendance?.checkOut)}
          </strong>
          <p>Your recorded finish time</p>
        </article>

        <article className="attendance-summary-card">
          <span className="attendance-card-label">Total Work Hours</span>
          <strong className="attendance-card-value">
            {formatHours(todayAttendance?.totalHours)}
          </strong>
          <p>Calculated from your recorded times</p>
        </article>
      </div>

      <section className="attendance-action-panel">
        <div className="attendance-action-copy">
          <span className="attendance-eyebrow">DAILY TIME TRACKING</span>
          <h2>Manage today's attendance</h2>
          <p>
            Your attendance is recorded securely against your employee
            account.
          </p>
        </div>

        <div className="attendance-action-buttons">
          <button
            type="button"
            className="attendance-button attendance-button-checkin"
            onClick={() => handleAttendanceAction("check-in")}
            disabled={actionLoading || checkedIn}
          >
            {actionLoading && !checkedIn ? "Processing..." : "Check In"}
          </button>

          <button
            type="button"
            className="attendance-button attendance-button-checkout"
            onClick={() => handleAttendanceAction("check-out")}
            disabled={actionLoading || !checkedIn || checkedOut}
          >
            {actionLoading ? "Processing..." : "Check Out"}
          </button>
        </div>
      </section>

      <section className="attendance-history-panel">
        <div className="attendance-history-header">
          <div>
            <span className="attendance-eyebrow">YOUR RECORDS</span>
            <h2>Attendance History</h2>
          </div>

          <button
            type="button"
            className="attendance-refresh-button"
            onClick={loadAttendance}
            disabled={loading || actionLoading}
          >
            ↻ Refresh
          </button>
        </div>

        {attendanceHistory.length === 0 ? (
          <div className="attendance-empty-state">
            <h3>No attendance records yet</h3>
            <p>Your recorded attendance will appear here.</p>
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendanceHistory.map((record) => (
                  <tr key={record._id}>
                    <td>{formatDate(record.date)}</td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>{formatHours(record.totalHours)}</td>
                    <td>
                      <span
                        className={`attendance-history-status status-${(
                          record.status || "present"
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {record.status || "Present"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default Attendance;