// src/pages/Splash.jsx
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 text-white text-center px-4"
      style={{ background: "var(--gradient)" }}
    >
      <h1 className="display-3 fw-bold lh-1 mb-4">
        Match.
        <br />
        Stream.
        <br />
        Connect.
      </h1>

      <p className="fs-3 opacity-90">Your perfect match is just a swipe away</p>

      <button className="btn-gradient mt-5" onClick={() => navigate("/home")}>
        Get Started
      </button>
    </div>
  );
}
