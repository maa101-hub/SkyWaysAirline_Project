import { useState, useEffect } from "react";
import "./BookNow.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ── Blank passenger ───────────────────────────────────────────
const blankPassenger = () => ({
  _key:   Math.random().toString(36).slice(2),
  name:   "",
  gender: "",
  age:    "",
  seatNo: "",
});

const fareCalculation = (p, price) => p * price;

export default function BookNow() {
  const location = useLocation();
  const navigate = useNavigate();
  const flightData = location.state || {};

  const autoReservationId = flightData.reservationId || "RES-" + Date.now();
  const autoUserId        = flightData.userId        || "USR-001";
  const autoScheduleId    = flightData.flight?.flightId || "SC-001";
  const price             = flightData.totalFare || 0;

  // ── Phases: flying → form → paying → planes-success → done
  const [phase,   setPhase]   = useState("flying");
  const [saving,  setSaving]  = useState(false);
  const [payMsg,  setPayMsg]  = useState("Initiating Payment...");
  const [ticket,  setTicket]  = useState(null);   // TicketResponse from backend
  const [payError, setPayError] = useState("");

  const [reservation, setReservation] = useState({
    reservationType: "",
    journeyDate:     "",
    noOfSeats:       1,
    totalFare:       "",
    bookingStatus:   1,
  });
  const [passengers, setPassengers] = useState([blankPassenger()]);

  // Auto-advance intro animation → form
  useEffect(() => {
    if (phase !== "flying") return;
    const t = setTimeout(() => setPhase("form"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Field handlers ────────────────────────────────────────
  const onResChange = (e) =>
    setReservation({ ...reservation, [e.target.name]: e.target.value });

  const addPassenger = () => {
    const next = [...passengers, blankPassenger()];
    setPassengers(next);
    setReservation((r) => ({ ...r, noOfSeats: next.length }));
  };

  const removePassenger = (key) => {
    if (passengers.length === 1) return;
    const next = passengers.filter((p) => p._key !== key);
    setPassengers(next);
    setReservation((r) => ({ ...r, noOfSeats: next.length }));
  };

  const onPassengerChange = (key, field, value) =>
    setPassengers(passengers.map((p) =>
      p._key === key ? { ...p, [field]: value } : p
    ));

  // ── MAIN SUBMIT → full payment flow ───────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setPayError("");

    // ── Build BookingRequest ──────────────────────────────
    const bookingRequest = {
      userId:      autoUserId,
      scheduleId:  autoScheduleId,
      journeyDate: reservation.journeyDate,
      noOfSeats:   passengers.length,
      passengers:  passengers.map(({ name, gender, age }) => ({
        name, gender,
        age:    Number(age),
      })),
    };

    try {
      // ── Phase 1: Create Order ─────────────────────────
      setPhase("paying");
      setPayMsg("Creating your order...");
const token = localStorage.getItem("token"); // ya jahan bhi store kiya ho
const orderRes = await axios.post(
  "http://localhost:8090/api/booking/create-order",
  bookingRequest,
);
      const orderId = orderRes.data.data;   // ApiResponse<String> → .data

      // ── Phase 2: Processing payment ───────────────────
      setPayMsg("Processing payment...");
      await delay(900);

      // ── Phase 3: Verifying ────────────────────────────
      setPayMsg("Verifying transaction...");
      await delay(800);

      // Generate a fake paymentId (Razorpay will replace this later)
      const signature = "PAY_" + Math.random().toString(36).slice(2).toUpperCase();

      // ── Phase 4: Confirm Booking ──────────────────────
      setPayMsg("Confirming booking...");
      const confirmRes = await axios.post(
        "http://localhost:8090/api/booking/confirm",
        {
          orderId,
          signature,
          bookingRequest,
        }
      );
      const ticketData = confirmRes.data.data;   // ApiResponse<TicketResponse>
      setTicket(ticketData);

      // ── Phase 5: Success planes animation ────────────
      setPayMsg("Payment Successful! ✓");
      await delay(600);
      setPhase("planes-success");

      // After planes fly → show done
      setTimeout(() => setPhase("done"), 2400);

    } catch (err) {
      console.error("Booking error:", err);
      const msg = err?.response?.data?.message || "Payment failed. Please try again.";
      setPayError(msg);
      setPhase("form");
    } finally {
      setSaving(false);
    }
  };

  // ── Reset / new booking ───────────────────────────────────
  const handleReset = () => {
    setPhase("flying");
    setSaving(false);
    setPayError("");
    setTicket(null);
    setReservation({ reservationType:"", journeyDate:"", noOfSeats:1, totalFare:"", bookingStatus:1 });
    setPassengers([blankPassenger()]);
  };

  const today = new Date().toISOString().split("T")[0];
  const totalFare = fareCalculation(passengers.length, price);

  return (
    <div className="bn-wrap">

      {/* ── Sky + clouds always ── */}
      <div className="bn-sky">
        <div className="cloud cl1" /><div className="cloud cl2" />
        <div className="cloud cl3" /><div className="cloud cl4" />
      </div>

      {/* ── Crack lines (intro only) ── */}
      {phase === "flying" && (
        <svg className="crack-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className="crack crack1" d="M0,30 L25,35 L40,28 L55,40 L70,25 L100,35" />
          <path className="crack crack2" d="M0,50 L20,48 L35,55 L50,45 L65,52 L100,48" />
          <path className="crack crack3" d="M0,70 L30,65 L45,75 L60,68 L80,72 L100,65" />
          <path className="crack crack4" d="M30,0 L35,20 L28,40 L40,60 L25,80 L35,100" />
          <path className="crack crack5" d="M70,0 L65,25 L75,45 L68,65 L72,85 L65,100" />
        </svg>
      )}

      {/* ── Shards (intro only) ── */}
      {phase === "flying" && (
        <div className="shards-container">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className={`shard s${i}`} />
          ))}
        </div>
      )}
      {phase === "flying" && <div className="shockwave" />}

      {/* ══════════════════════════════════════
          INTRO PLANES (flying phase)
      ══════════════════════════════════════ */}
      {phase === "flying" && (
        <div className="fly-stage">
          <div className="paper-plane pp1">
            <div className="pp-body" /><div className="pp-wing-top" />
            <div className="pp-wing-bot" /><div className="pp-trail" />
          </div>
          <div className="paper-plane pp2">
            <div className="pp-body" /><div className="pp-wing-top" />
            <div className="pp-wing-bot" /><div className="pp-trail" />
          </div>
          <div className="paper-plane pp3">
            <div className="pp-body" /><div className="pp-wing-top" />
            <div className="pp-wing-bot" /><div className="pp-trail" />
          </div>
          <p className="fly-label">Sky Ways Airlines</p>
        </div>
      )}

      {/* ══════════════════════════════════════
          PAYMENT LOADING SCREEN
      ══════════════════════════════════════ */}
      {phase === "paying" && (
        <div className="pay-stage">
          <div className="pay-card">

            {/* Radar ring loader */}
            <div className="radar-wrap">
              <div className="radar-ring r1" />
              <div className="radar-ring r2" />
              <div className="radar-ring r3" />
              <div className="radar-plane">✈</div>
            </div>

            <p className="pay-title">Processing Payment</p>
            <p className="pay-msg">{payMsg}</p>

            {/* Step dots */}
            <div className="pay-steps">
              {["Order", "Payment", "Verify", "Confirm"].map((s, i) => (
                <div key={s} className={`pay-step ${getStepClass(payMsg, i)}`}>
                  <div className="step-dot" />
                  <p className="step-label">{s}</p>
                </div>
              ))}
            </div>

            <p className="pay-secure">🔒 Secured by Sky Ways Payment Gateway</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          SUCCESS PLANES (after payment)
      ══════════════════════════════════════ */}
      {phase === "planes-success" && (
        <div className="fly-stage success-fly">
          <div className="pay-success-flash" />
          <div className="paper-plane pp1 success-pp">
            <div className="pp-body" /><div className="pp-wing-top" />
            <div className="pp-wing-bot" /><div className="pp-trail" />
          </div>
          <div className="paper-plane pp2 success-pp">
            <div className="pp-body" /><div className="pp-wing-top" />
            <div className="pp-wing-bot" /><div className="pp-trail" />
          </div>
          <div className="paper-plane pp3 success-pp">
            <div className="pp-body" /><div className="pp-wing-top" />
            <div className="pp-wing-bot" /><div className="pp-trail" />
          </div>
          <p className="fly-label success-label">Payment Successful! ✓</p>
        </div>
      )}

      {/* ══════════════════════════════════════
          BOOKING FORM
      ══════════════════════════════════════ */}
      {phase === "form" && (
        <div className="form-stage">
          <div className="glass-card form-appear">
            <div className="form-top-bar">
              <span className="form-logo">✈︎ Sky Ways</span>
              <h2 className="form-heading">Flight Booking</h2>
            </div>

            {/* Error banner */}
            {payError && (
              <div className="error-banner">
                ⚠ {payError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Auto-filled IDs */}
              <div className="auto-ids">
                <div className="auto-chip">
                  <span className="ac-label">Reservation ID</span>
                  <span className="ac-val">{autoReservationId}</span>
                </div>
                <div className="auto-chip">
                  <span className="ac-label">User ID</span>
                  <span className="ac-val">{autoUserId}</span>
                </div>
                <div className="auto-chip">
                  <span className="ac-label">Schedule ID</span>
                  <span className="ac-val">{autoScheduleId}</span>
                </div>
              </div>

              <p className="section-title">Reservation Details</p>

              <div className="fields-grid">
                <div className="field">
                  <label>Reservation Type</label>
                  <select name="reservationType" value={reservation.reservationType}
                    onChange={onResChange} required>
                    <option value="">Select type</option>
                    <option value="One-Way">One-Way</option>
                    <option value="Round-Trip">Round-Trip</option>
                  </select>
                </div>
                <div className="field">
                  <label>Journey Date</label>
                  <input type="date" name="journeyDate" min={today}
                    value={reservation.journeyDate} onChange={onResChange} required />
                </div>
                <div className="field">
                  <label>No. of Seats</label>
                  <input type="number" readOnly value={passengers.length} className="readonly-input" />
                </div>
                <div className="field">
                  <label>Total Fare (₹)</label>
                  <input type="number" readOnly value={totalFare} className="readonly-input" />
                </div>
              </div>

              <div className="passengers-header">
                <p className="section-title">Passengers</p>
                <button type="button" className="btn-add-pax" onClick={addPassenger}>
                  + Add Passenger
                </button>
              </div>

              <div className="passengers-list">
                {passengers.map((p, idx) => (
                  <div key={p._key} className="pax-card">
                    <div className="pax-card-header">
                      <span className="pax-num">Passenger {idx + 1}</span>
                      {passengers.length > 1 && (
                        <button type="button" className="btn-remove-pax"
                          onClick={() => removePassenger(p._key)}>✕</button>
                      )}
                    </div>
                    <div className="pax-grid">
                      <div className="field">
                        <label>Full Name</label>
                        <input type="text" placeholder="e.g. Rahul Sharma"
                          value={p.name}
                          onChange={(e) => onPassengerChange(p._key, "name", e.target.value)} required />
                      </div>
                      <div className="field">
                        <label>Gender</label>
                        <select value={p.gender}
                          onChange={(e) => onPassengerChange(p._key, "gender", e.target.value)} required>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Age</label>
                        <input type="number" min="1" max="120" placeholder="e.g. 28"
                          value={p.age}
                          onChange={(e) => onPassengerChange(p._key, "age", e.target.value)} required />
                      </div>
                      <div className="field">
                        <label>Seat No.</label>
                        <input type="number" min="1" placeholder="e.g. 14"
                          value={p.seatNo}
                          onChange={(e) => onPassengerChange(p._key, "seatNo", e.target.value)} required />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fare summary before pay */}
              <div className="fare-summary">
                <span className="fare-row">
                  <span>{passengers.length} Passenger{passengers.length > 1 ? "s" : ""} × ₹{price?.toLocaleString("en-IN")}</span>
                  <strong>₹{totalFare.toLocaleString("en-IN")}</strong>
                </span>
              </div>

              <button type="submit" className="btn-primary btn-submit" disabled={saving}>
                {saving ? (
                  <span className="saving-text">
                    <span className="dot-pulse" /> Initiating Payment...
                  </span>
                ) : (
                  <>💳 Pay ₹{totalFare.toLocaleString("en-IN")} &amp; Confirm</>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          SUCCESS / TICKET VIEW
      ══════════════════════════════════════ */}
      {phase === "done" && (
        <div className="form-stage">
          <div className="success-box">
            <div className="success-plane-icon">✈︎</div>
            <div className="success-tick">✓</div>
            <h2>Booking Confirmed!</h2>
            <p className="suc-id">
              Reservation ID: <strong>{ticket?.reservationId || autoReservationId}</strong>
            </p>

            {/* Ticket summary */}
            {ticket && (
              <div className="ticket-summary">
                <div className="ts-row">
                  <span className="ts-label">Schedule</span>
                  <span className="ts-val">{ticket.scheduleId}</span>
                </div>
                <div className="ts-row">
                  <span className="ts-label">Journey Date</span>
                  <span className="ts-val">{ticket.journeyDate}</span>
                </div>
                <div className="ts-row">
                  <span className="ts-label">Passengers</span>
                  <span className="ts-val">{ticket.noOfSeats}</span>
                </div>
                <div className="ts-row">
                  <span className="ts-label">Total Paid</span>
                  <span className="ts-val fare-paid">₹{Number(ticket.totalFare).toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <p className="suc-sub">
              A ticket has been sent to your registered email. ✉
            </p>

            <button className="btn-primary" onClick={handleReset}>Book Another Flight</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function getStepClass(msg, idx) {
  const msgLower = msg.toLowerCase();
  if (idx === 0) return msgLower.includes("order") ? "step-active" : "step-done";
  if (idx === 1) return msgLower.includes("process") ? "step-active" : msgLower.includes("verif") || msgLower.includes("confirm") || msgLower.includes("success") ? "step-done" : "";
  if (idx === 2) return msgLower.includes("verif") ? "step-active" : msgLower.includes("confirm") || msgLower.includes("success") ? "step-done" : "";
  if (idx === 3) return msgLower.includes("confirm") || msgLower.includes("success") ? "step-active" : "";
  return "";
}