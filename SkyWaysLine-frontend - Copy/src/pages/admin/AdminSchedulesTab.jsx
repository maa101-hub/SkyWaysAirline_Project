export default function AdminSchedulesTab({
  schedules,
  onAdd,
  onEdit,
  onDelete,
  seatInspector,
  seatStatus,
  seatStatusLoading,
  setSeatInspector,
  loadSeatStatus,
}) {
  const normalizeDay = (value) => {
    const key = String(value || "").trim().toLowerCase();
    if (["mon", "monday"].includes(key)) return "mon";
    if (["tue", "tues", "tuesday"].includes(key)) return "tue";
    if (["wed", "wednesday"].includes(key)) return "wed";
    if (["thu", "thur", "thurs", "thursday"].includes(key)) return "thu";
    if (["fri", "friday"].includes(key)) return "fri";
    if (["sat", "saturday"].includes(key)) return "sat";
    if (["sun", "sunday"].includes(key)) return "sun";
    return key;
  };

  const selectedDay = seatInspector.journeyDate
    ? normalizeDay(new Date(seatInspector.journeyDate).toLocaleDateString("en-US", { weekday: "short" }))
    : "";

  const filteredSchedules = selectedDay
    ? schedules.filter((s) =>
        String(s.availableDays || "")
          .split(/[,\s|/]+/)
          .filter(Boolean)
          .some((d) => normalizeDay(d) === selectedDay)
      )
    : schedules;

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Schedules</h1>
          <p className="tab-sub">Assign flights to routes with timings</p>
        </div>
        <button className="btn-add" onClick={() => onAdd()}>
          + Add Schedule
        </button>
      </div>

      <div className="booking-highlight-grid" style={{ marginBottom: 18 }}>
        <div className="booking-summary-card">
          <p className="booking-summary-label">Seat Inspector</p>
          <p className="booking-summary-title">Check booked seats by day</p>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <input
              className="seat-inspector-input"
              type="date"
              value={seatInspector.journeyDate}
              onChange={(e) =>
                setSeatInspector((prev) => ({
                  ...prev,
                  journeyDate: e.target.value,
                  scheduleId: "",
                }))
              }
            />
            <select
              className="seat-inspector-input"
              value={seatInspector.scheduleId}
              onChange={(e) => setSeatInspector((prev) => ({ ...prev, scheduleId: e.target.value }))}
            >
              <option value="">Select schedule</option>
              {filteredSchedules.map((s) => (
                <option key={s.scheduleId} value={s.scheduleId}>
                  {s.scheduleId} · {s.flightId}
                </option>
              ))}
            </select>
            <button className="btn-add" onClick={loadSeatStatus} disabled={seatStatusLoading}>
              {seatStatusLoading ? "Loading..." : "Load Seat Status"}
            </button>
          </div>
        </div>

        <div className="booking-summary-card">
          <p className="booking-summary-label">Selected Day Status</p>
          {seatStatus ? (
            <>
              <p className="booking-summary-title">
                {seatStatus.flightName} <span>({seatStatus.scheduleId})</span>
              </p>
              <p className="booking-summary-meta">
                {seatStatus.source} → {seatStatus.destination} · {seatStatus.journeyDate}
              </p>
              <p className="booking-summary-meta">
                Booked {seatStatus.bookedSeats} / {seatStatus.totalSeats} seats
              </p>
              <p className="booking-summary-meta">
                Available seats: {seatStatus.availableSeats}
              </p>
            </>
          ) : (
            <p className="booking-summary-meta">Select a schedule and date to inspect seat count.</p>
          )}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-num">{filteredSchedules.length}</p>
          <p className="stat-label">Total Schedules</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            {[...new Set(filteredSchedules.map((s) => s.flightId))].length}
          </p>
          <p className="stat-label">Flights Scheduled</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            {[...new Set(filteredSchedules.map((s) => s.routeId))].length}
          </p>
          <p className="stat-label">Routes Active</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Schedule ID</th>
              <th>Flight ID</th>
              <th>Route ID</th>
              <th>Duration (min)</th>
              <th>Available Days</th>
              <th>Departure</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  {selectedDay
                    ? "No schedules operate on selected date."
                    : "No schedules added yet."}
                </td>
              </tr>
            )}
            {filteredSchedules.map((s) => (
              <tr key={s.scheduleId}>
                <td>
                  <span className="id-badge">{s.scheduleId}</span>
                </td>
                <td>{s.flightId}</td>
                <td>{s.routeId}</td>
                <td>{s.travelDuration} min</td>
                <td>
                  <div className="day-chips">
                    {s.availableDays.split(",").map((d) => (
                      <span key={d} className="day-chip">
                        {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className="time-badge">{s.departureTime}</span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => onEdit(s)} title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3" />
                      </svg>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(s.scheduleId)}
                      title="Delete"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DAA520" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
