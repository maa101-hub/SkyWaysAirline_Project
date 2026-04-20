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
                    <button className="btn-edit" onClick={() => onEdit(f)}>
                      ✏ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(f.flightId)}
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
