// src/pages/OtherProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BottomNav from "../components/BottomNav";

const profileCache = new Map();

export default function OtherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (profileCache.has(id)) {
      const cached = profileCache.get(id);
      setUser(cached);
      setLoading(false);

      axios
        .get(`http://192.168.100.5:5000/api/users/${id}`)
        .then((res) => {
          if (cancelled) return;
          const fresh = res.data.user;
          profileCache.set(id, fresh);
          setUser(fresh);
        })
        .catch(() => {});
      return () => (cancelled = true);
    }

    axios
      .get(`http://192.168.100.5:5000/api/users/${id}`)
      .then((res) => {
        if (cancelled) return;
        const fetchedUser = res.data.user;
        profileCache.set(id, fetchedUser);
        setUser(fetchedUser);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Fetch error:", err);
        setError("Unable to load profile.");
        setLoading(false);
      });

    return () => (cancelled = true);
  }, [id]);

  if (loading)
    return (
      <div className="pd-loading">
        <div className="spinner-border text-pink"></div>
      </div>
    );

  if (error || !user)
    return (
      <div className="pd-not-found">
        <p>{error || "Profile not found"}</p>
        <button onClick={() => navigate("/home")}>Back to Home</button>
      </div>
    );

  const allPhotos = [user.profilePic, ...(user.extraPhotos || [])].filter(
    Boolean
  );

  return (
    <div className="pd-container">
      {/* BACK BUTTON FIXED */}
      <button className="pd-back-btn " onClick={() => navigate(-1)}>
        ←
      </button>
      <div className="pd-slider">
        {allPhotos.map((photo, i) => (
          <img key={i} src={photo} className="pd-slide-img" alt="photo" />
        ))}
      </div>

      {/* BACK BUTTON */}
      <button className="pd-back" onClick={() => navigate(-1)}>
        ←
      </button>

      {/* INFO */}
      <div className="pd-info-box">
        <h2>
          {user.name}, {user.age}
        </h2>

        <p className="pd-location">
          {user.location || "Somewhere"} • {user.distance} km away
        </p>

        {user.about && (
          <p>
            <strong>About Me:</strong> {user.about}
          </p>
        )}

        {user.interests?.length > 0 && (
          <div className="pd-tags">
            {user.interests.map((tag, i) => (
              <span key={i} className="pd-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/*   BUTTONS */}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button
            className="btn btn-primary w-50"
            onClick={() => navigate(`/chat/${id}`)}
          >
            Message
          </button>

          <button
            className="btn btn-danger  w-50"
            onClick={() => navigate(`/live/${id}`)}
          >
            Go Live
          </button>
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
