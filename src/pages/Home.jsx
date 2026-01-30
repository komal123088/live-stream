import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(60);
  const [maxDistance, setMaxDistance] = useState(100);
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    try {
      const cached = JSON.parse(localStorage.getItem("allUsers") || "[]");
      if (cached.length > 0) {
        setAllUsers(cached);
        setUsers(cached.filter((u) => u.firebaseUid !== currentUser?.uid));
      }
    } catch {}

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://192.168.100.5:5000/api/users",
          {
            timeout: 8000,
            signal: controller.signal,
          }
        );

        if (!mounted) return;

        const fresh = response.data.users || [];
        setAllUsers(fresh);
        setUsers(fresh.filter((u) => u.firebaseUid !== currentUser?.uid));
        localStorage.setItem("allUsers", JSON.stringify(fresh));
      } catch (err) {
        console.warn("Using cache only:", err.message);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [currentUser?.uid]);

  // APPLY FILTERS
  const applyFilters = () => {
    let filtered = allUsers.filter((u) => u.firebaseUid !== currentUser?.uid);

    filtered = filtered.filter((u) => {
      const a = u.age || 0;
      return a >= ageMin && a <= ageMax;
    });

    if (maxDistance < 100) {
      filtered = filtered.filter((u) => (u.distance || 999) <= maxDistance);
    }

    if (searchLocation.trim()) {
      const q = searchLocation.toLowerCase();
      filtered = filtered.filter((u) => u.location?.toLowerCase().includes(q));
    }

    setUsers(filtered);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setAgeMin(18);
    setAgeMax(60);
    setMaxDistance(100);
    setSearchLocation("");
    setUsers(allUsers.filter((u) => u.firebaseUid !== currentUser?.uid));
    setShowFilters(false);
  };

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setUsers(
      allUsers
        .filter((u) => u.firebaseUid !== currentUser?.uid)
        .filter((u) => u.name?.toLowerCase().includes(q))
    );
  };

  return (
    <div className="home-wrapper container-fluid position-relative">
      {/* HEADER */}

      {/* TOP BAR (Search + Filter in ONE ROW) */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        {/* SEARCH INPUT */}
        <div className="position-relative flex-grow-1 me-3">
          <i
            className="bi bi-search position-absolute"
            style={{
              top: "50%",
              left: "15px",
              transform: "translateY(-50%)",
              color: "var(--pink)",
            }}
          ></i>

          <input
            type="text"
            placeholder="Search by name..."
            className="form-control shadow-sm"
            onChange={handleSearch}
            style={{
              background: "white",
              borderRadius: "40px",
              padding: "12px 18px 12px 45px",
              border: "none",
            }}
          />
        </div>

        {/* FILTER BUTTON */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-btn btn-outline-pink "
        >
          <i className="bi bi-funnel me-2"></i> Filter
        </button>
      </div>

      {/* FILTER DROPDOWN (TOP) */}
      <div className={`filter-dropdown-wrapper ${showFilters ? "show" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="filter-title mb-0">Filters</h4>
          <button
            onClick={resetFilters}
            className="btn btn-sm btn-link text-danger"
          >
            Reset
          </button>
        </div>

        {/* AGE */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Age Range</label>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="number"
              className="form-control text-center filter-number"
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
            />
            <span>to</span>
            <input
              type="number"
              className="form-control text-center filter-number"
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
            />
          </div>
        </div>

        {/* DISTANCE */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Max Distance: {maxDistance === 100 ? "Any" : maxDistance + " km"}
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="form-range"
          />
        </div>

        {/* LOCATION */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Location</label>
          <input
            type="text"
            className="form-control filter-input"
            placeholder="e.g. London, Delhi..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <div className="filter-buttons d-flex gap-3">
          <button
            className="btn btn-light w-50"
            onClick={() => setShowFilters(false)}
          >
            Cancel
          </button>
          <button
            className="btn w-50 text-white"
            style={{ background: "var(--gradient)" }}
            onClick={applyFilters}
          >
            Show Results ({users.length})
          </button>
        </div>
      </div>

      {/* USERS GRID */}
      <div className="container pb-5">
        {users.length === 0 ? (
          <div className="text-center py-5">
            <h5>No users found</h5>
            <p className="text-muted">Try adjusting filters</p>
          </div>
        ) : (
          <div className="row g-4">
            {users.map((user) => (
              <div
                key={user.firebaseUid}
                className="col-6 col-md-4 col-lg-3"
                onClick={() => navigate(`/other-profile/${user.firebaseUid}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="card shadow-sm border-0 overflow-hidden">
                  <img
                    src={user.profilePic || "/default-you.jpg"}
                    alt={user.name}
                    onError={(e) => (e.target.src = "/default-you.jpg")}
                  />
                  <div className="text-center py-3 bg-white">
                    <h6 className="fw-bold mb-1">
                      {user.name}, {user.age || "??"}
                    </h6>
                    <p className="small text-muted mb-0">
                      {user.distance ? `${user.distance} km away` : "Nearby"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
