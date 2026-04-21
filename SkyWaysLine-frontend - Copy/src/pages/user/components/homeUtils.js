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

export function getColorForName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[idx];
}

export function getInitials(name = "") {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDobForUserId(dobValue) {
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
}

export function getShortUserId(profile) {
  if (!profile) return "—";

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const initials = getInitials(fullName || profile.name || "User");
  const dobPart = formatDobForUserId(profile.dob || profile.dateOfBirth || profile.birthDate);

  return initials && dobPart ? `${initials}${dobPart}` : profile.userId || profile.id || "—";
}

export function calcArrival(departure, durationMins) {
  const [h, m] = departure.split(":").map(Number);
  const total = h * 60 + m + Number(durationMins);
  const ah = Math.floor(total / 60) % 24;
  const am = total % 60;
  return `${String(ah).padStart(2, "0")}:${String(am).padStart(2, "0")}`;
}

export function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function generateReservationId() {
  return `RES-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

export function normalizeLocationInput(value) {
  return value.replace(/\s+/g, " ").replace(/^\s+/, "");
}
