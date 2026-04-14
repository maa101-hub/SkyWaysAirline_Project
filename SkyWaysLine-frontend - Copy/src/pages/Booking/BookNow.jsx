import { useState, useEffect, useRef } from "react";
import "./BookNow.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ── Blank passenger ──────────────────────────────────────────────────────────
const blankPassenger = () => ({
  _key:   Math.random().toString(36).slice(2),
  name:   "",
  gender: "",
  age:    "",
  seatNo: "",
});

const fareCalculation = (p, price) => p * price;
function calcArrival(departure, durationMins) {

  if (!departure || !durationMins) return "--:--";  // ✅ FIX

  const [h, m] = departure.split(":").map(Number);
  const total  = h * 60 + m + Number(durationMins);

  const ah = Math.floor(total / 60) % 24;
  const am = total % 60;

  return `${String(ah).padStart(2, "0")}:${String(am).padStart(2, "0")}`;
}
// ── Star field data ──────────────────────────────────────────────────────────
const STARS = Array.from({ length: 120 }, (_, i) => ({
  id:    i,
  x:     Math.random() * 100,
  y:     Math.random() * 100,
  r:     Math.random() * 1.8 + 0.4,
  delay: Math.random() * 4,
  dur:   Math.random() * 3 + 2,
}));

// ── Crack SVG paths ──────────────────────────────────────────────────────────
const CRACKS = [
  "M50,50 L15,10 L8,2",
  "M50,50 L82,8 L92,1",
  "M50,50 L95,45 L100,40",
  "M50,50 L88,80 L95,95",
  "M50,50 L60,92 L58,100",
  "M50,50 L35,88 L30,100",
  "M50,50 L5,60 L0,70",
  "M50,50 L10,30 L0,20",
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function getStepClass(msg, idx) {
  const m = msg.toLowerCase();
  const done  = (i) => i < idx;
  const steps = ["order","process","verif","confirm"];
  const active = steps.findIndex((s) => m.includes(s));
  if (active === idx) return "step-active";
  if (idx < active)  return "step-done";
  return "";
}

// ── Boarding-pass QR mock ────────────────────────────────────────────────────
function QRMock() {
  const cells = Array.from({ length: 10 * 10 }, () => Math.random() > 0.5);
  return (
    <div className="qr-grid">
      {cells.map((on, i) => (
        <div key={i} className={`qr-cell ${on ? "on" : ""}`} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function BookNow() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const flightData = location.state || {};
  const flight=flightData.flight || {};
  console.log("Flight data in BookNow:", flightData);
  const autoReservationId = flightData.reservationId || "RES-" + Date.now();
  const autoUserId        = flightData.userId        || "USR-001";
  const autoScheduleId    = flightData.flight?.flightId || "SC-001";
  const price             = flightData.totalFare || 0;
  const depTime = flight.departureTime?.slice(0, 5);
  const arrival = calcArrival(depTime, flight.travelDuration);


  // Phases: flying → form → paying → planes-success → done
  const [phase,    setPhase]    = useState("flying");
  const [saving,   setSaving]   = useState(false);
  const [payMsg,   setPayMsg]   = useState("Initiating Payment...");
  const [ticket,   setTicket]   = useState(null);
  const [payError, setPayError] = useState("");
  const [formStep, setFormStep] = useState(0); // 0=details, 1=passengers

  const [reservation, setReservation] = useState({
    reservationType: "",
    journeyDate:     "",
    noOfSeats:       1,
    totalFare:       "",
    bookingStatus:   1,
  });
  const [passengers, setPassengers] = useState([blankPassenger()]);

  // Auto-advance intro → form
  useEffect(() => {
    if (phase !== "flying") return;
    const t = setTimeout(() => setPhase("form"), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Field handlers ────────────────────────────────────────────────────────
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
 
  // ── SUBMIT → payment flow ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setPayError("");

    try {
    // Prepare the BookingRequest payload (adjust based on your state)
    const bookingRequest = {
      scheduleId: flight.flightId || "your-schedule-id",  // Ensure this is set from flightData
      noOfSeats: passengers.length,
      userId:autoUserId,  // Get from auth context or state
      journeyDate: reservation.journeyDate,
      passengers: passengers.map(p => ({
        name: p.name,
        gender: p.gender,
        age: p.age,
        // Add other fields if needed
      })),
    };
      setPhase("paying");
      setPayMsg("Creating your order...");

      const orderRes = await axios.post(
        "http://localhost:8090/api/booking/create-order",
        bookingRequest,
      );
      const orderId = orderRes.data.data;
      console.log("Received orderId:", orderId);
      setPayMsg("Processing payment...");
      
      const options = {
       key:         "rzp_test_SdKfg1SHSyvaok",
  amount: totalFare * 100,
    currency: "INR",
    order_id: orderId,
    name: "SkyWays Airline",
    description: "Flight booking",
    prefill: {
      name: passengers[0]?.name || "",
      email: "user@example.com",
    },
        handler: async function (response) {
          try {
            setPayMsg("Verifying payment...");
            await delay(700);
            console.log("Payment processing");
            const confirmRes = await axios.post(
              "http://localhost:8090/api/booking/confirm",
              {
                orderId:response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookingRequest,
              },
            );
            console.log("Booking confirmation response:", confirmRes.data);
            setTicket(confirmRes.data.data);
            setPayMsg("Booking Confirmed! ✓");
            await delay(600);
            setPhase("planes-success");
            setTimeout(() => setPhase("done"), 2400);

          } catch {
            setPayError("Payment verification failed. Please try again.");
            setPhase("form");
          } finally {
            setSaving(false);
          }
        },

        modal: {
          ondismiss: () => {
            setSaving(false);
            setPhase("form");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setPayError(err?.response?.data?.message || "Could not create order.");
      setSaving(false);
      setPhase("form");
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setPhase("flying");
    setSaving(false);
    setPayError("");
    setTicket(null);
    setFormStep(0);
    setReservation({ reservationType:"", journeyDate:"", noOfSeats:1, totalFare:"", bookingStatus:1 });
    setPassengers([blankPassenger()]);
  };

  const today     = new Date().toISOString().split("T")[0];
  const totalFare = fareCalculation(passengers.length, price);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bn-wrap">

      {/* ── Animated starfield background ── */}
      <div className="bn-sky">
        <svg className="star-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {STARS.map(s => (
            <circle
              key={s.id}
              cx={s.x} cy={s.y} r={s.r * 0.12}
              fill="white"
              style={{
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
              }}
              className="star-dot"
            />
          ))}
        </svg>
        {/* Horizon aurora */}
        <div className="aurora" />
        {/* Drifting clouds */}
        <div className="cloud-layer">
          {[1,2,3,4].map(i => <div key={i} className={`cloud cl${i}`} />)}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: FLYING (cinematic intro)
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "flying" && (
        <div className="fly-stage" key="fly">

          {/* Screen crack SVG */}
          <svg className="crack-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {CRACKS.map((d, i) => (
              <path key={i} d={d} className={`crack c${i+1}`} />
            ))}
          </svg>

          {/* Glass shards */}
          <div className="shards">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`shard sh${i+1}`} />
            ))}
          </div>

          {/* Shockwave ring */}
          <div className="shockwave-ring" />
          <div className="shockwave-ring sw2" />

          {/* Main SVG airplane */}
          <div className="intro-plane-wrap">
            <svg className="intro-plane" viewBox="0 0 420 160" fill="none">
              {/* Fuselage */}
              <path d="M40 80 Q100 68 240 76 Q310 80 380 76 Q408 78 380 82 Q310 86 240 84 Q100 92 40 82 Z" fill="#E8EAEE"/>
              {/* Nose cone */}
              <path d="M375 76 Q418 79 375 82 Z" fill="#C5C8CE"/>
              {/* Cockpit */}
              <ellipse cx="360" cy="79" rx="10" ry="5.5" fill="#5AABFF" opacity=".85"/>
              <ellipse cx="346" cy="79" rx="7"  ry="4.5" fill="#5AABFF" opacity=".65"/>
              {/* Main wing */}
              <path d="M200 78 L175 22 L275 70 Z" fill="#D0D4DA"/>
              <path d="M200 82 L175 138 L275 90 Z" fill="#C5C8CE"/>
              {/* Tail fin */}
              <path d="M68 77 L45 32 L95 72 Z" fill="#C8CBD1"/>
              <path d="M68 83 L45 128 L95 88 Z" fill="#BFC2C8"/>
              {/* Windows */}
              {[140,158,176,194,212,230,248,266,284].map((x,i) => (
                <rect key={i} x={x} y="73" width="10" height="8" rx="2.5"
                  fill="#5AABFF" opacity={0.75 - i*0.05}/>
              ))}
              {/* Engine 1 */}
              <ellipse cx="238" cy="108" rx="22" ry="11" fill="#B2B6BC"/>
              <ellipse cx="238" cy="108" rx="17" ry="7.5" fill="#9EA2A8"/>
              <ellipse cx="218" cy="108" rx="5" ry="5" fill="#FF7A30" opacity=".75"/>
              {/* Engine 2 */}
              <ellipse cx="195" cy="52" rx="18" ry="9" fill="#B2B6BC"/>
              <ellipse cx="195" cy="52" rx="13" ry="6" fill="#9EA2A8"/>
              <ellipse cx="179" cy="52" rx="4" ry="4" fill="#FF7A30" opacity=".65"/>
              {/* Gold livery stripe */}
              <path d="M95 78.5 Q240 75 378 79 L378 80.5 Q240 77 95 80 Z" fill="#C9A84C" opacity=".9"/>
              {/* Motion blur streaks */}
              {[68,73,79,84,89].map((y,i) => (
                <line key={i} x1="0" y1={y} x2="40" y2={y}
                  stroke="white" strokeWidth={2.5 - i*0.4}
                  opacity={0.25 - i*0.03}/>
              ))}
              {/* Engine glow trails */}
              <path d="M218 108 L0 115 L0 101 Z" fill="url(#trailGrad1)" opacity=".25"/>
              <path d="M179 52 L0 58 L0 46 Z" fill="url(#trailGrad2)" opacity=".2"/>
              <defs>
                <linearGradient id="trailGrad1" x1="218" x2="0" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#FF7A30" stopOpacity="0"/>
                  <stop offset="1" stopColor="#FF7A30" stopOpacity="1"/>
                </linearGradient>
                <linearGradient id="trailGrad2" x1="0" x2="179" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#FF7A30" stopOpacity="0"/>
                  <stop offset="1" stopColor="#FF7A30" stopOpacity="1"/>
                </linearGradient>
              </defs>
            </svg>
            {/* Light cone from engines */}
            <div className="engine-glow" />
          </div>

          {/* Brand lockup */}
          <div className="intro-brand">
            <span className="intro-logo-mark">✦</span>
            <span className="intro-logo-text">Sky<em>Ways</em></span>
            <span className="intro-tagline">Premium Air Travel</span>
          </div>

          {/* Progress bar */}
          <div className="intro-progress">
            <div className="intro-progress-fill" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: BOOKING FORM
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "form" && (
        <div className="form-stage" key="form">

          {/* Top nav bar */}
          <header className="form-nav">
            <div className="nav-logo">
              <span className="nav-logo-icon">✦</span>
              Sky<em>Ways</em>
            </div>
            <div className="nav-route">
              <span className="nav-route-city">{flightData.from || "—"}</span>
              <svg width="40" height="12" viewBox="0 0 40 12" className="nav-route-arrow">
                <path d="M0 6 H32 M28 2 L36 6 L28 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              <span className="nav-route-city">{flightData.to || "—"}</span>
            </div>
            <div className="nav-secure">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <path d="M6 0L12 3V7C12 10.3 9.3 13.3 6 14 2.7 13.3 0 10.3 0 7V3L6 0Z" fill="#C9A84C" opacity=".25"/>
                <path d="M6 1L11 3.5V7C11 9.8 8.8 12.5 6 13.2 3.2 12.5 1 9.8 1 7V3.5L6 1Z" stroke="#C9A84C" strokeWidth="1" fill="none"/>
              </svg>
              Secured
            </div>
          </header>

          {/* Error banner */}
          {payError && (
            <div className="error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {payError}
              <button onClick={() => setPayError("")} className="err-close">✕</button>
            </div>
          )}

          <div className="form-body">

            {/* Left column — flight summary card */}
            <aside className="flight-summary-card">
              <div className="fsc-header">
                <p className="fsc-eyebrow">Your Flight</p>
                <div className="fsc-route">
                  <div className="fsc-city">
                    <span className="fsc-iata">
  {flight.source?.slice(0, 3).toUpperCase() || "CDG"}
</span>
                    <span className="fsc-name">{flight.source || "Dubai"}</span>
                  </div>
                  <div className="fsc-flight-line">
                    <div className="fsc-line" />
                    <svg className="fsc-plane-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                    <div className="fsc-line" />
                  </div>
                  <div className="fsc-city">
                    <span className="fsc-iata">
  {flight.destination?.slice(0, 3).toUpperCase() || "CDG"}
</span>
                    <span className="fsc-name">{flight.destination || "Paris"}</span>
                  </div>
                </div>
              </div>

              <div className="fsc-details">
                {[
                  ["Flight",    flightData.flight?.flightId || "SW-411"],
                  ["Aircraft",  flightData.flight?.flightName || "Boeing 777"],
                  ["Departs",   depTime || "22:45"],
                  ["Arrives",   arrival   || "06:30 +1"],
                  ["Duration",  flight.travelDuration       || "8h 45m"],
                  ["Class",     flightData.cabinClass     || "Economy"],
                ].map(([label, val]) => (
                  <div key={label} className="fsc-row">
                    <span className="fsc-label">{label}</span>
                    <span className="fsc-val">{val}</span>
                  </div>
                ))}
              </div>

              <div className="fsc-fare-box">
                <div className="fsc-fare-row">
                  <span>{passengers.length} × ₹{price.toLocaleString("en-IN")}</span>
                  <span>₹{totalFare.toLocaleString("en-IN")}</span>
                </div>
                <div className="fsc-fare-row fsc-taxes">
                  <span>Taxes & Fees</span>
                  <span>Incl.</span>
                </div>
                <div className="fsc-fare-total">
                  <span>Total</span>
                  <span className="fsc-total-amount">₹{totalFare.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* IDs */}
      
            </aside>

            {/* Right column — form */}
            <main className="form-main">

              {/* Step indicator */}
              <div className="step-bar">
                {["Trip Details", "Passengers", "Payment"].map((label, i) => (
                  <div key={i} className={`step-item ${i === formStep ? "active" : i < formStep ? "done" : ""}`}>
                    <div className="step-bubble">
                      {i < formStep ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : i + 1}
                    </div>
                    <span>{label}</span>
                    {i < 2 && <div className={`step-connector ${i < formStep ? "filled" : ""}`} />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate>

                {/* ── STEP 0: Trip Details ── */}
                {formStep === 0 && (
                  <div className="form-section fade-in-up">
                    <h2 className="section-heading">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Trip Details
                    </h2>

                    <div className="fields-grid">
                      <div className="field-group">
                        <label className="field-label">Reservation Type</label>
                        <div className="select-wrap">
                          <select name="reservationType" value={reservation.reservationType}
                            onChange={onResChange} required className="field-input">
                            <option value="">Select type</option>
                            <option value="One-Way">One Way</option>
                            <option value="Round-Trip">Round Trip</option>
                          </select>
                          <span className="select-arrow">▾</span>
                        </div>
                      </div>

                      <div className="field-group">
                        <label className="field-label">Journey Date</label>
                        <input type="date" name="journeyDate" min={today}
                          value={reservation.journeyDate} onChange={onResChange}
                          required className="field-input" />
                      </div>

                      <div className="field-group readonly-group">
                        <label className="field-label">Seats</label>
                        <input type="number" readOnly value={passengers.length}
                          className="field-input readonly" />
                        <span className="readonly-badge">Auto</span>
                      </div>

                      <div className="field-group readonly-group">
                        <label className="field-label">Total Fare (₹)</label>
                        <input type="text" readOnly
                          value={"₹" + totalFare.toLocaleString("en-IN")}
                          className="field-input readonly fare-display" />
                        <span className="readonly-badge">Calculated</span>
                      </div>
                    </div>

                    <div className="form-nav-btns">
                      <button type="button" className="btn-next"
                        onClick={() => setFormStep(1)}
                        disabled={!reservation.reservationType || !reservation.journeyDate}>
                        Continue to Passengers
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l-7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Passengers ── */}
                {formStep === 1 && (
                  <div className="form-section fade-in-up">
                    <div className="pax-header">
                      <h2 className="section-heading">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        Passenger Details
                      </h2>
                      <button type="button" className="btn-add-pax" onClick={addPassenger}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add Passenger
                      </button>
                    </div>

                    <div className="passengers-list">
                      {passengers.map((p, idx) => (
                        <div key={p._key} className="pax-card">
                          <div className="pax-card-header">
                            <div className="pax-num-badge">
                              <span>{idx + 1}</span>
                            </div>
                            <span className="pax-card-title">Passenger {idx + 1}</span>
                            {passengers.length > 1 && (
                              <button type="button" className="btn-remove-pax"
                                onClick={() => removePassenger(p._key)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="pax-grid">
                            <div className="field-group pax-name">
                              <label className="field-label">Full Name</label>
                              <input type="text" placeholder="As on passport"
                                value={p.name} className="field-input"
                                onChange={(e) => onPassengerChange(p._key, "name", e.target.value)} required />
                            </div>
                            <div className="field-group">
                              <label className="field-label">Gender</label>
                              <div className="select-wrap">
                                <select value={p.gender} className="field-input"
                                  onChange={(e) => onPassengerChange(p._key, "gender", e.target.value)} required>
                                  <option value="">Select</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </select>
                                <span className="select-arrow">▾</span>
                              </div>
                            </div>
                            <div className="field-group">
                              <label className="field-label">Age</label>
                              <input type="number" min="1" max="120" placeholder="28"
                                value={p.age} className="field-input"
                                onChange={(e) => onPassengerChange(p._key, "age", e.target.value)} required />
                            </div>
                            <div className="field-group">
                              <label className="field-label">Seat No.</label>
                              <input type="number" min="1" placeholder="14A"
                                value={p.seatNo} className="field-input"
                                onChange={(e) => onPassengerChange(p._key, "seatNo", e.target.value)} required />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="form-nav-btns spread">
                      <button type="button" className="btn-back" onClick={() => setFormStep(0)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M19 12H5M12 5l-7 7 7 7"/>
                        </svg>
                        Back
                      </button>
                      <button type="submit" className="btn-pay" disabled={saving}>
                        {saving ? (
                          <span className="btn-loading">
                            <span className="spin-ring" /> Processing...
                          </span>
                        ) : (
                          <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                            Pay ₹{totalFare.toLocaleString("en-IN")} &amp; Confirm
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </main>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: PAYING
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "paying" && (
        <div className="paying-stage" key="paying">
          <div className="paying-card">

            {/* Orbital loader */}
            <div className="orbital-loader">
              <div className="orbit-ring or1" />
              <div className="orbit-ring or2" />
              <div className="orbit-ring or3" />
              <div className="orbit-dot od1" />
              <div className="orbit-dot od2" />
              <div className="orbit-core">
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
            </div>

            <p className="paying-title">Processing Payment</p>
            <p className="paying-msg">{payMsg}</p>

            {/* Steps */}
            <div className="pay-steps">
              {["Create Order", "Payment", "Verify", "Confirm"].map((s, i) => (
                <div key={s} className={`pay-step ${getStepClass(payMsg, i)}`}>
                  <div className="pay-step-dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>

            <p className="paying-secure">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <path d="M6 0L12 3V7C12 10.3 9.3 13.3 6 14 2.7 13.3 0 10.3 0 7V3L6 0Z" fill="#C9A84C" opacity=".3"/>
                <path d="M6 1L11 3.5V7C11 9.8 8.8 12.5 6 13.2 3.2 12.5 1 9.8 1 7V3.5L6 1Z" stroke="#C9A84C" strokeWidth="1" fill="none"/>
              </svg>
              256-bit SSL Encrypted · Sky Ways Payment Gateway
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: PLANES-SUCCESS (cinematic celebration)
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "planes-success" && (
        <div className="success-fly-stage" key="planes-success">
          <div className="success-burst" />
          <div className="success-burst sb2" />

          {/* Formation of 3 planes */}
          {[1,2,3].map(i => (
            <div key={i} className={`success-plane sp${i}`}>
              <svg viewBox="0 0 200 80" fill="none" width="160">
                <path d="M20 40 Q50 34 115 38 Q145 40 175 38 Q192 40 175 42 Q145 44 115 42 Q50 46 20 42 Z" fill="#E8EAEE"/>
                <path d="M170 38 Q195 40 170 42 Z" fill="#C5C8CE"/>
                <path d="M95 39 L80 12 L130 35 Z" fill="#D0D4DA"/>
                <path d="M95 41 L80 68 L130 45 Z" fill="#C5C8CE"/>
                <path d="M35 39 L22 16 L48 36 Z" fill="#C8CBD1"/>
                {[65,76,87,98,109].map((x,j) => (
                  <rect key={j} x={x} y="37" width="6" height="5" rx="1.5" fill="#5AABFF" opacity={0.7-j*0.08}/>
                ))}
                <path d="M88 39.5 Q140 38 172 40 L172 40.5 Q140 38.5 88 40 Z" fill="#C9A84C"/>
              </svg>
            </div>
          ))}

          <div className="success-fly-text">
            <div className="success-checkmark">
              <svg width="40" height="40" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none" stroke="#C9A84C" strokeWidth="2" className="check-circle"/>
                <path d="M14 27l8 8 16-16" fill="none" stroke="#C9A84C" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round" className="check-path"/>
              </svg>
            </div>
            <p>Payment Successful!</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: DONE (boarding pass ticket)
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "done" && (
        <div className="done-stage" key="done">
          <div className="boarding-pass fade-in-up">

            {/* Top section */}
            <div className="bp-top">
              <div className="bp-airline">
                <span className="bp-logo-mark">✦</span>
                <span className="bp-airline-name">Sky<em>Ways</em></span>
                <span className="bp-class-badge">{flightData.cabinClass || "Economy"}</span>
              </div>

              <div className="bp-route-row">
                <div className="bp-city-block">
                  <span className="bp-iata">{flightData.fromCode || "DXB"}</span>
                  <span className="bp-city-name">{flight.source || "Dubai"}</span>
                  <span className="bp-time">{flight.departureTime || "22:45"}</span>
                </div>

                <div className="bp-flight-arc">
                  <div className="bp-arc-line" />
                  <svg className="bp-fly-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                  <div className="bp-arc-line" />
                  <span className="bp-duration">{flight.travelDuration
 || "8h 45m"}</span>
                </div>

                <div className="bp-city-block right">
                  <span className="bp-iata">{flightData.toCode || "CDG"}</span>
                  <span className="bp-city-name">{flight.destination || "Paris"}</span>
                  <span className="bp-time">{arrival || "06:30"}</span>
                </div>
              </div>

              <div className="bp-meta-grid">
                {[
                  ["Flight",    ticket?.flightNumber || flight.flightId || "SW-411"],
                  ["Date",      ticket?.journeyDate  || reservation.journeyDate || "—"],
                  ["Passengers",ticket?.noOfSeats    || passengers.length],
                  ["Seat(s)",   passengers.map(p=>p.seatNo||"—").join(", ")],
                  ["Gate",      "B" + (Math.floor(Math.random()*20)+10)],
                  ["Terminal",  "T3"],
                ].map(([l,v]) => (
                  <div key={l} className="bp-meta-cell">
                    <span className="bp-meta-label">{l}</span>
                    <span className="bp-meta-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tear perforation */}
            <div className="bp-tear">
              <div className="bp-tear-line" />
              {[...Array(28)].map((_,i) => (
                <div key={i} className="bp-hole" style={{ left: `${3.4 * i + 1.5}%` }} />
              ))}
            </div>

            {/* Bottom stub */}
            <div className="bp-bottom">
              <div className="bp-stub-info">
                <div className="bp-res-id">
                  <span className="bp-res-label">Reservation ID</span>
                  <span className="bp-res-val">{ticket?.reservationId || autoReservationId}</span>
                </div>
                <div className="bp-amount">
                  <span className="bp-res-label">Amount Paid</span>
                  <span className="bp-amount-val">
                    ₹{Number(ticket?.totalFare || totalFare).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="bp-qr-wrap">
                <QRMock />
                <span className="bp-qr-label">Scan at gate</span>
              </div>
            </div>

            {/* Confirmation note */}
            <div className="bp-email-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Confirmation sent to your registered email address
            </div>

            <button className="btn-new-booking" onClick={handleReset}>
              Book Another Flight
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}