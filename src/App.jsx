import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header } from "./components/Header";
import { LiquidGlassNavbar } from "./components/Navigation/LiquidGlassNavbar";
import { RightPanel } from "./components/RightPanel/RightPanel";
import { ChatWindow } from "./components/Chat/ChatWindow";
import { FeedView } from "./components/Feed/FeedView";
import { SearchView } from "./components/Search/SearchView";
import { ProfileView } from "./components/Profile/ProfileView";
import { AdminDashboard } from "./components/Admin/AdminDashboard";
import { LiveMapModal } from "./components/Map/LiveMapModal";
import { CameraModal } from "./components/Camera/CameraModal";
import { CreatePostModal } from "./components/Feed/CreatePostModal";
import { AuthModal } from "./components/AuthModal";
import { AudioCallOverlay } from "./components/Chat/AudioCallOverlay";
import { firebaseService } from "./firebase/firebaseService";
import { useAudioCall } from "./hooks/useAudioCall";

const AppContent = () => {
  const { currentUser, activeTab, isAuthModalOpen, setIsAuthModalOpen, showToast } = useAuth();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [pendingMedia, setPendingMedia] = useState(null);
  const [pendingLocation, setPendingLocation] = useState(null);
  const audioCall = useAudioCall(currentUser, showToast);

  const handleCameraCapture = (imageDataUrl) => {
    setPendingMedia(imageDataUrl);
    showToast("Camera snap attached!", "success");
  };

  const handleSelectLocationPin = (locationObj) => {
    setPendingLocation(locationObj);
    showToast(`Location "${locationObj.name}" attached!`, "success");
  };

  const handleCreatePost = (postData) => {
    if (!currentUser) {
      showToast("Please sign in to publish a post", "error");
      setIsAuthModalOpen(true);
      return;
    }

    firebaseService.addFeedPost({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      ...postData
    });

    showToast("Feed post published!", "success");
  };

  return (
    <div className="app-viewport">
      <Header />

      <div className="desktop-app-grid">
        {/* Left Navigation Rail (Desktop) / Floating Pill (Mobile) */}
        <LiquidGlassNavbar 
          onOpenCreatePost={() => setIsCreateOpen(true)}
        />

        {/* Center Main View Container with Native iOS Spring Screen Transitions */}
        <main style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          height: "100%", 
          minHeight: 0,
          position: "relative", 
          overflow: "hidden",
          borderRadius: "var(--radius-lg)"
        }}>
          <div key={activeTab} className="ios-page-transition">
            {activeTab === "feed" && (
              <FeedView
                onOpenCamera={() => setIsCameraOpen(true)}
                onOpenMap={() => setIsMapOpen(true)}
                onSelectLocation={(loc) => {
                  setPendingLocation(loc);
                  setIsMapOpen(true);
                }}
                pendingMedia={pendingMedia}
                setPendingMedia={setPendingMedia}
                pendingLocation={pendingLocation}
                setPendingLocation={setPendingLocation}
              />
            )}

            {activeTab === "search" && (
              <SearchView 
                onSelectLocation={(loc) => {
                  setPendingLocation(loc);
                  setIsMapOpen(true);
                }}
              />
            )}

            {activeTab === "chat" && (
              <ChatWindow
                onStartAudioCall={audioCall.startAudioCall}
                onOpenCamera={() => setIsCameraOpen(true)}
                onOpenMap={() => setIsMapOpen(true)}
                onSelectLocation={(loc) => {
                  setPendingLocation(loc);
                  setIsMapOpen(true);
                }}
                pendingMedia={pendingMedia}
                setPendingMedia={setPendingMedia}
                pendingLocation={pendingLocation}
                setPendingLocation={setPendingLocation}
              />
            )}

            {activeTab === "profile" && (
              <ProfileView />
            )}

            {activeTab === "map" && (
              <div style={{ flex: 1, height: "100%", padding: "16px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#fff" }}>Live Map Explorer</h2>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}>
                      Tap below to search & pin global restaurants & shops
                    </p>
                  </div>
                  <button onClick={() => setIsMapOpen(true)} className="apple-btn apple-btn-primary">
                    Launch Map
                  </button>
                </div>
                <div 
                  onClick={() => setIsMapOpen(true)}
                  className="glass-surface" 
                  style={{ flex: 1, borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at center, rgba(10,132,255,0.15), rgba(18,24,36,0.9))" }}
                >
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(236,72,153,0.2)", color: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: "1.6rem" }}>
                      🗺️
                    </div>
                    <h3 style={{ color: "#fff", fontSize: "1.2rem" }}>Open Global Live Map</h3>
                    <p style={{ color: "var(--text-secondary-dark)", fontSize: "0.8rem", marginTop: "4px" }}>
                      Kathmandu, New York, Tokyo, London, Dubai & worldwide search
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "admin" && (
              <AdminDashboard />
            )}
          </div>
        </main>

        {/* Right Sidebar (Desktop) */}
        <RightPanel 
          onSelectLocation={(loc) => {
            setPendingLocation(loc);
            setIsMapOpen(true);
          }}
        />
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <AudioCallOverlay
        call={audioCall.call}
        remoteStream={audioCall.remoteStream}
        isMuted={audioCall.isMuted}
        onAccept={audioCall.acceptAudioCall}
        onDecline={audioCall.endAudioCall}
        onEnd={audioCall.endAudioCall}
        onToggleMute={audioCall.toggleMute}
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <LiveMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={handleSelectLocationPin}
        initialLocation={pendingLocation}
      />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePost}
        onOpenCamera={() => setIsCameraOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        pendingMedia={pendingMedia}
        setPendingMedia={setPendingMedia}
        pendingLocation={pendingLocation}
        setPendingLocation={setPendingLocation}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
