export default function AdminUserDeleteModal({
  userDelConfirm,
  onCancel,
  onDelete,
}) {
  if (!userDelConfirm) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm user-del-modal">
        <div className="modal-header">
          <h2>Delete User Account</h2>
        </div>
        <div className="modal-body">
          <div className="user-del-icon">⚠️</div>
          <p className="confirm-text">
            Permanently delete account of <strong>{userDelConfirm.name}</strong>?
            <br />
            <span className="del-warn">This action cannot be undone.</span>
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onDelete}>
            🗑 Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
