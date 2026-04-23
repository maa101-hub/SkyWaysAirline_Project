import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Home.css";

import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import FlightResults from "./components/FlightResults";
import FlightSearchForm from "./components/FlightSearchForm";
import HomeNavbar from "./components/HomeNavbar";
import ProfileModal from "./components/ProfileModal";
import WalletModal from "./components/WalletModal";
import { normalizeLocationInput } from "./components/homeUtils";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_ALIASES = {
  sun: "Sunday",
  sunday: "Sunday",
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
};

const getSelectedDay = (dateValue) => {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return "";

  return DAY_NAMES[new Date(year, month - 1, day).getDay()];
};

const normalizeDay = (dayValue) => {
  const key = String(dayValue || "")
    .trim()
    .toLowerCase();

  return DAY_ALIASES[key] || "";
};

const getFlightAvailableDays = (flight) => {
  const availabilityFields = [
    "availableDays",
    "availableDay",
    "operatingDays",
    "operationDays",
    "days",
    "flightDays",
    "scheduleDays",
    "daysOfWeek",
    "operatesOn",
    "availableOn",
    "dayOfWeek",
  ];

  for (const field of availabilityFields) {
    if (flight?.[field]) return flight[field];
  }

  return null;
};

const isFlightAvailableOnDate = (flight, dateValue) => {
  const selectedDay = getSelectedDay(dateValue);
  const availableDays = getFlightAvailableDays(flight);

  if (!selectedDay || !availableDays) return true;

  const days = Array.isArray(availableDays)
    ? availableDays
    : String(availableDays)
        .split(/[,\s|/]+/)
        .filter(Boolean);

  return days.some((day) => normalizeDay(day) === selectedDay);
};

export default function Home() {
  const navigate = useNavigate();
  const { profile, logout } = useContext(AuthContext);
  const { toggleTheme, theme } = useContext(ThemeContext);

  const firstName = profile?.firstName || "User";
  const [form, setForm] = useState({ from: "", to: "", date: "", passengers: "1" });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("fare");
  const [showProfile, setShowProfile] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "from" || name === "to" ? normalizeLocationInput(value) : value;

    setForm({ ...form, [name]: nextValue });
  };

  const handleSwap = () => setForm({ ...form, from: form.to, to: form.from });

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedFrom = form.from.trim();
    const trimmedTo = form.to.trim();

    if (!trimmedFrom || !trimmedTo || !form.date) {
      alert("Please fill in From, To and Date.");
      return;
    }
    if (trimmedFrom.toLowerCase() === trimmedTo.toLowerCase()) {
      alert("From and To cannot be the same.");
      return;
    }

    try {
      setLoading(true);
      setSearched(false);
      setForm((prev) => ({ ...prev, from: trimmedFrom, to: trimmedTo }));

      const res = await axios.get("http://localhost:8089/api/flights/searchByRoute", {
        params: { source: trimmedFrom, destination: trimmedTo, journeyDate: form.date },
      });

      const flights = Array.isArray(res.data) ? res.data : [];
      setResults(flights);
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
      if (sortBy === "fare") return a.fare - b.fare;
      if (sortBy === "duration") return a.travelDuration - b.travelDuration;
      if (sortBy === "departure") return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });
  }, [results, sortBy]);

  const today = new Date().toISOString().split("T")[0];
  const selectedDay = getSelectedDay(form.date);

  return (
    <div className="home-bg">
      <div className="stars" />

      <HomeNavbar
        navigate={navigate}
        theme={theme}
        toggleTheme={toggleTheme}
        firstName={firstName}
        onShowWallet={() => setShowWallet(true)}
        onShowProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
      />

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showWallet && <WalletModal onClose={() => setShowWallet(false)} />}

      <div className="hero">
        <h1 className="hero-title">
          Where do you want<br />to <span>fly today?</span>
        </h1>

        <FlightSearchForm
          form={form}
          onChange={handleChange}
          onSwap={handleSwap}
          onSubmit={handleSearch}
          today={today}
        />
      </div>

      {loading && (
        <div className="loading-wrap">
          <div className="plane-loader">✈︎</div>
          <p className="loading-text">Searching best flights for you...</p>
        </div>
      )}

      {searched && !loading && sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">😔</div>
          <p className="empty-title">No flights found</p>
          <p className="empty-sub">
            No flights from <strong>{form.from}</strong> to <strong>{form.to}</strong>
            {selectedDay ? ` on ${selectedDay}` : ""}. Try a different date or cities.
          </p>
        </div>
      )}

      {searched && !loading && sorted.length > 0 && (
        <FlightResults sorted={sorted} form={form} sortBy={sortBy} setSortBy={setSortBy} />
      )}

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
