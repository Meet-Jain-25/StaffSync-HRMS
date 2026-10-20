import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const getCategoryClass = (category) => {
    const classes = {
      General: "text-bg-primary",
      HR: "text-bg-info",
      Event: "text-bg-success",
      Policy: "text-bg-secondary",
      Urgent: "text-bg-danger",
    };

    return classes[category] || "text-bg-secondary";
  };

  return (
    <section>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Announcements</h2>
          <p className="text-secondary mb-0">
            Stay informed about the latest company updates.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={fetchAnnouncements}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            aria-label="Loading announcements"
          ></div>
          <p className="text-secondary mt-3">
            Loading announcements...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}

          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchAnnouncements}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && announcements.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-megaphone fs-1 text-secondary"></i>

            <h5 className="mt-3">No announcements yet</h5>

            <p className="text-secondary mb-0">
              Company announcements will appear here when they are published.
            </p>
          </div>
        </div>
      )}

      {/* Announcement List */}
      {!loading && !error && announcements.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {announcements.map((announcement) => (
            <article
              key={announcement._id}
              className="card border-0 shadow-sm"
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <span
                    className={`badge ${getCategoryClass(
                      announcement.category
                    )}`}
                  >
                    {announcement.category || "General"}
                  </span>

                  <small className="text-secondary">
                    <i className="bi bi-clock me-1"></i>
                    {formatDate(announcement.createdAt)}
                  </small>
                </div>

                <h5 className="fw-bold mb-2">
                  {announcement.title}
                </h5>

                <p
                  className="mb-3"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {announcement.message}
                </p>

                <div className="border-top pt-3">
                  <small className="text-secondary">
                    <i className="bi bi-person-circle me-2"></i>
                    Published by{" "}
                    {announcement.createdBy?.name || "StaffSync Team"}
                  </small>

                  {announcement.updatedAt &&
                    announcement.createdAt &&
                    new Date(announcement.updatedAt).getTime() !==
                      new Date(announcement.createdAt).getTime() && (
                      <small className="text-secondary ms-3">
                        <i className="bi bi-pencil me-1"></i>
                        Updated {formatDate(announcement.updatedAt)}
                      </small>
                    )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Announcements;