export default function AdminNotificationsPanel({
  notifOpen,
  notifications,
  pendingCount,
  users,
  getDisplayUserId,
  confirmDeleteUser,
  denyDeleteRequest,
  markAllNotificationsAsRead,
  clearNotificationHistory,
}) {
  const hasNotifications = notifications.length > 0;

  return (
    <div className={`notif-panel ${notifOpen ? "notif-open" : ""}`}>
      <div className="notif-header">
        <p className="notif-title">🔔 Notifications</p>
        <span className="notif-count">{pendingCount} pending</span>
      </div>

      {hasNotifications && (
        <div className="notif-toolbar">
          <button className="notif-toolbar-btn" onClick={markAllNotificationsAsRead}>
            Mark all as read
          </button>
          <button className="notif-toolbar-btn" onClick={clearNotificationHistory}>
            Clear history
          </button>
        </div>
      )}

      {!hasNotifications && (
        <p className="notif-empty">No notifications yet</p>
      )}

      {notifications.map((req) => {
        const linkedUser = users.find((user) => user.userId === req.userId);
        const displayUserId = linkedUser
          ? getDisplayUserId(linkedUser)
          : req.userId;

        const isPendingDeleteRequest = req.type === "DELETE_REQUEST" && req.status === "pending";
        const statusLabel =
          req.status === "approved"
            ? "Approved"
            : req.status === "denied"
              ? "Denied"
              : req.type === "USER_DELETED"
                ? "Deleted"
                : "Pending";

        return (
          <div key={`${req.type}-${req.reqId}`} className={`notif-item ${req.read ? "" : "notif-unread"}`}>
            <div className="notif-avatar">{req.name.charAt(0)}</div>
            <div className="notif-info">
              <p className="notif-msg">
                {req.type === "USER_DELETED" ? (
                  <>
                    <strong>{req.name}</strong> account deleted successfully
                  </>
                ) : (
                  <>
                    <strong>{req.name}</strong> wants to delete their account
                  </>
                )}
              </p>
              <p className="notif-meta">
                {displayUserId} · {req.requestedAt}
              </p>
              <p className={`notif-state notif-state-${req.status || "pending"}`}>{statusLabel}</p>
              {req.reason && <p className="notif-reason">"{req.reason}"</p>}
              {isPendingDeleteRequest && (
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
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
