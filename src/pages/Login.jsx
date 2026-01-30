import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      alert("Wrong email or password!");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await googleLogin();
      navigate("/home");
    } catch (err) {
      alert("Google login failed!");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #ff3cac 0%, #784ba0 100%)",
        padding: "16px",
      }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <div className="bg-white rounded-4 shadow-2xl overflow-hidden p-5">
          <div className="text-center mb-4">
            <h2
              className="fw-bold"
              style={{
                background: "linear-gradient(135deg, #ff3cac, #784ba0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome Back!
            </h2>
            <p className="text-muted small">Log in to continue</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 d-flex align-items-center bg-light rounded-3 px-3">
              <FaEnvelope size={20} style={{ color: "#ff3cac" }} />
              <input
                type="email"
                className="form-control border-0 shadow-none  bg-light"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ height: "50px" }}
                required
              />
            </div>
            <div className="mb-4 d-flex align-items-center bg-light rounded-3 px-3">
              <FaLock size={20} style={{ color: "#784ba0" }} />
              <input
                type="password"
                className="form-control border-0 shadow-none  bg-light"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ height: "50px" }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn w-100 text-white fw-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #ff3cac, #784ba0)",
                height: "50px",
              }}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="btn w-100 btn-light border d-flex align-items-center justify-content-center gap-2 mb-3"
          >
            <FaGoogle size={20} style={{ color: "#db4437" }} /> Continue with
            Google
          </button>
          <p className="text-center small">
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ color: "#ff3cac", fontWeight: "600" }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
