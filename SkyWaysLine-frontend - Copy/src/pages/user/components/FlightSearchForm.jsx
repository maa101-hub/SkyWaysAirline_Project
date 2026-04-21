export default function FlightSearchForm({ form, onChange, onSwap, onSubmit, today }) {
  return (
    <div className="search-card">
      <form onSubmit={onSubmit} noValidate>
        <div className="route-row">
          <div className="route-field">
            <label>From</label>
            <div className="input-icon-wrap">
              <span className="field-icon">🛫</span>
              <input
                type="text"
                name="from"
                placeholder="e.g. Delhi"
                value={form.from}
                onChange={onChange}
              />
            </div>
          </div>

          <button type="button" className="swap-btn" onClick={onSwap} title="Swap">⇌</button>

          <div className="route-field">
            <label>To</label>
            <div className="input-icon-wrap">
              <span className="field-icon">🛬</span>
              <input
                type="text"
                name="to"
                placeholder="e.g. Mumbai"
                value={form.to}
                onChange={onChange}
              />
            </div>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-field">
            <label>Departure Date</label>
            <input type="date" name="date" min={today} value={form.date} onChange={onChange} />
          </div>
          <button type="submit" className="search-btn">🔍 Search Flights</button>
        </div>
      </form>
    </div>
  );
}
