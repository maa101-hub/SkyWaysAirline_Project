import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
// import "./MyBooking.css";

/* ─── axios auth interceptor ─── */
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ─── Helpers ─── */
const getStoredUserId = () =>
  localStorage.getItem("userId") ||
  localStorage.getItem("userid") ||
  localStorage.getItem("USER_ID") ||
  "";

const toDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value) => {
  const d = toDateOnly(value);
  if (!d) return "N/A";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (value) => {
  if (!value) return "--:--";
  if (/^\d{2}:\d{2}/.test(value)) {
    const [h, m] = value.split(":");
    const d = new Date();
    d.setHours(+h, +m, 0, 0);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const formatFare = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  });

const calcArrivalTime = (dep, dur) => {
  if (!dep || !dur) return "";
  const [h, m] = dep.slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "";
  const total = h * 60 + m + Number(dur);
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== "");

const getCityCode = (v) => (v ? String(v).trim().slice(0, 3).toUpperCase() : "");

/* Airline logo colours */
const LOGO_COLORS = [
  "linear-gradient(135deg,#1a6fa8,#0d3d6b)",
  "linear-gradient(135deg,#c0392b,#8e1a1a)",
  "linear-gradient(135deg,#27ae60,#145a32)",
  "linear-gradient(135deg,#7d3c98,#4a235a)",
  "linear-gradient(135deg,#d4a017,#7a5c00)",
  "linear-gradient(135deg,#2e86c1,#154360)",
];
const getLogoColor = (name = "") => LOGO_COLORS[name.charCodeAt(0) % LOGO_COLORS.length];
const getLogoInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "SW";

/* ─── Normalize booking ─── */
const normalizeBooking = (booking) => {
  const flight =
    booking.flightResponse || booking.flightrespone || booking.flight || booking;
  const passengers =
    booking.passengers || booking.passengerList || booking.passengerDetails || booking.passengerDTOs || [];
  const seatNos =
    booking.seatNos ||
    passengers.map((p) => valueOr(p.seatNo, p.seatNumber, p.seat)).filter(Boolean).join(", ");
  const passengerName =
    booking.passengerName ||
    passengers.map((p) => p.name).filter(Boolean).join(", ") ||
    "Guest";

  const source = valueOr(
    booking.source, flight.source, flight.Source, flight.from, flight.departureCity, flight.origin, "Source"
  );
  const destination = valueOr(
    booking.destination, flight.destination, flight.Destination, flight.to, flight.arrivalCity, flight.dest, "Destination"
  );
  const departureTime = valueOr(booking.departureTime, flight.departureTime, flight.departureDateTime);
  const fromCode = valueOr(booking.fromCode, flight.fromCode, flight.sourceCode, getCityCode(source));
  const toCode = valueOr(booking.toCode, flight.toCode, flight.destinationCode, getCityCode(destination));

  return {
    reservationId: valueOr(booking.reservationId, booking.bookingId, ""),
    scheduleId:    valueOr(booking.scheduleId, flight.scheduleId, ""),
    flightName:    valueOr(booking.flightName, flight.flightName, flight.airlineName, "SkyWays Airline"),
    flightNumber:  valueOr(booking.flightNumber, flight.flightNumber, flight.flightNo, flight.flightId, "Flight"),
    passengerName, passengers, fromCode, toCode, source, destination,
    fromCity: valueOr(booking.fromCity, flight.fromCity, source),
    toCity:   valueOr(booking.toCity,   flight.toCity,   destination),
    departureTime,
    arrivalTime: valueOr(
      booking.arrivalTime, flight.arrivalTime, flight.arrivalDateTime,
      calcArrivalTime(departureTime, flight.travelDuration)
    ),
    bookingDate: booking.bookingDate,
    journeyDate: valueOr(booking.journeyDate, flight.journeyDate, flight.departureDate, flight.date),
    noOfSeats:   valueOr(booking.noOfSeats, booking.seats, booking.passengerCount, passengers.length, 1),
    totalFare:   valueOr(booking.totalFare, booking.fare, flight.fare, flight.price, 0),
    gate:        valueOr(booking.gate,     flight.gate,     "C12"),
    terminal:    valueOr(booking.terminal, flight.terminal, "T3"),
    seatNos:     seatNos || "Pending",
    boardingTime: valueOr(booking.boardingTime, flight.boardingTime, departureTime),
    group:       valueOr(booking.group, flight.group, "E"),
    classType:   valueOr(booking.classType, flight.classType, "Economy"),
    amountPaid:  valueOr(booking.amountPaid, booking.totalFare, booking.fare, flight.fare, 0),
    qrSeed:      valueOr(booking.qrSeed, booking.reservationId, booking.scheduleId, 42),
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus || "Paid",
  };
};

/* ════════════════════════════════════════
   CANCEL MODAL
════════════════════════════════════════ */
const CancelModal = ({ booking, onConfirm, onClose, loading }) => (
  <div className="mb-modal-overlay" onClick={onClose}>
    <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
      <div className="mb-modal-icon">⚠️</div>
      <h2 className="mb-modal-title">Cancel Booking?</h2>
      <p className="mb-modal-sub">
        You're about to cancel your flight from{" "}
        <strong>{booking.source}</strong> to{" "}
        <strong>{booking.destination}</strong> on{" "}
        {formatDate(booking.journeyDate)}.<br />
        This action <strong>cannot be undone.</strong>
      </p>
      <div className="mb-modal-actions">
        <button className="bc-btn bc-btn-ghost" onClick={onClose} disabled={loading}>
          Keep Booking
        </button>
        <button
          className="bc-btn bc-btn-danger"
          onClick={() => onConfirm(booking.reservationId)}
          disabled={loading}
        >
          {loading ? "Cancelling…" : "✕ Cancel Flight"}
        </button>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════
   BOOKING CARD
════════════════════════════════════════ */
const BookingCard = ({ booking, type, onCancel }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const isCancelled = booking.bookingStatus === 0;
  const statusKey   = isCancelled ? "cancelled" : type;
  const statusLabel = isCancelled ? "Cancelled" : type === "past" ? "Completed" : "Confirmed";

  const openBoardingPass = () => {
    navigate("/boarding-pass", {
      state: {
        flightNumber:  booking.flightNumber,
        passengerName: booking.passengerName,
        fromCode:      booking.fromCode,
        toCode:        booking.toCode,
        fromCity:      booking.fromCity,
        toCity:        booking.toCity,
        departureTime: booking.departureTime,
        arrivalTime:   booking.arrivalTime,
        journeyDate:   booking.journeyDate,
        gate:          booking.gate,
        terminal:      booking.terminal,
        seatNos:       booking.seatNos,
        boardingTime:  booking.boardingTime,
        group:         booking.group,
        classType:     booking.classType,
        reservationId: booking.reservationId,
        amountPaid:    booking.amountPaid,
        qrSeed:        booking.qrSeed,
      },
    });
  };

  const MetaItem = ({ icon, label, value, valueClass = "" }) => (
    <div className="bc-meta-item">
      <div className="bc-meta-label">
        <span className="bc-meta-label-icon">{icon}</span>
        {label}
      </div>
      <div className={`bc-meta-value ${valueClass}`}>{value}</div>
    </div>
  );

  return (
    <article
      className="bc"
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent bar */}
      <div className={`bc-accent-bar ${statusKey}`} />

      <div className="bc-body">
        {/* ── Top row ── */}
        <div className="bc-top">
          <div className="bc-airline-row">
            <div
              className="bc-logo"
              style={{ background: getLogoColor(booking.flightName) }}
            >
              {getLogoInitials(booking.flightName)}
            </div>
            <div>
              <div className="bc-airline-name">{booking.flightName}</div>
              <div className="bc-flight-code">✈ {booking.flightNumber}</div>
            </div>
          </div>

          <div className={`bc-status ${statusKey}`}>
            <span className="bc-status-dot" />
            {statusLabel}
          </div>
        </div>

        {/* ── Route visual ── */}
        <div className="bc-route">
          {/* Departure */}
          <div className="bc-route-city">
            <div className="bc-time">{formatTime(booking.departureTime)}</div>
            <div className="bc-iata">{booking.fromCode}</div>
            <div className="bc-city-name">{booking.fromCity || booking.source}</div>
          </div>

          {/* Path */}
          <div className="bc-path">
            <div className="bc-duration">
              ⏱ {booking.travelDuration || "Direct"}
            </div>
            <div className="bc-track">
              <div className="bc-track-dot" />
              <div className="bc-track-line">
                <span className={`bc-plane${hovered ? " fly" : ""}`}>✈</span>
              </div>
              <div className="bc-track-dot" />
            </div>
            <div className="bc-stops">Non-stop</div>
          </div>

          {/* Arrival */}
          <div className="bc-route-city right">
            <div className="bc-time">{formatTime(booking.arrivalTime)}</div>
            <div className="bc-iata">{booking.toCode}</div>
            <div className="bc-city-name">{booking.toCity || booking.destination}</div>
          </div>
        </div>

        {/* ── Meta grid row 1 ── */}
        <div className="bc-meta">
          <MetaItem icon="📅" label="Journey Date"  value={formatDate(booking.journeyDate)} />
          <MetaItem icon="🚪" label="Gate"          value={booking.gate}                    valueClass="sky" />
          <MetaItem icon="🏛" label="Terminal"      value={booking.terminal}                valueClass="sky" />
          <MetaItem icon="💼" label="Class"         value={booking.classType} />
        </div>

        {/* ── Meta grid row 2 ── */}
        <div className="bc-meta" style={{ marginBottom: 18 }}>
          <MetaItem icon="👤" label="Passenger"     value={booking.passengerName} />
          <MetaItem icon="💺" label="Seat(s)"       value={booking.seatNos}              valueClass="green" />
          <MetaItem icon="🎫" label="Boarding"      value={formatTime(booking.boardingTime)} />
          <MetaItem icon="💳" label="Amount Paid"   value={formatFare(booking.amountPaid)}  valueClass="accent" />
        </div>

        {/* ── Footer ── */}
        <div className="bc-footer">
          <div className="bc-res-id">
            # {booking.reservationId || "N/A"}
          </div>

          <div className="bc-actions">
            {/* View Ticket — always */}
            <button
              type="button"
              className="bc-btn bc-btn-ghost"
              onClick={openBoardingPass}
            >
              🎟 View Ticket
            </button>

            {type === "upcoming" && !isCancelled && (
              <>
                <button
                  type="button"
                  className="bc-btn bc-btn-primary"
                  onClick={openBoardingPass}
                >
                  ✈ Boarding Pass
                </button>
                <button
                  type="button"
                  className="bc-btn bc-btn-danger"
                  onClick={() => onCancel(booking)}
                >
                  ✕ Cancel
                </button>
              </>
            )}

            {(type === "past" || isCancelled) && (
              <button
                type="button"
                className="bc-btn bc-btn-book"
                onClick={() => navigate("/")}
              >
                ↺ Book Again
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const MyBooking = () => {
  const { profile }  = useContext(AuthContext);
  const navigate     = useNavigate();

  const [activeTab,  setActiveTab]  = useState("upcoming");
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);   // booking obj
  const [cancelling,   setCancelling]   = useState(false);
  const [toast,     setToast]       = useState(null);       // { msg, type }

  /* ── Fetch bookings ── */
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
        const res  = await axios.get(
          `http://localhost:8090/api/booking/my-flights/${userId}`
        );
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

  /* ── Group bookings ── */
  const grouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings.reduce(
      (acc, b) => {
        const jd = toDateOnly(b.journeyDate);
        jd && jd < today ? acc.past.push(b) : acc.upcoming.push(b);
        return acc;
      },
      { upcoming: [], past: [] }
    );
  }, [bookings]);

  const visible = grouped[activeTab];

  /* ── Toast helper ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Cancel handler ── */
  const handleCancelConfirm = async (reservationId) => {
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

  /* ── Stats for hero ── */
  const totalSpent = bookings.reduce((s, b) => s + Number(b.amountPaid || 0), 0);

  return (
    <main className="mb-page">
      {/* Stars */}
      <div className="mb-stars" aria-hidden />

      {/* ══ HERO ══ */}
      <section className="mb-hero">
        <div className="mb-hero-runway" aria-hidden />
        <div className="mb-hero-plane" aria-hidden>✈</div>

        <div className="mb-hero-tag">
          <span className="mb-hero-tag-dot" />
          SkyWays Airline
        </div>

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

      {/* ══ SHELL ══ */}
      <div className="mb-shell">

        {/* Tabs */}
        <div className="mb-tabs" role="tablist">
          {[
            { key: "upcoming", label: "Upcoming", icon: "✈" },
            { key: "past",     label: "Past",     icon: "🕐" },
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

        {/* Filter bar */}
        {!loading && !error && visible.length > 0 && (
          <div className="mb-filter-bar">
            <p className="mb-filter-info">
              Showing <strong>{visible.length}</strong>{" "}
              {activeTab === "upcoming" ? "upcoming" : "past"}{" "}
              {visible.length === 1 ? "journey" : "journeys"}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-state">
            <div className="mb-loading-plane">✈</div>
            <p className="mb-loading-text">Fetching your journeys…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mb-state">
            <div className="mb-state-icon">🚫</div>
            <h2 className="mb-state-title">Something went wrong</h2>
            <p className="mb-state-sub">{error}</p>
          </div>
        )}

        {/* Empty */}
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

        {/* Cards */}
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

      {/* ══ CANCEL MODAL ══ */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => !cancelling && setCancelTarget(null)}
          loading={cancelling}
        />
      )}

      {/* ══ TOAST ══ */}
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
          {toast.type === "danger" ? "✓ " : "✓ "}{toast.msg}
        </div>
      )}
    </main>
  );
};

export default MyBooking;