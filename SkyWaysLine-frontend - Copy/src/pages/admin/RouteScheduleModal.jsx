export default function RouteScheduleModal({ selectedRoute, flights, onClose }) {
  if (!selectedRoute) return null;

  const linkedSchedules = selectedRoute.linkedSchedules || [];
  const hasSchedules = linkedSchedules.length > 0;
  const flightsOnRoute = selectedRoute.linkedFlightIds?.length || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🛫 Route Schedule Details</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="route-summary-card">
            <div className="route-path-row">
              <p className="route-city from">{selectedRoute.source}</p>
              <span className="route-arrow">→</span>
              <p className="route-city to">{selectedRoute.destination}</p>
            </div>

            <div className="route-summary-grid">
              <div className="route-summary-item">
                <p className="detail-label">Route ID</p>
                <p className="detail-value">
                  <span className="id-badge">{selectedRoute.routeId}</span>
                </p>
              </div>

              <div className="route-summary-item">
                <p className="detail-label">Schedules</p>
                <p className="detail-value">{linkedSchedules.length}</p>
              </div>

              <div className="route-summary-item">
                <p className="detail-label">Flights</p>
                <p className="detail-value">{flightsOnRoute}</p>
              </div>
            </div>
          </div>

          <p className="section-head modal-section-head">Schedules on This Route</p>
          {hasSchedules ? (
            <div className="schedule-list">
              {linkedSchedules.map((schedule) => {
                const flight = flights.find(
                  (f) => f.flightId === schedule.flightId
                );

                const availableDays = String(schedule.availableDays || "")
                  .split(",")
                  .map((day) => day.trim())
                  .filter(Boolean);

                return (
                  <div key={schedule.scheduleId} className="schedule-card">
                    <div className="schedule-top-row">
                      <span className="schedule-id-pill">{schedule.scheduleId}</span>
                      <span className="time-badge">{schedule.departureTime}</span>
                    </div>

                    <div className="schedule-row compact">
                      <span className="label">Flight</span>
                      <span className="value flight-value">
                        <span className="flight-name">{flight?.flightName || schedule.flightId}</span>
                        <span className="badge-flight">{schedule.flightId}</span>
                      </span>
                    </div>

                    <div className="schedule-row compact">
                      <span className="label">Duration</span>
                      <span className="value">{schedule.travelDuration} min</span>
                    </div>

                    <div className="schedule-days-wrap">
                      <span className="label">Days</span>
                      <div className="day-chips">
                        {availableDays.map((day) => (
                          <span key={day} className="day-chip">{day}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-message">
              No schedules assigned to this route yet.
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
