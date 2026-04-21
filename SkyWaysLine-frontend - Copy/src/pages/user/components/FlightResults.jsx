import FlightCard from "./FlightCard";

const SORT_OPTIONS = [
  { key: "fare", label: "Fare" },
  { key: "duration", label: "Duration" },
  { key: "departure", label: "Departure" },
];

export default function FlightResults({ sorted, form, sortBy, setSortBy }) {
  return (
    <div className="results-section">
      <div className="results-header">
        <div className="results-info">
          <span className="count-num">{sorted.length}</span>
          <span className="count-label"> flight{sorted.length > 1 ? "s" : ""} found</span>
          <span className="route-tag">
            {form.from} → {form.to} · {form.date} · {form.passengers} Pax
          </span>
        </div>

        <div className="sort-wrap">
          <span className="sort-label">Sort:</span>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.key}
              className={`sort-btn ${sortBy === s.key ? "active" : ""}`}
              onClick={() => setSortBy(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flights-list">
        {sorted.map((fl) => (
          <FlightCard
            key={fl.flightId}
            fl={fl}
            passengers={form.passengers}
            journeyDate={form.date}
          />
        ))}
      </div>
    </div>
  );
}
