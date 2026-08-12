import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Lock, AlertCircle } from "lucide-react";

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginGoogle, loginManual, authPromptReason } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showGoogleCustomInput, setShowGoogleCustomInput] = useState(false);
  
  // Custom Google input state
  const [googleName, setGoogleName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");

  // Manual Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmitManual = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    loginManual(email, password);
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    loginGoogle({
      name: googleName.trim() || "Google User",
      email: googleEmail.trim() || "user@gmail.com"
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          maxWidth: "460px",
          width: "100%",
          padding: "24px",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "rgba(18, 24, 36, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)"
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(10, 132, 255, 0.2)",
              color: "#0A84FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff" }}>
                {isSignUp ? "Create Account" : "Welcome to Guff"}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)" }}>
                Sign in to access Live Messaging & Admin Panel
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="apple-btn apple-btn-glass" 
            style={{ width: "32px", height: "32px", padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Prompt Reason Banner if redirected */}
        {authPromptReason && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            fontSize: "0.82rem",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertCircle size={16} />
            {authPromptReason}
          </div>
        )}

        {/* Primary Google Auth Button */}
        <button
          onClick={() => loginGoogle()}
          className="apple-btn apple-btn-glass"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "0.92rem",
            justifyContent: "center",
            marginBottom: "12px"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "6px" }}>
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.39 7.37 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.37 0 3.27 2.61 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          Continue with Google OAuth
        </button>

        {/* Custom Google Account Form Toggle */}
        {!showGoogleCustomInput ? (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <button
              onClick={() => setShowGoogleCustomInput(true)}
              style={{ background: "none", border: "none", color: "#64D2FF", fontSize: "0.78rem", cursor: "pointer" }}
            >
              Sign in with custom Google Name & Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomGoogleSubmit} style={{ background: "rgba(10, 132, 255, 0.1)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid rgba(10, 132, 255, 0.3)", marginBottom: "16px" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64D2FF", marginBottom: "8px" }}>
              Custom Google Account Sign-In
            </div>
            <div className="form-group" style={{ marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="Google Display Name"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="form-input"
                style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: "8px" }}>
              <input
                type="email"
                placeholder="user@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="form-input"
                style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                required
              />
            </div>
            <button type="submit" className="apple-btn apple-btn-primary" style={{ width: "100%", padding: "8px", fontSize: "0.85rem" }}>
              Sign In as Google User
            </button>
          </form>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0" }}>
          <hr style={{ flex: 1, borderColor: "var(--apple-glass-border-dark)" }} />
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)", textTransform: "uppercase" }}>or email login</span>
          <hr style={{ flex: 1, borderColor: "var(--apple-glass-border-dark)" }} />
        </div>

        {/* Manual Email/Password Form */}
        <form onSubmit={handleSubmitManual}>
          {isSignUp && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Rajan Sapkota"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="apple-btn apple-btn-primary" style={{ width: "100%", padding: "12px", marginTop: "8px" }}>
            {isSignUp ? "Create Account & Sign In" : "Sign In with Email"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "14px" }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: "none", border: "none", color: "var(--apple-blue)", fontSize: "0.82rem", cursor: "pointer" }}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Register Now"}
          </button>
        </div>

      </div>
    </div>
  );
};
