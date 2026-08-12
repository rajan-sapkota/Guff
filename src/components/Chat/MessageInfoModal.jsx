import React from "react";
import { X, CheckCheck, Clock, Heart, Smile, Info, FileText } from "lucide-react";

export const MessageInfoModal = ({ isOpen, onClose, message, reactions = [] }) => {
  if (!isOpen || !message) return null;

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Tally reactions
  const reactionCounts = reactions.reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "420px",
          width: "100%",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          background: "rgba(18, 24, 36, 0.95)",
          backdropFilter: "blur(35px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Info size={20} color="#0A84FF" /> Message Info
          </h3>
          <button onClick={onClose} className="apple-btn apple-btn-glass" style={{ width: "32px", height: "32px", padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Message Bubble Preview */}
        <div style={{
          padding: "14px 18px",
          borderRadius: "18px",
          background: "linear-gradient(135deg, #0A84FF, #64D2FF)",
          color: "#fff",
          fontSize: "0.95rem",
          marginBottom: "20px",
          wordBreak: "break-word"
        }}>
          {message.text || (message.media ? "[Attached Image]" : "[Attached File]")}
        </div>

        {/* Message Delivery & Read Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCheck size={16} color="var(--text-secondary-dark)" /> Delivered
            </span>
            <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff" }}>
              {formattedTime}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCheck size={16} color="#0A84FF" /> Read
            </span>
            <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#0A84FF" }}>
              {formattedTime}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} color="#FF9F0A" /> Edited
            </span>
            <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff" }}>
              No
            </span>
          </div>
        </div>

        {/* Reactions Breakdown */}
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "14px", borderRadius: "16px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary-dark)", textTransform: "uppercase", marginBottom: "8px" }}>
            Reactions
          </div>
          {Object.keys(reactionCounts).length > 0 ? (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <span key={emoji} className="badge" style={{ background: "rgba(255,255,255,0.1)", fontSize: "0.9rem", color: "#fff" }}>
                  {emoji} x{count}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary-dark)" }}>No reactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
};
