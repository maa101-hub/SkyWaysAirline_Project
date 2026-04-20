export default function AdminScheduleModal({
  scheduleModal,
  scheduleEdit,
  scheduleForm,
  flights,
  routes,
  toggleDay,
  setScheduleForm,
  setScheduleModal,
  saveSchedule,
  DAYS,
}) {
  if (!scheduleModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setScheduleModal(false)}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{scheduleEdit ? "Edit Schedule" : "Add Schedule"}</h2>
          <button className="modal-close" onClick={() => setScheduleModal(false)}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>
              Schedule ID <span className="req">*</span>
            </label>
            <input
              placeholder="e.g. SC003"
              value={scheduleForm.scheduleId}
              disabled={!!scheduleEdit}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, scheduleId: e.target.value })
              }
            />
          </div>
          <div className="form-row-2">
            <div className="field">
              <label>
                Flight ID <span className="req">*</span>
              </label>
              <select
                value={scheduleForm.flightId}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, flightId: e.target.value })
                }
              >
                <option value="">Select Flight</option>
                {flights.map((f) => (
                  <option key={f.flightId} value={f.flightId}>
                    {f.flightId} — {f.flightName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                Route ID <span className="req">*</span>
              </label>
              <select
                value={scheduleForm.routeId}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, routeId: e.target.value })
                }
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r.routeId} value={r.routeId}>
                    {r.routeId} — {r.source} → {r.destination}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row-2">
            <div className="field">
              <label>
                Travel Duration (min) <span className="req">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 130"
                value={scheduleForm.travelDuration}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    travelDuration: e.target.value,
                  })
                }
              />
            </div>
            <div className="field">
              <label>
                Departure Time <span className="req">*</span>
              </label>
              <input
                type="time"
                value={scheduleForm.departureTime}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    departureTime: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="field">
            <label>
              Available Days <span className="req">*</span>
            </label>
            <div className="day-picker">
              {DAYS.map((d) => {
                const selected = scheduleForm.availableDays.split(",").includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    className={`day-pick-btn ${selected ? "selected" : ""}`}
                    onClick={() => toggleDay(d)}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={() => setScheduleModal(false)}>
            Cancel
          </button>
          <button className="btn-save" onClick={saveSchedule}>
            {scheduleEdit ? "Update" : "Add Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
