import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import "./MyBooking.css";

import BookingCard from "./components/myBooking/BookingCard";
import CancelModal from "./components/myBooking/CancelModal";
import MyBookingNavbar from "./components/myBooking/MyBookingNavbar";
import {
  formatFare,
  getStoredUserId,
  normalizeBooking,
  toDateOnly,
} from "./components/myBooking/myBookingUtils";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MyBooking = () => {
  const { profile, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState(null);

  const firstName = profile?.firstName || "User";

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const userId = profile?.userId || profile?.id || getStoredUserId();
      if (!userId) {
        setError("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`http://localhost:8090/api/booking/my-flights/${userId}`);
        const data = Array.isArray(res.data) ? res.data : [];
        setBookings(data.map(normalizeBooking));
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load your bookings right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [profile]);

  const grouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.reduce(
      (acc, b) => {
        const jd = toDateOnly(b.journeyDate);
        if (jd && jd < today) acc.past.push(b);
        else acc.upcoming.push(b);
        return acc;
      },
      { upcoming: [], past: [] }
    );
  }, [bookings]);

  const visible = grouped[activeTab];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCancelConfirm = async (reservationId) => {
    console.log("Cancelling reservation:", reservationId);
    if (!reservationId) return;

    try {
      setCancelling(true);
      await axios.delete(`http://localhost:8090/api/booking/cancel/${reservationId}`);
      setBookings((prev) =>
        prev.map((b) =>
          b.reservationId === reservationId ? { ...b, bookingStatus: 0 } : b
        )
      );
      showToast("Booking cancelled successfully.", "danger");
    } catch {
      showToast("Failed to cancel booking. Please try again.", "danger");
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.amountPaid || 0), 0);

  return (
    <main className="mb-page">
      <div className="mb-stars" aria-hidden />

      <MyBookingNavbar
        navigate={navigate}
        theme={theme}
        toggleTheme={toggleTheme}
        firstName={firstName}
        onLogout={handleLogout}
      />

      <section className="mb-hero">
        <div className="mb-hero-runway" aria-hidden />
        <div className="mb-hero-plane" aria-hidden>✈</div>

        <h1 className="mb-hero-title">
          My <em>Bookings</em>
        </h1>
        <p className="mb-hero-sub">
          Track your journeys, manage reservations, and relive every adventure — all in one place.
        </p>

        <div className="mb-hero-stats">
          <div className="mb-stat">
            <span className="mb-stat-num">{grouped.upcoming.length}</span>
            <span className="mb-stat-label">Upcoming</span>
          </div>
          <div className="mb-stat-divider" />
          <div className="mb-stat">
            <span className="mb-stat-num">{grouped.past.length}</span>
            <span className="mb-stat-label">Completed</span>
          </div>
          <div className="mb-stat-divider" />
          <div className="mb-stat">
            <span className="mb-stat-num">{formatFare(totalSpent)}</span>
            <span className="mb-stat-label">Total Spent</span>
          </div>
        </div>
      </section>

      <div className="mb-shell">
        <div className="mb-tabs" role="tablist">
          {[
            { key: "upcoming", label: "Upcoming", icon: "✈" },
            { key: "past", label: "Past", icon: "🕐" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              className={`mb-tab${activeTab === key ? " active" : ""}`}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
            >
              {icon} {label}
              <span className="mb-tab-count">{grouped[key].length}</span>
            </button>
          ))}
        </div>

        {!loading && !error && visible.length > 0 && (
          <div className="mb-filter-bar">
            <p className="mb-filter-info">
              Showing <strong>{visible.length}</strong> {activeTab === "upcoming" ? "upcoming" : "past"}{" "}
              {visible.length === 1 ? "journey" : "journeys"}
            </p>
          </div>
        )}

        {loading && (
          <div className="mb-state">
            <div className="mb-loading-plane">✈</div>
            <p className="mb-loading-text">Fetching your journeys…</p>
          </div>
        )}

        {!loading && error && (
          <div className="mb-state">
            <div className="mb-state-icon">🚫</div>
            <h2 className="mb-state-title">Something went wrong</h2>
            <p className="mb-state-sub">{error}</p>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="mb-state">
            <div className="mb-state-icon">{activeTab === "upcoming" ? "🛫" : "🗺"}</div>
            <h2 className="mb-state-title">
              {activeTab === "upcoming" ? "No upcoming flights" : "No past journeys"}
            </h2>
            <p className="mb-state-sub">
              {activeTab === "upcoming"
                ? "Your runway is clear. Book your next adventure!"
                : "Your flight history will appear here after your first journey."}
            </p>
            {activeTab === "upcoming" && (
              <button
                className="bc-btn bc-btn-primary"
                style={{ margin: "24px auto 0", display: "inline-flex" }}
                onClick={() => navigate("/")}
              >
                ✈ Explore Flights
              </button>
            )}
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="mb-list">
            {visible.map((booking, i) => (
              <BookingCard
                key={booking.reservationId || booking.scheduleId || i}
                booking={booking}
                type={activeTab}
                onCancel={(b) => setCancelTarget(b)}
              />
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => !cancelling && setCancelTarget(null)}
          loading={cancelling}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 500,
            background: toast.type === "danger" ? "rgba(224,85,85,0.15)" : "rgba(76,175,125,0.15)",
            border: `1.5px solid ${toast.type === "danger" ? "rgba(224,85,85,0.4)" : "rgba(76,175,125,0.4)"}`,
            color: toast.type === "danger" ? "#ff9b9b" : "#4caf7d",
            borderRadius: 12,
            padding: "14px 22px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.88rem",
            backdropFilter: "blur(10px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            animation: "fadeSlideDown 0.3s ease",
            maxWidth: 340,
          }}
        >
          ✓ {toast.msg}
        </div>
      )}
    </main>
  );
};

export default MyBooking;
