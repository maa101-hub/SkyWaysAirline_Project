export default function AdminFlightsTab({
  flights,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Flights</h1>
          <p className="tab-sub">Manage your fleet of aircraft</p>
        </div>
        <button className="btn-add" onClick={() => onAdd()}>
          + Add Flight
        </button>
      </div>
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-num">{flights.length}</p>
          <p className="stat-label">Total Flights</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            {flights.reduce((a, f) => a + Number(f.seatingCapacity), 0)}
          </p>
          <p className="stat-label">Total Seats</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            {flights.reduce((a, f) => a + Number(f.reservationCapacity || 0), 0)}
          </p>
          <p className="stat-label">Reserved Seats</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Flight ID</th>
              <th>Flight Name</th>
              <th>Seating Capacity</th>
              <th>Reservation Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">
                  No flights added yet.
                </td>
              </tr>
            )}
            {flights.map((f) => (
              <tr key={f.flightId}>
                <td>
                  <span className="id-badge">{f.flightId}</span>
                </td>
                <td>
                  <strong>{f.flightName}</strong>
                </td>
                <td>{f.seatingCapacity}</td>
                <td>{f.reservationCapacity || "—"}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => onEdit(f)} title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3" />
                      </svg>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(f.flightId)}
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
