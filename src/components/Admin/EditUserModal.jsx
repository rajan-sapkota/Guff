import React, { useState, useEffect } from "react";
import { X, Shield, User, Mail, Check, Trash2 } from "lucide-react";

export const EditUserModal = ({ isOpen, onClose, user, onSave, onDelete }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("active");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "user");
      setStatus(user.status || "active");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...user,
      name: name.trim(),
      email: email.trim(),
      role,
      status,
      bio: bio.trim(),
      avatar: avatar.trim()
    });
    onClose();
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
          borderRadius: "var(--radius-lg)",
          background: "rgba(18, 24, 36, 0.95)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.15)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={20} color="#FF9F0A" /> Edit User Profile & Permissions
          </h3>
          <button onClick={onClose} className="apple-btn apple-btn-glass" style={{ width: "32px", height: "32px", padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label>System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bio / Description</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="form-input"
              placeholder="User bio..."
            />
          </div>

          <div className="form-group">
            <label>Profile Avatar Photo URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="form-input"
              placeholder="https://..."
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => {
                onDelete(user.id);
                onClose();
              }}
              className="apple-btn apple-btn-glass"
              style={{ color: "#FF375F", padding: "10px 18px" }}
            >
              <Trash2 size={16} /> Delete User
            </button>

            <button
              type="submit"
              className="apple-btn apple-btn-primary"
              style={{ padding: "10px 24px" }}
            >
              <Check size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
