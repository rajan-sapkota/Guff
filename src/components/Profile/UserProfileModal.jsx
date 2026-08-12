import React from "react";
import { useAuth } from "../../context/AuthContext";
import { X, MessageSquare, Shield, Check, Grid, Image as ImageIcon, Heart } from "lucide-react";

export const UserProfileModal = ({ isOpen, onClose, user }) => {
  const { currentUser, toggleFollow, setActiveTab, setActiveChannel, showToast } = useAuth();

  if (!isOpen || !user) return null;

  const followingList = currentUser?.following || [];
  const isFollowing = followingList.includes(user.id);
  const isSelf = currentUser?.id === user.id;

  const handleStartPrivateMessage = () => {
    if (!currentUser) {
      showToast("Please sign in to send private messages", "error");
      return;
    }
    const dmChannelId = [currentUser.id, user.id].sort().join("_dm_");
    setActiveChannel(dmChannelId);
    setActiveTab("chat");
    onClose();
    showToast(`Opened private message thread with ${user.name}`, "info");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "460px",
          width: "100%",
          padding: 0,
          overflow: "hidden",
          borderRadius: "var(--radius-lg)",
          background: "rgba(18, 24, 36, 0.95)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)"
        }}
      >
        {/* Cover Photo Banner */}
        <div style={{
          height: "140px",
          background: "linear-gradient(135deg, #0A84FF, #BF5AF2, #FF375F)",
          position: "relative"
        }}>
          <button
            onClick={onClose}
            className="apple-btn apple-btn-glass"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "32px",
              height: "32px",
              padding: 0,
              zIndex: 10
            }}
          >
            <X size={16} />
          </button>

          {/* User Avatar */}
          <div style={{
            position: "absolute",
            bottom: "-36px",
            left: "20px"
          }}>
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={user.name}
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #121824",
                boxShadow: "0 8px 20px rgba(0,0,0,0.6)"
              }}
            />
          </div>
        </div>

        {/* Profile Content Body */}
        <div style={{ padding: "46px 20px 24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                {user.name}
                {user.role === "admin" && (
                  <span className="badge badge-admin" style={{ fontSize: "0.68rem" }}>
                    <Shield size={10} /> ADMIN
                  </span>
                )}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginTop: "2px" }}>
                {user.email}
              </p>
            </div>

            {/* Action Buttons: Follow & Direct Message */}
            {!isSelf && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => toggleFollow(user.id, user.name)}
                  className={`apple-btn ${isFollowing ? 'apple-btn-glass' : 'apple-btn-primary'}`}
                  style={{ padding: "8px 14px", fontSize: "0.82rem", color: isFollowing ? "#30D158" : "#fff" }}
                >
                  {isFollowing ? <><Check size={14} /> Following</> : "Follow"}
                </button>

                <button
                  onClick={handleStartPrivateMessage}
                  className="apple-btn apple-btn-glass"
                  style={{ padding: "8px 14px", fontSize: "0.82rem", color: "#0A84FF" }}
                  title="Send Direct Message"
                >
                  <MessageSquare size={16} /> Message
                </button>
              </div>
            )}
          </div>

          <p style={{ fontSize: "0.9rem", color: "#e2e8f0", marginTop: "12px", lineHeight: "1.4" }}>
            {user.bio || "Active Guff platform member"}
          </p>

          {/* Stats Bar */}
          <div style={{
            display: "flex",
            gap: "24px",
            marginTop: "16px",
            padding: "12px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div>
              <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>18</span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", marginLeft: "6px" }}>Posts</span>
            </div>
            <div>
              <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>{user.followersCount || 142}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", marginLeft: "6px" }}>Followers</span>
            </div>
            <div>
              <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>{(user.following || []).length || 34}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", marginLeft: "6px" }}>Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
