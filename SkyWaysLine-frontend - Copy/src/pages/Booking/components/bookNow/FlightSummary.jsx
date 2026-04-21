import { PlaneIcon } from "./BookNowVisuals";
import { fareCalculation } from "./bookNowUtils";

export default function FlightSummary({ flight, flightData, passengers, price, depTime, arrival }) {
  const totalFare = fareCalculation(passengers.length, price);

  return (
    <aside className="fsc">
      <div className="fsc-card">
        <p className="fsc-eyebrow">✦ Your Flight</p>

        <div className="fsc-route">
          <div className="fsc-city">
            <span className="fsc-iata">{flight.source?.slice(0, 3).toUpperCase() || "BOM"}</span>
            <span className="fsc-name">{flight.source || "Mumbai"}</span>
          </div>
          <div className="fsc-mid">
            <div className="fsc-line-h" />
            <div className="fsc-plane-sm"><PlaneIcon size={16} /></div>
            <div className="fsc-line-h" />
            <span className="fsc-dur">{flight.travelDuration || "--"}</span>
          </div>
          <div className="fsc-city" style={{ textAlign: "right" }}>
            <span className="fsc-iata">{flight.destination?.slice(0, 3).toUpperCase() || "JFK"}</span>
            <span className="fsc-name">{flight.destination || "New York"}</span>
          </div>
        </div>

        <div className="fsc-rows">
          {[
            ["Flight", flightData.flight?.flightId || "SW-411"],
            ["Aircraft", flightData.flight?.flightName || "Boeing 777"],
            ["Departs", depTime || "22:45"],
            ["Arrives", arrival || "--:--"],
            ["Duration", flight.travelDuration || "--"],
            ["Class", flightData.cabinClass || "Economy"],
          ].map(([l, v]) => (
            <div key={l} className="fsc-row">
              <span className="fsc-label">{l}</span>
              <span className="fsc-val">{v}</span>
            </div>
          ))}
        </div>

        <div className="fsc-fare">
          <div className="fsc-fare-row">
            <span>{passengers.length} × ₹{price.toLocaleString("en-IN")}</span>
            <span>₹{totalFare.toLocaleString("en-IN")}</span>
          </div>
          <div className="fsc-fare-row" style={{ color: "var(--slate-light)", fontSize: ".76rem" }}>
            <span>Taxes & Fees</span>
            <span>Incl.</span>
          </div>
          <div className="fsc-fare-total">
            <span>Total</span>
            <span className="fsc-total-amt">₹{totalFare.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
