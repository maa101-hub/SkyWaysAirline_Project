import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  calcArrival,
  fmtDuration,
  generateReservationId,
  getColorForName,
  getInitials,
} from "./homeUtils";

function getSeatStatus(seats) {
  if (seats === 0) {
    return { text: "Sold Out", color: "#e63946" };
  }

  if (seats < 10) {
    return { text: "Few Seats Left", color: "#f4a261" };
  }

  return { text: "Available", color: "#2a9d8f" };
}

export default function FlightCard({ fl, passengers, journeyDate }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const { profile } = useContext(AuthContext);

  const depTime = fl.departureTime?.slice(0, 5);
  const arrival = calcArrival(depTime, fl.travelDuration);
  const durationFmt = fmtDuration(fl.travelDuration);
  const totalFare = fl.fare * Number(passengers);
  const days = fl.availableDays?.split(",") || [];
  const [bg, bgDark] = getColorForName(fl.flightName);
  const initials = getInitials(fl.flightName);
  const seatStatus = getSeatStatus(fl.seats);

  return (
    <div
      className={`flight-card ${hovered ? "card-hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="card-glow" style={{ background: `${bg}18` }} />

      <div className="airline-col">
        <div
          className="flight-logo-box"
          style={{ background: `linear-gradient(135deg, ${bg}, ${bgDark})` }}
        >
          {initials}
        </div>
        <div>
          <p className="airline-name">{fl.flightName}</p>
          <p className="flight-code">{fl.flightId}</p>
        </div>
      </div>

      <div className="route-col">
        <div className="time-block">
          <p className="time">{depTime}</p>
          <p className="city-name">{fl.source}</p>
        </div>

        <div className="path-block">
          <p className="duration-txt">{durationFmt}</p>
          <div className="path-track">
            <span className="track-dot" />
            <div className="track-bar">
              <span className={`flying-plane ${hovered ? "fly-fast" : ""}`}>✈</span>
            </div>
            <span className="track-dot" />
          </div>
          <p className="dist-txt">{fl.distance.toLocaleString()} km</p>
        </div>

        <div className="time-block right-align">
          <p className="time">{arrival}</p>
          <p className="city-name">{fl.destination}</p>
        </div>
      </div>

      <div className="days-col">
        <p className="col-label">Available</p>
        <div className="day-chips">
          {days.map((d) => (
            <span key={d} className="day-chip">{d}</span>
          ))}
        </div>
      </div>

      <div className="cap-col">
        <p className="col-label">Seats</p>
        <p className="cap-num">{fl.seats}</p>
        <p className="cap-sub">total capacity</p>
        <p
          className={`seat-status ${
            fl.seats === 0 ? "pulse-red" : fl.seats < 10 ? "pulse-orange" : "pulse-green"
          }`}
          style={{ color: seatStatus.color, fontWeight: "500", fontSize: "10px" }}
        >
          {seatStatus.text}
        </p>
      </div>

      <div className="price-col">
        <p className="per-person">₹{fl.fare.toLocaleString("en-IN")} / person</p>
        <p className="price">₹{totalFare.toLocaleString("en-IN")}</p>
        <p className="total-note">for {passengers} passenger{passengers > 1 ? "s" : ""}</p>
        <button
          className="book-btn"
          disabled={fl.seats === 0}
          style={{
            background: `linear-gradient(135deg, ${bg}, ${bgDark})`,
            opacity: fl.seats === 0 ? 0.5 : 1,
            cursor: fl.seats === 0 ? "not-allowed" : "pointer",
          }}
          onClick={() =>
            navigate("/booking", {
              state: {
                flight: fl,
                passengers,
                journeyDate,
                userId: profile?.userId || profile?.id,
                reservationId: generateReservationId(),
                totalFare,
              },
            })
          }
        >
          {fl.seats === 0 ? "Sold Out" : "Book Now →"}
        </button>
      </div>
    </div>
  );
}
