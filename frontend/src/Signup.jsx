import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Password show/hide
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const mobilePattern = /^[6-9]\d{9}$/;

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!mobilePattern.test(formData.mobileNumber)) {
      newErrors.mobileNumber =
        "Enter a valid 10-digit mobile number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordPattern.test(formData.password)) {
      newErrors.password =
        "Password must be 8+ characters with uppercase, lowercase, number and special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
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
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            mobileNumber: formData.mobileNumber,
            password: formData.password,
          }),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        setMessage("❌ " + result);
        return;
      }

      setMessage(
        "✅ Account created successfully! Redirecting to Login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        "❌ Cannot connect to server. Please make sure Spring Boot is running."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          ♻️ EcoDetect
        </div>

        <h1>Create Account 🚀</h1>

        <p className="auth-subtitle">
          Join EcoDetect and help build a cleaner future
        </p>

        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}
          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />

            {errors.fullName && (
              <small className="error-text">
                {errors.fullName}
              </small>
            )}
          </div>

          {/* EMAIL */}
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

          {/* MOBILE NUMBER */}
          <div className="input-group">
            <label>Mobile Number</label>

            <input
              type="tel"
              name="mobileNumber"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              maxLength="10"
              inputMode="numeric"
            />

            {errors.mobileNumber && (
              <small className="error-text">
                {errors.mobileNumber}
              </small>
            )}
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
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
                    <circle cx="12" cy="12" r="3" />
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

          {/* CONFIRM PASSWORD */}
          <div className="input-group">
            <label>Confirm Password</label>

            <div className="password-input-wrapper">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
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
                    <path d="M6.61 6.61A9.83 9.83 0 0 0 1 12c1.73 0 9.27 3.11 11 8a9.77 9.77 0 0 0 4.24-.94" />
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
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <small className="error-text">
                {errors.confirmPassword}
              </small>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="auth-btn"
          >
            Create Account →
          </button>

        </form>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="switch-auth">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Signup;