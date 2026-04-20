export default function AdminSchedulesTab({
  schedules,
  onAdd,
  onEdit,
  onDelete,
}) {
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
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-num">{schedules.length}</p>
          <p className="stat-label">Total Schedules</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            {[...new Set(schedules.map((s) => s.flightId))].length}
          </p>
          <p className="stat-label">Flights Scheduled</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            {[...new Set(schedules.map((s) => s.routeId))].length}
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
            {schedules.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  No schedules added yet.
                </td>
              </tr>
            )}
            {schedules.map((s) => (
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
                    <button className="btn-edit" onClick={() => onEdit(s)}>
                      ✏ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(s.scheduleId)}
                    >
                      🗑 Delete
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
