import { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

const HINTS = [
  { id: "h1", label: "8 or more characters",  test: (v) => v.length >= 8 },
  { id: "h2", label: "Upper & lowercase",      test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: "h3", label: "A number (e.g. 1234)",   test: (v) => /\d/.test(v) },
  { id: "h4", label: "A symbol (e.g. !@#$)",   test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

export default function SignUp() {
 const nevigaet=useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    address: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const { firstName, lastName, dob, gender, address, email, phone, password } = form;

  if (!firstName || !lastName || !dob || !gender || !address || !email || !phone || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:8082/api/users/register",
      {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        gender: form.gender,
        address: form.address,
        phone: form.phone,
        email: form.email,
        password: form.password
      }
    );
  
    alert("Account created successfully!");
    nevigaet('/login');

  } catch (error) {
    if (error.response && error.response.status === 400) {
      setErrors(error.response.data); 
    } else {
      alert("Signup failed");
    }
  }
};

  return (
    <div className="auth-bg">
      <div className="stars" />

      {/* NAV */}
      <nav className="auth-nav">
        <div className="logo">
          ✈︎ Sky<span>Way</span>
        </div>
        <div className="nav-right">
          <span className="nav-text">Already have an account?</span>
          <a href="/login" className="nav-cta">Log In</a>
        </div>
      </nav>

      {/* CARD */}
      <div className="auth-wrapper">
        <div className="card">
          <div className="card-header">
            <div className="card-icon">✈︎</div>
            <h1 className="card-title">Create an Account</h1>
            <p className="card-sub">Join SkyWay and start booking flights in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Personal Information ── */}
            <div className="section-label">Personal Information</div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="firstName">First Name <span className="required">*</span> </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="e.g. Arjun"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && (
    <div className="error">{errors.firstName}</div>
  )}
              </div>
              <div className="field">
                <label htmlFor="lastName">Last Name <span className="required">*</span> </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="e.g. Sharma"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="dob">Date of Birth<span className="required">*</span></label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  required
                />
                {errors.dob && <div className="error">{errors.dob}</div>}
              </div>
              <div className="field">
                <label htmlFor="gender">Gender<span className="required">*</span></label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <div className="error">{errors.gender}</div>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="address">Address<span className="required">*</span></label>
              <textarea
                id="address"
                name="address"
                placeholder="Street, City, State, PIN Code"
                value={form.address}
                onChange={handleChange}
                required
              />
              {errors.address && <div className="error">{errors.address}</div>}
            </div>

            {/* ── Contact Information ── */}
            <div className="section-label">Contact Information</div>

            <div className="field">
              <label htmlFor="email">Email<span className="required">*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="error">{errors.email}</div>}

              <div className="tip">✦ We will use your email as your User ID.</div>
            </div>

            <div className="field">
              <label htmlFor="phone">Phone Number<span className="required">*</span></label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <div className="error">{errors.phone}</div>}
            </div>

            {/* ── Security ── */}
            <div className="section-label">Security</div>

            <div className="field">
              <label htmlFor="password">Password<span className="required">*</span></label>
              <div className="pw-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <div className="error">{errors.password}</div>}
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>

              {/* Password hints */}
              <div className="pw-hints">
                {HINTS.map((hint) => (
                  <span
                    key={hint.id}
                    className={`hint ${hint.test(form.password) ? "ok" : ""}`}
                  >
                    {hint.label}
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Create Account →
            </button>

            <p className="footer-note" style={{ marginTop: "16px" }}>
              By creating an account, you agree to our{" "}
              <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <hr className="divider" />
          <p className="footer-note">
            Already have an account? <a href="/login">Log In →</a>
          </p>
        </div>
      </div>
    </div>
  );
}