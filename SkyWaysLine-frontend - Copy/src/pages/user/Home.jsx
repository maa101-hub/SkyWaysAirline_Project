import { useState,useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import axios from "axios";

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaWallet } from "react-icons/fa";
import { toast } from "react-toastify";
import { ThemeContext } from "../../context/ThemeContext";
import { initiatePayment } from "../../utils/razorpay";

const COLOR_PALETTE = [
  ["#1a73e8", "#0d47a1"],
  ["#e63946", "#9b1b23"],
  ["#e07b00", "#a35800"],
  ["#6a0dad", "#4a0080"],
  ["#0a9396", "#005f61"],
  ["#ae2012", "#7a1208"],
  ["#606c38", "#3d4a22"],
  ["#3a86ff", "#1a5fcc"],
];
function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[idx];
}

function getInitials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function calcArrival(departure, durationMins) {
  const [h, m] = departure.split(":").map(Number);
  const total  = h * 60 + m + Number(durationMins);
  const ah = Math.floor(total / 60) % 24;
  const am = total % 60;
  return `${String(ah).padStart(2, "0")}:${String(am).padStart(2, "0")}`;
}

function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
function getUserName(profile) {
  if (!profile) return "User";
  const { firstName} = profile;
  return `${firstName || ""}`.trim() || "User";
}
  const generateReservationId = () => {
  return "RES-" + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// ── Flight Card ───────────────────────────────────────────────
function FlightCard({ fl, passengers }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const depTime = fl.departureTime?.slice(0, 5);
  const arrival = calcArrival(depTime, fl.travelDuration);
  const durationFmt = fmtDuration(fl.travelDuration);
  const totalFare   = fl.fare * Number(passengers);
  const days = fl.availableDays?.split(",") || [];
  const [bg, bgDark] = getColorForName(fl.flightName);
  const initials    = getInitials(fl.flightName);
  const {profile}=useContext(AuthContext);
  const getSeatStatus = (seats) => {
  if (seats === 0) {
    return { text: "Sold Out", color: "#e63946" };
  } else if (seats < 10) {
    return { text: "Few Seats Left", color: "#f4a261" };
  } else {
    return { text: "Available", color: "#2a9d8f" };
  }
};

const seatStatus = getSeatStatus(fl.seats);
  return (
    <div
      className={`flight-card ${hovered ? "card-hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="card-glow" style={{ background: `${bg}18` }} />

      <div className="airline-col">
        <div
          className="flight-logo-box"
          style={{ background: `linear-gradient(135deg, ${bg}, ${bgDark})` }}
        >
          {initials}
        </div>
        <div>
          <p className="airline-name">{fl.flightName}</p>
          <p className="flight-code">{fl.flightId}</p>
        </div>
      </div>

      <div className="route-col">
        <div className="time-block">
          <p className="time">{depTime}</p>
          <p className="city-name">{fl.source}</p>
        </div>

        <div className="path-block">
          <p className="duration-txt">{durationFmt}</p>
          <div className="path-track">
            <span className="track-dot" />
            <div className="track-bar">
              <span className={`flying-plane ${hovered ? "fly-fast" : ""}`}>✈</span>
            </div>
            <span className="track-dot" />
          </div>
          <p className="dist-txt">{fl.distance.toLocaleString()} km</p>
        </div>

        <div className="time-block right-align">
          <p className="time">{arrival}</p>
          <p className="city-name">{fl.destination}</p>
        </div>
      </div>

      <div className="days-col">
        <p className="col-label">Available</p>
        <div className="day-chips">
          {days.map((d) => (
            <span key={d} className="day-chip">{d}</span>
          ))}
        </div>
      </div>

      <div className="cap-col">
        <p className="col-label">Seats</p>
        <p className="cap-num">{fl.seats}</p>
        <p className="cap-sub">total capacity</p>
        <p
  className={`seat-status ${
    fl.seats === 0
      ? "pulse-red"
      : fl.seats < 10
      ? "pulse-orange"
      : "pulse-green"
  }`}
  style={{ color: seatStatus.color, fontWeight: "500", fontSize:"10px" }}
>
  {seatStatus.text}
</p>
      </div>

      <div className="price-col">
        <p className="per-person">₹{fl.fare.toLocaleString("en-IN")} / person</p>
        <p className="price">₹{totalFare.toLocaleString("en-IN")}</p>
        <p className="total-note">for {passengers} passenger{passengers > 1 ? "s" : ""}</p>
        <button
          className="book-btn"
          disabled={fl.seats === 0}
  style={{
    background: `linear-gradient(135deg, ${bg}, ${bgDark})`,
    opacity: fl.seats === 0 ? 0.5 : 1,
    cursor: fl.seats === 0 ? "not-allowed" : "pointer"
  }}
          onClick={() =>
  navigate("/booking", {
    state: {
      flight: fl,
      passengers,
      userId: profile?.userId || profile?.id,
      reservationId: generateReservationId(),
      totalFare
    },
  })
}
        >
         {fl.seats === 0 ? "Sold Out" : "Book Now →"}
        </button>
      </div>
    </div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────
function ProfileModal({ onClose }) {
  // Helper function to format DOB for display (yyyy-mm-dd to dd/mm/yyyy)
  const formatDOB = (dob) => {
    if (!dob) return "—";
    const [year, month, day] = dob.split("-");
    return `${day}/${month}/${year}`;
  };

  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { user,name, profile, setProfile } = useContext(AuthContext);

  // Fetch profile on moun

useEffect(() => {
  const token = localStorage.getItem("token");

  axios
    .get("http://localhost:8082/api/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      setProfile(res.data);

      setEditForm({
        firstName: res.data.firstName || "",
        lastName:  res.data.lastName  || "",
        dob:       res.data.dob       || "",
        gender:    res.data.gender    || "",
        address:   res.data.address   || "",
      });
    })
    .catch(() => setError("Failed to load profile."))
    .finally(() => setLoading(false));
}, []);
  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
  setSaving(true);
  setError("");
  setSuccessMsg("");

  try {
    const token = localStorage.getItem("token");

    await axios.put(
      "http://localhost:8082/api/users/profile",
      editForm,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // global update
    setProfile((prev) => ({
      ...prev,
      ...editForm,
    }));

    setSuccessMsg("Profile updated successfully!");
    setIsEditing(false);

  } catch (err) {
    if (err.response && err.response.status === 400) {
      setError(err.response.data);
    } else {
      setError("Failed to update profile.");
    }
  } finally {
    setSaving(false);
  }
};

  // Avatar initials + color from name
  const displayName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User"
    : "User";
  const avatarInitials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="pf-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="pf-header">
          <h2 className="pf-title">My Profile</h2>
          <button className="pf-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="pf-loading">
            <div className="pf-spinner" />
            <p>Loading profile...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="pf-error-banner">{error}</div>
        )}

        {/* ── Success ── */}
        {successMsg && (
          <div className="pf-success-banner">✓ {successMsg}</div>
        )}

        {/* ── Profile content ── */}
        {profile && !loading && (
          <>
            {/* Avatar section */}
            <div className="pf-avatar-section">
              <div className="pf-avatar-ring">
                <div className="pf-avatar-circle">{avatarInitials}</div>
              </div>
              <div className="pf-avatar-info">
                <p className="pf-display-name">{displayName}</p>
                <p className="pf-user-id">ID: {profile.userId || profile.id || "—"}</p>
              </div>
            </div>

            {/* ── Read-only fields (email + phone) ── */}
            <div className="pf-readonly-row">
              <div className="pf-readonly-field">
                <span className="pf-readonly-icon">✉</span>
                <div>
                  <p className="pf-readonly-label">Email</p>
                  <p className="pf-readonly-val">{profile.email || "—"}</p>
                </div>
              </div>
              <div className="pf-readonly-field">
                <span className="pf-readonly-icon">📱</span>
                <div>
                  <p className="pf-readonly-label">Phone</p>
                  <p className="pf-readonly-val">{profile.phoneNumber || "—"}</p>
                </div>
              </div>
            </div>

            <div className="pf-divider" />

            {/* ── Editable fields ── */}
            {!isEditing ? (
              /* View mode */
              <div className="pf-view-grid">
                {[
                  { label: "First Name", val: profile.firstName },
                  { label: "Last Name",  val: profile.lastName  },
                  { label: "Date of Birth", val: formatDOB(profile.dob)   },
                  { label: "Gender",     val: profile.gender    },
                  { label: "Address",    val: profile.address, full: true },
                ].map((item) => (
                  <div key={item.label} className={`pf-view-field ${item.full ? "full" : ""}`}>
                    <p className="pf-field-label">{item.label}</p>
                    <p className="pf-field-val">{item.val || "—"}</p>
                  </div>

                ))}
              </div>
            ) : (
              /* Edit mode */
              <div className="pf-edit-grid">
                <div className="pf-edit-field">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                    placeholder="First name"
                  />
                  {error.firstName && <p className="pf-error">{error.firstName}</p>}
                </div>
                <div className="pf-edit-field">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                    placeholder="Last name"
                  />
                  {error.lastName && <p className="pf-error">{error.lastName}</p>}
                </div>
                <div className="pf-edit-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={editForm.dob}
                    onChange={handleEditChange}
                  />
                  {error.dob && <p className="pf-error">{error.dob}</p>}
                </div>
                <div className="pf-edit-field">
                  <label>Gender</label>
                  <select name="gender" value={editForm.gender} onChange={handleEditChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="pf-edit-field pf-full">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    placeholder="Your address"
                  />
                  {error.address && <p className="pf-error">{error.address}</p>}
                </div>

              </div>
            )}

            {/* ── Footer actions ── */}
            <div className="pf-footer">
              {!isEditing ? (
                <button className="pf-edit-btn" onClick={() => setIsEditing(true)}>
                  ✏ Edit Profile
                </button>
              ) : (
                <>
                  <button
                    className="pf-cancel-btn"
                    onClick={() => { setIsEditing(false); setError(""); }}
                  >
                    Cancel
                  </button>
                  <button
                    className="pf-save-btn"
                    onClick={handleUpdate}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Wallet Modal ─────────────────────────────────────────────
function WalletModal({ onClose }) {
  const { profile, setProfile } = useContext(AuthContext);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAddMoney = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (amt > 50000) {
      setError("Maximum top-up amount is ₹50,000.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // Assume backend endpoint for wallet top-up
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8090/api/booking/wallet/add",
        { amount: amt },
        {
          headers: {
 Authorization: `Bearer ${token}`
}
        }
      );

      // Initiate Razorpay payment
      const options = {
        key: "rzp_test_SdKfg1SHSyvaok", // Replace with actual key
        amount: amt * 100, // Amount in paise
        currency: "INR",
        name: "SkyWays Airline",
        description: "Wallet Top-up",
        order_id: res.data.data, // Assuming backend returns orderId
        handler: async function (response) {
          // Verify payment on backend
          console.log("Razorpay Response:", response);
          try {
            await axios.post(
              "http://localhost:8090/api/booking/wallet/verify",
              {
    paymentId: response.razorpay_payment_id,
    orderId: response.razorpay_order_id,
    signature: response.razorpay_signature,
              },
              {
          headers: {
 Authorization: `Bearer ${token}`
}
              }
            );
            // Update profile wallet balance
            setProfile((prev) => ({
              ...prev,
              wallet: (prev.wallet || 0) + amt,
            }));
            setSuccessMsg(`₹${amt} added to wallet successfully!`);
            setAmount("");
          } catch (err) {
            setError("Payment verification failed.");
          }
        },
        prefill: {
          name: profile?.firstName + " " + profile?.lastName,
          email: profile?.email,
          contact: profile?.phoneNumber,
        },
        theme: {
          color: "#1a73e8",
        },
      };

      await initiatePayment(options);
    } catch (err) {
      setError("Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pf-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="pf-header">
          <h2 className="pf-title">My Wallet</h2>
          <button className="pf-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Wallet Balance ── */}
        <div className="wallet-balance-section">
          <div className="wallet-balance">
            <FaWallet className="wallet-icon-large" />
            <div>
              <p className="balance-label">Current Balance</p>
              <p className="balance-amount">₹{(profile?.wallet || 0).toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        <div className="pf-divider" />

        {/* ── Add Money ── */}
        <div className="add-money-section">
          <h3>Add Money to Wallet</h3>
          {error && <div className="pf-error-banner">{error}</div>}
          {successMsg && <div className="pf-success-banner">✓ {successMsg}</div>}

          <div className="add-money-form">
            <label>Amount (₹)</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="50000"
            />
            <p className="amount-note">Minimum: ₹1 | Maximum: ₹50,000</p>
          </div>

          <button
            className="add-money-btn"
            onClick={handleAddMoney}
            disabled={loading || !amount}
          >
            {loading ? "Processing..." : "Add Money"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Home Component ───────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
   const {profile, logout}=useContext(AuthContext);
   const { toggleTheme, theme } = useContext(ThemeContext);
   console.log(profile);
const firstname = profile?.firstName || "User";
  const [form, setForm]         = useState({ from: "", to: "", date: "", passengers: "1" });
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [sortBy, setSortBy]     = useState("fare");

  // ── Profile modal state ───────────────────────────────────
  const [showProfile, setShowProfile] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSwap   = ()  => setForm({ ...form, from: form.to, to: form.from });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date) {
      alert("Please fill in From, To and Date.");
      return;
    }
    if (form.from.toLowerCase() === form.to.toLowerCase()) {
      alert("From and To cannot be the same.");
      return;
    }
    try {
      setLoading(true);
      setSearched(false);
      const res = await axios.get(
        "http://localhost:8089/api/flights/searchByRoute",
        { params: { source: form.from, destination: form.to } }
      );
      setResults(res.data);
      console.log("Search results:", res.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
      alert("Error fetching flights");
    } finally {
      setLoading(false);
    }
  };

const handleLogout = async () => {
  const confirmLogout = window.confirm("Are you sure you want to logout?");
  
  if (!confirmLogout) return;

  try {
    await axios.put(`http://localhost:8082/api/users/${profile.userId}`);
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
  const sorted = useMemo(() => {
    return [...results].sort((a, b) => {
      if (sortBy === "fare")      return a.fare - b.fare;
      if (sortBy === "duration")  return a.travelDuration - b.travelDuration;
      if (sortBy === "departure") return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });
  }, [results, sortBy]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="home-bg">
      <div className="stars" />

      {/* ── NAVBAR ── */}
      <nav className="home-nav">
        <div className="logo">✈︎ Sky<span>Ways</span></div>
        <div className="nav-links">
          <a href="#" className="nav-link active">Flights</a>
          <a href="#" className="nav-link">My Bookings</a>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">{theme === 'light' ? '🌙' : '☀️'}</button>
           <div className="wallet-icon" title="Click to manage wallet" onClick={() => setShowWallet(true)}>
    <FaWallet />
  </div>
          {/* ── Clickable user badge ── */}
          <div
            className="user-badge"
            onClick={() => setShowProfile(true)}
            title="View Profile"
          >
            <div className="user-avatar">{firstname.charAt(0)}</div>
            <span className="user-name">{firstname || "user"}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>⎋ Logout</button>
        </div>
      </nav>

      {/* ── PROFILE MODAL ── */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* ── WALLET MODAL ── */}
      {showWallet && <WalletModal onClose={() => setShowWallet(false)} />}

      {/* ── HERO ── */}
      <div className="hero">
        <h1 className="hero-title">
          Where do you want<br />to <span>fly today?</span>
        </h1>

        {/* ── SEARCH CARD ── */}
        <div className="search-card">
          <form onSubmit={handleSearch} noValidate>
            <div className="route-row">
              <div className="route-field">
                <label>From</label>
                <div className="input-icon-wrap">
                  <span className="field-icon">🛫</span>
                  <input
                    type="text" name="from"
                    placeholder="e.g. Delhi"
                    value={form.from} onChange={handleChange}
                  />
                </div>
              </div>

              <button type="button" className="swap-btn" onClick={handleSwap} title="Swap">⇌</button>

              <div className="route-field">
                <label>To</label>
                <div className="input-icon-wrap">
                  <span className="field-icon">🛬</span>
                  <input
                    type="text" name="to"
                    placeholder="e.g. Mumbai"
                    value={form.to} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-field">
                <label>Departure Date</label>
                <input type="date" name="date" min={today} value={form.date} onChange={handleChange} />
              </div>
              <button type="submit" className="search-btn">🔍 Search Flights</button>
            </div>
          </form>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="loading-wrap">
          <div className="plane-loader">✈︎</div>
          <p className="loading-text">Searching best flights for you...</p>
        </div>
      )}

      {/* ── NO RESULTS ── */}
      {searched && !loading && sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">😔</div>
          <p className="empty-title">No flights found</p>
          <p className="empty-sub">
            No flights from <strong>{form.from}</strong> to <strong>{form.to}</strong>.
            Try different cities.
          </p>
        </div>
      )}

      {/* ── RESULTS ── */}
      {searched && !loading && sorted.length > 0 && (
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
              {[
                { key: "fare",      label: "Fare" },
                { key: "duration",  label: "Duration" },
                { key: "departure", label: "Departure" },
              ].map((s) => (
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
              <FlightCard key={fl.flightId} fl={fl} passengers={form.passengers} />
            ))}
          </div>
        </div>
      )}

      {/* ── INITIAL EMPTY ── */}
      {!searched && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🌏</div>
          <p className="empty-title">Ready for takeoff?</p>
          <p className="empty-sub">Enter your route above to discover available flights.</p>
        </div>
      )}
    </div>
  );
}