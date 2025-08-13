import React, { useState, useEffect } from "react"; // Your configured axios or fetch instance
import './ProfileUpdate.css'
import apiInstance from '../../utils/axios';

const ProfileUpdate= () => {
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    image: null, // for file input
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current user profile data on mount
    async function fetchProfile() {
      try {
        const res = await apiInstance.get("/user/profile/"); // your endpoint to get profile
        setProfileData({
          username: res.data.username,
          email: res.data.email,
          image: null,
        });
        setPreviewImage(res.data.image); // existing profile image URL
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileData(prev => ({ ...prev, image: file }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", profileData.username);
      formData.append("email", profileData.email);
      if (profileData.image) {
        formData.append("image", profileData.image);
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      await apiInstance.put("/user/profile/update/", formData, config);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
  className="profile-update-form"
  onSubmit={handleSubmit}
  encType="multipart/form-data"
>
  <h2>Update Profile</h2>

  <div className="form-group">
    <label>Username:</label>
    <input
      type="text"
      name="username"
      value={profileData.username}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label>Email:</label>
    <input
      type="email"
      name="email"
      value={profileData.email}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label>Profile Image:</label><br />
    {previewImage && (
      <img
        src={previewImage}
        alt="Profile Preview"
        className="image-preview"
      />
    )}
    <input
      type="file"
      name="image"
      onChange={handleFileChange}
      accept="image/*"
    />
  </div>

  <button type="submit" disabled={loading}>
    {loading ? "Saving..." : "Update Profile"}
  </button>
</form>
  );
};

export default ProfileUpdate;
