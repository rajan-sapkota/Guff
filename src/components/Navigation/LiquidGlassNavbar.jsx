import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  Home, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  User, 
  MapPin, 
  Shield, 
  LogOut,
  LogIn
} from "lucide-react";

export const LiquidGlassNavbar = ({ onOpenCreatePost }) => {
  const { currentUser, activeTab, requireAuthForTab, setIsAuthModalOpen, logout, unreadMessageSenderCount } = useAuth();
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "feed", label: "Feed", icon: Home },
    { id: "search", label: "Explore", icon: Search },
    { id: "chat", label: "Messages", icon: MessageSquare, requiresAuth: true },
    { id: "map", label: "Explore Map", icon: MapPin },
    { id: "profile", label: "Profile", icon: User, requiresAuth: true }
  ];

  if (currentUser && currentUser.role === "admin") {
    navItems.push({ id: "admin", label: "Admin Panel", icon: Shield, requiresAuth: true });
  }

  const activeIndex = Math.max(0, navItems.findIndex(item => item.id === activeTab));

  return (
    <>
      {/* Desktop Floating Left Navigation Rail */}
      <aside className="desktop-only desktop-left-rail" style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "220px",
        padding: "24px 16px",
        borderRadius: "var(--radius-lg)",
        background: "rgba(28, 28, 30, 0.6)",
        backdropFilter: "blur(35px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "var(--shadow-floating)",
        position: "sticky",
        top: "24px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Logo / Brand Header */}
          <div style={{ paddingLeft: "8px" }}>
            <img className="desktop-brand-logo" src="/guff-logo.png" alt="Guff" />
          </div>

          {/* Navigation Items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => requireAuthForTab(item.id)}
                  className={`apple-btn ${isActive ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                  style={{
                    justifyContent: "flex-start",
                    width: "100%",
                    padding: "12px 18px",
                    fontSize: "0.92rem"
                  }}
                >
                  <IconComp size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Create Post Action Button */}
            <button
              onClick={onOpenCreatePost}
              className="apple-btn apple-btn-primary"
              style={{
                marginTop: "16px",
                width: "100%",
                background: "linear-gradient(135deg, #BF5AF2, #FF375F)",
                boxShadow: "0 8px 25px rgba(191, 90, 242, 0.4)"
              }}
            >
              <PlusCircle size={20} />
              <span>New Post</span>
            </button>
          </nav>
        </div>

        {/* User Account / Login Bar at Bottom */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px" }}>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)", textTransform: "capitalize" }}>
                    {currentUser.role}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="apple-btn apple-btn-glass"
                style={{ width: "34px", height: "34px", padding: 0 }}
                title="Log Out"
              >
                <LogOut size={16} color="#FF375F" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="apple-btn apple-btn-glass"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <LogIn size={18} color="#0A84FF" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Apple Liquid Glass Floating Pill Navigation Bar */}
      <nav 
        className="mobile-only liquid-glass-nav-mobile"
        style={{
          gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
          transform: `translateX(-50%) translateY(${Math.min(4, scrollOffset * 0.02)}px) scale(${1 - Math.min(0.02, scrollOffset * 0.0001)})`,
          boxShadow: `0 ${20 + Math.min(10, scrollOffset * 0.05)}px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)`
        }}
      >
        {/* Sliding Liquid Glass Active Indicator Pill */}
        <div 
          className="liquid-active-indicator"
          style={{
            position: "absolute",
            top: "10px",
            left: `calc(${17 - (activeIndex * 24) / navItems.length}px + ${(activeIndex * 100) / navItems.length}%)`,
            width: `calc(${100 / navItems.length}% - ${24 / navItems.length + 10}px)`,
            height: "52px",
            borderRadius: "26px",
            background: "linear-gradient(135deg, rgba(10, 132, 255, 0.35), rgba(100, 210, 255, 0.15))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(10, 132, 255, 0.4)",
            boxShadow: "0 4px 20px rgba(10, 132, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
            transition: "all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
            pointerEvents: "none"
          }}
        />

        {navItems.map((item, index) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => requireAuthForTab(item.id)}
              className={`liquid-tab-btn ${isActive ? "active" : ""}`}
              title={item.label}
              style={{
                zIndex: 2
              }}
            >
              <span style={{ position: "relative", display: "inline-flex" }}>
                <IconComp
                  size={24}
                  style={{
                    transform: isActive ? "scale(1.22)" : "scale(1)",
                    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease",
                    filter: isActive ? "drop-shadow(0 0 8px rgba(10, 132, 255, 0.8))" : "none"
                  }}
                />
                {item.id === "chat" && unreadMessageSenderCount > 0 && (
                  <span className="message-unread-count" aria-label={`${unreadMessageSenderCount} people have unread messages`}>
                    {unreadMessageSenderCount > 99 ? "99+" : unreadMessageSenderCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
