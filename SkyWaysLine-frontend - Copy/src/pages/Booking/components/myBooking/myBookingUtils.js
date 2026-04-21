export const getStoredUserId = () =>
  localStorage.getItem("userId") ||
  localStorage.getItem("userid") ||
  localStorage.getItem("USER_ID") ||
  "";

export const toDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value) => {
  const d = toDateOnly(value);
  if (!d) return "N/A";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatTime = (value) => {
  if (!value) return "--:--";
  if (/^\d{2}:\d{2}/.test(value)) {
    const [h, m] = value.split(":");
    const d = new Date();
    d.setHours(+h, +m, 0, 0);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

export const formatFare = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const calcArrivalTime = (dep, dur) => {
  if (!dep || !dur) return "";
  const [h, m] = dep.slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "";
  const total = h * 60 + m + Number(dur);
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== "");
const getCityCode = (v) => (v ? String(v).trim().slice(0, 3).toUpperCase() : "");

const LOGO_COLORS = [
  "linear-gradient(135deg,#1a6fa8,#0d3d6b)",
  "linear-gradient(135deg,#c0392b,#8e1a1a)",
  "linear-gradient(135deg,#27ae60,#145a32)",
  "linear-gradient(135deg,#7d3c98,#4a235a)",
  "linear-gradient(135deg,#d4a017,#7a5c00)",
  "linear-gradient(135deg,#2e86c1,#154360)",
];

export const getLogoColor = (name = "") => LOGO_COLORS[name.charCodeAt(0) % LOGO_COLORS.length];
export const getLogoInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "SW";

export const normalizeBooking = (booking) => {
  const flight = booking.flightResponse || booking.flightrespone || booking.flight || booking;
  const passengers =
    booking.passengers || booking.passengerList || booking.passengerDetails || booking.passengerDTOs || [];

  const seatNos =
    booking.seatNos || passengers.map((p) => valueOr(p.seatNo, p.seatNumber, p.seat)).filter(Boolean).join(", ");

  const passengerName =
    booking.passengerName || passengers.map((p) => p.name).filter(Boolean).join(", ") || "Guest";

  const source = valueOr(
    booking.source,
    flight.source,
    flight.Source,
    flight.from,
    flight.departureCity,
    flight.origin,
    "Source"
  );
  const destination = valueOr(
    booking.destination,
    flight.destination,
    flight.Destination,
    flight.to,
    flight.arrivalCity,
    flight.dest,
    "Destination"
  );
  const departureTime = valueOr(booking.departureTime, flight.departureTime, flight.departureDateTime);
  const fromCode = valueOr(booking.fromCode, flight.fromCode, flight.sourceCode, getCityCode(source));
  const toCode = valueOr(booking.toCode, flight.toCode, flight.destinationCode, getCityCode(destination));

  return {
    reservationId: valueOr(booking.reservationId, booking.bookingId, ""),
    scheduleId: valueOr(booking.scheduleId, flight.scheduleId, ""),
    flightName: valueOr(booking.flightName, flight.flightName, flight.airlineName, "SkyWays Airline"),
    flightNumber: valueOr(booking.flightNumber, flight.flightNumber, flight.flightNo, flight.flightId, "Flight"),
    passengerName,
    passengers,
    fromCode,
    toCode,
    source,
    destination,
    fromCity: valueOr(booking.fromCity, flight.fromCity, source),
    toCity: valueOr(booking.toCity, flight.toCity, destination),
    departureTime,
    arrivalTime: valueOr(
      booking.arrivalTime,
      flight.arrivalTime,
      flight.arrivalDateTime,
      calcArrivalTime(departureTime, flight.travelDuration)
    ),
    bookingDate: booking.bookingDate,
    journeyDate: valueOr(booking.journeyDate, flight.journeyDate, flight.departureDate, flight.date),
    noOfSeats: valueOr(booking.noOfSeats, booking.seats, booking.passengerCount, passengers.length, 1),
    totalFare: valueOr(booking.totalFare, booking.fare, flight.fare, flight.price, 0),
    gate: valueOr(booking.gate, flight.gate, "C12"),
    terminal: valueOr(booking.terminal, flight.terminal, "T3"),
    seatNos: seatNos || "Pending",
    boardingTime: valueOr(booking.boardingTime, flight.boardingTime, departureTime),
    group: valueOr(booking.group, flight.group, "E"),
    classType: valueOr(booking.classType, flight.classType, "Economy"),
    amountPaid: valueOr(booking.amountPaid, booking.totalFare, booking.fare, flight.fare, 0),
    qrSeed: valueOr(booking.qrSeed, booking.reservationId, booking.scheduleId, 42),
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus || "Paid",
  };
};
