export default function AdminRouteModal({
  routeModal,
  routeEdit,
  routeForm,
  setRouteForm,
  setRouteModal,
  saveRoute,
}) {
  if (!routeModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setRouteModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{routeEdit ? "Edit Route" : "Add Route"}</h2>
          <button className="modal-close" onClick={() => setRouteModal(false)}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>
              Route ID <span className="req">*</span>
            </label>
            <input
              placeholder="e.g. RT003"
              value={routeForm.routeId}
              disabled={!!routeEdit}
              onChange={(e) =>
                setRouteForm({ ...routeForm, routeId: e.target.value })
              }
            />
          </div>
          <div className="form-row-2">
            <div className="field">
              <label>
                Source <span className="req">*</span>
              </label>
              <input
                placeholder="e.g. Delhi"
                value={routeForm.source}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, source: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>
                Destination <span className="req">*</span>
              </label>
              <input
                placeholder="e.g. Mumbai"
                value={routeForm.destination}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, destination: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-row-2">
            <div className="field">
              <label>
                Distance (km) <span className="req">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 1150"
                value={routeForm.distance}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, distance: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Fare (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 4599"
                value={routeForm.fare}
                onChange={(e) =>
                  setRouteForm({ ...routeForm, fare: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={() => setRouteModal(false)}>
            Cancel
          </button>
          <button className="btn-save" onClick={saveRoute}>
            {routeEdit ? "Update" : "Add Route"}
          </button>
        </div>
      </div>
    </div>
  );
}
