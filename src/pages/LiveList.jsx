import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import BottomNav from "../components/BottomNav";
import TopNav from "../components/TopNav";

export default function LiveList() {
  const [liveUsers, setLiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const liveRef = ref(database, "liveStreams");

    const unsubscribe = onValue(liveRef, (snapshot) => {
      const liveList = [];

      snapshot.forEach((child) => {
        const data = child.val();

        if (data?.isLive === true) {
          const viewersCount = data.viewersList
            ? Object.keys(data.viewersList).length
            : 0;

          liveList.push({
            uid: child.key,
            name: data.name,
            profilePic: data.profilePic,
            title: data.title,
            viewers: viewersCount, // ✅ REAL COUNT
          });
        }
      });

      setLiveUsers(liveList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border text-pink"></div>
      </div>
    );
  }

  return (
    <div className="live-list-page">
      <TopNav />

      <div className="live-header">
        <h2>Live Now</h2>
        <p>Join ongoing streams!</p>
      </div>

      {liveUsers.length === 0 ? (
        <div className="no-live">
          <p>No one is live right now...</p>
        </div>
      ) : (
        <div className="live-grid">
          {liveUsers.map((user) => (
            <div
              key={user.uid}
              className="live-card"
              onClick={() => navigate(`/live/${user.uid}`)}
            >
              <img
                src={user.profilePic}
                alt={user.name}
                className="live-avatar"
              />

              {/* 🔴 Overlay */}
              <div className="live-overlay">
                <span className="live-badge">LIVE</span>

                {/* 👀 REAL VIEWERS COUNT */}
                <span className="viewers">👁 {user.viewers}</span>
              </div>

              <div className="live-info">
                <h4>{user.name}</h4>
                <p>{user.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav active="live" />
    </div>
  );
}
