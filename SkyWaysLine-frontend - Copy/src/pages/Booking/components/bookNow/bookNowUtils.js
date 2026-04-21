export const blankPassenger = () => ({
  _key: Math.random().toString(36).slice(2),
  name: "",
  gender: "",
  age: "",
  seatNo: "",
});

export const fareCalculation = (p, price) => p * price;

export function calcArrival(departure, durationMins) {
  if (!departure || !durationMins) return "--:--";
  const [h, m] = departure.split(":").map(Number);
  const total = h * 60 + m + Number(durationMins);
  const ah = Math.floor(total / 60) % 24;
  const am = total % 60;
  return `${String(ah).padStart(2, "0")}:${String(am).padStart(2, "0")}`;
}

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const getInitialWalletBalance = (flightData) => {
  const candidates = [
    flightData?.walletBalance,
    flightData?.user?.walletBalance,
    flightData?.userData?.walletBalance,
    flightData?.currentBalance,
    typeof window !== "undefined" ? window.localStorage.getItem("skywaysWalletBalance") : null,
  ];

  for (const value of candidates) {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) return num;
  }

  return 25000;
};

export const getWalletBalanceFromProfile = (profile) => {
  const candidates = [profile?.walletBalance, profile?.wallet, profile?.balance, profile?.amount];

  for (const value of candidates) {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) return num;
  }

  return null;
};

export function getStepClass(msg, idx) {
  const m = msg.toLowerCase();
  const steps = ["order", "process", "verif", "confirm"];
  const active = steps.findIndex((s) => m.includes(s));
  if (active === idx) return "s-active";
  if (idx < active) return "s-done";
  return "";
}
