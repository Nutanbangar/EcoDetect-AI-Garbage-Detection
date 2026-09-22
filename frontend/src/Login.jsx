
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [forgotData, setForgotData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [forgotMessage, setForgotMessage] = useState("");

  const getRoleName = (role) => {
    if (role === "ADMIN") return "Admin";
    if (role === "WORKER") return "Worker";
    return "User";
  };

  const getRoleIcon = (role) => {
    if (role === "ADMIN") return "🏢";
    if (role === "WORKER") return "🛠️";
    return "👤";
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setMessage("");
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });

    setMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage("❌ " + result.message);
        return;
      }

      if (result.role !== selectedRole) {
        setMessage(
          `❌ This account is not registered as ${getRoleName(
            selectedRole
          )}.`
        );
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userName", result.fullName);
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("role", result.role);

      setMessage("✅ Login successful! Redirecting...");

      setTimeout(() => {
        if (result.role === "ADMIN") {
          navigate("/admin");
        } else if (result.role === "WORKER") {
          navigate("/worker");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "❌ Cannot connect to server. Please make sure Spring Boot is running."
      );
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    setForgotMessage("");

    if (!forgotData.email.trim()) {
      setForgotMessage("❌ Email is required");
      return;
    }

    if (!forgotData.newPassword) {
      setForgotMessage("❌ New password is required");
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordPattern.test(forgotData.newPassword)) {
      setForgotMessage(
        "❌ Password must be at least 8 characters and include uppercase, lowercase, number and special character."
      );
      return;
    }

    if (!forgotData.confirmPassword) {
      setForgotMessage("❌ Confirm password is required");
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotMessage("❌ Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotData.email,
            newPassword: forgotData.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setForgotMessage("❌ " + result.message);
        return;
      }

      setForgotMessage("✅ Password reset successfully!");

      setTimeout(() => {
        setShowForgotPassword(false);

        setForgotData({
          email: "",
          newPassword: "",
          confirmPassword: "",
        });

        setForgotMessage("");
      }, 1500);
    } catch (error) {
      console.error("Forgot password error:", error);

      setForgotMessage(
        "❌ Cannot connect to server. Please make sure Spring Boot is running."
      );
    }
  };

  const handleChangeRole = () => {
    setSelectedRole(null);

    setFormData({
      email: "",
      password: "",
    });

    setErrors({});
    setMessage("");
    setShowPassword(false);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);

    setForgotData({
      email: "",
      newPassword: "",
      confirmPassword: "",
    });

    setForgotMessage("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          ♻️ EcoDetect
        </div>

        {/* FORGOT PASSWORD SCREEN */}

        {showForgotPassword ? (
          <div className="forgot-password-section">

            <h1>Reset Password 🔐</h1>

            <p className="auth-subtitle">
              Enter your registered email and create a new password.
            </p>

            <div className="input-group">

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotData.email}
                onChange={(e) =>
                  setForgotData({
                    ...forgotData,
                    email: e.target.value,
                  })
                }
              />

            </div>

            <div className="input-group">

              <label>New Password</label>

              <div className="password-input-wrapper">

                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={forgotData.newPassword}
                  onChange={(e) =>
                    setForgotData({
                      ...forgotData,
                      newPassword: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            <div className="input-group">

              <label>Confirm Password</label>

              <div className="password-input-wrapper">

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={forgotData.confirmPassword}
                  onChange={(e) =>
                    setForgotData({
                      ...forgotData,
                      confirmPassword: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            {forgotMessage && (
              <div className="success-message">
                {forgotMessage}
              </div>
            )}

            <button
              type="button"
              className="auth-btn"
              onClick={handleForgotPassword}
            >
              Reset Password →
            </button>

            <button
              type="button"
              className="back-home"
              onClick={handleBackToLogin}
            >
              ← Back to Login
            </button>

          </div>

        ) : !selectedRole ? (

          /* ROLE SELECTION */

          <>
            <h1>Welcome to EcoDetect 👋</h1>

            <p className="auth-subtitle">
              Choose how you want to login
            </p>

            <div className="login-role-options">

              <button
                type="button"
                className="login-role-card"
                onClick={() => handleRoleSelect("USER")}
              >
                <div className="role-icon">
                  👤
                </div>

                <div className="role-content">
                  <h3>User</h3>

                  <p>
                    Detect garbage and report complaints
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

              <button
                type="button"
                className="login-role-card"
                onClick={() => handleRoleSelect("ADMIN")}
              >
                <div className="role-icon">
                  🏢
                </div>

                <div className="role-content">
                  <h3>Admin</h3>

                  <p>
                    Manage workers and complaints
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

              <button
                type="button"
                className="login-role-card"
                onClick={() => handleRoleSelect("WORKER")}
              >
                <div className="role-icon">
                  🛠️
                </div>

                <div className="role-content">
                  <h3>Worker</h3>

                  <p>
                    Manage assigned cleaning tasks
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

            </div>

            <Link to="/" className="back-home">
              ← Back to Home
            </Link>
          </>

        ) : (

          /* LOGIN FORM */

          <>
            <div className="selected-role">

              <span className="selected-role-icon">
                {getRoleIcon(selectedRole)}
              </span>

              <div className="selected-role-info">

                <small>Logging in as</small>

                <strong>
                  {getRoleName(selectedRole)}
                </strong>

              </div>

              <button
                type="button"
                className="change-role-btn"
                onClick={handleChangeRole}
              >
                Change
              </button>

            </div>

            <h1>Welcome Back 👋</h1>

            <p className="auth-subtitle">
              Login to continue to your{" "}
              {getRoleName(selectedRole)} account
            </p>

            <form onSubmit={handleSubmit}>

              <div className="input-group">

                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />

                {errors.email && (
                  <small className="error-text">
                    {errors.email}
                  </small>
                )}

              </div>

              <div className="input-group">

                <label>Password</label>

                <div className="password-input-wrapper">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (

                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3l18 18" />

                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />

                        <path d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 9.27 3.11 11 8a9.82 9.82 0 0 1-4.06 5.07" />

                        <path d="M6.61 6.61A9.83 9.83 0 0 0 1 12c1.73 4.89 6 8 11 8a9.77 9.77 0 0 0 4.24-.94" />
                      </svg>

                    ) : (

                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />

                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>

                    )}

                  </button>

                </div>

                {errors.password && (
                  <small className="error-text">
                    {errors.password}
                  </small>
                )}

              </div>

              <div className="forgot-password">

                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotMessage("");
                  }}
                >
                  Forgot Password?
                </button>

              </div>

              <button
                type="submit"
                className="auth-btn"
              >
                Login →
              </button>

            </form>

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            {selectedRole === "USER" && (
              <>
                <div className="auth-divider">
                  <span>OR</span>
                </div>

                <p className="switch-auth">
                  Don't have an account?

                  <Link to="/signup">
                    {" "}Create Account
                  </Link>
                </p>
              </>
            )}

            <button
              type="button"
              className="back-home"
              onClick={handleChangeRole}
            >
              ← Choose Different Login
            </button>

          </>
        )}

      </div>
    </div>
  );
}

export default Login;

