import { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
// import API from "../../api";
//RK
//import { getUsers } from "../../api.jsx";
import { API, flightAPI, getUsers,deleteUser } from "../../api";


// ── Blank forms ───────────────────────────────────────────────
const blankFlight   = { flightId:"", flightName:"", seatingCapacity:"", reservationCapacity:"" };
const blankRoute    = { routeId:"", source:"", destination:"", distance:"", fare:"" };
const blankSchedule = { scheduleId:"", flightId:"", routeId:"", travelDuration:"", availableDays:"", departureTime:"" };
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ── Mock data for new features (replace with API calls) ────────
const MOCK_USERS = [
  { userId:"USR-001", firstName:"Rahul",  lastName:"Sharma",  email:"rahul@email.com",  phone:"9876543210", joinDate:"2024-01-15", status:"active" },
  { userId:"USR-002", firstName:"Priya",  lastName:"Singh",   email:"priya@email.com",  phone:"9876543211", joinDate:"2024-02-20", status:"active" },
  { userId:"USR-003", firstName:"Amit",   lastName:"Kumar",   email:"amit@email.com",   phone:"9876543212", joinDate:"2024-03-10", status:"active" },
  { userId:"USR-004", firstName:"Sneha",  lastName:"Patel",   email:"sneha@email.com",  phone:"9876543213", joinDate:"2024-04-05", status:"active" },
  { userId:"USR-005", firstName:"Vikram", lastName:"Joshi",   email:"vikram@email.com", phone:"9876543214", joinDate:"2024-05-18", status:"active" },
];
const MOCK_DELETE_REQUESTS = [
  { reqId:"REQ-001", userId:"USR-003", name:"Amit Kumar",  email:"amit@email.com",  requestedAt:"2024-06-10 09:30", reason:"No longer needed" },
  { reqId:"REQ-002", userId:"USR-005", name:"Vikram Joshi", email:"vikram@email.com", requestedAt:"2024-06-11 14:15", reason:"Privacy concerns" },
];
const MOCK_BOOKINGS_TOTAL  = 1284;
const MOCK_WALLET_BALANCE  = 5842390;
const MOCK_REVENUE_MONTHLY = [420000, 510000, 380000, 620000, 590000, 710000];

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  // ── Existing state (unchanged) ────────────────────────────
  const [flights,   setFlights]   = useState([]);
  const [routes,    setRoutes]    = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [flightForm, setFlightForm]       = useState(blankFlight);
  const [flightEdit, setFlightEdit]       = useState(null);
  const [flightModal, setFlightModal]     = useState(false);
  const [flightDel, setFlightDel]         = useState(null);

  const [routeForm, setRouteForm]         = useState(blankRoute);
  const [routeEdit, setRouteEdit]         = useState(null);
  const [routeModal, setRouteModal]       = useState(false);
  const [routeDel, setRouteDel]           = useState(null);

  const [scheduleForm, setScheduleForm]   = useState(blankSchedule);
  const [scheduleEdit, setScheduleEdit]   = useState(null);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleDel, setScheduleDel]     = useState(null);

  // ── NEW state ─────────────────────────────────────────────
  const [users, setUsers]                   = useState([]);
  const [deleteRequests, setDeleteRequests] = useState(MOCK_DELETE_REQUESTS);
  const [notifOpen, setNotifOpen]           = useState(false);
  const [userDelConfirm, setUserDelConfirm] = useState(null); // { userId, name, fromRequest }
  const [reqApproveId, setReqApproveId]     = useState(null); // highlight animation
  const notifRef = useRef(null);

  // ── Existing API calls (unchanged) ───────────────────────
  useEffect(() => {
    flightAPI.get("/api/flights")
      .then(res => setFlights(res.data.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    flightAPI.get("/api/routes")
      .then(res => setRoutes(res.data.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    flightAPI.get("/api/schedules")
      .then(res => setSchedules(res.data.data))
      .catch(err => console.error(err));
  }, []);

  //RK
  useEffect(() => {
  fetchUsers();
}, []);

const fetchUsers = async () => {
  try {
    const res = await getUsers();
    console.log("Users from backend:", res.data);
    setUsers(res.data);
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Existing helpers (unchanged) ──────────────────────────
  const openAdd = (type) => {
    if (type === "flights")   { setFlightForm(blankFlight);     setFlightEdit(null);   setFlightModal(true); }
    if (type === "routes")    { setRouteForm(blankRoute);       setRouteEdit(null);    setRouteModal(true); }
    if (type === "schedules") { setScheduleForm(blankSchedule); setScheduleEdit(null); setScheduleModal(true); }
  };

  const saveFlight = async () => {
    const { flightId, flightName, seatingCapacity } = flightForm;
    if (!flightId || !flightName || !seatingCapacity) { alert("Fill all required fields."); return; }
    try {
      if (flightEdit) await flightAPI.put(`/api/flights/${flightEdit}`, flightForm);
      else            await flightAPI.post("/api/flights", flightForm);
      const res = await flightAPI.get("/api/flights");
      setFlights(res.data.data);
      setFlightModal(false);
    } catch (err) { console.error(err); alert("Error saving flight"); }
  };
  const editFlight = (f) => { setFlightForm({ ...f }); setFlightEdit(f.flightId); setFlightModal(true); };
  const deleteFlight = async () => {
    try {
      await flightAPI.delete(`/api/flights/${flightDel}`);
      setFlights(flights.filter(f => f.flightId !== flightDel));
      setFlightDel(null);
    } catch (err) { console.error(err); }
  };

  const saveRoute = async () => {
    try {
      if (routeEdit) await flightAPI.put(`/api/routes/${routeEdit}`, routeForm);
      else           await flightAPI.post("/api/routes", routeForm);
      const res = await flightAPI.get("/api/routes");
      setRoutes(res.data.data);
      setRouteModal(false);
    } catch (err) { console.error(err); }
  };
  const editRoute = (r) => { setRouteForm({ ...r }); setRouteEdit(r.routeId); setRouteModal(true); };
  const deleteRoute = async () => {
    try {
      await flightAPI.delete(`/api/routes/${routeDel}`);
      setRoutes(routes.filter(r => r.routeId !== routeDel));
      setRouteDel(null);
    } catch (err) { console.error(err); }
  };

  const toggleDay = (day) => {
    const days = scheduleForm.availableDays ? scheduleForm.availableDays.split(",") : [];
    const next = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
    setScheduleForm({ ...scheduleForm, availableDays: next.join(",") });
  };
  const saveSchedule = async () => {
    const { scheduleId, flightId, routeId, travelDuration, availableDays, departureTime } = scheduleForm;
    if (!scheduleId || !flightId || !routeId || !travelDuration || !availableDays || !departureTime) {
      alert("Fill all required fields."); return;
    }
    try {
      if (scheduleEdit) await flightAPI.put(`/api/schedules/${scheduleEdit}`, scheduleForm);
      else              await flightAPI.post("/api/schedules", scheduleForm);
      const res = await flightAPI.get("/api/schedules");
      setSchedules(res.data.data);
      setScheduleModal(false);
    } catch (err) { console.error(err); }
  };
  const editSchedule = (s) => { setScheduleForm({ ...s }); setScheduleEdit(s.scheduleId); setScheduleModal(true); };
  const deleteSchedule = async () => {
    try {
      await flightAPI.delete(`/api/schedules/${scheduleDel}`);
      setSchedules(schedules.filter(s => s.scheduleId !== scheduleDel));
      setScheduleDel(null);
    } catch (err) { console.error(err); }
  };

  // ── NEW: User / Delete-request handlers ──────────────────
  const confirmDeleteUser = (userId, name, fromRequest = false) => {
    setUserDelConfirm({ userId, name, fromRequest });
  };

  const executeDeleteUser = async () => {
  const { userId, fromRequest } = userDelConfirm;
  try {
    await deleteUser(userId); // 🔥 backend call
    setUsers(users.filter(u => u.userId !== userId));
    if (fromRequest) {
      setDeleteRequests(deleteRequests.filter(r => r.userId !== userId));
      setNotifOpen(false);
    }
    setUserDelConfirm(null);
  } catch (err) {
    console.error(err);
    alert("Error deleting user");
  }
};

  const denyDeleteRequest = (reqId) => {
    setDeleteRequests(deleteRequests.filter(r => r.reqId !== reqId));
  };

  // ── Overview computed values ──────────────────────────────
  const totalSeats    = flights.reduce((a, f) => a + Number(f.seatingCapacity || 0), 0);
  const months        = ["Jan","Feb","Mar","Apr","May","Jun"];

  return (
    <div className="dash-bg">
      <div className="stars" />

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside className="sidebar">
        <div className="sidebar-logo">✈︎ Sky<span>Way</span></div>
        <p className="sidebar-role">Admin Panel</p>

        <nav className="sidebar-nav">
          {/* NEW */}
          <button className={`s-link ${tab==="overview"?"active":""}`} onClick={()=>setTab("overview")}>
            <span className="s-icon">📊</span> Overview
          </button>
          {/* existing */}
          <button className={`s-link ${tab==="flights"?"active":""}`}   onClick={()=>setTab("flights")}>
            <span className="s-icon">✈</span> Flights
          </button>
          <button className={`s-link ${tab==="routes"?"active":""}`}    onClick={()=>setTab("routes")}>
            <span className="s-icon">🗺</span> Routes
          </button>
          <button className={`s-link ${tab==="schedules"?"active":""}`} onClick={()=>setTab("schedules")}>
            <span className="s-icon">📅</span> Schedules
          </button>
          {/* NEW */}
          <button className={`s-link ${tab==="users"?"active":""}`}     onClick={()=>setTab("users")}>
            <span className="s-icon">👥</span> Users
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-side" onClick={()=>{ if(window.confirm("Logout?")) navigate("/login"); }}>
            ⎋ Logout
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          TOPBAR (notification bell)
      ══════════════════════════════════════ */}
      <div className="dash-topbar" ref={notifRef}>
        <div className="topbar-right">
          <button className="notif-bell" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {deleteRequests.length > 0 && (
              <span className="notif-badge">{deleteRequests.length}</span>
            )}
          </button>

          {/* ── Notification panel ── */}
          <div className={`notif-panel ${notifOpen ? "notif-open" : ""}`}>
            <div className="notif-header">
              <p className="notif-title">🔔 Notifications</p>
              <span className="notif-count">{deleteRequests.length} pending</span>
            </div>

            {deleteRequests.length === 0 && (
              <p className="notif-empty">No pending requests</p>
            )}

            {deleteRequests.map((req) => (
              <div key={req.reqId} className="notif-item">
                <div className="notif-avatar">
                  {req.name.charAt(0)}
                </div>
                <div className="notif-info">
                  <p className="notif-msg">
                    <strong>{req.name}</strong> wants to delete their account
                  </p>
                  <p className="notif-meta">{req.userId} · {req.requestedAt}</p>
                  {req.reason && <p className="notif-reason">"{req.reason}"</p>}
                  <div className="notif-actions">
                    <button
                      className="notif-btn-approve"
                      onClick={() => confirmDeleteUser(req.userId, req.name, true)}
                    >
                      ✓ Delete Account
                    </button>
                    <button
                      className="notif-btn-deny"
                      onClick={() => denyDeleteRequest(req.reqId)}
                    >
                      ✕ Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main className="dash-main">

        {/* ─── OVERVIEW TAB ──────────────────────────────── */}
        {tab === "overview" && (
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
                  <p className="ov-value">₹{MOCK_WALLET_BALANCE.toLocaleString("en-IN")}</p>
                  <p className="ov-sub">Total revenue collected</p>
                </div>
              </div>

              {/* Total Bookings */}
              <div className="ov-card bookings-card">
                <div className="ov-card-icon">🎫</div>
                <div>
                  <p className="ov-label">Total Bookings</p>
                  <p className="ov-value">{MOCK_BOOKINGS_TOTAL.toLocaleString()}</p>
                  <p className="ov-sub">All time reservations</p>
                </div>
              </div>

              {/* Registered Users */}
              <div className="ov-card users-card">
                <div className="ov-card-icon">👥</div>
                <div>
                  <p className="ov-label">Registered Users</p>
                  <p className="ov-value">{users.length}</p>
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
              <p className="section-head">Monthly Revenue (₹)</p>
              <div className="bar-chart">
                {MOCK_REVENUE_MONTHLY.map((val, i) => {
                  const max = Math.max(...MOCK_REVENUE_MONTHLY);
                  const pct = (val / max) * 100;
                  return (
                    <div key={i} className="bar-col">
                      <p className="bar-val">₹{(val/1000).toFixed(0)}K</p>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ height: `${pct}%` }} />
                      </div>
                      <p className="bar-label">{months[i]}</p>
                    </div>
                  );
                })}
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
                  ₹{routes.length
                    ? Math.round(routes.reduce((a,r) => a + Number(r.fare), 0) / routes.length).toLocaleString("en-IN")
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── FLIGHTS TAB (unchanged) ─────────────────── */}
        {tab === "flights" && (
          <div className="tab-content">
            <div className="tab-header">
              <div>
                <h1 className="tab-title">Flights</h1>
                <p className="tab-sub">Manage your fleet of aircraft</p>
              </div>
              <button className="btn-add" onClick={()=>openAdd("flights")}>+ Add Flight</button>
            </div>
            <div className="stats-row">
              <div className="stat-card"><p className="stat-num">{flights.length}</p><p className="stat-label">Total Flights</p></div>
              <div className="stat-card"><p className="stat-num">{flights.reduce((a,f)=>a+Number(f.seatingCapacity),0)}</p><p className="stat-label">Total Seats</p></div>
              <div className="stat-card"><p className="stat-num">{flights.reduce((a,f)=>a+Number(f.reservationCapacity||0),0)}</p><p className="stat-label">Reserved Seats</p></div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Flight ID</th><th>Flight Name</th><th>Seating Capacity</th><th>Reservation Capacity</th><th>Actions</th></tr></thead>
                <tbody>
                  {flights.length === 0 && <tr><td colSpan="5" className="empty-row">No flights added yet.</td></tr>}
                  {flights.map(f => (
                    <tr key={f.flightId}>
                      <td><span className="id-badge">{f.flightId}</span></td>
                      <td><strong>{f.flightName}</strong></td>
                      <td>{f.seatingCapacity}</td>
                      <td>{f.reservationCapacity || "—"}</td>
                      <td><div className="action-btns">
                        <button className="btn-edit"   onClick={()=>editFlight(f)}>✏ Edit</button>
                        <button className="btn-delete" onClick={()=>setFlightDel(f.flightId)}>🗑 Delete</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ROUTES TAB (unchanged) ──────────────────── */}
        {tab === "routes" && (
          <div className="tab-content">
            <div className="tab-header">
              <div><h1 className="tab-title">Routes</h1><p className="tab-sub">Configure source–destination routes</p></div>
              <button className="btn-add" onClick={()=>openAdd("routes")}>+ Add Route</button>
            </div>
            <div className="stats-row">
              <div className="stat-card"><p className="stat-num">{routes.length}</p><p className="stat-label">Total Routes</p></div>
              <div className="stat-card"><p className="stat-num">{routes.reduce((a,r)=>a+Number(r.distance),0).toLocaleString()} km</p><p className="stat-label">Total Distance</p></div>
              <div className="stat-card"><p className="stat-num">₹{routes.length ? Math.min(...routes.map(r=>r.fare)).toLocaleString("en-IN") : 0}</p><p className="stat-label">Min Fare</p></div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Route ID</th><th>Source</th><th>Destination</th><th>Distance (km)</th><th>Fare (₹)</th><th>Actions</th></tr></thead>
                <tbody>
                  {routes.length === 0 && <tr><td colSpan="6" className="empty-row">No routes added yet.</td></tr>}
                  {routes.map(r => (
                    <tr key={r.routeId}>
                      <td><span className="id-badge">{r.routeId}</span></td>
                      <td>🛫 {r.source}</td><td>🛬 {r.destination}</td>
                      <td>{Number(r.distance).toLocaleString()}</td>
                      <td>₹{Number(r.fare).toLocaleString("en-IN")}</td>
                      <td><div className="action-btns">
                        <button className="btn-edit"   onClick={()=>editRoute(r)}>✏ Edit</button>
                        <button className="btn-delete" onClick={()=>setRouteDel(r.routeId)}>🗑 Delete</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── SCHEDULES TAB (unchanged) ───────────────── */}
        {tab === "schedules" && (
          <div className="tab-content">
            <div className="tab-header">
              <div><h1 className="tab-title">Schedules</h1><p className="tab-sub">Assign flights to routes with timings</p></div>
              <button className="btn-add" onClick={()=>openAdd("schedules")}>+ Add Schedule</button>
            </div>
            <div className="stats-row">
              <div className="stat-card"><p className="stat-num">{schedules.length}</p><p className="stat-label">Total Schedules</p></div>
              <div className="stat-card"><p className="stat-num">{[...new Set(schedules.map(s=>s.flightId))].length}</p><p className="stat-label">Flights Scheduled</p></div>
              <div className="stat-card"><p className="stat-num">{[...new Set(schedules.map(s=>s.routeId))].length}</p><p className="stat-label">Routes Active</p></div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Schedule ID</th><th>Flight ID</th><th>Route ID</th><th>Duration (min)</th><th>Available Days</th><th>Departure</th><th>Actions</th></tr></thead>
                <tbody>
                  {schedules.length === 0 && <tr><td colSpan="7" className="empty-row">No schedules added yet.</td></tr>}
                  {schedules.map(s => (
                    <tr key={s.scheduleId}>
                      <td><span className="id-badge">{s.scheduleId}</span></td>
                      <td>{s.flightId}</td><td>{s.routeId}</td>
                      <td>{s.travelDuration} min</td>
                      <td><div className="day-chips">{s.availableDays.split(",").map(d=><span key={d} className="day-chip">{d}</span>)}</div></td>
                      <td><span className="time-badge">{s.departureTime}</span></td>
                      <td><div className="action-btns">
                        <button className="btn-edit"   onClick={()=>editSchedule(s)}>✏ Edit</button>
                        <button className="btn-delete" onClick={()=>setScheduleDel(s.scheduleId)}>🗑 Delete</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── USERS TAB (NEW) ─────────────────────────── */}
        {tab === "users" && (
          <div className="tab-content">
            <div className="tab-header">
              <div>
                <h1 className="tab-title">Users</h1>
                <p className="tab-sub">Manage registered accounts</p>
              </div>
              {deleteRequests.length > 0 && (
                <div className="del-req-badge" onClick={() => setNotifOpen(true)}>
                  🔔 {deleteRequests.length} Delete Request{deleteRequests.length > 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="stats-row">
              <div className="stat-card"><p className="stat-num">{users.length}</p><p className="stat-label">Total Users</p></div>
              <div className="stat-card"><p className="stat-num">{users.filter(u=>u.status==="active").length}</p><p className="stat-label">Active</p></div>
              <div className="stat-card"><p className="stat-num warn-num">{deleteRequests.length}</p><p className="stat-label">Delete Requests</p></div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th><th>Name</th><th>Email</th>
                    <th>Phone</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && <tr><td colSpan="6" className="empty-row">No users found.</td></tr>}
                  {users
                     .filter(u => u.userType !== "A")
                     .map(u => {
                    const hasRequest = deleteRequests.some(r => r.userId === u.userId);
                    return (
                      <tr key={u.userId} className={hasRequest ? "row-warning" : ""}>
                        <td><span className="id-badge">{u.userId}</span></td>
                        <td>
                          <div className="user-cell">
                            <div className="user-mini-avatar">{u.firstName.charAt(0)}</div>
                            <span>{u.firstName} {u.lastName}</span>
                            {hasRequest && <span className="pending-tag">Pending Delete</span>}
                          </div>
                        </td>
                        <td>{u.email}</td>
                        
                        <td>{u.phoneNumber}</td>
                        <td>{u.joinDate || "-"}</td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={() => confirmDeleteUser(u.userId, `${u.firstName} ${u.lastName}`, false)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ══════════════════════════════════════
          ALL EXISTING MODALS (unchanged)
      ══════════════════════════════════════ */}

      {/* Flight Modal */}
      {flightModal && (
        <div className="modal-overlay" onClick={()=>setFlightModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{flightEdit ? "Edit Flight" : "Add Flight"}</h2>
              <button className="modal-close" onClick={()=>setFlightModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row-2">
                <div className="field">
                  <label>Flight ID <span className="req">*</span></label>
                  <input placeholder="e.g. FL003" value={flightForm.flightId} disabled={!!flightEdit}
                    onChange={e=>setFlightForm({...flightForm, flightId:e.target.value})} />
                </div>
                <div className="field">
                  <label>Flight Name <span className="req">*</span></label>
                  <input placeholder="e.g. SkyWay Premium" value={flightForm.flightName}
                    onChange={e=>setFlightForm({...flightForm, flightName:e.target.value})} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="field">
                  <label>Seating Capacity <span className="req">*</span></label>
                  <input type="number" min="1" placeholder="e.g. 180" value={flightForm.seatingCapacity}
                    onChange={e=>setFlightForm({...flightForm, seatingCapacity:e.target.value})} />
                </div>
                <div className="field">
                  <label>Reservation Capacity</label>
                  <input type="number" min="0" placeholder="e.g. 20" value={flightForm.reservationCapacity}
                    onChange={e=>setFlightForm({...flightForm, reservationCapacity:e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>setFlightModal(false)}>Cancel</button>
              <button className="btn-save" onClick={saveFlight}>{flightEdit ? "Update" : "Add Flight"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Route Modal */}
      {routeModal && (
        <div className="modal-overlay" onClick={()=>setRouteModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{routeEdit ? "Edit Route" : "Add Route"}</h2>
              <button className="modal-close" onClick={()=>setRouteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Route ID <span className="req">*</span></label>
                <input placeholder="e.g. RT003" value={routeForm.routeId} disabled={!!routeEdit}
                  onChange={e=>setRouteForm({...routeForm, routeId:e.target.value})} />
              </div>
              <div className="form-row-2">
                <div className="field"><label>Source <span className="req">*</span></label>
                  <input placeholder="e.g. Delhi" value={routeForm.source}
                    onChange={e=>setRouteForm({...routeForm, source:e.target.value})} /></div>
                <div className="field"><label>Destination <span className="req">*</span></label>
                  <input placeholder="e.g. Mumbai" value={routeForm.destination}
                    onChange={e=>setRouteForm({...routeForm, destination:e.target.value})} /></div>
              </div>
              <div className="form-row-2">
                <div className="field"><label>Distance (km) <span className="req">*</span></label>
                  <input type="number" min="1" placeholder="e.g. 1150" value={routeForm.distance}
                    onChange={e=>setRouteForm({...routeForm, distance:e.target.value})} /></div>
                <div className="field"><label>Fare (₹)</label>
                  <input type="number" min="0" placeholder="e.g. 4599" value={routeForm.fare}
                    onChange={e=>setRouteForm({...routeForm, fare:e.target.value})} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>setRouteModal(false)}>Cancel</button>
              <button className="btn-save" onClick={saveRoute}>{routeEdit ? "Update" : "Add Route"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="modal-overlay" onClick={()=>setScheduleModal(false)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{scheduleEdit ? "Edit Schedule" : "Add Schedule"}</h2>
              <button className="modal-close" onClick={()=>setScheduleModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field"><label>Schedule ID <span className="req">*</span></label>
                <input placeholder="e.g. SC003" value={scheduleForm.scheduleId} disabled={!!scheduleEdit}
                  onChange={e=>setScheduleForm({...scheduleForm, scheduleId:e.target.value})} /></div>
              <div className="form-row-2">
                <div className="field"><label>Flight ID <span className="req">*</span></label>
                  <select value={scheduleForm.flightId} onChange={e=>setScheduleForm({...scheduleForm, flightId:e.target.value})}>
                    <option value="">Select Flight</option>
                    {flights.map(f=><option key={f.flightId} value={f.flightId}>{f.flightId} — {f.flightName}</option>)}
                  </select></div>
                <div className="field"><label>Route ID <span className="req">*</span></label>
                  <select value={scheduleForm.routeId} onChange={e=>setScheduleForm({...scheduleForm, routeId:e.target.value})}>
                    <option value="">Select Route</option>
                    {routes.map(r=><option key={r.routeId} value={r.routeId}>{r.routeId} — {r.source} → {r.destination}</option>)}
                  </select></div>
              </div>
              <div className="form-row-2">
                <div className="field"><label>Travel Duration (min) <span className="req">*</span></label>
                  <input type="number" min="1" placeholder="e.g. 130" value={scheduleForm.travelDuration}
                    onChange={e=>setScheduleForm({...scheduleForm, travelDuration:e.target.value})} /></div>
                <div className="field"><label>Departure Time <span className="req">*</span></label>
                  <input type="time" value={scheduleForm.departureTime}
                    onChange={e=>setScheduleForm({...scheduleForm, departureTime:e.target.value})} /></div>
              </div>
              <div className="field"><label>Available Days <span className="req">*</span></label>
                <div className="day-picker">
                  {DAYS.map(d=>{
                    const selected = scheduleForm.availableDays.split(",").includes(d);
                    return <button key={d} type="button" className={`day-pick-btn ${selected?"selected":""}`} onClick={()=>toggleDay(d)}>{d}</button>;
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>setScheduleModal(false)}>Cancel</button>
              <button className="btn-save" onClick={saveSchedule}>{scheduleEdit ? "Update" : "Add Schedule"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Delete Confirm */}
      {(flightDel || routeDel || scheduleDel) && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header"><h2>Confirm Delete</h2></div>
            <div className="modal-body">
              <p className="confirm-text">Are you sure you want to delete <strong>{flightDel || routeDel || scheduleDel}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={()=>{ setFlightDel(null); setRouteDel(null); setScheduleDel(null); }}>Cancel</button>
              <button className="btn-danger" onClick={()=>{ if(flightDel) deleteFlight(); if(routeDel) deleteRoute(); if(scheduleDel) deleteSchedule(); }}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: User Delete Confirm Modal ── */}
      {userDelConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-sm user-del-modal">
            <div className="modal-header">
              <h2>Delete User Account</h2>
            </div>
            <div className="modal-body">
              <div className="user-del-icon">⚠️</div>
              <p className="confirm-text">
                Permanently delete account of{" "}
                <strong>{userDelConfirm.name}</strong>?<br />
                <span className="del-warn">This action cannot be undone.</span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setUserDelConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={executeDeleteUser}>🗑 Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}