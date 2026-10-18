import { useEffect, useState } from "react";
import api from "../../services/api";

function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const loadLeaves = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/leave/my");
      setLeaves(response.data.leaves || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.endDate < form.startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/leave", form);

      setSuccess("Your leave request has been submitted successfully.");

      setForm({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      await loadLeaves();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "text-bg-success";
      case "Rejected":
        return "text-bg-danger";
      default:
        return "text-bg-warning";
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Leave Management</h3>
          <p className="text-secondary mb-0">
            Apply for leave and track your applications.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadLeaves}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* Apply for Leave */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="fw-semibold mb-4">Apply for Leave</h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="leaveType" className="form-label">
                  Leave Type
                </label>

                <select
                  id="leaveType"
                  name="leaveType"
                  className="form-select"
                  value={form.leaveType}
                  onChange={handleChange}
                  required
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="startDate" className="form-label">
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="endDate" className="form-label">
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={form.endDate}
                  onChange={handleChange}
                  min={form.startDate || undefined}
                  required
                />
              </div>

              <div className="col-12">
                <label htmlFor="reason" className="form-label">
                  Reason for Leave
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  className="form-control"
                  rows="4"
                  maxLength="500"
                  placeholder="Explain why you need leave..."
                  value={form.reason}
                  onChange={handleChange}
                  required
                />

                <div className="form-text">
                  Maximum 500 characters.
                </div>
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Submit Leave Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Leave History */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="fw-semibold mb-3">My Leave Requests</h5>

          {loading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-secondary mt-2 mb-0">
                Loading leave requests...
              </p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="alert alert-light border mb-0">
              You haven't submitted any leave requests yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>

                      <td>
                        {new Date(leave.startDate).toLocaleDateString(
                          "en-IN",
                          { timeZone: "UTC" }
                        )}
                      </td>

                      <td>
                        {new Date(leave.endDate).toLocaleDateString(
                          "en-IN",
                          { timeZone: "UTC" }
                        )}
                      </td>

                      <td>
                        <span
                          className="d-inline-block text-break"
                          style={{ maxWidth: "200px" }}
                        >
                          {leave.reason}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td>
                        {leave.reviewRemarks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveManagement;