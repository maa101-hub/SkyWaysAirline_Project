import { Routes, Route } from "react-router-dom";
import Login from "../pages/common/Login";
import SignUp from "../pages/common/SignUp";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Home from "../pages/user/Home";
import Dashboard from "../pages/admin/Dashboard";
import BookNow from "../pages/Booking/BookNow";
import BoardingPass from "../pages/BoardingPass/BoardingPass";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />   {/* 🔥 ADD THIS */}
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home/>}/>
      <Route path="/admin" element={<Dashboard></Dashboard>}></Route>
      <Route path="/booking" element={<BookNow></BookNow>}></Route>
      <Route path="/boarding-pass" element={<BoardingPass />} />
    </Routes>
  );
}

export default AppRoutes;