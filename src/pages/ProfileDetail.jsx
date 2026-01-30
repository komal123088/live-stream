import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";
import { auth, database } from "../firebase";
import { ref, set, serverTimestamp, onValue } from "firebase/database";

export default function ProfileDetail() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return setLoading(false);

    axios
      .get(`http://192.168.100.5:5000/api/users/${currentUser.uid}`)
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Profile load error:", err);
        setLoading(false);
      });
  }, [currentUser]);

  // Check if user is already live
  useEffect(() => {
    if (!currentUser?.uid) return;

    const liveRef = ref(database, `liveStreams/${currentUser.uid}`);
    const unsubscribe = onValue(liveRef, (snap) => {
      setIsLive(snap.val()?.isLive === true);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const startLive = async () => {
    if (!currentUser) return;

    const liveRef = ref(database, `liveStreams/${currentUser.uid}`);

    try {
      await set(liveRef, {
        isLive: true,
        startedAt: serverTimestamp(),
        name: user?.name || "User",
        profilePic: user?.profilePic || "https://via.placeholder.com/150",
        title: "Live with friends!",
        viewers: 0,
      });

      // Redirect to own live room
      navigate(`/live/${currentUser.uid}`);
    } catch (err) {
      console.error("Failed to start live:", err);
      alert("Error starting live stream");
    }
  };

  if (loading)
    return (
      <div className="pd-loading">
        <div className="spinner-border text-pink"></div>
      </div>
    );

  if (!user)
    return (
      <div className="pd-not-found">
        <p>Profile not found</p>
        <button onClick={() => navigate("/home")}>Back to Home</button>
      </div>
    );

  const allPhotos = [user.profilePic, ...(user.extraPhotos || [])].filter(
    Boolean
  );

  return (
    <div className="pd-container">
      {/* Slider Section */}
      <div className="pd-slider" id="photoScroll">
        {allPhotos.map((photo, i) => (
          <img key={i} src={photo} className="pd-slide-img" alt="photo" />
        ))}
      </div>

      {/* Back Button */}
      <button className="pd-back-btn" onClick={() => navigate(-1)}>
        ←
      </button>

      {/* Info Card */}
      <div className="pd-info-box">
        <h2>
          {user.name}, {user.age}
        </h2>
        <p className="pd-location">
          {user.location || "Somewhere"} • {user.distance || "?"} km away
        </p>

        {user.about && (
          <p>
            <strong>About Me:</strong> {user.about}
          </p>
        )}

        {user.interests?.length > 0 && (
          <div className="pd-tags">
            {user.interests.map((i, idx) => (
              <span key={idx} className="pd-tag">
                {i}
              </span>
            ))}
          </div>
        )}

        {/* Go Live Button – Only on own profile */}
        <button
          className="btn btn-danger w-50 mt-4"
          onClick={startLive}
          disabled={isLive}
        >
          {isLive ? "You are Live!" : "Go Live"}
        </button>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
