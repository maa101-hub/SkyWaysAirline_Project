import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import axios  from "axios";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
  const nevigate=useNavigate();
  const [loginMethod, setLoginMethod] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mathAnswer, setMathAnswer] = useState("");
  const [captchaSeed, setCaptchaSeed] = useState(0);
  const [otpCountdown, setOtpCountdown] = useState(30);

 const { login } = useContext(AuthContext);
  const { toggleTheme, theme } = useContext(ThemeContext);

  const captcha = useMemo(() => {
    const first = 2 + ((captchaSeed * 3 + 5) % 8);
    const second = 1 + ((captchaSeed * 5 + 2) % 9);
    return {
      first,
      second,
      answer: first + second,
    };
  }, [captchaSeed]);

  const otpLabel = loginMethod === "mobile-otp" ? "Mobile Number" : "Email";
  const otpPlaceholder =
    loginMethod === "mobile-otp" ? "Enter mobile number" : "Enter email address";
  const isOtpMode = loginMethod !== "password";
  const methodTitle =
    loginMethod === "password"
      ? "Email + Password"
      : loginMethod === "email-otp"
      ? "Email + OTP"
      : "Mobile + OTP";
  const methodSubtitle =
    loginMethod === "password"
      ? "Use your regular email and password to access your account."
      : loginMethod === "email-otp"
      ? "Get a one-time password on your email for quick and secure access."
      : "Get a one-time password on your mobile number and continue securely.";

  const resetOtpFlow = () => {
    setIdentifier("");
    setOtp("");
    setOtpSent(false);
    setMathAnswer("");
    setOtpCountdown(30);
    setCaptchaSeed((prev) => prev + 1);
  };

  useEffect(() => {
    if (!otpSent || otpCountdown <= 0) return undefined;

    const timer = setTimeout(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpSent, otpCountdown]);

const handlePasswordLogin = async (e) => {
  e.preventDefault();

  if (!email.trim() || !password.trim()) {
    toast.error("Please fill in all fields!");
    return;
  }

  try {
    setLoading(true);

    const res = await axios.post(
      "http://localhost:8082/api/users/login",
      { email: email.trim(), password }
    );

    const token = res.data?.token || res.data;

    await login(token);
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
      toast.error("Invalid email or password!");
    } else if (e.response?.status === 404) {
      toast.error("User not found!");
    } else {
      toast.error(e.response?.data?.message || "Login Failed!");
    }
  } finally {
    setLoading(false);
  }
};

const handleRequestOtp = async (e) => {
  e.preventDefault();

  if (!identifier.trim()) {
    toast.error(`Please enter ${otpLabel.toLowerCase()}!`);
    return;
  }

  if (!mathAnswer.trim()) {
    toast.error("Please solve the human check!");
    return;
  }

  if (Number(mathAnswer) !== captcha.answer) {
    toast.error("Wrong answer for human check!");
    setMathAnswer("");
    setCaptchaSeed((prev) => prev + 1);
    return;
  }

  try {
    setLoading(true);

    await axios.post(
      "http://localhost:8082/api/users/login/request-otp",
      { identifier: identifier.trim() }
    );

    setOtpSent(true);
    setOtpCountdown(30);
    toast.success("OTP sent successfully!");
  } catch (e) {
    if (e.response?.status === 404) {
      toast.error("User not found!");
    } else {
      toast.error(e.response?.data?.message || "Failed to send OTP!");
    }
  } finally {
    setLoading(false);
  }
};

const handleVerifyOtp = async (e) => {
  e.preventDefault();

  if (!otp.trim()) {
    toast.error("Please enter OTP!");
    return;
  }

  try {
    setLoading(true);

    const res = await axios.post(
      "http://localhost:8082/api/users/login/verify-otp",
      {
        identifier: identifier.trim(),
        otp: otp.trim(),
      }
    );

    const token = res.data?.token || res.data;

    await login(token);
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
      toast.error("Invalid OTP!");
    } else if (e.response?.status === 404) {
      toast.error("User not found!");
    } else {
      toast.error(e.response?.data?.message || "Login Failed!");
    }
  } finally {
    setLoading(false);
  }
};

const handleResendOtp = async () => {
  if (!identifier.trim()) return;

  try {
    setLoading(true);
    await axios.post(
      "http://localhost:8082/api/users/login/request-otp",
      { identifier: identifier.trim() }
    );
    setOtpCountdown(30);
    toast.success("OTP resent successfully!");
  } catch (e) {
    toast.error(e.response?.data?.message || "Failed to resend OTP!");
  } finally {
    setLoading(false);
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
              Log in with email and password, email OTP, or mobile OTP.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.6rem",
              marginBottom: "1rem",
            }}
          >
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setLoginMethod("password");
                resetOtpFlow();
              }}
              style={{
                padding: "0.75rem 0.9rem",
                opacity: loginMethod === "password" ? 1 : 0.72,
              }}
            >
              Password
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setLoginMethod("email-otp");
                resetOtpFlow();
              }}
              style={{
                padding: "0.75rem 0.9rem",
                opacity: loginMethod === "email-otp" ? 1 : 0.72,
              }}
            >
              Email OTP
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setLoginMethod("mobile-otp");
                resetOtpFlow();
              }}
              style={{
                padding: "0.75rem 0.9rem",
                opacity: loginMethod === "mobile-otp" ? 1 : 0.72,
              }}
            >
              Mobile OTP
            </button>
          </div>

          <div
            style={{
              marginBottom: "1.2rem",
              padding: "0.95rem 1rem",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.45rem",
              }}
            >
              <strong style={{ fontSize: "0.95rem" }}>{methodTitle}</strong>
              {isOtpMode && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.3rem 0.55rem",
                    borderRadius: "999px",
                    background: otpSent ? "rgba(34,197,94,0.14)" : "rgba(59,130,246,0.14)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {otpSent ? "OTP Sent" : "Step 1 of 2"}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: "0.84rem", opacity: 0.86, lineHeight: 1.55 }}>
              {methodSubtitle}
            </p>
            {isOtpMode && (
              <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.5rem" }}>
                <div
                  style={{
                    height: "6px",
                    flex: 1,
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: otpSent ? "100%" : "50%",
                      height: "100%",
                      background: "linear-gradient(90deg, #38bdf8, #2563eb)",
                      transition: "width .3s ease",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {loginMethod === "password" ? (
            <form onSubmit={handlePasswordLogin} noValidate>
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

              <div className="field">
                <label htmlFor="li-password">Password</label>
                <input
                  id="li-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary">
                {loading ? "Please wait..." : "Log In"}
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} noValidate>
              <div className="field">
                <label htmlFor="li-identifier">{otpLabel}</label>
                <input
                  id="li-identifier"
                  type={loginMethod === "mobile-otp" ? "tel" : "text"}
                  placeholder={otpPlaceholder}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={otpSent}
                />
              </div>

              {!otpSent && (
                <div className="field">
                  <label htmlFor="li-math">Human Check</label>
                  <input
                    id="li-math"
                    type="number"
                    placeholder={`What is ${captcha.first} + ${captcha.second}?`}
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                  />
                  <p className="forgot" style={{ marginTop: "0.65rem" }}>
                    Solve the math question to continue.
                  </p>
                </div>
              )}

              {otpSent && (
                <>
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.85rem 0.95rem",
                      borderRadius: "14px",
                      background: "rgba(37,99,235,0.08)",
                      border: "1px solid rgba(37,99,235,0.16)",
                    }}
                  >
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      OTP sent to {identifier}
                    </div>
                    <div style={{ fontSize: "0.77rem", opacity: 0.82, lineHeight: 1.5 }}>
                      Enter the 6-digit code to continue. You can request a new OTP if needed.
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="li-otp">OTP</label>
                    <input
                      id="li-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  <p className="forgot">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading || otpCountdown > 0}
                      style={{
                        background: "none",
                        border: "none",
                        color: "inherit",
                        textDecoration: "underline",
                        cursor: loading || otpCountdown > 0 ? "not-allowed" : "pointer",
                        opacity: loading || otpCountdown > 0 ? 0.6 : 1,
                        padding: 0,
                        font: "inherit",
                      }}
                    >
                      {loading
                        ? "Please wait..."
                        : otpCountdown > 0
                        ? `Resend OTP in ${otpCountdown}s`
                        : "Resend OTP"}
                    </button>
                  </p>
                </>
              )}

              <button type="submit" className="btn-primary">
                {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
              </button>

              {otpSent && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={resetOtpFlow}
                  style={{ marginTop: "0.9rem", background: "transparent", color: "var(--text)", border: "1px solid rgba(255,255,255,.14)" }}
                >
                  Change {otpLabel}
                </button>
              )}
            </form>
          )}

          <hr className="divider" />
          <p className="footer-note">
            Don't have an account? <a href="/">Create one →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
