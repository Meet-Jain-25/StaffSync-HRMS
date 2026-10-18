import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function HRLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [message, setMessage] = useState("");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (statusFilter !== "All") {
        params.status = statusFilter;
      }

      const response = await api.get("/leave", { params });
      setLeaves(response.data.leaves || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleReview = async (leaveId, status) => {
    setError("");
    setMessage("");

    setReviewingId(leaveId);

    try {
      const response = await api.patch(
        `/leave/${leaveId}/review`,
        {
          status,
          reviewRemarks: remarks[leaveId] || "",
        }
      );

      setMessage(
        response.data.message ||
          `Leave request ${status.toLowerCase()} successfully.`
      );

      await fetchLeaves();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${status.toLowerCase()} this request.`
      );
    } finally {
      setReviewingId(null);
    }
  };

  const statusClass = (status) => {
    if (status === "Approved") return "text-bg-success";
    if (status === "Rejected") return "text-bg-danger";
    return "text-bg-warning";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      timeZone: "UTC",
    });
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Leave Management</h2>
          <p className="text-secondary mb-0">
            Review and manage employee leave requests.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={fetchLeaves}
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

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <h5 className="fw-semibold mb-0">
              Employee Leave Requests
            </h5>

            <div>
              <label
                htmlFor="leave-status-filter"
                className="form-label me-2"
              >
                Filter:
              </label>

              <select
                id="leave-status-filter"
                className="form-select d-inline-block"
                style={{ width: "auto", minWidth: "150px" }}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="All">All Requests</option>
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
              <p className="text-secondary mt-2 mb-0">
                Loading leave requests...
              </p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="alert alert-light border mb-0">
              No {statusFilter === "All" ? "" : statusFilter.toLowerCase() + " "}
              leave requests found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Review Remarks</th>
                    {statusFilter !== "Approved" &&
                      statusFilter !== "Rejected" && (
                        <th>Actions</th>
                      )}
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => {
                    const employee = leave.employee;
                    const employeeName =
                      employee?.user?.name || "Unknown employee";
                    const department =
                      employee?.department || "—";
                    const isPending = leave.status === "Pending";

                    return (
                      <tr key={leave._id}>
                        <td>
                          <strong>{employeeName}</strong>
                          <br />
                          <small className="text-secondary">
                            {employee?.employeeId || ""}
                          </small>
                        </td>

                        <td>{department}</td>

                        <td>{leave.leaveType}</td>

                        <td className="text-nowrap">
                          {formatDate(leave.startDate)}
                          <br />
                          <small className="text-secondary">
                            to {formatDate(leave.endDate)}
                          </small>
                        </td>

                        <td style={{ minWidth: "160px", maxWidth: "240px" }}>
                          <div className="text-break">
                            {leave.reason}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`badge ${statusClass(
                              leave.status
                            )}`}
                          >
                            {leave.status}
                          </span>
                        </td>

                        <td style={{ minWidth: "180px" }}>
                          {leave.reviewRemarks || "—"}
                        </td>

                        {statusFilter !== "Approved" &&
                          statusFilter !== "Rejected" && (
                            <td style={{ minWidth: "220px" }}>
                              {isPending ? (
                                <div>
                                  <textarea
                                    className="form-control form-control-sm mb-2"
                                    rows="2"
                                    maxLength={500}
                                    placeholder="Optional review remarks"
                                    aria-label={`Review remarks for ${employeeName}`}
                                    value={remarks[leave._id] || ""}
                                    onChange={(event) =>
                                      setRemarks((previous) => ({
                                        ...previous,
                                        [leave._id]: event.target.value,
                                      }))
                                    }
                                  />

                                  <div className="d-flex gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-success btn-sm"
                                      disabled={
                                        reviewingId !== null
                                      }
                                      onClick={() =>
                                        handleReview(
                                          leave._id,
                                          "Approved"
                                        )
                                      }
                                    >
                                      {reviewingId === leave._id
                                        ? "Saving..."
                                        : "Approve"}
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      disabled={
                                        reviewingId !== null
                                      }
                                      onClick={() =>
                                        handleReview(
                                          leave._id,
                                          "Rejected"
                                        )
                                      }
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                "Already reviewed"
                              )}
                            </td>
                          )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRLeaveManagement;