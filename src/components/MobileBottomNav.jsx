import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  MessageSquare, 
  Rss, 
  Compass, 
  Shield, 
  Camera,
  Lock
} from "lucide-react";

export const MobileBottomNav = ({ onOpenCamera, onOpenMap }) => {
  const { currentUser, activeTab, setActiveTab, requireAuthForTab } = useAuth();

  return (
    <nav className="mobile-only glass-panel" style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: "var(--mobile-nav-height)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      zIndex: 1000,
      borderTop: "1px solid var(--border-color)",
      background: "rgba(18, 24, 36, 0.95)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      padding: "0 8px"
    }}>
      {/* 1. Public Feed */}
      <button
        onClick={() => setActiveTab("feed")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          background: "none",
          border: "none",
          color: activeTab === "feed" ? "var(--primary)" : "var(--text-muted)",
          fontSize: "0.72rem",
          fontWeight: activeTab === "feed" ? "700" : "500",
          cursor: "pointer",
          flex: 1
        }}
      >
        <Rss size={20} color={activeTab === "feed" ? "var(--primary)" : "var(--text-muted)"} />
        <span>Feed</span>
      </button>

      {/* 2. Live Chat (Protected) */}
      <button
        onClick={() => requireAuthForTab("chat")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          background: "none",
          border: "none",
          color: activeTab === "chat" ? "var(--primary)" : "var(--text-muted)",
          fontSize: "0.72rem",
          fontWeight: activeTab === "chat" ? "700" : "500",
          cursor: "pointer",
          flex: 1,
          position: "relative"
        }}
      >
        <div style={{ position: "relative" }}>
          <MessageSquare size={20} color={activeTab === "chat" ? "var(--primary)" : "var(--text-muted)"} />
          {!currentUser && (
            <Lock size={10} color="#f87171" style={{ position: "absolute", top: "-4px", right: "-6px" }} />
          )}
        </div>
        <span>Live Chat</span>
      </button>

      {/* 3. Camera Snap Center Button */}
      <button
        onClick={onOpenCamera}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary), var(--accent-cyan))",
          border: "none",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 15px rgba(99,102,241,0.5)",
          cursor: "pointer",
          marginTop: "-14px"
        }}
        title="Snap camera photo"
      >
        <Camera size={22} />
      </button>

      {/* 4. Live Map Explorer */}
      <button
        onClick={() => { setActiveTab("map"); onOpenMap(); }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          background: "none",
          border: "none",
          color: activeTab === "map" ? "var(--primary)" : "var(--text-muted)",
          fontSize: "0.72rem",
          fontWeight: activeTab === "map" ? "700" : "500",
          cursor: "pointer",
          flex: 1
        }}
      >
        <Compass size={20} color={activeTab === "map" ? "var(--primary)" : "var(--text-muted)"} />
        <span>Live Map</span>
      </button>

      {/* 5. Admin (Visible if Admin) */}
      {currentUser?.role === "admin" && (
        <button
          onClick={() => setActiveTab("admin")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            background: "none",
            border: "none",
            color: activeTab === "admin" ? "#f59e0b" : "var(--text-muted)",
            fontSize: "0.72rem",
            fontWeight: activeTab === "admin" ? "700" : "500",
            cursor: "pointer",
            flex: 1
          }}
        >
          <Shield size={20} color={activeTab === "admin" ? "#f59e0b" : "var(--text-muted)"} />
          <span>Admin</span>
        </button>
      )}
    </nav>
  );
};
