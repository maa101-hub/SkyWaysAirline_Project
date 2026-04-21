import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/common/Login";
import SignUp from "../pages/common/SignUp";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Home from "../pages/user/Home";
import Dashboard from "../pages/admin/Dashboard";
import BookNow from "../pages/Booking/BookNow";
import BoardingPass from "../pages/BoardingPass/BoardingPass";
import MyBooking from "../pages/Booking/MyBooking";
import { AuthContext } from "../context/AuthContext";

function AppRoutes() {
  const { user, authLoading } = useContext(AuthContext);

  const rootElement = authLoading
    ? null
    : user
      ? user.role === "C"
        ? <Navigate to="/home" replace />
        : <Navigate to="/admin" replace />
      : <SignUp />;

  return (
    <Routes>
      <Route path="/" element={rootElement} />
      <Route path="/login" element={<Login />} />
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