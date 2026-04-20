export default function AdminDeleteConfirmModal({
  flightDel,
  routeDel,
  scheduleDel,
  onCancel,
  onDelete,
}) {
  if (!flightDel && !routeDel && !scheduleDel) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2>Confirm Delete</h2>
        </div>
        <div className="modal-body">
          <p className="confirm-text">
            Are you sure you want to delete <strong>{flightDel || routeDel || scheduleDel}</strong>?
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onDelete}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}
