// src/pages/Matches.jsx
import React from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import profilesData from "../data/profiles";

export default function Matches() {
  const matches = [
    {
      id: 1,
      name: "Olivia",
      photo: profilesData[0].photo,
      lastMsg: "Hey! How are you?",
      time: "2m ago",
      unread: 3,
    },
    {
      id: 2,
      name: "Emma",
      photo: profilesData[1].photo,
      lastMsg: "That was fun streaming!",
      time: "1h ago",
      unread: 0,
    },
    {
      id: 3,
      name: "Ava",
      photo: profilesData[2].photo,
      lastMsg: "Are you free tonight?",
      time: "3h ago",
      unread: 1,
    },
    {
      id: 4,
      name: "Isabella",
      photo: profilesData[3].photo,
      lastMsg: "Loved your live!",
      time: "Yesterday",
      unread: 0,
    },
  ];

  return (
    <div className="mobile-container pb-5" style={{ paddingTop: "20px" }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-gradient fw-bold">Your Matches</h3>
        <small className="text-muted">
          Start chatting with your connections
        </small>
      </div>

      {/* Matches List */}
      <div className="px-3">
        {matches.map((match) => (
          <Link
            key={match.id}
            to={`/chat/${match.id}`}
            className="text-decoration-none"
          >
            <div
              className="d-flex align-items-center py-3 border-bottom"
              style={{ gap: "15px" }}
            >
              {/* Profile Photo */}
              <div className="position-relative">
                <img
                  src={match.photo}
                  alt={match.name}
                  className="rounded-circle"
                  style={{ width: "65px", height: "65px", objectFit: "cover" }}
                />
                {/* Online Indicator */}
                <div
                  className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "3px solid white",
                  }}
                ></div>
              </div>

              {/* Info */}
              <div className="flex-grow-1">
                <h6 className="mb-0 fw-semibold">{match.name}</h6>
                <p
                  className="text-muted small mb-0 text-truncate"
                  style={{ maxWidth: "220px" }}
                >
                  {match.lastMsg}
                </p>
              </div>

              {/* Right Side */}
              <div className="text-end">
                <small className="text-muted d-block">{match.time}</small>
                {match.unread > 0 && (
                  <span className="badge bg-primary rounded-pill mt-1">
                    {match.unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State (optional) */}
      {matches.length === 0 && (
        <div className="text-center mt-5">
          <i className="bi bi-heart fs-1 text-muted"></i>
          <p className="text-muted mt-3">No matches yet. Keep swiping!</p>
        </div>
      )}

      <BottomNav active="matches" />
    </div>
  );
}
