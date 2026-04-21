import { formatDate } from "./myBookingUtils";

export default function CancelModal({ booking, onConfirm, onClose, loading }) {
  return (
    <div className="mb-modal-overlay" onClick={onClose}>
      <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mb-modal-icon">⚠️</div>
        <h2 className="mb-modal-title">Cancel Booking?</h2>
        <p className="mb-modal-sub">
          You're about to cancel your flight from <strong>{booking.source}</strong> to <strong>{booking.destination}</strong> on {formatDate(booking.journeyDate)}.
          <br />
          This action <strong>cannot be undone.</strong>
        </p>
        <div className="mb-modal-actions">
          <button className="bc-btn bc-btn-ghost" onClick={onClose} disabled={loading}>
            Keep Booking
          </button>
          <button className="bc-btn bc-btn-danger" onClick={() => onConfirm(booking.reservationId)} disabled={loading}>
            {loading ? "Cancelling…" : "✕ Cancel Flight"}
          </button>
        </div>
      </div>
    </div>
  );
}
