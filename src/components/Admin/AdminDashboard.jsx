import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { firebaseService } from "../../firebase/firebaseService";
import { EditUserModal } from "./EditUserModal";
import { UserProfileModal } from "../Profile/UserProfileModal";
import { 
  Shield, 
  Users, 
  UserCheck, 
  Search, 
  Edit3, 
  Trash2, 
  MessageSquare,
  UserPlus,
  UserCheck2,
  CheckCircle,
  AlertTriangle,
  UserX,
  Eye
} from "lucide-react";

export const AdminDashboard = () => {
  const { currentUser, showToast, setActiveTab, setActiveChannel } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [inspectingUser, setInspectingUser] = useState(null);

  useEffect(() => {
    // Subscribe to Firestore users collection
    const unsub = firebaseService.subscribeUsers((fetchedUsers) => {
      setUsers(fetchedUsers);
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const handleSaveUser = async (updatedUser) => {
    await firebaseService.saveUser(updatedUser);
    showToast(`User ${updatedUser.name} saved successfully`, "success");
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user from the system?")) {
      await firebaseService.deleteUser(userId);
      showToast("User account removed", "info");
    }
  };

  const handleStartPrivateMessage = (user) => {
    if (!currentUser) return;
    const dmChannelId = [currentUser.id, user.id].sort().join("_dm_");
    setActiveChannel(dmChannelId);
    setActiveTab("chat");
    showToast(`Opened private chat thread with ${user.name}`, "info");
  };

  const filteredUsers = users.filter((u) => {
    const matchesQuery = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const activeCount = users.filter(u => u.status === "active").length;
  const suspendedCount = users.filter(u => u.status === "suspended").length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", padding: "24px" }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)"
      }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield color="#FF9F0A" /> Admin Control & User Directory
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary-dark)", marginTop: "2px" }}>
            Inspect system members, manage roles (Admin/User), send private messages, and configure user status
          </p>
        </div>

        <span className="badge badge-admin" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
          <Shield size={14} /> System Administrator
        </span>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="glass-surface" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", display: "flex", justifyContent: "space-between" }}>
            Total Registered Users <Users size={16} color="#0A84FF" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#fff", marginTop: "6px" }}>
            {totalUsers}
          </div>
        </div>

        <div className="glass-surface" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", display: "flex", justifyContent: "space-between" }}>
            System Administrators <Shield size={16} color="#FF9F0A" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#FF9F0A", marginTop: "6px" }}>
            {adminCount}
          </div>
        </div>

        <div className="glass-surface" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", display: "flex", justifyContent: "space-between" }}>
            Active Accounts <UserCheck size={16} color="#30D158" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#30D158", marginTop: "6px" }}>
            {activeCount}
          </div>
        </div>

        <div className="glass-surface" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)", display: "flex", justifyContent: "space-between" }}>
            Suspended Accounts <UserX size={16} color="#FF375F" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#FF375F", marginTop: "6px" }}>
            {suspendedCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} color="var(--text-secondary-dark)" style={{ position: "absolute", left: "16px", top: "15px" }} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "42px", height: "46px", borderRadius: "var(--radius-pill)" }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-input"
          style={{ width: "160px", height: "46px", borderRadius: "var(--radius-pill)" }}
        >
          <option value="all">All Roles</option>
          <option value="user">Users Only</option>
          <option value="admin">Admins Only</option>
        </select>
      </div>

      {/* Horizontally Scrollable Table Wrapper so NO options/buttons are hidden */}
      <div className="glass-surface" style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ width: "100%", minWidth: "850px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "rgba(255, 255, 255, 0.04)", borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
              <th style={{ padding: "14px 18px", color: "var(--text-secondary-dark)", fontWeight: "600" }}>User Profile</th>
              <th style={{ padding: "14px 18px", color: "var(--text-secondary-dark)", fontWeight: "600" }}>Email</th>
              <th style={{ padding: "14px 18px", color: "var(--text-secondary-dark)", fontWeight: "600" }}>Role</th>
              <th style={{ padding: "14px 18px", color: "var(--text-secondary-dark)", fontWeight: "600" }}>Status</th>
              <th style={{ padding: "14px 18px", color: "var(--text-secondary-dark)", fontWeight: "600", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <td style={{ padding: "14px 18px" }}>
                  <div 
                    onClick={() => setInspectingUser(u)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
                    title="Click to view full profile card & message"
                  >
                    <img
                      src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt={u.name}
                      style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontWeight: "700", color: "#fff" }}>{u.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>{u.bio || "Active member"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px", color: "var(--text-secondary-dark)" }}>
                  {u.email}
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span className={`badge ${u.role === 'admin' ? 'badge-admin' : ''}`} style={{
                    background: u.role === 'admin' ? "rgba(255, 159, 10, 0.2)" : "rgba(10, 132, 255, 0.15)",
                    color: u.role === 'admin' ? "#FF9F0A" : "#0A84FF"
                  }}>
                    {u.role ? u.role.toUpperCase() : "USER"}
                  </span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span className="badge" style={{
                    background: u.status === 'active' ? "rgba(48, 209, 88, 0.18)" : "rgba(255, 55, 95, 0.18)",
                    color: u.status === 'active' ? "#30D158" : "#FF375F"
                  }}>
                    {u.status ? u.status.toUpperCase() : "ACTIVE"}
                  </span>
                </td>
                <td style={{ padding: "14px 18px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      onClick={() => setInspectingUser(u)}
                      className="apple-btn apple-btn-glass"
                      title="View Profile Card"
                      style={{ width: "36px", height: "36px", padding: 0 }}
                    >
                      <Eye size={16} color="#64D2FF" />
                    </button>
                    <button
                      onClick={() => handleStartPrivateMessage(u)}
                      className="apple-btn apple-btn-glass"
                      title="Send Private Message"
                      style={{ width: "36px", height: "36px", padding: 0 }}
                    >
                      <MessageSquare size={16} color="#0A84FF" />
                    </button>
                    <button
                      onClick={() => setEditingUser(u)}
                      className="apple-btn apple-btn-glass"
                      title="Edit Profile & Role"
                      style={{ width: "36px", height: "36px", padding: 0 }}
                    >
                      <Edit3 size={16} color="#FF9F0A" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="apple-btn apple-btn-glass"
                      title="Delete User Account"
                      style={{ width: "36px", height: "36px", padding: 0, color: "#FF375F" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditUserModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
      />

      <UserProfileModal
        isOpen={Boolean(inspectingUser)}
        onClose={() => setInspectingUser(null)}
        user={inspectingUser}
      />
    </div>
  );
};
