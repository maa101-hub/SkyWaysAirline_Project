import { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import axios  from "axios";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
  const nevigate=useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

 const { login } = useContext(AuthContext);
 const { toggleTheme, theme } = useContext(ThemeContext);

const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    toast.error("Please fill in all fields!");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:8082/api/users/login",
      { email, password }
    );

    console.log("TOKEN:", res.data);

    const token = res.data; // ✅ FIXED

    login(token);
    toast.success("Login successful!");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role;
    
    if(role==='C'){
    nevigate("/home");
    }
    else{
      nevigate("/admin")
    }

  } catch (e) {
    if (e.response?.status === 401) {
      toast.error("Invalid Email or Password!");
    } else if (e.response?.status === 404) {
      toast.error("User not found!");
    } else {
      toast.error(e.response?.data?.message || "Login Failed!");
    }
  }
};
  return (
    <div className="auth-bg">
      <div className="stars" />

      {/* NAV */}
      <nav className="auth-nav">
        <div className="logo">
          ✈︎ Sky<span>Ways</span>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">{theme === 'light' ? '🌙' : '☀️'}</button>
          <span className="nav-text">Don't have an account?</span>
          <a href="/" className="nav-cta">Sign Up</a>
        </div>
      </nav>

      {/* CARD */}
      <div className="auth-wrapper">
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🔑</div>
            <h1 className="card-title">Welcome Back</h1>
            <p className="card-sub">
              Log in to your Sky Ways account to manage your bookings.
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div className="field">
              <label htmlFor="li-email">Email</label>
              <input
                id="li-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="li-pw">Password</label>
              <div className="pw-wrap">
                <input
                  id="li-pw"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <p className="forgot">
              <a href="#">Forgot your password?</a>
            </p>

            <button type="submit" className="btn-primary">
              Log In
            </button>
          </form>

          <hr className="divider" />
          <p className="footer-note">
            Don't have an account? <a href="/">Create one →</a>
          </p>
        </div>
      </div>
    </div>
  );
}