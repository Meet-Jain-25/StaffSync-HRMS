import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const initialForm = {
  title: "",
  message: "",
  category: "General",
};

const categories = ["General", "HR", "Event", "Policy", "Urgent"];

function HRAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/announcements");
      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load announcements. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const title = form.title.trim();
    const message = form.message.trim();

    if (!title || !message) {
      setError("Please provide both a title and a message.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const response = await api.patch(
          `/announcements/${editingId}`,
          {
            title,
            message,
            category: form.category,
          }
        );

        setSuccessMessage(
          response.data.message || "Announcement updated successfully."
        );
      } else {
        const response = await api.post("/announcements", {
          title,
          message,
          category: form.category,
        });

        setSuccessMessage(
          response.data.message || "Announcement created successfully."
        );
      }

      resetForm();
      await fetchAnnouncements();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the announcement. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement._id);

    setForm({
      title: announcement.title || "",
      message: announcement.message || "",
      category: announcement.category || "General",
    });

    setError("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (announcement) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${announcement.title}"?`
    );

    if (!confirmed) return;

    setDeletingId(announcement._id);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.delete(
        `/announcements/${announcement._id}`
      );

      setSuccessMessage(
        response.data.message || "Announcement deleted successfully."
      );

      if (editingId === announcement._id) {
        resetForm();
      }

      await fetchAnnouncements();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the announcement. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const categoryClass = {
    General: "text-bg-primary",
    HR: "text-bg-info",
    Event: "text-bg-success",
    Policy: "text-bg-secondary",
    Urgent: "text-bg-danger",
  };

  const filteredAnnouncements =
    categoryFilter === "All"
      ? announcements
      : announcements.filter(
          (announcement) => announcement.category === categoryFilter
        );

  return (
    <section>
      {/* Create / Edit Form */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
            <div>
              <h3 className="fw-bold mb-1">
                {editingId ? "Edit Announcement" : "Publish Announcement"}
              </h3>

              <p className="text-secondary mb-0">
                {editingId
                  ? "Update an existing company announcement."
                  : "Share important updates with employees and managers."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="announcement-title" className="form-label">
                Announcement Title *
              </label>

              <input
                id="announcement-title"
                type="text"
                name="title"
                className="form-control"
                placeholder="Enter announcement title"
                value={form.title}
                onChange={handleInputChange}
                maxLength={150}
                required
              />

              <div className="form-text">
                {form.title.length}/150 characters
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="announcement-message" className="form-label">
                Message *
              </label>

              <textarea
                id="announcement-message"
                name="message"
                className="form-control"
                rows={5}
                placeholder="Write the announcement details..."
                value={form.message}
                onChange={handleInputChange}
                maxLength={5000}
                required
              />

              <div className="form-text">
                {form.message.length}/5000 characters
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="announcement-category" className="form-label">
                Category *
              </label>

              <select
                id="announcement-category"
                name="category"
                className="form-select"
                value={form.category}
                onChange={handleInputChange}
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success" role="status">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <i
                    className={`bi ${
                      editingId ? "bi-check-lg" : "bi-megaphone"
                    } me-2`}
                  />
                  {editingId ? "Save Changes" : "Publish Announcement"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Announcements List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h3 className="fw-bold mb-1">All Announcements</h3>
              <p className="text-secondary mb-0">
                {announcements.length} announcement
                {announcements.length === 1 ? "" : "s"} published
              </p>
            </div>

            <div className="d-flex gap-2">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter announcements by category"
              >
                <option value="All">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={fetchAnnouncements}
                disabled={loading}
                aria-label="Refresh announcements"
                title="Refresh announcements"
              >
                <i className="bi bi-arrow-clockwise" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Loading announcements...
                </span>
              </div>

              <p className="text-secondary mt-3">
                Loading announcements...
              </p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-megaphone fs-1 text-secondary" />

              <h5 className="mt-3">
                {announcements.length === 0
                  ? "No announcements published yet"
                  : "No announcements in this category"}
              </h5>

              <p className="text-secondary mb-0">
                {announcements.length === 0
                  ? "Use the form above to publish your first announcement."
                  : "Choose another category to view more announcements."}
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredAnnouncements.map((announcement) => (
                <article
                  key={announcement._id}
                  className="border rounded-3 p-3 p-md-4"
                >
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div className="flex-grow-1">
                      <span
                        className={`badge ${
                          categoryClass[announcement.category] ||
                          "text-bg-secondary"
                        } mb-2`}
                      >
                        {announcement.category || "General"}
                      </span>

                      <h5 className="fw-bold mb-2">
                        {announcement.title}
                      </h5>

                      <p
                        className="text-secondary mb-3"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {announcement.message}
                      </p>

                      <div className="small text-secondary">
                        <div>
                          <i className="bi bi-person-circle me-2" />
                          Published by{" "}
                          {announcement.createdBy?.name || "StaffSync Team"}
                        </div>

                        <div className="mt-1">
                          <i className="bi bi-clock me-2" />
                          {formatDate(announcement.createdAt)}
                        </div>

                        {announcement.updatedAt &&
                          announcement.createdAt &&
                          new Date(announcement.updatedAt).getTime() !==
                            new Date(announcement.createdAt).getTime() && (
                            <div className="mt-1">
                              <i className="bi bi-pencil me-2" />
                              Updated {formatDate(announcement.updatedAt)}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(announcement)}
                        disabled={saving || deletingId !== null}
                      >
                        <i className="bi bi-pencil-square me-1" />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(announcement)}
                        disabled={deletingId !== null || saving}
                      >
                        {deletingId === announcement._id ? (
                          "Deleting..."
                        ) : (
                          <>
                            <i className="bi bi-trash me-1" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HRAnnouncements;