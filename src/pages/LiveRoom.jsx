import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { database, auth } from "../firebase";
import { ref, onValue, set, remove } from "firebase/database";
import axios from "axios";
import { FaUser } from "react-icons/fa6";

// same caching pattern
const userCache = new Map();

export default function LiveRoom() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const [liveData, setLiveData] = useState(null);
  const [viewers, setViewers] = useState([]);
  const [showViewersList, setShowViewersList] = useState(false);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);

  // 🔥 EXACT same API logic as OtherProfile
  const fetchUserData = async (userId) => {
    if (userCache.has(userId)) {
      return userCache.get(userId);
    }

    try {
      const res = await axios.get(
        `http://192.168.100.5:5000/api/users/${userId}`
      );

      const user = res.data?.user;
      if (!user) return null;

      userCache.set(userId, user);
      return user;
    } catch (err) {
      console.error("User fetch error:", err);
      return null;
    }
  };

  useEffect(() => {
    const liveRef = ref(database, `liveStreams/${uid}`);
    const viewersRef = ref(database, `liveStreams/${uid}/viewersList`);

    // Live status
    const unsubscribeLive = onValue(liveRef, (snap) => {
      const data = snap.val();
      if (data && data.isLive) {
        setLiveData(data);
      } else {
        navigate("/live");
      }
      setLoading(false);
    });

    // Viewers realtime
    const unsubscribeViewers = onValue(viewersRef, async (snap) => {
      const viewerIds = [];

      snap.forEach((child) => {
        viewerIds.push(child.val().uid);
      });

      const resolvedUsers = await Promise.all(
        viewerIds.map(async (id) => {
          const user = await fetchUserData(id);
          if (!user) return null;

          return {
            uid: id,
            name: user.name,
            profilePic: user.profilePic,
          };
        })
      );

      // ❗ show ONLY real users
      setViewers(resolvedUsers.filter(Boolean));
    });

    // Join live
    if (currentUser) {
      const myRef = ref(
        database,
        `liveStreams/${uid}/viewersList/${currentUser.uid}`
      );
      set(myRef, { uid: currentUser.uid });
    }

    return () => {
      unsubscribeLive();
      unsubscribeViewers();

      if (currentUser) {
        const myRef = ref(
          database,
          `liveStreams/${uid}/viewersList/${currentUser.uid}`
        );
        remove(myRef);
      }
    };
  }, [uid, currentUser, navigate]);

  const endLive = async () => {
    if (!currentUser || currentUser.uid !== uid) return;
    await remove(ref(database, `liveStreams/${uid}`));
    navigate("/live");
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!liveData) return null;

  return (
    <div
      className="live-room-container"
      style={{
        marginTop: "60px",
      }}
    >
      <h2>{liveData.name}'s Live Stream</h2>

      {/* Video */}
      <div className="video-player">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="video-element"
        />
        <div className="video-overlay">
          <span className="live-badge">LIVE</span>
        </div>
      </div>

      {/* Info */}
      <div className="live-info">
        <p>{liveData.title}</p>

        <div className="viewers-section">
          <span>{viewers.length} viewers</span>
          <button
            className="viewers-icon-btn"
            onClick={() => setShowViewersList(!showViewersList)}
          >
            <FaUser />
          </button>
        </div>
      </div>

      {/* Viewers List */}
      {showViewersList && (
        <div className="viewers-list-popup">
          <h4>Viewers ({viewers.length})</h4>

          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "left",
              textAlign: "left",
            }}
          >
            {viewers.map((v) => (
              <li
                key={v.uid}
                style={{
                  listStyle: "none",
                }}
              >
                <img src={v.profilePic} alt={v.name} className="viewer-pic" />
                <span>
                  {v.name}
                  {v.uid === uid && " (Host)"}
                </span>
              </li>
            ))}
          </ul>

          <button onClick={() => setShowViewersList(false)}>Close</button>
        </div>
      )}

      {/* End Live */}
      {currentUser?.uid === uid && (
        <button className="btn btn-danger mt-4" onClick={endLive}>
          End Live
        </button>
      )}
    </div>
  );
}
