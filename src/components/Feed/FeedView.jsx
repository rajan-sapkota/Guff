import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { firebaseService } from "../../firebase/firebaseService";
import { LocationCard } from "../Chat/LocationCard";
import { CreatePostModal } from "./CreatePostModal";
import { UserProfileModal } from "../Profile/UserProfileModal";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Trash2, 
  MapPin, 
  Camera, 
  Send,
  Rss,
  Paperclip,
  FileText
} from "lucide-react";

export const FeedView = ({ onOpenCamera, onOpenMap, onSelectLocation, pendingMedia, setPendingMedia, pendingLocation, setPendingLocation }) => {
  const { currentUser, showToast, setIsAuthModalOpen } = useAuth();
  const [feeds, setFeeds] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [popLikedPostId, setPopLikedPostId] = useState(null);
  const [bounceSharePostId, setBounceSharePostId] = useState(null);
  const [inspectingUser, setInspectingUser] = useState(null);

  useEffect(() => {
    // Real-time Firestore subscription for social feeds
    const unsub = firebaseService.subscribeFeeds((fetchedFeeds) => {
      setFeeds(fetchedFeeds);
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const handleLike = async (item) => {
    if (!currentUser) {
      showToast("Please login to like posts", "error");
      setIsAuthModalOpen(true);
      return;
    }
    setPopLikedPostId(item.id);
    setTimeout(() => setPopLikedPostId(null), 400);

    await firebaseService.likeFeedPost(item.id, item.likes || 0, currentUser);
  };

  const handleShare = async (item) => {
    setBounceSharePostId(item.id);
    setTimeout(() => setBounceSharePostId(null), 400);

    if (currentUser && item.userId && item.userId !== currentUser.id) {
      await firebaseService.addNotification({
        userId: item.userId,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorAvatar: currentUser.avatar,
        notificationType: "share",
        targetId: item.id,
        targetType: "post",
        metadata: { text: item.content?.substring(0, 30) }
      });
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Post link copied to clipboard! 🔗", "success");
    } else {
      showToast("Post shared!", "info");
    }
  };

  const handleAddComment = async (item) => {
    if (!currentUser) {
      showToast("Please login to comment", "error");
      setIsAuthModalOpen(true);
      return;
    }
    if (!commentText.trim()) return;

    await firebaseService.addCommentToFeed(item.id, {
      userName: currentUser.name,
      text: commentText.trim()
    }, item.comments || [], currentUser);

    setCommentText("");
  };

  const handleDeletePost = async (feedId) => {
    if (confirm("Are you sure you want to delete this feed post?")) {
      await firebaseService.deleteFeedPost(feedId);
      showToast("Feed post removed", "info");
    }
  };

  const handleCreatePost = async (postData) => {
    if (!currentUser) {
      showToast("Please login to create a post", "error");
      setIsAuthModalOpen(true);
      return;
    }

    await firebaseService.addFeedPost({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      ...postData
    });

    showToast("Feed post published!", "success");
  };

  return (
    <div className="feed-view" style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", padding: "24px 32px" }}>
      {/* Feed Title & Post Trigger Header */}
      <div className="feed-title-bar" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.12)"
      }}>
        <div className="feed-title-copy">
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
            <Rss color="#0A84FF" size={26} /> Social Guff Feed
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", marginTop: "4px" }}>
            Discover camera snaps, restaurant recommendations, and global community posts
          </p>
        </div>

        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="apple-btn apple-btn-primary feed-create-button"
          style={{ padding: "12px 24px" }}
        >
          <Plus size={20} /> New Feed Post
        </button>
      </div>

      {/* Feed List */}
      <div style={{ maxWidth: "780px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
        {feeds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary-dark)" }}>
            <Rss size={44} color="#0A84FF" style={{ opacity: 0.5, marginBottom: "12px" }} />
            <h3 style={{ color: "#fff" }}>No feed posts yet</h3>
            <p style={{ fontSize: "0.85rem", marginTop: "6px" }}>Be the first to share a post or camera snap!</p>
          </div>
        ) : (
          feeds.map((item) => {
            const canDelete = currentUser && (currentUser.role === "admin" || currentUser.id === item.userId);
            const isCommentOpen = activeCommentPostId === item.id;
            const postMedia = item.media || item.image;
            const isPopLiked = popLikedPostId === item.id;
            const isBounceShare = bounceSharePostId === item.id;

            return (
              <div key={item.id} className="glass-surface feed-card" style={{ padding: "26px", borderRadius: "28px" }}>
                {/* Post Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div 
                    onClick={() => setInspectingUser({ id: item.userId, name: item.userName, avatar: item.userAvatar, role: item.userRole })}
                    style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
                    title="Click to view profile card"
                  >
                    <img
                      src={item.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt={item.userName}
                      style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.userName}
                        {item.userRole === "admin" && (
                          <span className="badge badge-admin" style={{ fontSize: "0.68rem" }}>ADMIN</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginTop: "2px" }}>
                        {new Date(item.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {canDelete && (
                    <button 
                      onClick={() => handleDeletePost(item.id)}
                      className="apple-btn apple-btn-glass"
                      title="Delete post"
                      style={{ width: "36px", height: "36px", padding: 0, color: "#FF375F" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Content Text */}
                <div style={{ fontSize: "1rem", color: "#f1f5f9", lineHeight: "1.55", marginBottom: "18px" }}>
                  {item.content}
                </div>

                {/* Photo Image Attachment (Camera Snap, File Upload, or Cmd+V Paste) with 20px corners */}
                {postMedia && (
                  <div style={{ marginBottom: "18px", overflow: "hidden", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                    <img
                      src={postMedia}
                      alt="Feed attachment"
                      style={{ width: "100%", maxHeight: "460px", objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}

                {/* Document File Attachment */}
                {item.file && !postMedia && (
                  <div style={{
                    marginBottom: "18px",
                    padding: "14px 20px",
                    background: "rgba(191, 90, 242, 0.12)",
                    border: "1px solid rgba(191, 90, 242, 0.3)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "#BF5AF2"
                  }}>
                    <FileText size={22} />
                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "700" }}>{item.file.name}</div>
                      <div style={{ fontSize: "0.78rem", opacity: 0.8 }}>{item.file.size}</div>
                    </div>
                  </div>
                )}

                {/* Location Card */}
                {item.location && (
                  <div style={{ marginBottom: "18px" }}>
                    <LocationCard 
                      location={item.location} 
                      onSelectLocation={onSelectLocation}
                    />
                  </div>
                )}

                {/* Social Action Bar */}
                <div className="feed-action-bar" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                  marginTop: "16px"
                }}>
                  {/* Like Button with Pop Animation & Database Notification Event */}
                  <button 
                    onClick={() => handleLike(item)}
                    className={`apple-btn apple-btn-glass feed-action-button ${isPopLiked ? 'animate-like-pop' : ''}`}
                    style={{ padding: "8px 18px", fontSize: "0.88rem", color: "#FF375F" }}
                  >
                    <Heart size={18} fill="#FF375F" /> <span>{item.likes || 0} Likes</span>
                  </button>

                  {/* Comment Button */}
                  <button 
                    onClick={() => setActiveCommentPostId(isCommentOpen ? null : item.id)}
                    className="apple-btn apple-btn-glass feed-action-button"
                    style={{ padding: "8px 18px", fontSize: "0.88rem" }}
                  >
                    <MessageCircle size={18} /> <span>{item.comments?.length || 0} Comments</span>
                  </button>

                  {/* Share Button with Bounce Animation & Database Notification Event */}
                  <button
                    onClick={() => handleShare(item)}
                    className={`apple-btn apple-btn-glass feed-action-button ${isBounceShare ? 'animate-share-bounce' : ''}`}
                    style={{ padding: "8px 18px", fontSize: "0.88rem", color: "#64D2FF" }}
                  >
                    <Share2 size={18} /> <span>Share</span>
                  </button>
                </div>

                {/* Comments Section with Slide Animation */}
                {isCommentOpen && (
                  <div className="animate-comment-slide" style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                      {item.comments && item.comments.length > 0 ? (
                        item.comments.map((c) => (
                          <div key={c.id} style={{ background: "rgba(255,255,255,0.06)", padding: "10px 16px", borderRadius: "16px", fontSize: "0.88rem" }}>
                            <span style={{ fontWeight: "700", color: "#0A84FF", marginRight: "8px" }}>{c.userName}:</span>
                            <span style={{ color: "#e2e8f0" }}>{c.text}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary-dark)" }}>No comments yet. Write one below!</div>
                      )}
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddComment(item);
                      }}
                      style={{ display: "flex", gap: "10px" }}
                    >
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="form-input"
                        style={{ padding: "10px 18px", fontSize: "0.88rem" }}
                      />
                      <button type="submit" className="apple-btn apple-btn-primary" style={{ padding: "10px 20px" }}>
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleCreatePost}
        onOpenCamera={onOpenCamera}
        onOpenMap={onOpenMap}
        pendingMedia={pendingMedia}
        setPendingMedia={setPendingMedia}
        pendingLocation={pendingLocation}
        setPendingLocation={setPendingLocation}
      />

      <UserProfileModal
        isOpen={Boolean(inspectingUser)}
        onClose={() => setInspectingUser(null)}
        user={inspectingUser}
      />
    </div>
  );
};
