export default function AdminBookingsTab({
  bookingRows,
  totalBookedSeats,
  totalRemainingSeats,
  fullyBookedFlights,
  topBookedFlight,
  totalSeats,
}) {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Bookings</h1>
          <p className="tab-sub">
            Flight-wise booking status and remaining seat capacity
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-num">{totalBookedSeats.toLocaleString()}</p>
          <p className="stat-label">Booked Seats</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">{totalRemainingSeats.toLocaleString()}</p>
          <p className="stat-label">Remaining Seats</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">{fullyBookedFlights}</p>
          <p className="stat-label">Fully Booked Flights</p>
        </div>
      </div>

      <div className="booking-highlight-grid">
        <div className="booking-summary-card">
          <p className="booking-summary-label">Top booked flight</p>
          <p className="booking-summary-title">
            {topBookedFlight.flightName}{" "}
            <span>({topBookedFlight.flightId})</span>
          </p>
          <p className="booking-summary-meta">
            {topBookedFlight.bookedSeats} bookings recorded so far
          </p>
        </div>
        <div className="booking-summary-card">
          <p className="booking-summary-label">Overall occupancy</p>
          <p className="booking-summary-title">
            {totalSeats
              ? Math.round((totalBookedSeats / totalSeats) * 100)
              : 0}
            %
          </p>
          <p className="booking-summary-meta">
            Based on all flights currently available in the system
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Route</th>
              <th>Total Seats</th>
              <th>Orders</th>
              <th>Seats Left</th>
              <th>Occupancy</th>
              <th>Schedules</th>
            </tr>
          </thead>
          <tbody>
            {bookingRows.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  No flight booking data available yet.
                </td>
              </tr>
            )}
            {bookingRows.map((flight) => (
              <tr key={flight.flightId}>
                <td>
                  <div className="booking-flight-cell">
                    <span className="booking-flight-id">
                      {flight.flightId}
                    </span>
                    <span className="booking-flight-name">
                      {flight.flightName}
                    </span>
                  </div>
                </td>
                <td className="booking-route-cell">
                  <ul className="booking-route-list">
                    {flight.routeDetails.map((route) => (
                      <li
                        key={`${flight.flightId}-${route.routeId}`}
                        className="booking-route-item"
                      >
                        <span className="booking-route-name">
                          {route.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{Number(flight.seatingCapacity || 0)}</td>
                <td>{flight.bookingCount}</td>
                <td>
                  <span
                    className={`booking-count ${
                      flight.remainingSeats === 0 ? "full" : "remaining"
                    }`}
                  >
                    {flight.remainingSeats}
                  </span>
                </td>
                <td>
                  <div className="occupancy-cell">
                    <div className="occupancy-bar">
                      <div
                        className={`occupancy-fill ${
                          flight.remainingSeats === 0 ? "danger" : ""
                        }`}
                        style={{
                          width: `${Math.min(flight.occupancy, 100)}%`,
                        }}
                      />
                    </div>
                    <span>{Math.round(flight.occupancy)}%</span>
                  </div>
                </td>
                <td>{flight.scheduleCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
