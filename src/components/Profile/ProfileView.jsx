import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Edit3, Grid, Image as ImageIcon, Heart, MapPin, Shield, CheckCircle } from "lucide-react";

export const ProfileView = () => {
  const { currentUser, setIsAuthModalOpen } = useAuth();
  const [activeSegment, setActiveSegment] = useState("posts"); // 'posts' | 'media' | 'liked'

  const user = currentUser || {
    name: "Guest Explorer",
    email: "guest@guff.app",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    bio: "Sign in to customize your profile, share photos, and pin restaurants!"
  };

  const sampleMediaGrid = [
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Cover Photo */}
      <div style={{
        height: "180px",
        width: "100%",
        background: "linear-gradient(135deg, #0A84FF, #BF5AF2, #FF375F)",
        position: "relative"
      }}>
        {/* Profile Avatar Header */}
        <div style={{
          position: "absolute",
          bottom: "-40px",
          left: "24px",
          display: "flex",
          alignItems: "flex-end",
          gap: "16px"
        }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #000",
              boxShadow: "0 8px 25px rgba(0,0,0,0.5)"
            }}
          />
        </div>
      </div>

      {/* Profile Details Bar */}
      <div style={{ padding: "50px 24px 20px 24px" }}>
        <div className="profile-details-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              {user.name}
              {user.role === "admin" && (
                <span className="badge badge-admin"><Shield size={10} /> ADMIN</span>
              )}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", marginTop: "2px" }}>
              {user.email}
            </p>
          </div>

          <button onClick={() => setIsAuthModalOpen(true)} className="apple-btn apple-btn-glass" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>

        <p style={{ fontSize: "0.95rem", color: "#e2e8f0", marginTop: "14px", lineHeight: "1.4" }}>
          {user.bio || "Active Guff member • Exploring top places & live threads"}
        </p>

        {/* Stats Grid */}
        <div className="profile-stats" style={{ display: "flex", gap: "28px", marginTop: "18px", padding: "14px 0", borderTop: "1px solid var(--apple-glass-border-dark)", borderBottom: "1px solid var(--apple-glass-border-dark)" }}>
          <div>
            <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff" }}>24</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginLeft: "6px" }}>Posts</span>
          </div>
          <div>
            <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff" }}>1.4K</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginLeft: "6px" }}>Followers</span>
          </div>
          <div>
            <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff" }}>380</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginLeft: "6px" }}>Following</span>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div style={{ display: "flex", gap: "8px", margin: "20px 0 16px 0", background: "rgba(255,255,255,0.06)", padding: "4px", borderRadius: "var(--radius-pill)" }}>
          <button
            onClick={() => setActiveSegment("posts")}
            className={`apple-btn ${activeSegment === 'posts' ? 'apple-btn-primary' : ''}`}
            style={{ flex: 1, padding: "8px", fontSize: "0.85rem", background: activeSegment === 'posts' ? undefined : 'transparent' }}
          >
            <Grid size={16} /> Posts
          </button>
          <button
            onClick={() => setActiveSegment("media")}
            className={`apple-btn ${activeSegment === 'media' ? 'apple-btn-primary' : ''}`}
            style={{ flex: 1, padding: "8px", fontSize: "0.85rem", background: activeSegment === 'media' ? undefined : 'transparent' }}
          >
            <ImageIcon size={16} /> Media
          </button>
          <button
            onClick={() => setActiveSegment("liked")}
            className={`apple-btn ${activeSegment === 'liked' ? 'apple-btn-primary' : ''}`}
            style={{ flex: 1, padding: "8px", fontSize: "0.85rem", background: activeSegment === 'liked' ? undefined : 'transparent' }}
          >
            <Heart size={16} /> Liked
          </button>
        </div>

        {/* Grid Media Display */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
          {sampleMediaGrid.map((src, idx) => (
            <div key={idx} style={{ borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "1/1", position: "relative" }}>
              <img src={src} alt="Media post" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
