import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import "./Login.css";

const API_BASE_URL = "http://localhost:8082/api/users";
const FORGOT_PASSWORD_ENDPOINTS = {
  requestOtp: `${API_BASE_URL}/forgot-password/request-otp`,
  verifyOtp: `${API_BASE_URL}/forgot-password/verify-otp`,
  updatePassword: `${API_BASE_URL}/forgot-password/update-password`,
};

export default function Login() {
  const nevigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { toggleTheme, theme } = useContext(ThemeContext);

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

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtpCountdown, setForgotOtpCountdown] = useState(30);
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false);

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
  const authView = isOtpMode ? "otp" : "password";
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

  const switchToPasswordLogin = () => {
    setLoginMethod("password");
    resetOtpFlow();
  };

  const switchToOtpLogin = () => {
    setLoginMethod("email-otp");
    resetOtpFlow();
  };

  const resetOtpFlow = () => {
    setIdentifier("");
    setOtp("");
    setOtpSent(false);
    setMathAnswer("");
    setOtpCountdown(30);
    setCaptchaSeed((prev) => prev + 1);
  };

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotStep(1);
    setForgotOtpCountdown(30);
    setForgotOtpVerified(false);
  };

  useEffect(() => {
    if (!otpSent || otpCountdown <= 0) return undefined;

    const timer = setTimeout(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpSent, otpCountdown]);

  useEffect(() => {
    if (forgotStep !== 2 || forgotOtpCountdown <= 0) return undefined;

    const timer = setTimeout(() => {
      setForgotOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [forgotStep, forgotOtpCountdown]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/login`, {
        email: email.trim(),
        password,
      });

      const token = res.data?.token || res.data;

      await login(token);
      toast.success("Login successful!");

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "C") {
        nevigate("/home");
      } else {
        nevigate("/admin");
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

      await axios.post(`${API_BASE_URL}/login/request-otp`, {
        identifier: identifier.trim(),
      });

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

      const res = await axios.post(`${API_BASE_URL}/login/verify-otp`, {
        identifier: identifier.trim(),
        otp: otp.trim(),
      });

      const token = res.data?.token || res.data;

      await login(token);
      toast.success("Login successful!");

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "C") {
        nevigate("/home");
      } else {
        nevigate("/admin");
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
      await axios.post(`${API_BASE_URL}/login/request-otp`, {
        identifier: identifier.trim(),
      });
      setOtpCountdown(30);
      toast.success("OTP resent successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to resend OTP!");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequestOtp = async (e) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      toast.error("Please enter your email!");
      return;
    }

    try {
      setLoading(true);
      await axios.post(FORGOT_PASSWORD_ENDPOINTS.requestOtp, {
        email: forgotEmail.trim(),
      });
      setForgotStep(2);
      setForgotOtp("");
      setForgotOtpVerified(false);
      setForgotOtpCountdown(30);
      toast.success("Password reset OTP sent successfully!");
    } catch (e) {
      if (e.response?.status === 404) {
        toast.error("User not found!");
      } else {
        toast.error(e.response?.data?.message || "Failed to send reset OTP!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordVerifyOtp = async (e) => {
    e.preventDefault();

    if (!forgotOtp.trim()) {
      toast.error("Please enter OTP!");
      return;
    }

    try {
      setLoading(true);
      await axios.post(FORGOT_PASSWORD_ENDPOINTS.verifyOtp, {
        identifier: forgotEmail.trim(),
        otp: forgotOtp.trim(),
      });
      setForgotStep(3);
      setForgotOtpVerified(true);
      toast.success("OTP verified successfully!");
    } catch (e) {
      if (e.response?.status === 401) {
        toast.error("Invalid OTP!");
      } else {
        toast.error(e.response?.data?.message || "OTP verification failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordUpdate = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all password fields!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      await axios.post(FORGOT_PASSWORD_ENDPOINTS.updatePassword, {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword,
      });
      toast.success("Password updated successfully. Please log in.");
      setEmail(forgotEmail.trim());
      resetForgotPasswordFlow();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update password!");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordResendOtp = async () => {
    if (!forgotEmail.trim()) return;

    try {
      setLoading(true);
      await axios.post(FORGOT_PASSWORD_ENDPOINTS.requestOtp, {
        email: forgotEmail.trim(),
      });
      setForgotOtpCountdown(30);
      toast.success("Reset OTP resent successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to resend reset OTP!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="stars" />

      <nav className="auth-nav">
        <div className="logo">
          ✈︎ Sky<span>Ways</span>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <span className="nav-text">Don&apos;t have an account?</span>
          <a href="/signup" className="nav-cta">Sign Up</a>
        </div>
      </nav>

      <div className="auth-wrapper">
        <div className="card">
          <div className="card-header">
            <div className="card-icon">{showForgotPassword ? "🛡️" : "🔑"}</div>
            <h1 className="card-title">{showForgotPassword ? "Reset Password" : "Welcome Back"}</h1>
            <p className="card-sub">
              {showForgotPassword
                ? "Request an OTP, verify it, and set a new password for your account."
                : "Log in with email and password, email OTP, or mobile OTP."}
            </p>
          </div>

          {showForgotPassword ? (
            <>
              <div className="flow-panel">
                <div className="flow-head">
                  <strong>Forgot Password</strong>
                  <span className="flow-badge">Step {forgotStep} of 3</span>
                </div>
                <p className="flow-copy">
                  {forgotStep === 1 && "Enter your registered email address to receive a password reset OTP."}
                  {forgotStep === 2 && "Verify the OTP sent to your email to unlock password reset."}
                  {forgotStep === 3 && "Create a new password for your account and return to login."}
                </p>
                <div className="flow-progress">
                  <div
                    className="flow-progress-bar"
                    style={{ width: forgotStep === 1 ? "33.33%" : forgotStep === 2 ? "66.66%" : "100%" }}
                  />
                </div>
              </div>

              {forgotStep === 1 && (
                <form onSubmit={handleForgotPasswordRequestOtp} noValidate>
                  <div className="field">
                    <label htmlFor="fp-email">Email</label>
                    <input
                      id="fp-email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary">
                    {loading ? "Please wait..." : "Request OTP"}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleForgotPasswordVerifyOtp} noValidate>
                  <div className="notice-box">
                    <div className="notice-title">OTP sent to {forgotEmail}</div>
                    <div className="notice-text">
                      Enter the OTP to verify your identity before changing the password.
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="fp-otp">OTP</label>
                    <input
                      id="fp-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={forgotOtp}
                      maxLength={6}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  <p className="forgot">
                    <button
                      type="button"
                      onClick={handleForgotPasswordResendOtp}
                      disabled={loading || forgotOtpCountdown > 0}
                      className="link-button"
                    >
                      {loading
                        ? "Please wait..."
                        : forgotOtpCountdown > 0
                          ? `Resend OTP in ${forgotOtpCountdown}s`
                          : "Resend OTP"}
                    </button>
                  </p>

                  <button type="submit" className="btn-primary">
                    {loading ? "Please wait..." : "Verify OTP"}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotOtp("");
                      setForgotOtpVerified(false);
                    }}
                  >
                    Change Email
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleForgotPasswordUpdate} noValidate>
                  <div className="success-chip">
                    {forgotOtpVerified ? "OTP verified successfully" : "Verification complete"}
                  </div>

                  <div className="field">
                    <label htmlFor="fp-password">New Password</label>
                    <input
                      id="fp-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="fp-confirm-password">Confirm Password</label>
                    <input
                      id="fp-confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary">
                    {loading ? "Please wait..." : "Update Password"}
                  </button>
                </form>
              )}

              <hr className="divider" />
              <p className="footer-note">
                Remembered your password?{" "}
                <button type="button" className="inline-action" onClick={resetForgotPasswordFlow}>
                  Back to login
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="auth-mode-switch">
                <button
                  type="button"
                  className={`mode-chip ${authView === "password" ? "active" : ""}`}
                  onClick={switchToPasswordLogin}
                >
                  Password
                </button>
                <button
                  type="button"
                  className={`mode-chip ${authView === "otp" ? "active" : ""}`}
                  onClick={switchToOtpLogin}
                >
                  OTP Login
                </button>
              </div>

              <div className="flow-panel">
                <div className="flow-head">
                  <strong>{methodTitle}</strong>
                  {isOtpMode && (
                    <span className="flow-badge">{otpSent ? "OTP Sent" : "Step 1 of 2"}</span>
                  )}
                </div>
                <p className="flow-copy">{methodSubtitle}</p>
                {isOtpMode && (
                  <div className="flow-progress">
                    <div
                      className="flow-progress-bar"
                      style={{ width: otpSent ? "100%" : "50%" }}
                    />
                  </div>
                )}
              </div>

              {isOtpMode && (
                <div className="otp-channel-switch">
                  <button
                    type="button"
                    className={`channel-chip ${loginMethod === "email-otp" ? "active" : ""}`}
                    onClick={() => {
                      setLoginMethod("email-otp");
                      resetOtpFlow();
                    }}
                  >
                    Use Email OTP
                  </button>
                  <button
                    type="button"
                    className={`channel-chip ${loginMethod === "mobile-otp" ? "active" : ""}`}
                    onClick={() => {
                      setLoginMethod("mobile-otp");
                      resetOtpFlow();
                    }}
                  >
                    Use Mobile OTP
                  </button>
                </div>
              )}

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

                  <p className="forgot">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        setForgotEmail(email);
                        setShowForgotPassword(true);
                      }}
                    >
                      Forgot Password?
                    </button>
                  </p>

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
                      <p className="forgot helper-copy">Solve the math question to continue.</p>
                    </div>
                  )}

                  {otpSent && (
                    <>
                      <div className="notice-box">
                        <div className="notice-title">OTP sent to {identifier}</div>
                        <div className="notice-text">
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
                          className="link-button"
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
                    <button type="button" className="btn-secondary" onClick={resetOtpFlow}>
                      Change {otpLabel}
                    </button>
                  )}
                </form>
              )}

              <hr className="divider" />
              <p className="footer-note">
                Don&apos;t have an account? <a href="/signup">Create one →</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
