import { useContext, useEffect, useState } from "react";
import "./BookNow.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import AnimBtn from "./components/bookNow/AnimBtn";
import FlightSummary from "./components/bookNow/FlightSummary";
import StepRunway from "./components/bookNow/StepRunway";
import { PlaneIcon, PlaneSVG, SmallPlane } from "./components/bookNow/BookNowVisuals";
import {
  blankPassenger,
  calcArrival,
  delay,
  fareCalculation,
  getInitialWalletBalance,
  getStepClass,
  getWalletBalanceFromProfile,
} from "./components/bookNow/bookNowUtils";

// ════════════════════════════════════════════════════════════════════════════════
export default function BookNow() {
  const { profile } = useContext(AuthContext);
  const location   = useLocation();
  const navigate   = useNavigate();
  const flightData = location.state || {};
  const flight     = flightData.flight || {};

  const autoReservationId = flightData.reservationId || "RES-" + Date.now();
  const autoUserId        = flightData.userId || "USR-001";
  const price             = flightData.totalFare || 0;
  const depTime           = flight.departureTime?.slice(0, 5);
  const arrival           = calcArrival(depTime, flight.travelDuration);

  // Phases: flying → form → paying → success → done
  const [phase,    setPhase]    = useState("flying");
  const [saving,   setSaving]   = useState(false);
  const [payMsg,   setPayMsg]   = useState("Initiating Payment...");
  const [ticket,   setTicket]   = useState(null);
  const [payError, setPayError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [walletBalance, setWalletBalance] = useState(() => getInitialWalletBalance(flightData));

  // Step within form (0–3)
  const [formStep, setFormStep] = useState(0);
  const [flipDir,  setFlipDir]  = useState("forward"); // for animation class

  const [reservation, setReservation] = useState({
    reservationType: "",
    journeyDate: flightData.journeyDate || "",
  });
  const [passengers, setPassengers] = useState([blankPassenger()]);

  const totalFare = fareCalculation(passengers.length, price);
  const today     = new Date().toISOString().split("T")[0];
  const walletHasFunds = walletBalance >= totalFare;
  const userEmail =
    profile?.email ||
    profile?.userEmail ||
    profile?.emailId ||
    profile?.user?.email ||
    profile?.data?.email ||
    flightData.email ||
    flightData.userEmail ||
    "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("skywaysWalletBalance", String(walletBalance));
    }
  }, [walletBalance]);

  useEffect(() => {
    const profileWalletBalance = getWalletBalanceFromProfile(profile);
    if (profileWalletBalance !== null) {
      setWalletBalance(profileWalletBalance);
    }
  }, [profile]);

  // Auto-advance intro
  useEffect(() => {
    if (phase !== "flying") return;
    const t = setTimeout(() => setPhase("form"), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  // Step navigation with flip direction
  const goToStep = (next) => {
    setFlipDir(next > formStep ? "forward" : "back");
    setFormStep(next);
  };

  // Field handlers
  const onResChange = (e) =>
    setReservation({ ...reservation, [e.target.name]: e.target.value });

  const addPassenger = () => {
    const next = [...passengers, blankPassenger()];
    setPassengers(next);
  };

  const removePassenger = (key) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((p) => p._key !== key));
  };

  const onPaxChange = (key, field, val) =>
    setPassengers(passengers.map((p) => p._key === key ? { ...p, [field]: val } : p));

  const finalizeSuccess = async (ticketData) => {
    setTicket(ticketData);
    const confirmedPassengers =
      ticketData?.passengers ||
      ticketData?.passengerList ||
      ticketData?.passengerDTOs ||
      [];

    if (Array.isArray(confirmedPassengers) && confirmedPassengers.length > 0) {
      setPassengers((prev) =>
        prev.map((passenger, index) => {
          const confirmed = confirmedPassengers[index] || {};

          return {
            ...passenger,
            name: confirmed.name || passenger.name,
            gender: confirmed.gender || passenger.gender,
            age: confirmed.age || passenger.age,
            seatNo:
              confirmed.seatNo ||
              confirmed.seatNumber ||
              confirmed.seat ||
              passenger.seatNo,
          };
        })
      );
    }
    setPayMsg("Booking Confirmed! ✓");
    await delay(600);
    setPhase("success");
    setTimeout(() => setPhase("done"), 2400);
  };

  const buildAssignedPassengers = () => {
    return passengers;
  };

  const buildBookingRequest = (assignedPax) => ({
    scheduleId: flight.flightId || "SC-001",
    noOfSeats: assignedPax.length,
    userId: autoUserId,
    journeyDate: reservation.journeyDate,
    passengers: assignedPax.map(({ name, gender, age }) => ({ name, gender, age })),
  });

  const handleWalletPayment = async (bookingRequest, assignedPax) => {
    if (!walletHasFunds) {
      throw new Error("Insufficient wallet balance for this booking.");
    }

    setPayMsg("Processing wallet payment...");
    await delay(400);

    setPayMsg("Confirming your booking...");

    const walletRes = await axios.post(
      "http://localhost:8090/api/booking/wallet/payment",
      bookingRequest
    );

    setWalletBalance((prev) => Math.max(prev - totalFare, 0));

    await finalizeSuccess(
      walletRes?.data?.data || {
        reservationId: autoReservationId,
        flightNumber: flight.flightId || "SW-411",
        noOfSeats: assignedPax.length,
        totalFare,
        journeyDate: reservation.journeyDate,
        passengers: bookingRequest.passengers,
        paymentMethod: "wallet",
      }
    );
  };

  const handleRazorpayPayment = async (bookingRequest) => {
    setPayMsg("Creating your order...");

    const orderRes = await axios.post("http://localhost:8090/api/booking/create-order", bookingRequest);
    const orderId = orderRes.data.data;

    setPayMsg("Processing payment...");

    const options = {
      key: "rzp_test_SdKfg1SHSyvaok",
      amount: totalFare * 100,
      currency: "INR",
      order_id: orderId,
      name: "SkyWays Airlines",
      description: "Flight Booking",
      prefill: { name: passengers[0]?.name || "", email: "user@example.com" },
      handler: async (response) => {
        try {
          setPayMsg("Verifying payment...");
          await delay(700);
          const confirmRes = await axios.post("http://localhost:8090/api/booking/confirm", {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingRequest,
          });
          await finalizeSuccess(confirmRes.data.data);
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
  };

  // Submit / payment
  const handleSubmit = async () => {
    setSaving(true);
    setPayError("");

    try {
      const assignedPax = buildAssignedPassengers();
      const bookingRequest = buildBookingRequest(assignedPax);

      setPhase("paying");

      if (paymentMethod === "wallet") {
        await handleWalletPayment(bookingRequest, assignedPax);
        setSaving(false);
        return;
      }

      await handleRazorpayPayment(bookingRequest);
    } catch (err) {
      setPayError(err?.response?.data?.message || err?.message || "Could not complete payment.");
      setSaving(false);
      setPhase("form");
    }
  };

  const handleReset = () => {
    setPhase("flying");
    setSaving(false);
    setPayError("");
    setTicket(null);
    setPaymentMethod("razorpay");
    setFormStep(0);
    setReservation({ reservationType: "", journeyDate: "" });
    setPassengers([blankPassenger()]);
  };

  const ticketPassengers =
    ticket?.passengers ||
    ticket?.passengerList ||
    ticket?.passengerDTOs ||
    [];

  const confirmedPassengers =
    Array.isArray(ticketPassengers) && ticketPassengers.length > 0
      ? ticketPassengers.map((passenger, index) => ({
          ...passengers[index],
          ...passenger,
          seatNo:
            passenger.seatNo ||
            passenger.seatNumber ||
            passenger.seat ||
            passengers[index]?.seatNo ||
            "",
        }))
      : passengers;

  const seatList = confirmedPassengers.map((p) => p.seatNo || "Pending").join(", ");

  const boardingPassPayload = confirmedPassengers.map((passenger, index) => ({
    flightNumber:  ticket?.flightNumber || flight.flightId || "SW-411",
    passengerName: passenger.name || "Guest",
    fromCode:      flightData.fromCode || flight.source?.slice(0,3).toUpperCase() || "BOM",
    toCode:        flightData.toCode   || flight.destination?.slice(0,3).toUpperCase() || "JFK",
    fromCity:      flight.source       || "Mumbai",
    toCity:        flight.destination  || "New York",
    departureTime: depTime  || "22:45",
    arrivalTime:   arrival  || "06:30",
    journeyDate:   reservation.journeyDate || ticket?.journeyDate || today,
    gate:          ticket?.gate     || "B" + (Math.floor(Math.random() * 20) + 10),
    terminal:      ticket?.terminal || "T3",
    seatNos:       passenger.seatNo || "Pending",
    boardingTime:  depTime || "22:45",
    group:         flightData.cabinClass?.slice(0,1).toUpperCase() || "E",
    classType:     flightData.cabinClass || "Economy",
    reservationId: ticket?.reservationId || autoReservationId,
    amountPaid:    Number(ticket?.totalFare || totalFare),
    email:         userEmail,
    qrSeed:        Number(ticket?.reservationId?.slice(-6)) || 42 + index,
  }));

  // Step validation
  const step0Valid = reservation.reservationType && reservation.journeyDate;
  const step1Valid = passengers.every((p) => p.name && p.gender && p.age);

  // Panel animation class
  const panelClass = `step-panel ${flipDir === "forward" ? "flip-enter" : "flip-enter-back"}`;

  return (
    <div className="bn-wrap">

      {/* Background */}
      <div className="bn-bg">
        <div className="bn-cloud bn-cloud-1" />
        <div className="bn-cloud bn-cloud-2" />
        <div className="bn-cloud bn-cloud-3" />
      </div>

      {/* ══ PHASE: FLYING ══════════════════════════════════════════════════════ */}
      {phase === "flying" && (
        <div className="fly-stage">
          <div className="fly-plane-wrap">
            <PlaneSVG width={320} />
          </div>
          <div className="fly-brand">
            <div style={{ fontFamily:"var(--font-d)", fontSize:"3rem", fontWeight:800, color:"var(--blue-dark)", letterSpacing:"-.02em" }}>
              Sky<em style={{ color:"var(--blue)", fontStyle:"normal" }}>Ways</em>
            </div>
            <span style={{ fontSize:".78rem", letterSpacing:".35em", textTransform:"uppercase", color:"var(--slate)" }}>
              Premium Air Travel
            </span>
          </div>
          <div className="fly-progress">
            <div className="fly-progress-bar" />
          </div>
        </div>
      )}

      {/* ══ PHASE: FORM ════════════════════════════════════════════════════════ */}
      {phase === "form" && (
        <div className="form-stage">

          {/* Nav */}
          <header className="form-nav">
            <div
              className="nav-logo"
              onClick={() => navigate("/home")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/home");
                }
              }}
              style={{ cursor: "pointer" }}
              title="Go to Home"
            >
              ✈︎ Sky<span>Ways</span>
            </div>
            <div className="nav-route">
              <span>{flight.source?.slice(0,3).toUpperCase() || flightData.from || "—"}</span>
              <span className="nav-route-divider">›</span>
              <span>{flight.destination?.slice(0,3).toUpperCase() || flightData.to || "—"}</span>
            </div>
            <div className="nav-secure">
              <div className="nav-secure-dot" />
              SSL Secured
            </div>
          </header>

          {/* Error */}
          {payError && (
            <div className="error-banner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {payError}
              <button className="err-close" onClick={() => setPayError("")}>✕</button>
            </div>
          )}

          {/* Step runway */}
          <StepRunway current={formStep} />

          <div className="form-body">

            {/* Sidebar */}
            <FlightSummary
              flight={flight}
              flightData={flightData}
              passengers={passengers}
              price={price}
              depTime={depTime}
              arrival={arrival}
            />

            {/* Main content — flip panels */}
            <main>
              <div className="flip-container">

                {/* ── STEP 0: Trip Details ── */}
                {formStep === 0 && (
                  <div className={panelClass}>
                    <div className="sec-head">
                      <div className="sec-head-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      Trip Details
                    </div>

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
                        <input type="text" readOnly value={`${passengers.length} passenger${passengers.length > 1 ? "s" : ""}`}
                          className="field-input readonly" />
                        <span className="readonly-badge">Auto</span>
                      </div>

                      <div className="field-group readonly-group">
                        <label className="field-label">Total Fare</label>
                        <input type="text" readOnly
                          value={"₹" + totalFare.toLocaleString("en-IN")}
                          className="field-input readonly fare-display" />
                        <span className="readonly-badge">Calculated</span>
                      </div>
                    </div>

                    <div className="nav-btns">
                      <AnimBtn
                        className="btn-primary"
                        onClick={() => goToStep(1)}
                        disabled={!step0Valid}
                      >
                        Continue
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </AnimBtn>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Passengers ── */}
                {formStep === 1 && (
                  <div className={panelClass}>
                    <div className="pax-head">
                      <div className="sec-head">
                        <div className="sec-head-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                          </svg>
                        </div>
                        Passengers
                      </div>
                      <button type="button" className="btn-add-pax" onClick={addPassenger}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add
                      </button>
                    </div>

                    {/* Seat auto-assign note */}
                  

                    <div className="pax-list">
                      {passengers.map((p, idx) => (
                        <div key={p._key} className="pax-card">
                          <div className="pax-card-head">
                            <div className="pax-badge">{idx + 1}</div>
                            <span className="pax-title">Passenger {idx + 1}</span>
                            {passengers.length > 1 && (
                              <button type="button" className="btn-rm-pax"
                                onClick={() => removePassenger(p._key)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="pax-grid">
                            <div className="field-group" style={{ gridColumn:"1/-1" }}>
                              <label className="field-label">Full Name</label>
                              <input type="text" placeholder="As on passport"
                                value={p.name} className="field-input"
                                onChange={(e) => onPaxChange(p._key, "name", e.target.value)} required />
                            </div>
                            <div className="field-group">
                              <label className="field-label">Gender</label>
                              <div className="select-wrap">
                                <select value={p.gender} className="field-input"
                                  onChange={(e) => onPaxChange(p._key, "gender", e.target.value)} required>
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
                              <input type="number" min="1" max="120" placeholder="Age"
                                value={p.age} className="field-input"
                                onChange={(e) => onPaxChange(p._key, "age", e.target.value)} required />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="nav-btns spread">
                      <AnimBtn className="btn-ghost" onClick={() => goToStep(0)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M19 12H5M12 5l-7 7 7 7"/>
                        </svg>
                        Back
                      </AnimBtn>
                      <AnimBtn
                        className="btn-primary"
                        onClick={() => goToStep(2)}
                        disabled={!step1Valid}
                      >
                        Review Booking
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </AnimBtn>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Review ── */}
                {formStep === 2 && (
                  <div className={panelClass}>
                    <div className="sec-head">
                      <div className="sec-head-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                      </div>
                      Review Your Booking
                    </div>

                    <div className="review-panel">

                      {/* Route */}
                      <div className="review-section">
                        <div className="review-section-title">Flight Details</div>
                        <div className="review-route-block">
                          <div>
                            <div className="review-iata">{flight.source?.slice(0,3).toUpperCase() || "BOM"}</div>
                            <div className="review-city">{flight.source || "Mumbai"}</div>
                            <div style={{ fontSize:".85rem", fontWeight:700, color:"var(--text)", marginTop:".3rem" }}>{depTime || "--:--"}</div>
                          </div>
                          <div className="review-plane-mid">
                            <div className="review-dashed" />
                            <div className="review-plane-icon"><PlaneIcon size={20} /></div>
                            <div className="review-dashed" />
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div className="review-iata">{flight.destination?.slice(0,3).toUpperCase() || "JFK"}</div>
                            <div className="review-city">{flight.destination || "New York"}</div>
                            <div style={{ fontSize:".85rem", fontWeight:700, color:"var(--text)", marginTop:".3rem" }}>{arrival || "--:--"}</div>
                          </div>
                        </div>
                        <div className="review-grid">
                          {[
                            ["Flight",    flightData.flight?.flightId || "SW-411"],
                            ["Aircraft",  flightData.flight?.flightName || "Boeing 777"],
                            ["Date",      reservation.journeyDate || "--"],
                            ["Class",     flightData.cabinClass || "Economy"],
                            ["Type",      reservation.reservationType || "--"],
                            ["Duration",  flight.travelDuration || "--"],
                          ].map(([l, v]) => (
                            <div key={l} className="review-cell">
                              <div className="rc-label">{l}</div>
                              <div className="rc-val">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Passengers */}
                      <div className="review-section">
                        <div className="review-section-title">Passengers ({passengers.length})</div>
                        <div className="review-pax-list">
                          {passengers.map((p, i) => (
                            <div key={p._key} className="review-pax-row">
                              <div className="rpax-num">{i + 1}</div>
                              <div className="rpax-name">{p.name || "—"}</div>
                              <div className="rpax-meta">
                                <span>{p.gender || "—"}</span>
                                <span>Age {p.age || "—"}</span>
                                <span style={{ color:"var(--blue)", fontWeight:600 }}>Seat: Auto</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fare */}
                      <div className="review-section">
                        <div className="review-section-title">Fare Summary</div>
                        <div className="review-fare-block">
                          <div className="review-fare-row">
                            <span>Base Fare × {passengers.length}</span>
                            <span>₹{fareCalculation(passengers.length, price).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="review-fare-row">
                            <span>Taxes & Surcharges</span>
                            <span>Included</span>
                          </div>
                          <div className="review-fare-total">
                            <span>Amount to Pay</span>
                            <span className="review-fare-amt">₹{totalFare.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="review-section">
                        <div className="review-section-title">Payment Method</div>
                        <div className="payment-methods">
                          <button
                            type="button"
                            className={`payment-option ${paymentMethod === "wallet" ? "active" : ""} ${!walletHasFunds ? "insufficient" : ""}`}
                            onClick={() => setPaymentMethod("wallet")}
                          >
                            <div className="payment-option-top">
                              <div className="payment-option-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 7a2 2 0 0 1 2-2h14v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
                                  <path d="M3 9h16"/>
                                  <circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none"/>
                                </svg>
                              </div>
                              <div>
                                <div className="payment-option-title">Pay through Wallet</div>
                                <div className="payment-option-subtitle">
                                  Use your SkyWays wallet balance instantly
                                </div>
                              </div>
                            </div>
                            <div className="wallet-balance-row">
                              <span>Current Balance</span>
                              <strong>₹{walletBalance.toLocaleString("en-IN")}</strong>
                            </div>
                            <div className={`wallet-status ${walletHasFunds ? "enough" : "low"}`}>
                              {walletHasFunds
                                ? `After payment: ₹${Math.max(walletBalance - totalFare, 0).toLocaleString("en-IN")}`
                                : `Need ₹${(totalFare - walletBalance).toLocaleString("en-IN")} more`}
                            </div>
                          </button>

                          <button
                            type="button"
                            className={`payment-option ${paymentMethod === "razorpay" ? "active" : ""}`}
                            onClick={() => setPaymentMethod("razorpay")}
                          >
                            <div className="payment-option-top">
                              <div className="payment-option-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                                  <path d="M2 10h20"/>
                                </svg>
                              </div>
                              <div>
                                <div className="payment-option-title">Pay with Razorpay</div>
                                <div className="payment-option-subtitle">
                                  Card, UPI, net banking and more
                                </div>
                              </div>
                            </div>
                            <div className="wallet-balance-row">
                              <span>Payable Amount</span>
                              <strong>₹{totalFare.toLocaleString("en-IN")}</strong>
                            </div>
                            <div className="wallet-status enough">Secure online payment gateway</div>
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="nav-btns spread">
                      <AnimBtn className="btn-ghost" onClick={() => goToStep(1)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M19 12H5M12 5l-7 7 7 7"/>
                        </svg>
                        Edit
                      </AnimBtn>
                      <AnimBtn
                        className="btn-pay"
                        onClick={handleSubmit}
                        disabled={saving || (paymentMethod === "wallet" && !walletHasFunds)}
                      >
                        {saving ? (
                          <span className="btn-loading-inner">
                            <span className="spin" /> Processing...
                          </span>
                        ) : (
                          <>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                            {paymentMethod === "wallet"
                              ? `Pay from Wallet ₹${totalFare.toLocaleString("en-IN")}`
                              : `Pay with Razorpay ₹${totalFare.toLocaleString("en-IN")}`}
                          </>
                        )}
                      </AnimBtn>
                    </div>
                  </div>
                )}

              </div>
            </main>
          </div>
        </div>
      )}

      {/* ══ PHASE: PAYING ══════════════════════════════════════════════════════ */}
      {phase === "paying" && (
        <div className="paying-stage">
          <div className="paying-card">
            <div className="orbit-loader">
              <div className="orbit-ring or1" />
              <div className="orbit-ring or2" />
              <div className="orbit-ring or3" />
              <div className="orbit-core">
                <PlaneIcon size={24} />
              </div>
            </div>
            <p className="paying-title">Processing Payment</p>
            <p className="paying-msg">{payMsg}</p>
            <div className="pay-steps">
              {["Order","Payment","Verify","Confirm"].map((s, i) => (
                <div key={s} className={`pay-step ${getStepClass(payMsg, i)}`}>
                  <div className="pay-dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <p className="paying-secure">
              <svg width="11" height="13" viewBox="0 0 12 14" fill="none">
                <path d="M6 0L12 3V7C12 10.3 9.3 13.3 6 14 2.7 13.3 0 10.3 0 7V3L6 0Z" fill="var(--blue)" opacity=".2"/>
                <path d="M6 1L11 3.5V7C11 9.8 8.8 12.5 6 13.2 3.2 12.5 1 9.8 1 7V3.5L6 1Z" stroke="var(--blue)" strokeWidth="1" fill="none"/>
              </svg>
              256-bit SSL · SkyWays Payment Gateway
            </p>
          </div>
        </div>
      )}

      {/* ══ PHASE: SUCCESS ═════════════════════════════════════════════════════ */}
      {phase === "success" && (
        <div className="success-stage">
          <div className="success-burst" />
          <div className="success-burst burst2" />
          <div className="success-planes">
            {[1,2,3].map(i => (
              <div key={i} className={`spl spl${i}`} style={{
                top: `${40 + (i-2)*12}%`,
                left: 0,
              }}>
                <SmallPlane size={120 + i * 20} />
              </div>
            ))}
          </div>
          <div className="success-center">
            <div className="success-check">
              <svg width="56" height="56" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none" stroke="var(--blue)" strokeWidth="1.5" className="check-circle"/>
                <path d="M14 27l8 8 16-16" fill="none" stroke="var(--blue)" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round" className="check-path"/>
              </svg>
            </div>
            <p className="success-label">Payment Successful!</p>
          </div>
        </div>
      )}

      {/* ══ PHASE: DONE ════════════════════════════════════════════════════════ */}
      {phase === "done" && (
        <div className="done-stage">
          <button
            type="button"
            className="done-home-btn"
            onClick={() => navigate("/home")}
            aria-label="Go to home"
            title="Go to Home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 10.5L12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
            </svg>
            Home
          </button>

          <div className="confirm-card anim-up">

            {/* Blue header */}
            <div className="confirm-top">
              <div className="confirm-status-row">
                <div className="confirm-check-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="confirm-status">Booking Confirmed</span>
              </div>
              <p className="confirm-sub">
                Your reservation is secured. Review your details below.
              </p>
            </div>

            {/* Route */}
            <div className="confirm-route">
              <div>
                <div className="conf-iata">{flight.source?.slice(0,3).toUpperCase() || "BOM"}</div>
                <div className="conf-city">{flight.source || "Mumbai"}</div>
              </div>
              <div className="conf-mid">
                <div className="conf-mid-line" />
                <div className="conf-plane-icon"><PlaneIcon size={20} /></div>
                <div className="conf-mid-line" />
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="conf-iata">{flight.destination?.slice(0,3).toUpperCase() || "JFK"}</div>
                <div className="conf-city">{flight.destination || "New York"}</div>
              </div>
            </div>

            {/* Details grid */}
            <div className="confirm-grid">
              {[
                ["Reservation ID", ticket?.reservationId || autoReservationId],
                ["Flight",         ticket?.flightNumber  || flight.flightId || "SW-411"],
                ["Date",           reservation.journeyDate || ticket?.journeyDate || today],
                ["Passengers",     String(ticket?.noOfSeats || passengers.length)],
                ["Seats",          seatList],
                ["Amount Paid",    "₹" + Number(ticket?.totalFare || totalFare).toLocaleString("en-IN")],
              ].map(([l, v]) => (
                <div key={l} className="cg-cell">
                  <div className="cg-label">{l}</div>
                  <div className="cg-val">{v}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="confirm-actions">
              <AnimBtn
                className="btn-boarding"
                onClick={() => navigate("/boarding-pass", {
                  state: {
                    boardings: boardingPassPayload,
                    autoEmail: false,
                    email: userEmail,
                  },
                })}
                style={{ width:"100%" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <polyline points="2 10 22 10"/>
                </svg>
                Get Your Boarding Pass
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </AnimBtn>
              <AnimBtn
                className="btn-secondary"
                onClick={handleReset}
                style={{ width:"100%" }}
              >
                Book Another Flight
              </AnimBtn>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
