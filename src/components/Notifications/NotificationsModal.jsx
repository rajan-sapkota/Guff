import React from "react";
import { useAuth } from "../../context/AuthContext";
import { firebaseService } from "../../firebase/firebaseService";
import { X, Bell, Heart, MessageSquare, UserPlus, MessageCircle, Flame, Users, Sparkles, CheckCheck } from "lucide-react";

export const NotificationsModal = ({ isOpen, onClose, onNavigateToTab }) => {
  const { notifications, unreadNotificationCount, currentUser } = useAuth();

  if (!isOpen) return null;

  const handleMarkAsRead = async (notifId) => {
    await firebaseService.markNotificationAsRead(notifId);
  };

  const handleMarkAllAsRead = async () => {
    await firebaseService.markAllNotificationsAsRead(currentUser?.id);
  };

  const getNotifIconAndColor = (type) => {
    switch (type) {
      case "like": return { icon: Heart, color: "#FF375F", label: "liked your post" };
      case "comment": return { icon: MessageCircle, color: "#0A84FF", label: "commented on your post" };
      case "follow": return { icon: UserPlus, color: "#30D158", label: "started following you" };
      case "direct_message": return { icon: MessageSquare, color: "#BF5AF2", label: "sent you a direct message" };
      case "share": return { icon: Flame, color: "#64D2FF", label: "shared your post" };
      default: return { icon: Sparkles, color: "#FF9F0A", label: "interacted with you" };
    }
  };

  // Group real database notifications dynamically into Today, Yesterday, Last Week
  const now = new Date();
  const todayNotifs = [];
  const yesterdayNotifs = [];
  const olderNotifs = [];

  notifications.forEach((n) => {
    const created = new Date(n.createdAt);
    const diffHours = (now - created) / (1000 * 60 * 60);

    if (diffHours < 24) {
      todayNotifs.push(n);
    } else if (diffHours < 48) {
      yesterdayNotifs.push(n);
    } else {
      olderNotifs.push(n);
    }
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "460px",
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius-lg)",
          background: "rgba(18, 24, 36, 0.95)",
          backdropFilter: "blur(35px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Bell size={20} color="#0A84FF" />
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff" }}>
                Real-Time Activity
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
                {unreadNotificationCount > 0 ? `${unreadNotificationCount} unread database updates` : "All notifications read"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {unreadNotificationCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="apple-btn apple-btn-glass"
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="apple-btn apple-btn-glass" style={{ width: "32px", height: "32px", padding: 0 }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Database Notifications List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary-dark)" }}>
              <Bell size={40} color="#0A84FF" style={{ opacity: 0.4, marginBottom: "12px" }} />
              <h4 style={{ color: "#fff" }}>No real notifications yet</h4>
              <p style={{ fontSize: "0.82rem", marginTop: "4px" }}>
                When members send messages, like posts, comment, or follow you, updates will appear here in real-time!
              </p>
            </div>
          ) : (
            <>
              {/* Today Section */}
              {todayNotifs.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: "800", textTransform: "uppercase", color: "#0A84FF", letterSpacing: "0.05em", marginBottom: "12px" }}>
                    Today
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {todayNotifs.map((n) => {
                      const { icon: IconComp, color, label } = getNotifIconAndColor(n.notificationType);
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className="glass-surface"
                          style={{
                            padding: "14px 16px",
                            borderRadius: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            background: !n.read ? "rgba(10, 132, 255, 0.14)" : "rgba(255, 255, 255, 0.05)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img 
                              src={n.actorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                              alt={n.actorName} 
                              style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                            />
                            <div>
                              <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff" }}>
                                {n.actorName} <span style={{ fontWeight: "400", color: "var(--text-secondary-dark)" }}>{label}</span>
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", marginTop: "2px" }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          {!n.read && (
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0A84FF" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Yesterday Section */}
              {yesterdayNotifs.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-secondary-dark)", letterSpacing: "0.05em", marginBottom: "12px" }}>
                    Yesterday
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {yesterdayNotifs.map((n) => {
                      const { icon: IconComp, color, label } = getNotifIconAndColor(n.notificationType);
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className="glass-surface"
                          style={{
                            padding: "14px 16px",
                            borderRadius: "18px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            background: "rgba(255, 255, 255, 0.04)"
                          }}
                        >
                          <img 
                            src={n.actorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                            alt={n.actorName} 
                            style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff" }}>
                              {n.actorName} <span style={{ fontWeight: "400", color: "var(--text-secondary-dark)" }}>{label}</span>
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", marginTop: "2px" }}>
                              Yesterday
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Older Section */}
              {olderNotifs.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-secondary-dark)", letterSpacing: "0.05em", marginBottom: "12px" }}>
                    Older Notifications
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {olderNotifs.map((n) => {
                      const { icon: IconComp, color, label } = getNotifIconAndColor(n.notificationType);
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className="glass-surface"
                          style={{
                            padding: "14px 16px",
                            borderRadius: "18px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            background: "rgba(255, 255, 255, 0.04)"
                          }}
                        >
                          <img 
                            src={n.actorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                            alt={n.actorName} 
                            style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff" }}>
                              {n.actorName} <span style={{ fontWeight: "400", color: "var(--text-secondary-dark)" }}>{label}</span>
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", marginTop: "2px" }}>
                              {new Date(n.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
