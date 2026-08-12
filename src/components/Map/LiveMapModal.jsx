import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, Search, Utensils, Store, Check, Navigation, Globe, Star } from "lucide-react";
import L from "leaflet";

const POPULAR_SPOTS = [
  {
    id: "spot_1",
    name: "Himalayan Spice Bistro",
    category: "Restaurant",
    city: "Kathmandu",
    address: "Thamel Marg, Kathmandu 44600",
    lat: 27.7172,
    lng: 85.3240,
    rating: 4.9,
    desc: "Famous authentic Momo & Nepalese cuisine"
  },
  {
    id: "spot_2",
    name: "Katz's Delicatessen",
    category: "Restaurant",
    city: "New York",
    address: "205 E Houston St, New York, NY",
    lat: 40.7222,
    lng: -73.9874,
    rating: 4.8,
    desc: "Iconic NYC deli pastrami sandwiches"
  },
  {
    id: "spot_3",
    name: "Tsuta Ramen Tokyo",
    category: "Restaurant",
    city: "Tokyo",
    address: "Shibuya, Tokyo, Japan",
    lat: 35.6620,
    lng: 139.7038,
    rating: 4.9,
    desc: "Michelin-starred truffle shoyu ramen"
  },
  {
    id: "spot_4",
    name: "Borough Market Artisans",
    category: "Shop",
    city: "London",
    address: "London Bridge, London SE1 1TL",
    lat: 51.5055,
    lng: -0.0910,
    rating: 4.7,
    desc: "World famous gourmet food & cheese market"
  },
  {
    id: "spot_5",
    name: "Al Mallah Shawarma",
    category: "Restaurant",
    city: "Dubai",
    address: "2nd Dec St, Al Satwa, Dubai",
    lat: 25.2312,
    lng: 55.2655,
    rating: 4.8,
    desc: "Legendary authentic Middle Eastern street food"
  }
];

export const LiveMapModal = ({ isOpen, onClose, onSelectLocation, initialLocation }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpot, setSelectedSpot] = useState(initialLocation || POPULAR_SPOTS[0]);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Restaurant");

  useEffect(() => {
    if (!isOpen) return;

    // Give DOM time to render canvas
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstance.current) {
        const initialLat = selectedSpot ? selectedSpot.lat : 27.7172;
        const initialLng = selectedSpot ? selectedSpot.lng : 85.3240;

        const map = L.map(mapRef.current).setView([initialLat, initialLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mapInstance.current = map;

        // Click map handler to drop custom pin
        map.on("click", (e) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;

          const newCustomSpot = {
            id: "custom_" + Date.now(),
            name: customName || "Custom Pinned Spot",
            category: customCategory,
            lat: lat,
            lng: lng,
            address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
            rating: 5.0
          };

          setSelectedSpot(newCustomSpot);
        });
      }

      // Update map view and markers when selected spot changes
      if (mapInstance.current) {
        // Clear existing markers
        markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
        markersRef.current = [];

        POPULAR_SPOTS.forEach(spot => {
          const marker = L.marker([spot.lat, spot.lng]).addTo(mapInstance.current);
          marker.bindPopup(`<b>${spot.name}</b><br/>${spot.category} • ${spot.city}`);
          marker.on("click", () => setSelectedSpot(spot));
          markersRef.current.push(marker);
        });

        if (selectedSpot) {
          mapInstance.current.flyTo([selectedSpot.lat, selectedSpot.lng], 14, { duration: 1.2 });
          const selectedMarker = L.marker([selectedSpot.lat, selectedSpot.lng]).addTo(mapInstance.current);
          selectedMarker.bindPopup(`<b>${selectedSpot.name}</b><br/>Pinned Location`).openPopup();
          markersRef.current.push(selectedMarker);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, selectedSpot]);

  if (!isOpen) return null;

  const handleConfirmPin = () => {
    if (!selectedSpot) return;
    const finalLocation = {
      ...selectedSpot,
      name: customName || selectedSpot.name,
      category: customCategory || selectedSpot.category
    };
    onSelectLocation(finalLocation);
    onClose();
  };

  const filteredSpots = POPULAR_SPOTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content map-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "940px", width: "95vw", height: "85vh", display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
        
        {/* Header */}
        <div className="map-modal-header" style={{
          padding: "16px 24px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(236, 72, 153, 0.2)",
              color: "#ec4899",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Globe size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", color: "#fff" }}>Global Live Map & Place Sharing</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Discover, pin, and share restaurants & shops anywhere in the world
              </p>
            </div>
          </div>

          <button onClick={onClose} className="apple-btn apple-btn-glass map-modal-close" aria-label="Close map">
            <X size={18} />
          </button>
        </div>

        {/* Map Body Layout */}
        <div className="map-modal-body" style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          
          {/* Left Discovery Sidebar */}
          <div className="map-search-panel" style={{ width: "320px", borderRight: "1px solid var(--border-color)", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
            <div className="map-search-box" style={{ padding: "12px" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
                <input
                  type="text"
                  placeholder="Search city, restaurant, shop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "36px", fontSize: "0.85rem" }}
                />
              </div>
            </div>

            <div className="map-results" style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="map-results-label" style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-dark)", margin: "4px 0" }}>
                Popular World Spots
              </div>

              {filteredSpots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    onClick={() => {
                      setSelectedSpot(spot);
                      setCustomName(spot.name);
                    }}
                    className={`map-spot-card ${isSelected ? "is-selected" : ""}`}
                    style={{
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      background: isSelected ? "rgba(99, 102, 241, 0.18)" : "var(--bg-secondary)",
                      border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "0.88rem", color: isSelected ? "#fff" : "#e2e8f0" }}>
                      {spot.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                      <span>{spot.category} • {spot.city}</span>
                      <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "2px" }}>
                        <Star size={10} fill="#f59e0b" /> {spot.rating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Location Inputs */}
            <div className="map-pin-details" style={{ padding: "12px", borderTop: "1px solid var(--border-color)", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                Pin Details
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Spot/Shop Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="form-input"
                  style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                />
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="form-input"
                  style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                >
                  <option value="Restaurant">Restaurant / Bistro</option>
                  <option value="Cafe">Cafe & Bakery</option>
                  <option value="Shop">Retail Shop & Boutique</option>
                  <option value="Market">Street Market</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Map Canvas */}
          <div className="map-canvas" style={{ flex: 1, position: "relative" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {/* Float Footer Banner */}
            {selectedSpot && (
              <div className="map-selected-spot" style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                right: "20px",
                zIndex: 1000,
                background: "rgba(18, 24, 36, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--border-glow)",
                borderRadius: "var(--radius-lg)",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
              }}>
                <div className="map-selected-copy">
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "#fff" }}>
                    {customName || selectedSpot.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {selectedSpot.address || `Lat: ${selectedSpot.lat?.toFixed(4)}, Lng: ${selectedSpot.lng?.toFixed(4)}`}
                  </div>
                </div>

                <button onClick={handleConfirmPin} className="apple-btn apple-btn-primary map-attach-button" style={{ padding: "10px 18px" }}>
                  <Check size={16} /> Attach Location Pin
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
