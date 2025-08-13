import React, { useState, useEffect } from "react";
import ProfileUpdate from "../ProfileUpdate/ProfileUpdate";
import Cookies from "js-cookie";
import {getUserProfile} from "../../utils/auth";
import {jwtDecode} from "jwt-decode";
import "./Profile.css";

const ProfileView = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = Cookies.get("access_token");
        let userid = null;
        if (token) {
          const decoded = jwtDecode(token);
          userid = decoded.user_id || decoded.id || decoded.sub;
          console.log("Current user ID:", userid);
        }
        if (!userid) {
          console.log("No valid user ID found, skipping fetch");
          return;
        }
        const res = await getUserProfile(userid);
        setProfileData(res.data);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    }
    fetchProfile();
  }, []);

  if (!profileData) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="profile-view-container">
      <div className="profile-view-header">
        <h2>My Profile</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close profile sidebar">
          &times;
        </button>
      </div>
      {isEditing ? (
        <ProfileUpdate
          initialData={profileData}
          onUpdate={(updatedData) => {
            setProfileData(updatedData);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="profile-details">
          <img
            className="profile-avatar"
            src={profileData.image || "/default-avatar.avif"}
            alt="Profile"
          />
          <p>
            <strong>Username:</strong> <span>{profileData.username}</span>
          </p>
          <p>
            <strong>Email:</strong> <span>{profileData.email}</span>
          </p>
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            Update Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
