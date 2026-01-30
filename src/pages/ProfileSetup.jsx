// src/pages/ProfileSetup.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  // Step 1: Photos
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [extraFiles, setExtraFiles] = useState([null, null, null]);
  const [extraPreviews, setExtraPreviews] = useState([null, null, null]);

  // Step 2: Basic Info
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Female");

  // Step 3: About & Interests
  const [about, setAbout] = useState("");
  const [interests, setInterests] = useState([]);
  const allInterests = [
    "Movies",
    "Travel",
    "Food",
    "Music",
    "Gym",
    "Reading",
    "Dancing",
    "Art",
    "Gaming",
  ];

  // Step 4: Preferences
  const [location, setLocation] = useState("Camden, London");
  const [distance, setDistance] = useState(15);
  const [intent, setIntent] = useState("Dating");

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleImageUpload = (e, isProfile = false, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isProfile) {
        setProfilePreview(reader.result);
        setProfileFile(file);
      } else {
        const newPreviews = [...extraPreviews];
        const newFiles = [...extraFiles];
        newPreviews[index] = reader.result;
        newFiles[index] = file;
        setExtraPreviews(newPreviews);
        setExtraFiles(newFiles);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = async () => {
    if (!user?.uid) return alert("User not authenticated.");
    if (!profileFile) return alert("Add at least one profile photo.");

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("photos", profileFile);
      extraFiles
        .filter(Boolean)
        .forEach((file) => formData.append("photos", file));

      const uploadRes = await axios.post(
        "http://192.168.100.5:5000/api/users/upload-photos",
        formData,
        {
          timeout: 90000,
        }
      );

      const urls = uploadRes?.data?.photoUrls || [];
      if (!urls.length) throw new Error("Upload failed");

      const userData = {
        firebaseUid: user.uid,
        name,
        age: age ? Number(age) : undefined,
        gender,
        about,
        interests,
        location,
        distance: distance ? Number(distance) : undefined,
        intent,
        profilePic: urls[0],
        extraPhotos: urls.slice(1),
      };

      await axios.post(
        "http://192.168.100.5:5000/api/users/profile",
        userData,
        { timeout: 30000 }
      );

      localStorage.setItem("currentUserProfile", JSON.stringify(userData));
      navigate("/home");
    } catch (err) {
      console.error("Profile completion error:", err);
      alert("Upload/save failed. Check console and backend status.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-box">
        {/* Progress Dots */}
        <div className="d-flex justify-content-center mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="mx-1 rounded-circle"
              style={{
                width: "12px",
                height: "12px",
                background:
                  step >= i
                    ? "linear-gradient(135deg,#ff3cac,#784ba0)"
                    : "#ddd",
              }}
            />
          ))}
        </div>

        {/* STEP 1: Photos */}
        {step === 1 && (
          <>
            <h2>Add Your Photos</h2>
            <p
              style={{
                color: "#ff578e",
                fontSize: "14px",
                marginBottom: "30px",
              }}
            >
              Add at least 1 profile photo & up to 3 more
            </p>
            <div className="text-center mb-5">
              <div
                className="mx-auto rounded-circle overflow-hidden border border-5 border-white shadow-lg"
                style={{
                  width: "140px",
                  height: "140px",
                  cursor: "pointer",
                  background: "#f0f0f0",
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <i className="bi bi-person fs-1 text-muted"></i>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, true)}
                style={{ display: "none" }}
              />
              <p className="mt-2 text-muted small">Tap to set profile photo</p>
            </div>

            <div className="row g-3">
              {extraPreviews.map((photo, i) => (
                <div key={i} className="col-4">
                  <div
                    className="ratio ratio-1x1 rounded-3 overflow-hidden shadow border"
                    style={{ cursor: "pointer", border: "3px dashed #ff9ac8" }}
                    onClick={() =>
                      document.getElementById(`extra-${i}`).click()
                    }
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center bg-light">
                        <i className="bi bi-plus-lg fs-2 text-muted"></i>
                      </div>
                    )}
                    <input
                      id={`extra-${i}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false, i)}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP 2: Basic Info */}
        {step === 2 && (
          <>
            <h2>Tell us about you</h2>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control mb-3"
              style={{ borderRadius: "16px", padding: "14px" }}
            />
            <input
              type="number"
              placeholder="Your Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="form-control mb-4"
              style={{ borderRadius: "16px", padding: "14px" }}
            />
            <label className="label d-block text-start mb-2">Gender</label>
            <div className="gender-box">
              <button
                className={gender === "Female" ? "active" : ""}
                onClick={() => setGender("Female")}
              >
                Female
              </button>
              <button
                className={gender === "Male" ? "active" : ""}
                onClick={() => setGender("Male")}
              >
                Male
              </button>
            </div>
          </>
        )}

        {/* STEP 3: About & Interests */}
        {step === 3 && (
          <>
            <h2>About You</h2>
            <textarea
              placeholder="Write something cute about yourself..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="form-control mb-4"
              rows={4}
              style={{ borderRadius: "16px", padding: "14px" }}
            />
            <label className="label d-block text-start mb-3">
              Your Interests
            </label>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {allInterests.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleInterest(item)}
                  className={`px-4 py-2 rounded-pill border-0 ${
                    interests.includes(item) ? "text-white" : "bg-light"
                  }`}
                  style={
                    interests.includes(item)
                      ? {
                          background: "linear-gradient(135deg,#ff3cac,#784ba0)",
                        }
                      : {}
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 4: Preferences */}
        {step === 4 && (
          <>
            <h2>Your Preferences</h2>
            <label className="label">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-control mb-3"
            />
            <label className="label">Distance</label>
            <input
              type="range"
              min="1"
              max="100"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="form-range"
            />
            <span>{distance} km</span>
            <label className="label mt-3">Relationship Intent</label>
            <div className="intent-box">
              {[
                "Friendship",
                "Dating",
                "Casual",
                "Long-term",
                "Marriage",
                "Don't know",
              ].map((item) => (
                <button
                  key={item}
                  className={intent === item ? "active" : ""}
                  onClick={() => setIntent(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="mt-5">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn btn-light w-100 mb-3 rounded-pill py-3"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="continue-btn">
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="continue-btn"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Complete & Enter App"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
