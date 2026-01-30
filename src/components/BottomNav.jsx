// src/components/BottomNav.jsx
import { Link, useLocation } from "react-router-dom";

export default function BottomNav({ userUid }) {
  const location = useLocation();
  let active = "";

  // Determine active page based on URL
  if (location.pathname.startsWith("/home")) active = "home";
  else if (location.pathname.startsWith("/matches")) active = "matches";
  else if (location.pathname.startsWith("/chat")) active = "chat";
  else if (location.pathname.startsWith("/live")) active = "live";
  else if (
    location.pathname.startsWith("/profile") &&
    !location.pathname.startsWith("/other-profile")
  )
    active = "profile";

  return (
    <div
      className="fixed-bottom bg-white border-top shadow-lg bottom-nav"
      style={{ maxWidth: "480px", margin: "auto", left: 0, right: 0 }}
    >
      <div className="d-flex justify-content-around py-3 bottom-links">
        {/* HOME */}
        <Link
          to="/home"
          className={`text-center text-decoration-none ${
            active === "home" ? "text-pink fw-bold" : "text-muted"
          }`}
        >
          <i className="bi bi-compass fs-3"></i>
          <div className="small">Discover</div>
        </Link>

        {/* MATCHES */}
        <Link
          to="/matches"
          className={`text-center text-decoration-none ${
            active === "matches" ? "text-pink fw-bold" : "text-muted"
          }`}
        >
          <i className="bi bi-heart fs-3"></i>
          <div className="small">Matches</div>
        </Link>

        {/* LIVE */}
        <Link
          to="/live"
          className={`text-center text-decoration-none ${
            active === "live" ? "text-pink fw-bold" : "text-muted"
          }`}
        >
          <i
            className="bi bi-play-circle-fill fs-2"
            style={{ color: "var(--pink)" }}
          ></i>
          <div className="small">Live</div>
        </Link>

        {/* CHAT */}
        <Link
          to="/chat"
          className={`text-center text-decoration-none ${
            active === "chat" ? "text-pink fw-bold" : "text-muted"
          }`}
        >
          <i className="bi bi-chat-dots fs-3"></i>
          <div className="small">Chat</div>
        </Link>

        {/* PROFILE */}
        <Link
          to={`/profile/${userUid}`}
          className={`text-center text-decoration-none ${
            active === "profile" ? "text-pink fw-bold" : "text-muted"
          }`}
        >
          <i className="bi bi-person fs-3"></i>
          <div className="small">Profile</div>
        </Link>
      </div>
    </div>
  );
}
