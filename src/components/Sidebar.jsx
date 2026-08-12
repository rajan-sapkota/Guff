import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  MessageSquare, 
  Rss, 
  MapPin, 
  Shield, 
  Hash, 
  Camera, 
  Lock,
  Compass
} from "lucide-react";

export const Sidebar = ({ onOpenCamera, onOpenMap }) => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    requireAuthForTab,
    activeChannel, 
    setActiveChannel,
    setIsAuthModalOpen,
    setAuthPromptReason
  } = useAuth();

  const channels = [
    { id: "general", name: "general", desc: "Public chit-chat & updates" },
    { id: "foodies-corner", name: "foodies-corner", desc: "Best food & restaurant picks" },
    { id: "shop-local", name: "shop-local", desc: "Local shops & store deals" },
    { id: "announcements", name: "announcements", desc: "Official community news" }
  ];

  const handleSelectChannel = (chId) => {
    if (!currentUser) {
      setAuthPromptReason("Please login to access live chat channels.");
      setIsAuthModalOpen(true);
      return;
    }
    setActiveChannel(chId);
    setActiveTab("chat");
  };

  return (
    <aside className="glass-panel" style={{
      width: "280px",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid var(--border-color)",
      height: "calc(100vh - 64px)",
      userSelect: "none"
    }}>
      {/* Navigation Mode Tabs */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
        
        {/* Social Feed - PUBLIC for everyone */}
        <button
          onClick={() => setActiveTab("feed")}
          className={`btn ${activeTab === "feed" ? "btn-primary" : "btn-secondary"}`}
          style={{ justifyContent: "flex-start", width: "100%", padding: "10px 14px" }}
        >
          <Rss size={18} /> Social Feed (Public)
        </button>

        {/* Live Messages - PROTECTED */}
        <button
          onClick={() => requireAuthForTab("chat")}
          className={`btn ${activeTab === "chat" ? "btn-primary" : "btn-secondary"}`}
          style={{ justifyContent: "flex-start", width: "100%", padding: "10px 14px", position: "relative" }}
        >
          <MessageSquare size={18} /> Live Messages
          {!currentUser && (
            <span className="badge" style={{ marginLeft: "auto", background: "rgba(239,68,68,0.2)", color: "#f87171", fontSize: "0.65rem" }}>
              <Lock size={10} /> Login
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("map"); onOpenMap(); }}
          className={`btn ${activeTab === "map" ? "btn-primary" : "btn-secondary"}`}
          style={{ justifyContent: "flex-start", width: "100%", padding: "10px 14px" }}
        >
          <Compass size={18} /> Live Map Explorer
        </button>

        {currentUser?.role === "admin" && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`btn ${activeTab === "admin" ? "btn-primary" : "btn-secondary"}`}
            style={{ 
              justifyContent: "flex-start", 
              width: "100%", 
              padding: "10px 14px",
              background: activeTab === "admin" ? "linear-gradient(135deg, #f59e0b, #ec4899)" : "rgba(245, 158, 11, 0.1)",
              color: activeTab === "admin" ? "#fff" : "#f59e0b",
              border: "1px solid rgba(245, 158, 11, 0.3)"
            }}
          >
            <Shield size={18} /> Admin Dashboard
          </button>
        )}
      </div>

      <hr style={{ borderColor: "var(--border-color)", margin: "0 16px" }} />

      {/* Quick Action Tools */}
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-dark)", marginBottom: "10px", letterSpacing: "0.05em" }}>
          Quick Actions
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={onOpenCamera}
            className="btn btn-secondary" 
            style={{ flex: 1, padding: "8px 12px", fontSize: "0.82rem" }}
          >
            <Camera size={15} color="#06b6d4" /> Snap Photo
          </button>
          <button 
            onClick={onOpenMap}
            className="btn btn-secondary" 
            style={{ flex: 1, padding: "8px 12px", fontSize: "0.82rem" }}
          >
            <MapPin size={15} color="#ec4899" /> Pin Place
          </button>
        </div>
      </div>

      <hr style={{ borderColor: "var(--border-color)", margin: "0 16px" }} />

      {/* Channels List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-dark)", letterSpacing: "0.05em" }}>
            Chat Channels
          </span>
          <span className="badge" style={{ background: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)" }}>
            4 live
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {channels.map((ch) => {
            const isActive = activeChannel === ch.id && activeTab === "chat";
            return (
              <div
                key={ch.id}
                onClick={() => handleSelectChannel(ch.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  background: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                  transition: "all 0.2s ease"
                }}
                className="channel-item"
              >
                <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Hash size={16} color={isActive ? "var(--primary)" : "var(--text-dark)"} />
                    <span style={{ fontSize: "0.9rem", fontWeight: isActive ? "600" : "400", color: isActive ? "#fff" : "var(--text-muted)" }}>
                      {ch.name}
                    </span>
                  </div>
                  {!currentUser && <Lock size={12} color="var(--text-dark)" style={{ marginLeft: "auto" }} />}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dark)", marginLeft: "24px", marginTop: "2px" }}>
                  {ch.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
