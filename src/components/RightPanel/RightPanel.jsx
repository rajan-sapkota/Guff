import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Flame, UserPlus, Sparkles, Check, Hash } from "lucide-react";

export const RightPanel = ({ onSelectLocation }) => {
  const { currentUser, toggleFollow } = useAuth();

  const suggestedUsers = [
    {
      id: "user_ayesha",
      name: "Ayesha Sharma",
      handle: "@ayesha",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      bio: "Cafe enthusiast & traveler ☕"
    },
    {
      id: "user_priya",
      name: "Priya Patel",
      handle: "@priya_p",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "UI/UX Designer & photographer 📸"
    }
  ];

  const trendingTopics = [
    { tag: "#HimalayanMomo", posts: "14.2K posts", category: "Food & Dining" },
    { tag: "#TokyoMatcha", posts: "8.9K posts", category: "Travel" },
    { tag: "#AppleLiquidGlass", posts: "24.5K posts", category: "Design" }
  ];

  const followingList = currentUser?.following || [];

  return (
    <aside className="desktop-only desktop-right-panel" style={{
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      height: "100%",
      position: "sticky",
      top: "12px",
      overflowY: "auto"
    }}>
      {/* 1. Who To Follow Card */}
      <div className="glass-surface" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <UserPlus size={18} color="#0A84FF" /> Who to Follow
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {suggestedUsers.map(user => {
            const isFollowing = followingList.includes(user.id);
            return (
              <div key={user.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#fff" }}>{user.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>{user.handle}</div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleFollow(user.id, user.name)}
                  className={`apple-btn ${isFollowing ? 'apple-btn-glass' : 'apple-btn-primary'}`} 
                  style={{ padding: "6px 14px", fontSize: "0.8rem", color: isFollowing ? "#30D158" : "#fff" }}
                >
                  {isFollowing ? <><Check size={14} /> Following</> : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Trending Topics Card */}
      <div className="glass-surface" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Flame size={18} color="#FF9F0A" /> Trending Now
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {trendingTopics.map((item, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", textTransform: "uppercase" }}>
                {item.category}
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: "700", color: "#fff" }}>
                {item.tag}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
                {item.posts}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Online Friends Live Stream */}
      <div className="glass-surface" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="#30D158" /> Online Friends
          </h3>
          <span className="badge" style={{ background: "rgba(48, 209, 88, 0.2)", color: "#30D158" }}>
            Live
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "4px" }}>
          <div style={{ textAlign: "center", cursor: "pointer" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                alt="Rajan" 
                style={{ width: "44px", height: "44px", borderRadius: "50%", border: "2px solid #30D158" }}
              />
              <span style={{ position: "absolute", bottom: "2px", right: "2px", width: "10px", height: "10px", borderRadius: "50%", background: "#30D158", border: "2px solid #000" }} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#fff", marginTop: "2px" }}>Rajan</div>
          </div>

          <div style={{ textAlign: "center", cursor: "pointer" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                alt="Admin" 
                style={{ width: "44px", height: "44px", borderRadius: "50%", border: "2px solid #FF9F0A" }}
              />
              <span style={{ position: "absolute", bottom: "2px", right: "2px", width: "10px", height: "10px", borderRadius: "50%", background: "#FF9F0A", border: "2px solid #000" }} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#fff", marginTop: "2px" }}>Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
