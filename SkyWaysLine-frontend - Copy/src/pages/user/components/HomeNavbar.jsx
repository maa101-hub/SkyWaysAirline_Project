import { FaWallet } from "react-icons/fa";

export default function HomeNavbar({
  navigate,
  theme,
  toggleTheme,
  firstName,
  onShowWallet,
  onShowProfile,
  onLogout,
}) {
  return (
    <nav className="home-nav">
      <div
        className="logo"
        onClick={() => navigate("/home")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate("/home");
          }
        }}
        style={{ cursor: "pointer" }}
        title="Go to Home"
      >
        ✈︎ Sky<span>Ways</span>
      </div>

      <div className="nav-links">
        <a href="#" className="nav-link active">Flights</a>
        <button
          type="button"
          className="nav-link nav-link-button"
          onClick={() => navigate("/my-bookings")}
        >
          My Bookings
        </button>
      </div>

      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <div className="wallet-icon" title="Click to manage wallet" onClick={onShowWallet}>
          <FaWallet />
        </div>

        <div className="user-badge" onClick={onShowProfile} title="View Profile">
          <div className="user-avatar">{firstName.charAt(0)}</div>
          <span className="user-name">{firstName || "user"}</span>
        </div>

        <button className="logout-btn" onClick={onLogout}>⎋ Logout</button>
      </div>
    </nav>
  );
}
