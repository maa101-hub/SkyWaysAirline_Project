import { Routes, Route } from "react-router-dom";
import Login from "../pages/common/Login";
import SignUp from "../pages/common/SignUp";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Home from "../pages/user/Home";
import Dashboard from "../pages/admin/Dashboard";
import BookNow from "../pages/Booking/BookNow";
import BoardingPass from "../pages/BoardingPass/BoardingPass";
import MyBooking from "../pages/Booking/MyBooking";
import AboutPage from "../components/AboutPage";
import SupportLinkPage from "../components/SupportLinkPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AboutPage />} />
      <Route path="/support/:slug" element={<SupportLinkPage />} />
      <Route path="/social/:platform" element={<SupportLinkPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute role="C">
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["A", "ADMIN"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute role="C">
            <BookNow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute role="C">
            <MyBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boarding-pass"
        element={
          <ProtectedRoute role="C">
            <BoardingPass />
          </ProtectedRoute>
        }
      />
    </Routes>

  );
}

export default AppRoutes;
