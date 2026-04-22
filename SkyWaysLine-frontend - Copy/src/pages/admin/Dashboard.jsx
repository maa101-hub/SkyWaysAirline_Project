import { useState, useEffect, useRef, useCallback, useContext } from "react";
import "./Dashboard.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { flightAPI, getUsers, deleteUser, getAllBookings } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { ThemeContext } from "../../context/ThemeContext";
import AdminMapView from "./AdminMapView";
import RouteScheduleModal from "./RouteScheduleModal";
import AdminOverviewTab from "./AdminOverviewTab";
import AdminBookingsTab from "./AdminBookingsTab";
import AdminUsersTab from "./AdminUsersTab";
import AdminSchedulesTab from "./AdminSchedulesTab";
import AdminFlightsTab from "./AdminFlightsTab";
import AdminRoutesTab from "./AdminRoutesTab";
import AdminNotificationsPanel from "./AdminNotificationsPanel";
import AdminFlightModal from "./AdminFlightModal";
import AdminRouteModal from "./AdminRouteModal";
import AdminScheduleModal from "./AdminScheduleModal";
import AdminDeleteConfirmModal from "./AdminDeleteConfirmModal";
import AdminUserDeleteModal from "./AdminUserDeleteModal";

const blankFlight   = { flightId:"", flightName:"", seatingCapacity:"", reservationCapacity:"" };
const blankRoute    = { routeId:"", source:"", destination:"", distance:"", fare:"" };
const blankSchedule = { scheduleId:"", flightId:"", routeId:"", travelDuration:"", availableDays:"", departureTime:"" };
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const getInitials = (...parts) =>
  parts
    .filter(Boolean)
    .flatMap((part) => String(part).trim().split(/\s+/))
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

const formatDobForUserId = (dobValue) => {
  if (!dobValue) return "";

  const raw = String(dobValue).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-");
    return `${year}${day}${month}`;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("/");
    return `${year}${day}${month}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${year}${day}${month}`;
};

const normalizeUserStatus = (statusValue) => {
  const raw = String(statusValue ?? "").trim().toLowerCase();
  const isInactive =
    statusValue === 0 ||
    raw === "0" ||
    raw === "inactive" ||
    raw === "deleted" ||
    raw === "disabled" ||
    raw === "false";

  return isInactive ? "inactive" : "active";
};

const isExplicitlyDeletedUser = (user) => {
  const rawStatus = String(user?.rawStatus ?? user?.status ?? "")
    .trim()
    .toLowerCase();

  return user?.isDeleted === true || rawStatus === "deleted";
};

const getDisplayUserId = (user) => {
  if (!user) return "—";

  const initials = getInitials(user.firstName, user.lastName, user.name);
  const dobPart = formatDobForUserId(user.dob || user.dateOfBirth || user.birthDate);

  return initials && dobPart ? `${initials}${dobPart}` : user.userId || "—";
};

const INDIA_CITY_POINTS = {
  delhi: { label: "Delhi", lat: 28.6139, lng: 77.209 },
  mumbai: { label: "Mumbai", lat: 19.076, lng: 72.8777 },
  bengaluru: { label: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  chennai: { label: "Chennai", lat: 13.0827, lng: 80.2707 },
  kolkata: { label: "Kolkata", lat: 22.5726, lng: 88.3639 },
  hyderabad: { label: "Hyderabad", lat: 17.385, lng: 78.4867 },
  ahmedabad: { label: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  pune: { label: "Pune", lat: 18.5204, lng: 73.8567 },
  goa: { label: "Goa", lat: 15.2993, lng: 74.124 },
  jaipur: { label: "Jaipur", lat: 26.9124, lng: 75.7873 },
  lucknow: { label: "Lucknow", lat: 26.8467, lng: 80.9462 },
  patna: { label: "Patna", lat: 25.5941, lng: 85.1376 },
  bhopal: { label: "Bhopal", lat: 23.2599, lng: 77.4126 },
  nagpur: { label: "Nagpur", lat: 21.1458, lng: 79.0882 },
  kochi: { label: "Kochi", lat: 9.9312, lng: 76.2673 },
  trivandrum: { label: "Trivandrum", lat: 8.5241, lng: 76.9366 },
  srinagar: { label: "Srinagar", lat: 34.0837, lng: 74.7973 },
  guwahati: { label: "Guwahati", lat: 26.1445, lng: 91.7362 },
  bhubaneswar: { label: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  visakhapatnam: { label: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
  indore: { label: "Indore", lat: 22.7196, lng: 75.8577 },
  chandigarh: { label: "Chandigarh", lat: 30.7333, lng: 76.7794 },
};

const INDIA_MAP_CENTER = [22.9734, 78.6569];
const INDIA_MAP_BOUNDS = [
  [6.0, 67.5],
  [37.5, 97.5],
];

const CITY_ALIASES = {
  delhi: "delhi",
  "new delhi": "delhi",
  mumbai: "mumbai",
  bombay: "mumbai",
  bengaluru: "bengaluru",
  bangalore: "bengaluru",
  chennai: "chennai",
  madras: "chennai",
  kolkata: "kolkata",
  calcutta: "kolkata",
  hyderabad: "hyderabad",
  ahmedabad: "ahmedabad",
  pune: "pune",
  goa: "goa",
  jaipur: "jaipur",
  lucknow: "lucknow",
  patna: "patna",
  bhopal: "bhopal",
  nagpur: "nagpur",
  kochi: "kochi",
  cochin: "kochi",
  trivandrum: "trivandrum",
  thiruvananthapuram: "trivandrum",
  srinagar: "srinagar",
  guwahati: "guwahati",
  bhubaneswar: "bhubaneswar",
  vizag: "visakhapatnam",
  visakhapatnam: "visakhapatnam",
  indore: "indore",
  chandigarh: "chandigarh",
};

const normalizePlace = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveCityKey = (placeName) => {
  const normalized = normalizePlace(placeName);
  if (!normalized) return null;

  if (CITY_ALIASES[normalized]) return CITY_ALIASES[normalized];

  const matchedAlias = Object.keys(CITY_ALIASES).find(
    (alias) => normalized.includes(alias) || alias.includes(normalized)
  );

  return matchedAlias ? CITY_ALIASES[matchedAlias] : null;
};

const MOCK_DELETE_REQUESTS = [
  { reqId:"REQ-001", userId:"USR-003", name:"Amit Kumar",  email:"amit@email.com",  requestedAt:"2024-06-10 09:30", reason:"No longer needed" },
  { reqId:"REQ-002", userId:"USR-005", name:"Vikram Joshi", email:"vikram@email.com", requestedAt:"2024-06-11 14:15", reason:"Privacy concerns" },
];
const AUTH_EVENT_KEY = "skyways_auth_event";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { toggleTheme, theme } = useContext(ThemeContext);
  const [tab, setTab] = useState("overview");
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

  const [users, setUsers]                   = useState([]);
  const [bookings, setBookings]             = useState([]);
  const [deleteRequests, setDeleteRequests] = useState(MOCK_DELETE_REQUESTS);
  const [notifOpen, setNotifOpen]           = useState(false);
  const [userDelConfirm, setUserDelConfirm] = useState(null); // { userId, name, fromRequest }
  const [expandedUserBookings, setExpandedUserBookings] = useState(null);
  const [geoCityPoints, setGeoCityPoints]   = useState({});
  const [mapNow, setMapNow]                 = useState(Date.now());
  const [lineDashOffset, setLineDashOffset] = useState(0);
  const [selectedRouteOnMap, setSelectedRouteOnMap] = useState(null);
  const notifRef = useRef(null);
  const { profile } = useContext(AuthContext);
  const wallet = profile?.wallet ?? 0;

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getAllBookings();
      const payload = res?.data?.data ?? res?.data;
      const normalized = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.bookings)
          ? payload.bookings
          : [];

      setBookings(normalized);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getUsers();
      const nextUsers = Array.isArray(res.data)
        ? res.data.map((u) => ({
            ...u,
            rawStatus: u?.status,
            status: normalizeUserStatus(u?.status),
          }))
        : [];

      setUsers(nextUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  useEffect(() => {
    flightAPI.get("/api/flights").then((res) => setFlights(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    flightAPI.get("/api/routes").then((res) => setRoutes(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    flightAPI.get("/api/schedules").then((res) => setSchedules(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (tab !== "bookings" && tab !== "overview") return;

    fetchBookings();
  }, [tab, fetchBookings]);

  useEffect(() => {
    if (tab !== "map") return;

    const clockTimer = setInterval(() => {
      setMapNow(Date.now());
    }, 1000);

    const lineTimer = setInterval(() => {
      setLineDashOffset((prev) => (prev <= -100 ? 0 : prev - 1));
    }, 120);

    return () => {
      clearInterval(clockTimer);
      clearInterval(lineTimer);
    };
  }, [tab]);

  useEffect(() => {
    const handleFocus = () => fetchBookings();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchBookings]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 10000);

    const handleAuthSync = (event) => {
      if (event.key === AUTH_EVENT_KEY) {
        fetchUsers();
      }
    };

    const handleAuthEvent = () => {
      fetchUsers();
    };

    window.addEventListener("storage", handleAuthSync);
    window.addEventListener("skyways-auth-event", handleAuthEvent);
    window.addEventListener("focus", fetchUsers);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleAuthSync);
      window.removeEventListener("skyways-auth-event", handleAuthEvent);
      window.removeEventListener("focus", fetchUsers);
    };
  }, [fetchUsers]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const unresolvedPlaces = [...new Set(routes.flatMap((route) => [route?.source, route?.destination]).map((place) => normalizePlace(place)).filter((place) => place && !resolveCityKey(place) && !geoCityPoints[place]))];

    if (unresolvedPlaces.length === 0) return;

    let cancelled = false;

    const geocodeMissingPlaces = async () => {
      const resolvedEntries = await Promise.all(
        unresolvedPlaces.map(async (place) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(place)}`
            );
            if (!response.ok) return null;

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) return null;

            const hit = data[0];
            const lat = Number(hit.lat);
            const lng = Number(hit.lon);
            if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

            const label = String(hit.display_name || place).split(",")[0]?.trim() || place;
            return [place, { label, lat, lng }];
          } catch (error) {
            return null;
          }
        })
      );

      if (cancelled) return;

      const nextPoints = resolvedEntries
        .filter(Boolean)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      if (Object.keys(nextPoints).length) {
        setGeoCityPoints((prev) => ({ ...prev, ...nextPoints }));
      }
    };

    geocodeMissingPlaces();

    return () => {
      cancelled = true;
    };
  }, [routes, geoCityPoints]);

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

  const confirmDeleteUser = (userId, name, fromRequest = false) => {
    setUserDelConfirm({ userId, name, fromRequest });
  };

  const executeDeleteUser = async () => {
    const { userId, fromRequest } = userDelConfirm;

    try {
      await deleteUser(userId);
      await fetchUsers();

      if (fromRequest) {
        setDeleteRequests((prevRequests) =>
          prevRequests.filter((r) => r.userId !== userId)
        );
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

  const totalSeats = flights.reduce((a, f) => a + Number(f.seatingCapacity || 0), 0);

  const bookingRows = flights.map((flight) => {
    const totalFlightSeats = Number(flight.seatingCapacity || 0);
    const relatedSchedules = schedules.filter((schedule) => schedule.flightId === flight.flightId);
    const relatedScheduleIds = relatedSchedules.map((schedule) => schedule.scheduleId);
    const routeIds = [...new Set(relatedSchedules.map((schedule) => schedule.routeId).filter(Boolean))];
    const matchingRoutes = routeIds
      .map((routeId) => routes.find((route) => route.routeId === routeId))
      .filter(Boolean);
    const flightBookings = bookings.filter((booking) => {
      const bookingFlightId = booking.flightId || booking.flightNumber || booking.flightNo;
      const bookingScheduleId = booking.scheduleId || booking.scheduleNo;

      return (
        bookingFlightId === flight.flightId ||
        bookingScheduleId === flight.flightId ||
        relatedScheduleIds.includes(bookingScheduleId)
      );
    });
    const bookedSeats = flightBookings.reduce((sum, booking) => {
      const seatCount =
        Number(booking.noOfSeats) ||
        Number(booking.totalSeats) ||
        Number(booking.bookedSeats) ||
        (Array.isArray(booking.passengers) ? booking.passengers.length : 0) ||
        1;

      return sum + seatCount;
    }, 0);
    const remainingSeats = Math.max(totalFlightSeats - bookedSeats, 0);
    const occupancy = totalFlightSeats ? Math.min((bookedSeats / totalFlightSeats) * 100, 100) : 0;
    const routeDetails = matchingRoutes.length
      ? matchingRoutes.map((route) => {
          const routeOrders = bookings.filter((booking) => {
            const bookingScheduleId = booking.scheduleId || booking.scheduleNo;
            if (!bookingScheduleId) return false;

            const matchedSchedule = schedules.find((schedule) => schedule.scheduleId === bookingScheduleId);
            return matchedSchedule?.routeId === route.routeId;
          }).length;

          return {
            routeId: route.routeId,
            label: `${route.source} → ${route.destination}`,
            orderCount: routeOrders,
          };
        })
      : [{ routeId: "unassigned", label: "Route not assigned", orderCount: 0 }];

    return {
      ...flight,
      bookedSeats,
      remainingSeats,
      occupancy,
      scheduleCount: relatedSchedules.length,
      bookingCount: flightBookings.length,
      routeDetails,
    };
  });

  const totalBookedSeats = bookingRows.reduce((sum, flight) => sum + flight.bookedSeats, 0);
  const totalRemainingSeats = Math.max(totalSeats - totalBookedSeats, 0);

  const fullyBookedFlights = bookingRows.filter((flight) => flight.remainingSeats === 0 && flight.seatingCapacity).length;
  const topBookedFlight = bookingRows.reduce(
    (best, flight) => (flight.bookedSeats > best.bookedSeats ? flight : best),
    bookingRows[0] || { flightName: "—", flightId: "—", bookedSeats: 0 }
  );

  const getUserBookingDetails = (userId) => {
    const userBookings = bookings.filter((booking) => booking.userId === userId);
    const groupedFlights = userBookings.reduce((acc, booking) => {
      const matchedSchedule = schedules.find(
        (schedule) => schedule.scheduleId === (booking.scheduleId || booking.scheduleNo)
      );
      const matchedFlight = flights.find(
        (flight) =>
          flight.flightId === (booking.flightId || booking.flightNumber || booking.flightNo) ||
          flight.flightId === matchedSchedule?.flightId
      );

      const flightKey = matchedFlight?.flightId || booking.flightId || booking.flightNumber || "UNKNOWN";
      const flightLabel = matchedFlight
        ? `${matchedFlight.flightId} ${matchedFlight.flightName}`
        : `${flightKey} Flight`;

      if (!acc[flightKey]) {
        acc[flightKey] = { label: flightLabel, orders: 0 };
      }

      acc[flightKey].orders += 1;
      return acc;
    }, {});

    return {
      totalOrders: userBookings.length,
      flights: Object.values(groupedFlights),
    };
  };

  const customerUsers = users.filter((u) => u.userType !== "A");
  const registeredUsers = customerUsers.filter((u) => !isExplicitlyDeletedUser(u));
  const deletedUsers = customerUsers
    .filter((u) => isExplicitlyDeletedUser(u))
    .map((u) => {
      const deletedName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();

      return {
        userId: u.userId,
        displayUserId: getDisplayUserId(u),
        name: deletedName || u.name || "Unknown User",
        email: u.email || "—",
        phoneNumber: u.phoneNumber || "—",
        deletedBy: u.deletedBy || "Admin",
        deletedAt: u.deletedAt || u.updatedAt || null,
        totalOrders: getUserBookingDetails(u.userId).totalOrders,
      };
    });

  const getMapPointForPlace = (placeName) => {
    const cityKey = resolveCityKey(placeName);
    if (cityKey && INDIA_CITY_POINTS[cityKey]) return INDIA_CITY_POINTS[cityKey];

    const normalized = normalizePlace(placeName);
    return normalized ? geoCityPoints[normalized] || null : null;
  };

  const parseDepartureMinutes = (timeText) => {
    const value = String(timeText || "").trim();
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return 0;

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;

    return Math.max(0, Math.min(23, hour)) * 60 + Math.max(0, Math.min(59, minute));
  };

  const createPlaneIcon = (bearing) =>
    L.divIcon({
      className: "plane-marker-wrap",
      html: `<div class="plane-marker" style="transform: rotate(${bearing.toFixed(1)}deg);">✈</div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

  const routeSchedulesByRouteId = schedules.reduce((acc, schedule) => {
    if (!schedule?.routeId) return acc;
    if (!acc[schedule.routeId]) acc[schedule.routeId] = [];
    acc[schedule.routeId].push(schedule);
    return acc;
  }, {});

  const activeRouteMapData = routes.map((route) => {
    const sourceKey = resolveCityKey(route.source);
    const destinationKey = resolveCityKey(route.destination);
    const sourceNormalized = normalizePlace(route.source);
    const destinationNormalized = normalizePlace(route.destination);
    const sourcePoint = getMapPointForPlace(route.source);
    const destinationPoint = getMapPointForPlace(route.destination);
    const linkedSchedules = routeSchedulesByRouteId[route.routeId] || [];
    const linkedFlightIds = [...new Set(linkedSchedules.map((schedule) => schedule.flightId).filter(Boolean))];

    return {
      ...route,
      sourceKey: sourceKey || sourceNormalized,
      destinationKey: destinationKey || destinationNormalized,
      sourcePoint,
      destinationPoint,
      linkedSchedules,
      scheduleCount: linkedSchedules.length,
      linkedFlightIds,
    };
  });

  const mappedRouteLines = activeRouteMapData.filter(
    (route) => route.sourcePoint && route.destinationPoint && route.sourceKey !== route.destinationKey
  );

  const unmappedRoutes = activeRouteMapData.filter(
    (route) => !route.sourcePoint || !route.destinationPoint || route.sourceKey === route.destinationKey
  );

  const mapCityPins = (() => {
    const cityMap = new Map();

    mappedRouteLines.forEach((route) => {
      cityMap.set(route.sourceKey, {
        key: route.sourceKey,
        label: route.sourcePoint.label,
        lat: route.sourcePoint.lat,
        lng: route.sourcePoint.lng,
      });
      cityMap.set(route.destinationKey, {
        key: route.destinationKey,
        label: route.destinationPoint.label,
        lat: route.destinationPoint.lat,
        lng: route.destinationPoint.lng,
      });
    });

    return [...cityMap.values()];
  })();

  const animatedRouteLines = mappedRouteLines.map((route) => {
    const schedule = route.linkedSchedules?.[0];
    const travelDuration = Math.max(20, Number(schedule?.travelDuration) || 90);
    const departureMinutes = parseDepartureMinutes(schedule?.departureTime);
    const now = new Date(mapNow);
    const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const elapsedInCycle = ((nowMinutes - departureMinutes) % travelDuration + travelDuration) % travelDuration;
    const progress = elapsedInCycle / travelDuration;

    const startLat = route.sourcePoint.lat;
    const startLng = route.sourcePoint.lng;
    const endLat = route.destinationPoint.lat;
    const endLng = route.destinationPoint.lng;

    const planeLat = startLat + (endLat - startLat) * progress;
    const planeLng = startLng + (endLng - startLng) * progress;

    const deltaLat = endLat - startLat;
    const deltaLng = endLng - startLng;
    const bearing = (Math.atan2(-deltaLat, deltaLng) * 180) / Math.PI;

    return {
      ...route,
      planeLat,
      planeLng,
      bearing,
    };
  });

  return (
    <div className="dash-bg">
      <div className="stars" />

      <aside className="sidebar">
        <div className="sidebar-logo">✈︎ Sky<span>Ways</span></div>
        <p className="sidebar-role">Admin Panel</p>

        <nav className="sidebar-nav">
          <button className={`s-link ${tab==="overview"?"active":""}`} onClick={()=>setTab("overview")}>
            <span className="s-icon">📊</span> Overview
          </button>
          <button className={`s-link ${tab==="flights"?"active":""}`}   onClick={()=>setTab("flights")}>
            <span className="s-icon">✈</span> Flights
          </button>
          <button className={`s-link ${tab==="routes"?"active":""}`}    onClick={()=>setTab("routes")}>
            <span className="s-icon">🗺</span> Routes
          </button>
          <button className={`s-link ${tab==="map"?"active":""}`}       onClick={()=>setTab("map")}>
            <span className="s-icon">🌍</span> Map
          </button>
          <button className={`s-link ${tab==="schedules"?"active":""}`} onClick={()=>setTab("schedules")}>
            <span className="s-icon">📅</span> Schedules
          </button>
          <button className={`s-link ${tab==="bookings"?"active":""}`}  onClick={()=>setTab("bookings")}>
            <span className="s-icon">🎟️</span> Bookings
          </button>
          <button className={`s-link ${tab==="users"?"active":""}`}     onClick={()=>setTab("users")}>
            <span className="s-icon">👥</span> Users
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-side" onClick={()=>{ if(window.confirm("Logout?")) { logout(); toast.success("Logged out successfully!"); navigate("/login"); } }}>
            ⎋ Logout
          </button>
        </div>
      </aside>

      <div className="dash-topbar" ref={notifRef}>
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">{theme === 'light' ? '🌙' : '☀️'}</button>
          <button className="notif-bell" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {deleteRequests.length > 0 && (
              <span className="notif-badge">{deleteRequests.length}</span>
            )}
          </button>

          <AdminNotificationsPanel
            notifOpen={notifOpen}
            deleteRequests={deleteRequests}
            users={users}
            getDisplayUserId={getDisplayUserId}
            confirmDeleteUser={confirmDeleteUser}
            denyDeleteRequest={denyDeleteRequest}
          />
        </div>
      </div>

      <main className="dash-main">

        {tab === "overview" && (
          <AdminOverviewTab
            wallet={wallet}
            totalBookedSeats={totalBookedSeats}
            totalRemainingSeats={totalRemainingSeats}
            totalSeats={totalSeats}
            flights={flights}
            users={users}
            routes={routes}
            schedules={schedules}
            deleteRequests={deleteRequests}
          />
        )}

        {tab === "flights" && (
          <AdminFlightsTab
            flights={flights}
            onAdd={() => openAdd("flights")}
            onEdit={editFlight}
            onDelete={setFlightDel}
          />
        )}

        {tab === "routes" && (
          <AdminRoutesTab
            routes={routes}
            onAdd={() => openAdd("routes")}
            onEdit={editRoute}
            onDelete={setRouteDel}
          />
        )}

        {tab === "map" && (
          <AdminMapView
            animatedRouteLines={animatedRouteLines}
            mappedRouteLines={mappedRouteLines}
            unmappedRoutes={unmappedRoutes}
            mapCityPins={mapCityPins}
            lineDashOffset={lineDashOffset}
            createPlaneIcon={createPlaneIcon}
            onRouteClick={setSelectedRouteOnMap}
          />
        )}

        {tab === "schedules" && (
          <AdminSchedulesTab
            schedules={schedules}
            onAdd={() => openAdd("schedules")}
            onEdit={editSchedule}
            onDelete={setScheduleDel}
          />
        )}

        {tab === "bookings" && (
          <AdminBookingsTab
            bookingRows={bookingRows}
            totalBookedSeats={totalBookedSeats}
            totalRemainingSeats={totalRemainingSeats}
            fullyBookedFlights={fullyBookedFlights}
            topBookedFlight={topBookedFlight}
            totalSeats={totalSeats}
          />
        )}

        {tab === "users" && (
          <AdminUsersTab
            users={registeredUsers}
            deletedUsers={deletedUsers}
            deleteRequests={deleteRequests}
            expandedUserBookings={expandedUserBookings}
            setExpandedUserBookings={setExpandedUserBookings}
            getDisplayUserId={getDisplayUserId}
            getUserBookingDetails={getUserBookingDetails}
            confirmDeleteUser={confirmDeleteUser}
            onNotificationClick={() => setNotifOpen(true)}
          />
        )}

      </main>

      <AdminFlightModal
        flightModal={flightModal}
        flightEdit={flightEdit}
        flightForm={flightForm}
        setFlightForm={setFlightForm}
        setFlightModal={setFlightModal}
        saveFlight={saveFlight}
      />

      <AdminRouteModal
        routeModal={routeModal}
        routeEdit={routeEdit}
        routeForm={routeForm}
        setRouteForm={setRouteForm}
        setRouteModal={setRouteModal}
        saveRoute={saveRoute}
      />

      <AdminScheduleModal
        scheduleModal={scheduleModal}
        scheduleEdit={scheduleEdit}
        scheduleForm={scheduleForm}
        flights={flights}
        routes={routes}
        toggleDay={toggleDay}
        setScheduleForm={setScheduleForm}
        setScheduleModal={setScheduleModal}
        saveSchedule={saveSchedule}
        DAYS={DAYS}
      />

      <AdminDeleteConfirmModal
        flightDel={flightDel}
        routeDel={routeDel}
        scheduleDel={scheduleDel}
        onCancel={() => {
          setFlightDel(null);
          setRouteDel(null);
          setScheduleDel(null);
        }}
        onDelete={() => {
          if (flightDel) deleteFlight();
          if (routeDel) deleteRoute();
          if (scheduleDel) deleteSchedule();
        }}
      />

      <AdminUserDeleteModal
        userDelConfirm={userDelConfirm}
        onCancel={() => setUserDelConfirm(null)}
        onDelete={executeDeleteUser}
      />

      <RouteScheduleModal 
        selectedRoute={selectedRouteOnMap} 
        flights={flights}
        onClose={() => setSelectedRouteOnMap(null)} 
      />
    </div>
  );
}
