import React from "react";
import { MapPin, Navigation, Star, Store, Utensils } from "lucide-react";

export const LocationCard = ({ location, onSelectLocation }) => {
  if (!location) return null;

  const isFood = location.category?.toLowerCase().includes("restaurant") || location.category?.toLowerCase().includes("cafe");

  return (
    <div 
      className="glass-card" 
      style={{
        marginTop: "8px",
        padding: "12px",
        borderRadius: "var(--radius-md)",
        background: "rgba(18, 24, 36, 0.9)",
        border: "1px solid var(--border-glow)",
        maxWidth: "360px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: isFood ? "rgba(245, 158, 11, 0.2)" : "rgba(6, 182, 212, 0.2)",
            color: isFood ? "#f59e0b" : "#06b6d4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {isFood ? <Utensils size={16} /> : <Store size={16} />}
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#fff" }}>
              {location.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>{location.category || "Shop & Place"}</span>
              {location.rating && (
                <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "2px", fontWeight: "600" }}>
                  <Star size={11} fill="#f59e0b" /> {location.rating}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="badge" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc" }}>
          <MapPin size={10} /> Pin
        </span>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
        <Navigation size={12} color="var(--accent-cyan)" />
        {location.address || location.city || `Lat: ${location.lat?.toFixed(4)}, Lng: ${location.lng?.toFixed(4)}`}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        {onSelectLocation && (
          <button 
            onClick={() => onSelectLocation(location)}
            className="btn btn-primary"
            style={{ flex: 1, padding: "6px 10px", fontSize: "0.78rem" }}
          >
            <MapPin size={12} /> View Live Map
          </button>
        )}
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${location.lat || 0},${location.lng || 0}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ padding: "6px 10px", fontSize: "0.78rem", textDecoration: "none" }}
        >
          <Navigation size={12} /> Directions
        </a>
      </div>
    </div>
  );
};
