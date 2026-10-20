import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const initialForm = {
  title: "",
  description: "",
  trainer: "",
  department: "",
  startDate: "",
  endDate: "",
  location: "",
  status: "Upcoming",
};

function TrainingManagement() {
  const [trainings, setTrainings] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (statusFilter !== "All") {
        params.status = statusFilter;
      }

      const response = await api.get("/training", { params });

      setTrainings(response.data.trainings || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load training programs."
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (editingId) {
        const response = await api.patch(
          `/training/${editingId}`,
          form
        );

        setMessage(
          response.data.message ||
            "Training program updated successfully."
        );
      } else {
        const response = await api.post("/training", form);

        setMessage(
          response.data.message ||
            "Training program created successfully."
        );
      }

      resetForm();
      await fetchTrainings();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the training program."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (training) => {
    setError("");
    setMessage("");

    setEditingId(training._id);

    setForm({
      title: training.title || "",
      description: training.description || "",
      trainer: training.trainer || "",
      department: training.department || "",
      startDate: training.startDate
        ? new Date(training.startDate).toISOString().slice(0, 10)
        : "",
      endDate: training.endDate
        ? new Date(training.endDate).toISOString().slice(0, 10)
        : "",
      location: training.location || "",
      status: training.status || "Upcoming",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (trainingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this training program?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(trainingId);

    try {
      const response = await api.delete(`/training/${trainingId}`);

      setMessage(
        response.data.message ||
          "Training program deleted successfully."
      );

      if (editingId === trainingId) {
        resetForm();
      }

      await fetchTrainings();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the training program."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Upcoming":
        return "text-bg-primary";
      case "Ongoing":
        return "text-bg-success";
      case "Completed":
        return "text-bg-secondary";
      case "Cancelled":
        return "text-bg-danger";
      default:
        return "text-bg-warning";
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Training Management</h2>

          <p className="text-secondary mb-0">
            Create and manage employee training programs.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={fetchTrainings}
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

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="fw-semibold mb-3">
            {editingId ? "Edit Training Program" : "Create Training Program"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="training-title" className="form-label">
                  Training Title *
                </label>

                <input
                  id="training-title"
                  name="title"
                  className="form-control"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="training-trainer" className="form-label">
                  Trainer *
                </label>

                <input
                  id="training-trainer"
                  name="trainer"
                  className="form-control"
                  value={form.trainer}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="training-department" className="form-label">
                  Department *
                </label>

                <input
                  id="training-department"
                  name="department"
                  className="form-control"
                  value={form.department}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="training-location" className="form-label">
                  Location *
                </label>

                <input
                  id="training-location"
                  name="location"
                  className="form-control"
                  value={form.location}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
              </div>

              <div className="col-12">
                <label
                  htmlFor="training-description"
                  className="form-label"
                >
                  Description *
                </label>

                <textarea
                  id="training-description"
                  name="description"
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={2000}
                  required
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="training-start-date" className="form-label">
                  Start Date *
                </label>

                <input
                  id="training-start-date"
                  name="startDate"
                  type="date"
                  className="form-control"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="training-end-date" className="form-label">
                  End Date *
                </label>

                <input
                  id="training-end-date"
                  name="endDate"
                  type="date"
                  className="form-control"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="training-status" className="form-label">
                  Status
                </label>

                <select
                  id="training-status"
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-12 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Training"
                      : "Create Training"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <h5 className="fw-semibold mb-0">
              Training Programs
            </h5>

            <div className="d-flex align-items-center gap-2">
              <label htmlFor="training-filter" className="form-label mb-0">
                Status:
              </label>

              <select
                id="training-filter"
                className="form-select"
                style={{ width: "auto", minWidth: "150px" }}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
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
                Loading training programs...
              </p>
            </div>
          ) : trainings.length === 0 ? (
            <div className="alert alert-light border mb-0">
              No training programs found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Trainer</th>
                    <th>Department</th>
                    <th>Dates</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {trainings.map((training) => (
                    <tr key={training._id}>
                      <td style={{ minWidth: "180px" }}>
                        <strong>{training.title}</strong>
                        <div
                          className="small text-secondary text-break"
                          style={{ maxWidth: "280px" }}
                        >
                          {training.description}
                        </div>
                      </td>

                      <td>{training.trainer}</td>

                      <td>{training.department}</td>

                      <td className="text-nowrap">
                        {formatDate(training.startDate)}
                        <br />
                        <small className="text-secondary">
                          to {formatDate(training.endDate)}
                        </small>
                      </td>

                      <td>{training.location}</td>

                      <td>
                        <span className={`badge ${getStatusClass(training.status)}`}>
                          {training.status}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEdit(training)}
                            disabled={deletingId !== null}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(training._id)}
                            disabled={deletingId !== null}
                          >
                            {deletingId === training._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
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

export default TrainingManagement;