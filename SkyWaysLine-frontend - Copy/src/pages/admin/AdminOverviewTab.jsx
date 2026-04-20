export default function AdminOverviewTab({
  wallet,
  totalBookedSeats,
  totalRemainingSeats,
  totalSeats,
  flights,
  users,
  routes,
  schedules,
  deleteRequests,
}) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const MOCK_REVENUE_MONTHLY = [
    420000, 510000, 380000, 620000, 590000, 710000,
  ];

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Overview</h1>
          <p className="tab-sub">Your airline at a glance</p>
        </div>
      </div>

      {/* ── Big stat cards ── */}
      <div className="overview-cards">
        {/* Wallet */}
        <div className="ov-card wallet-card">
          <div className="ov-card-icon">💰</div>
          <div>
            <p className="ov-label">Admin Wallet</p>
            <p className="ov-value">₹{wallet}</p>
            <p className="ov-sub">Total revenue collected</p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="ov-card bookings-card">
          <div className="ov-card-icon">🎫</div>
          <div>
            <p className="ov-label">Total Bookings</p>
            <p className="ov-value">{totalBookedSeats.toLocaleString()}</p>
            <p className="ov-sub">
              {totalRemainingSeats.toLocaleString()} seats still available
            </p>
          </div>
        </div>

        {/* Registered Users */}
        <div className="ov-card users-card">
          <div className="ov-card-icon">👥</div>
          <div>
            <p className="ov-label">Registered Users</p>
            <p className="ov-value">
              {users.filter((u) => u.userType !== "A").length}
            </p>
            <p className="ov-sub">Active accounts</p>
          </div>
        </div>

        {/* Flights */}
        <div className="ov-card flights-card">
          <div className="ov-card-icon">✈</div>
          <div>
            <p className="ov-label">Active Flights</p>
            <p className="ov-value">{flights.length}</p>
            <p className="ov-sub">{totalSeats} total seats</p>
          </div>
        </div>
      </div>

      {/* ── Revenue chart (CSS bar chart) ── */}
      <div className="revenue-section">
        <p className="section-head">Annual Revenue 2024 (₹)</p>
        <div className="bar-chart">
          {MOCK_REVENUE_MONTHLY.map((val, i) => {
            const max = Math.max(...MOCK_REVENUE_MONTHLY);
            const pct = (val / max) * 100;
            return (
              <div key={i} className="bar-col">
                <p className="bar-val">₹{(val / 1000).toFixed(0)}K</p>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${pct}%` }} />
                </div>
                <p className="bar-label">{months[i]}</p>
              </div>
            );
          })}
          <div className="bar-col total-col">
            <p className="bar-val total-val">
              ₹
              {(
                MOCK_REVENUE_MONTHLY.reduce((a, b) => a + b, 0) / 1000
              ).toFixed(0)}
              K
            </p>
            <div className="bar-track">
              <div
                className="bar-fill total-fill"
                style={{ height: "100%" }}
              />
            </div>
            <p className="bar-label total-label">Total</p>
          </div>
        </div>
      </div>

      {/* ── Quick summary ── */}
      <div className="quick-row">
        <div className="quick-card">
          <p className="quick-label">Routes Available</p>
          <p className="quick-val">{routes.length}</p>
        </div>
        <div className="quick-card">
          <p className="quick-label">Schedules Running</p>
          <p className="quick-val">{schedules.length}</p>
        </div>
        <div className="quick-card">
          <p className="quick-label">Delete Requests</p>
          <p className="quick-val warn">{deleteRequests.length}</p>
        </div>
        <div className="quick-card">
          <p className="quick-label">Avg Fare</p>
          <p className="quick-val">
            ₹
            {routes.length
              ? Math.round(
                  routes.reduce((a, r) => a + Number(r.fare), 0) /
                    routes.length
                ).toLocaleString("en-IN")
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
