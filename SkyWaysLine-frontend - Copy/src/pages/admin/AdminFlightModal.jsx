export default function AdminFlightModal({
  flightModal,
  flightEdit,
  flightForm,
  setFlightForm,
  setFlightModal,
  saveFlight,
}) {
  if (!flightModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setFlightModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{flightEdit ? "Edit Flight" : "Add Flight"}</h2>
          <button className="modal-close" onClick={() => setFlightModal(false)}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="form-row-2">
            <div className="field">
              <label>
                Flight ID <span className="req">*</span>
              </label>
              <input
                placeholder="e.g. FL003"
                value={flightForm.flightId}
                disabled={!!flightEdit}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, flightId: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>
                Flight Name <span className="req">*</span>
              </label>
              <input
                placeholder="e.g. Sky Ways Premium"
                value={flightForm.flightName}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, flightName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-row-2">
            <div className="field">
              <label>
                Seating Capacity <span className="req">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 180"
                value={flightForm.seatingCapacity}
                onChange={(e) =>
                  setFlightForm({
                    ...flightForm,
                    seatingCapacity: e.target.value,
                  })
                }
              />
            </div>
            <div className="field">
              <label>Reservation Capacity</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 20"
                value={flightForm.reservationCapacity}
                onChange={(e) =>
                  setFlightForm({
                    ...flightForm,
                    reservationCapacity: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={() => setFlightModal(false)}>
            Cancel
          </button>
          <button className="btn-save" onClick={saveFlight}>
            {flightEdit ? "Update" : "Add Flight"}
          </button>
        </div>
      </div>
    </div>
  );
}
