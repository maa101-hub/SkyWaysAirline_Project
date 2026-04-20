export default function AdminNotificationsPanel({
  notifOpen,
  deleteRequests,
  users,
  getDisplayUserId,
  confirmDeleteUser,
  denyDeleteRequest,
}) {
  return (
    <div className={`notif-panel ${notifOpen ? "notif-open" : ""}`}>
      <div className="notif-header">
        <p className="notif-title">🔔 Notifications</p>
        <span className="notif-count">{deleteRequests.length} pending</span>
      </div>

      {deleteRequests.length === 0 && (
        <p className="notif-empty">No pending requests</p>
      )}

      {deleteRequests.map((req) => {
        const linkedUser = users.find((user) => user.userId === req.userId);
        const displayUserId = linkedUser
          ? getDisplayUserId(linkedUser)
          : req.userId;

        return (
          <div key={req.reqId} className="notif-item">
            <div className="notif-avatar">{req.name.charAt(0)}</div>
            <div className="notif-info">
              <p className="notif-msg">
                <strong>{req.name}</strong> wants to delete their account
              </p>
              <p className="notif-meta">
                {displayUserId} · {req.requestedAt}
              </p>
              {req.reason && <p className="notif-reason">"{req.reason}"</p>}
              <div className="notif-actions">
                <button
                  className="notif-btn-approve"
                  onClick={() => confirmDeleteUser(req.userId, req.name, true)}
                >
                  ✓ Delete Account
                </button>
                <button
                  className="notif-btn-deny"
                  onClick={() => denyDeleteRequest(req.reqId)}
                >
                  ✕ Deny
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
