import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Bell
} from "lucide-react";
import { NotificationsModal } from "./Notifications/NotificationsModal";

export const Header = () => {
  const { 
    currentUser, 
    setIsAuthModalOpen, 
    logout, 
    toastMessage,
    setActiveTab,
    unreadNotificationCount
  } = useAuth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="glass-panel app-header" style={{
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: "1px solid var(--apple-glass-border-dark)",
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div 
        onClick={() => setActiveTab("feed")}
        className="app-header-brand"
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
      >
        <img className="app-brand-logo" src="/guff-logo.png" alt="Guff" />
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="app-header-toast" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 14px",
          borderRadius: "9999px",
          background: toastMessage.type === "error" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)",
          border: `1px solid ${toastMessage.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
          color: toastMessage.type === "error" ? "#f87171" : "#34d399",
          fontSize: "0.82rem",
          fontWeight: "500",
          animation: "fadeIn 0.2s ease"
        }}>
          {toastMessage.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          {toastMessage.msg}
        </div>
      )}

      {/* User actions */}
      <div className="app-header-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Notifications are available only to signed-in users. */}
        {currentUser && (
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="apple-btn apple-btn-glass"
            style={{ width: "36px", height: "36px", padding: 0, position: "relative" }}
            title="Real-Time Notifications & Activity"
          >
            <Bell size={17} color="#0A84FF" />
            {unreadNotificationCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                minWidth: "16px",
                height: "16px",
                borderRadius: "8px",
                background: "#FF375F",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #000",
                padding: "0 4px"
              }}>
                {unreadNotificationCount}
              </span>
            )}
          </button>
        )}

        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div 
              onClick={() => setActiveTab("profile")}
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "2px solid #0A84FF" }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#fff" }} className="desktop-only">
                {currentUser.name}
              </span>
            </div>

            <button 
              onClick={logout} 
              className="apple-btn apple-btn-glass" 
              title="Sign out"
              style={{ width: "34px", height: "34px", padding: 0 }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsAuthModalOpen(true)} className="apple-btn apple-btn-primary header-sign-in" style={{ padding: "6px 10px", fontSize: "0.78rem", minHeight: "36px", gap: "6px" }}>
            <User size={14} /> Sign In
          </button>
        )}
      </div>

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToTab={setActiveTab}
      />
    </header>
  );
};
