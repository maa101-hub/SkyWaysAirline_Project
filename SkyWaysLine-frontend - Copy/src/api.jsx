import axios from "axios";

// ✅ USER SERVICE API (8082)
const API = axios.create({
  baseURL: "http://localhost:8082",
});

// ✅ FLIGHT SERVICE API (8089)
const flightAPI = axios.create({
  baseURL: "http://localhost:8089",
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

// RK
//───────── USERS ─────────
export const getUsers = () => API.get("/api/users/all");

// export both APIs if needed
export { API, flightAPI };

//RK
export const deleteUser = (userId) =>
  API.delete(`/api/users/${userId}`);