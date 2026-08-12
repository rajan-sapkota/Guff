import React, { useState } from "react";
import { X, Database, Save, CheckCircle2, AlertCircle, RefreshCw, Key, Server } from "lucide-react";
import { firebaseConfig } from "../firebase/firebaseConfig";
import { firebaseService } from "../firebase/firebaseService";

export const FirebaseSetupModal = ({ isOpen, onClose, onConnected }) => {
  const [apiKey, setApiKey] = useState(firebaseConfig.apiKey || "");
  const [authDomain, setAuthDomain] = useState(firebaseConfig.authDomain || "");
  const [projectId, setProjectId] = useState(firebaseConfig.projectId || "");
  const [storageBucket, setStorageBucket] = useState(firebaseConfig.storageBucket || "");
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig.messagingSenderId || "");
  const [appId, setAppId] = useState(firebaseConfig.appId || "");
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const newConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    localStorage.setItem("guff_firebase_config", JSON.stringify(newConfig));
    setStatusMsg({ type: "success", text: "Saved credentials. Reloading to connect to Cloud Firestore..." });
    if (onConnected) onConnected();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleReset = () => {
    localStorage.removeItem("guff_firebase_config");
    setStatusMsg({ type: "info", text: "Cleared custom keys. Resetting..." });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", padding: "28px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.2)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", color: "#fff" }}>Firebase Database Credentials</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Project ID: <span style={{ color: "#f59e0b", fontWeight: "600" }}>{firebaseConfig.projectId || "guff-app-74476"}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <X size={18} />
          </button>
        </div>

        {statusMsg && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: statusMsg.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(99, 102, 241, 0.15)",
            border: `1px solid ${statusMsg.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(99, 102, 241, 0.3)"}`,
            color: statusMsg.type === "success" ? "#34d399" : "#a5b4fc",
            fontSize: "0.85rem",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle2 size={16} />
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveConfig}>
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Key size={14} color="var(--primary)" /> API Key (apiKey)
            </label>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Server size={14} color="var(--accent-cyan)" /> Project ID (projectId)
              </label>
              <input
                type="text"
                placeholder="guff-app-74476"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Auth Domain</label>
              <input
                type="text"
                placeholder="guff-app-74476.firebaseapp.com"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label>Storage Bucket</label>
              <input
                type="text"
                placeholder="guff-app-74476.firebasestorage.app"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Messaging Sender ID</label>
              <input
                type="text"
                placeholder="109823749182"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>App ID (appId)</label>
            <input
              type="text"
              placeholder="1:109823749182:web:a897b2198cf7"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
            <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
              <RefreshCw size={14} /> Reset Saved Keys
            </button>

            <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>
              <Save size={16} /> Save & Connect Cloud Database
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
