import axios from "axios";

// ✅ USER SERVICE API (8082)
const API = axios.create({
  baseURL: "http://localhost:8082",
});

// ✅ FLIGHT SERVICE API (8089)
const flightAPI = axios.create({
  baseURL: "http://localhost:8089",
});

// ✅ BOOKING SERVICE API (8090)
const bookingAPI = axios.create({
  baseURL: "http://localhost:8090",
});

// 🔐 TOKEN attach (for both APIs)
const attachToken = (req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
};

API.interceptors.request.use(attachToken);
flightAPI.interceptors.request.use(attachToken);
bookingAPI.interceptors.request.use(attachToken);
//Kaithwas
// RK
//sourabh bahrijjsafjdjsdfjwsdkf
//sfrtgr
//───────── USERS ─────────
export const getUsers = () => API.get("/api/users/all");
export const getAllBookings = () => bookingAPI.get("/api/booking/all");

// export both APIs if needed
export { API, flightAPI, bookingAPI };

//RK
export const deleteUser = (userId) =>
  API.delete(`/api/users/${userId}`);

export const submitDeleteRequestEvent = (payload) =>
  API.post("/api/users/delete-request", payload);
