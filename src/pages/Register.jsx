import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { FaEnvelope, FaGoogle } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return alert("Enter valid email");
    if (password.length < 6) return alert("Password must 6 characters");
    if (password !== confirm) return alert("password  not match");

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      navigate("/profile-setup");
    } catch (err) {
      console.log(err);
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #ff3cac 0%, #784ba0 100%)",
        padding: "16px",
      }}
    >
      <div className="w-100" style={{ maxWidth: "400px", width: "100%" }}>
        <div
          className="bg-white rounded-4 shadow-lg p-4 p-md-5"
          style={{ minHeight: "500px" }}
        >
          {/* Logo */}
          <div className="text-center mb-4 mb-md-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mb-md-4"
              style={{
                width: "90px",
                height: "90px",
                background: "linear-gradient(135deg, #ff3cac, #784ba0)",
              }}
            >
              <svg width="50" height="50" viewBox="0 0 100 100">
                <path
                  d="M50 88.87 C65 75 85 58 92 44 C97 34 92 20 80 15 C68 10 56 14 50 22 C44 14 32 10 20 15 C8 20 3 34 8 44 C15 58 35 75 50 88.87"
                  fill="white"
                />
              </svg>
            </div>
            <h2
              className="fw-bold fs-4 fs-md-3 mb-2"
              style={{
                background: "linear-gradient(135deg, #ff3cac, #784ba0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Create Account
            </h2>
            <p className="text-muted small">Enter your details to register</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister}>
            <div className="d-flex align-items-center bg-light rounded-3 mb-3">
              <div className="px-3">
                <FaEnvelope size={22} style={{ color: "#ff3cac" }} />
              </div>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control border-0 shadow-none fs-6"
                style={{ height: "50px", background: "transparent" }}
                required
              />
            </div>

            <input
              type="password"
              placeholder="Password"
              className="form-control mb-3 rounded-3"
              style={{ height: "50px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="form-control mb-4 rounded-3"
              style={{ height: "50px" }}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 text-white fw-bold rounded-3 shadow-sm mb-3"
              style={{
                background: "linear-gradient(135deg, #ff3cac, #784ba0)",
                height: "50px",
                fontSize: "16px",
              }}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="text-center small mt-3">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{ color: "#ff3cac", cursor: "pointer", fontWeight: 600 }}
              >
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
