export default function AdminRoutesTab({
  routes,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Routes</h1>
          <p className="tab-sub">Configure source–destination routes</p>
        </div>
        <button className="btn-add" onClick={() => onAdd()}>
          + Add Route
        </button>
      </div>
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-num">{routes.length}</p>
          <p className="stat-label">Total Routes</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            {routes
              .reduce((a, r) => a + Number(r.distance), 0)
              .toLocaleString()}{" "}
            km
          </p>
          <p className="stat-label">Total Distance</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">
            ₹
            {routes.length
              ? Math.min(...routes.map((r) => r.fare)).toLocaleString("en-IN")
              : 0}
          </p>
          <p className="stat-label">Min Fare</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Route ID</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Distance (km)</th>
              <th>Fare (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No routes added yet.
                </td>
              </tr>
            )}
            {routes.map((r) => (
              <tr key={r.routeId}>
                <td>
                  <span className="id-badge">{r.routeId}</span>
                </td>
                <td>🛫 {r.source}</td>
                <td>🛬 {r.destination}</td>
                <td>{Number(r.distance).toLocaleString()}</td>
                <td>₹{Number(r.fare).toLocaleString("en-IN")}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => onEdit(r)} title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3" />
                      </svg>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(r.routeId)}
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
