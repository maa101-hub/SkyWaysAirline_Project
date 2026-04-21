import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  formatDate,
  formatFare,
  formatTime,
  getLogoColor,
  getLogoInitials,
} from "./myBookingUtils";

function MetaItem({ icon, label, value, valueClass = "" }) {
  return (
    <div className="bc-meta-item">
      <div className="bc-meta-label">
        <span className="bc-meta-label-icon">{icon}</span>
        {label}
      </div>
      <div className={`bc-meta-value ${valueClass}`}>{value}</div>
    </div>
  );
}

export default function BookingCard({ booking, type, onCancel }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isCancelled = booking.bookingStatus === 0;
  const statusKey = isCancelled ? "cancelled" : type;
  const statusLabel = isCancelled ? "Cancelled" : type === "past" ? "Completed" : "Confirmed";

  const openBoardingPass = () => {
    navigate("/boarding-pass", {
      state: {
        flightNumber: booking.flightNumber,
        passengerName: booking.passengerName,
        fromCode: booking.fromCode,
        toCode: booking.toCode,
        fromCity: booking.fromCity,
        toCity: booking.toCity,
        departureTime: booking.departureTime,
        arrivalTime: booking.arrivalTime,
        journeyDate: booking.journeyDate,
        gate: booking.gate,
        terminal: booking.terminal,
        seatNos: booking.seatNos,
        boardingTime: booking.boardingTime,
        group: booking.group,
        classType: booking.classType,
        reservationId: booking.reservationId,
        amountPaid: booking.amountPaid,
        qrSeed: booking.qrSeed,
      },
    });
  };

  return (
    <article
      className="bc"
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`bc-accent-bar ${statusKey}`} />

      <div className="bc-body">
        <div className="bc-top">
          <div className="bc-airline-row">
            <div className="bc-logo" style={{ background: getLogoColor(booking.flightName) }}>
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

        <div className="bc-route">
          <div className="bc-route-city">
            <div className="bc-time">{formatTime(booking.departureTime)}</div>
            <div className="bc-iata">{booking.fromCode}</div>
            <div className="bc-city-name">{booking.fromCity || booking.source}</div>
          </div>

          <div className="bc-path">
            <div className="bc-duration">⏱ {booking.travelDuration || "Direct"}</div>
            <div className="bc-track">
              <div className="bc-track-dot" />
              <div className="bc-track-line">
                <span className={`bc-plane${hovered ? " fly" : ""}`}>✈</span>
              </div>
              <div className="bc-track-dot" />
            </div>
            <div className="bc-stops">Non-stop</div>
          </div>

          <div className="bc-route-city right">
            <div className="bc-time">{formatTime(booking.arrivalTime)}</div>
            <div className="bc-iata">{booking.toCode}</div>
            <div className="bc-city-name">{booking.toCity || booking.destination}</div>
          </div>
        </div>

        {detailsOpen && (
          <div className="bc-details-panel" style={{ marginBottom: 18 }}>
            <div className="bc-meta">
              <MetaItem icon="📅" label="Journey Date" value={formatDate(booking.journeyDate)} />
              <MetaItem icon="💼" label="Class" value={booking.classType} />
              <MetaItem icon="💳" label="Amount Paid" value={formatFare(booking.amountPaid)} valueClass="accent" />
            </div>

            <div className="bc-actions bc-actions-details">
              {type === "upcoming" && !isCancelled && (
                <>
                  <button type="button" className="bc-btn bc-btn-primary" onClick={openBoardingPass}>
                    ✈ Boarding Pass
                  </button>
                  <button type="button" className="bc-btn bc-btn-danger" onClick={() => onCancel(booking)}>
                    ✕ Cancel
                  </button>
                </>
              )}

              {(type === "past" || isCancelled) && (
                <button type="button" className="bc-btn bc-btn-book" onClick={() => navigate("/")}>
                  ↺ Book Again
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bc-footer">
          <div className="bc-res-id"># {booking.reservationId || "N/A"}</div>

          <button
            type="button"
            className="bc-details-toggle"
            onClick={() => setDetailsOpen((prev) => !prev)}
            aria-expanded={detailsOpen}
          >
            {detailsOpen ? "Hide Details" : "Show Details"}
            <span className={`bc-details-arrow${detailsOpen ? " open" : ""}`}>⌄</span>
          </button>
        </div>
      </div>
    </article>
  );
}
