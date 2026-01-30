// src/components/TopNav.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopNav({ active }) {
  const { user: firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("currentUserProfile");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const saved = localStorage.getItem("currentUserProfile");
    if (saved) {
      setUserData(JSON.parse(saved));
      return;
    }

    fetch(`http://192.168.100.5:5000/api/users/${firebaseUser.uid}`)
      .then((r) => r.json())
      .then((data) => {
        const user = data.user;
        localStorage.setItem("currentUserProfile", JSON.stringify(user));
        setUserData(user);
      })
      .catch(() => {
        setUserData({ name: firebaseUser.displayName || "User" });
      });
  }, [firebaseUser]);

  const name = userData?.name || firebaseUser?.displayName || "User";
  const photo = userData?.profilePic || "/default-you.jpg";

  return (
    <div className="topnav topBar">
      <div className="topnav-left">
        <h3 style={{ color: "#ff578e" }}>Live stream</h3>
      </div>

      <div className="topnav-center">
        <Link
          to="/home"
          className={`nav-item ${active === "home" ? "active" : ""}`}
        >
          Discover
        </Link>
        <Link
          to="/matches"
          className={`nav-item ${active === "matches" ? "active" : ""}`}
        >
          Matches
        </Link>
        <Link
          to="/live"
          className={`nav-item ${active === "live" ? "active" : ""}`}
        >
          Live
        </Link>
        <Link
          to="/chat"
          className={`nav-item ${active === "chat" ? "active" : ""}`}
        >
          Chat
        </Link>
        <Link
          to={`/profile/${firebaseUser?.uid}`}
          className={`nav-item ${active === "profile" ? "active" : ""}`}
        >
          Profile
        </Link>
      </div>

      <div className="topnav-right">
        <div
          className="d-flex align-items-center gap-2"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/profile/${firebaseUser?.uid}`)}
        >
          <div className="position-relative">
            <img
              src={photo}
              alt={name}
              className="rounded-circle"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                border: "3px solid #ff3cac",
              }}
              onError={(e) => {
                e.target.src = "/default-you.jpg";
              }}
            />
            <div
              className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
              style={{ width: "12px", height: "12px" }}
            />
          </div>
          <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>
            {name}
          </span>
        </div>
        <button className="more-btn ms-3">
          <i className="bi bi-three-dots-vertical fs-5"></i>
        </button>
      </div>
    </div>
  );
}
