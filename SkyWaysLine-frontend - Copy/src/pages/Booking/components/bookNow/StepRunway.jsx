const STEPS = ["Trip Details", "Passengers", "Review", "Payment"];

export default function StepRunway({ current }) {
  return (
    <div className="step-runway">
      <div className="step-runway-inner">
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div className={`step-pill ${i === current ? "active" : i < current ? "done" : ""}`}>
              <div className="step-num">
                {i < current ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : i + 1}
              </div>
              <span>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="step-arrow">›</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
