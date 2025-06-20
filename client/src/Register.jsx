// Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from './AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setStatus("❌ Passwords do not match.");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setStatus("❌ Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const result = await register(email, password);
    
    if (result.success) {
      setStatus("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setStatus(`❌ ${result.error}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <h1 className="register-main-title">Create an Account</h1>
        <form onSubmit={handleRegister} className="register-form">
          <input
            type="email"
            placeholder="Email"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className="register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="register-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>

          {status && <div className="register-status">{status}</div>}

          <p className="register-signin-link">
            Already have an account?{" "}
            <Link to="/login" className="register-link">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;