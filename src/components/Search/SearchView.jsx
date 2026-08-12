import React, { useState } from "react";
import { Search, Flame, Users, Hash, MapPin, Sparkles, TrendingUp } from "lucide-react";

export const SearchView = ({ onSelectLocation }) => {
  const [query, setQuery] = useState("");

  const categories = ["All", "People", "Places", "Hashtags", "Food & Cafes", "Communities"];
  const [activeCategory, setActiveCategory] = useState("All");

  const trendingHashtags = [
    { tag: "#HimalayanBistro", category: "Restaurants • 14.2K posts" },
    { tag: "#TokyoMatcha", category: "Cafes • 8.9K posts" },
    { tag: "#LiquidGlassUI", category: "Design • 24.5K posts" },
    { tag: "#NYCStreetFood", category: "Foodie • 31.1K posts" }
  ];

  const suggestedPeople = [
    { name: "Rajan Sapkota", handle: "@rajan", role: "Software Architect", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { name: "Ayesha Sharma", handle: "@ayesha", role: "Coffee & Food Reviewer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    { name: "Priya Patel", handle: "@priya", role: "Digital Creator", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" }
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", padding: "20px" }}>
      {/* Search Input Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ position: "relative" }}>
          <Search size={20} color="var(--text-secondary-dark)" style={{ position: "absolute", left: "18px", top: "16px" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, trending posts, cafes, map pins..."
            className="form-input"
            style={{
              paddingLeft: "48px",
              height: "52px",
              borderRadius: "var(--radius-pill)",
              fontSize: "1rem",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)"
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`apple-btn ${activeCategory === cat ? 'apple-btn-primary' : 'apple-btn-glass'}`}
            style={{ padding: "8px 16px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section 1: Trending Hashtags */}
      <div className="glass-surface" style={{ padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <TrendingUp size={20} color="#0A84FF" /> Trending Hashtags
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          {trendingHashtags.map((h, i) => (
            <div key={i} style={{ background: "rgba(255, 255, 255, 0.04)", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                <Hash size={16} color="#0A84FF" /> {h.tag.replace("#", "")}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginTop: "4px" }}>
                {h.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Suggested People */}
      <div className="glass-surface" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <Users size={20} color="#BF5AF2" /> Suggested People
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {suggestedPeople.map((p, i) => (
            <div key={i} className="suggested-person-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src={p.avatar} alt={p.name} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#fff" }}>{p.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)" }}>{p.handle} • {p.role}</div>
                </div>
              </div>
              <button className="apple-btn apple-btn-glass" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
