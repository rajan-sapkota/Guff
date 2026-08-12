import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { firebaseService } from "../../firebase/firebaseService";
import { MessageInput } from "./MessageInput";
import { LocationCard } from "./LocationCard";
import { MessageInfoModal } from "./MessageInfoModal";
import { 
  Hash, 
  Sparkles, 
  User, 
  Shield, 
  Lock, 
  MapPin, 
  Camera, 
  MessageSquare,
  Utensils,
  ShoppingBag,
  Megaphone,
  Menu,
  X,
  FileText,
  Check,
  CheckCheck,
  Phone,
  Video,
  Info,
  Search,
  Pin,
  Smile,
  ChevronDown,
  AlertCircle,
  Loader2,
  Copy,
  Reply,
  Forward,
  Trash2,
  Plus
} from "lucide-react";

export const ChatWindow = ({ onOpenCamera, onOpenMap, onSelectLocation, pendingMedia, setPendingMedia, pendingLocation, setPendingLocation }) => {
  const { currentUser, activeChannel, setActiveChannel, showToast, setIsAuthModalOpen } = useAuth();
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState("📌 Welcome to Guff Live Messenger! Tap any member to DM directly.");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [reactions, setReactions] = useState({});
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [activeMobileReactionMsgId, setActiveMobileReactionMsgId] = useState(null);
  const [infoModalMsg, setInfoModalMsg] = useState(null);

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const longPressTimerRef = useRef(null);

  const channels = [
    { id: "general", name: "general", icon: Hash, desc: "General Chat" },
    { id: "foodies-corner", name: "foodies-corner", icon: Utensils, desc: "Cafes & Dining" },
    { id: "shop-local", name: "shop-local", icon: ShoppingBag, desc: "Local Market" },
    { id: "announcements", name: "announcements", icon: Megaphone, desc: "Updates" }
  ];

  useEffect(() => {
    // Subscribe to all users for DM list & online status
    const unsubUsers = firebaseService.subscribeUsers((usersList) => {
      setAllUsers(usersList);
    });

    return () => {
      if (typeof unsubUsers === "function") unsubUsers();
    };
  }, []);

  useEffect(() => {
    // Subscribe to real-time messages for activeChannel
    const unsub = firebaseService.subscribeMessages(activeChannel, (fetchedMsgs) => {
      setMessages(fetchedMsgs);
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [activeChannel]);

  // Real Read Receipt Trigger: When recipient opens the active channel, mark unread messages as read in backend
  useEffect(() => {
    if (currentUser && activeChannel) {
      firebaseService.markChannelMessagesAsRead(activeChannel, currentUser.id);
    }
  }, [activeChannel, messages, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async ({ text, media, file, location }) => {
    if (!currentUser) {
      showToast("Please login to send messages", "error");
      setIsAuthModalOpen(true);
      return;
    }

    const payload = {
      channelId: activeChannel,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      text: text,
      media: media,
      file: file,
      location: location,
      type: location ? "location" : (media ? "media" : "text"),
      status: "delivered"
    };

    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1200);

    await firebaseService.sendMessage(payload);
  };

  const handleChannelSelect = (channelId) => {
    setActiveChannel(channelId);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleToggleReaction = async (msgObj, emoji) => {
    const msgId = msgObj.id;
    setReactions((prev) => {
      const currentList = prev[msgId] || [];
      const updated = currentList.includes(emoji)
        ? currentList.filter(e => e !== emoji)
        : [...currentList, emoji];
      return { ...prev, [msgId]: updated };
    });
    setActiveMobileReactionMsgId(null);
    showToast(`Reacted ${emoji}`, "info");

    if (currentUser && msgObj.senderId && msgObj.senderId !== currentUser.id) {
      await firebaseService.addNotification({
        userId: msgObj.senderId,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorAvatar: currentUser.avatar,
        notificationType: "reaction",
        targetId: msgId,
        targetType: "message",
        metadata: { text: emoji }
      });
    }
  };

  const handleTouchStart = (msgId) => {
    longPressTimerRef.current = setTimeout(() => {
      setActiveMobileReactionMsgId(msgId);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setSelectedMsgForMenu(msg);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleContextMenuAction = (action) => {
    if (!selectedMsgForMenu) return;
    if (action === "copy") {
      navigator.clipboard.writeText(selectedMsgForMenu.text || "");
      showToast("Message copied to clipboard! 📋", "success");
    } else if (action === "pin") {
      setPinnedMessage(`📌 ${selectedMsgForMenu.senderName}: "${selectedMsgForMenu.text}"`);
      showToast("Message pinned to thread header!", "success");
    } else if (action === "info") {
      setInfoModalMsg(selectedMsgForMenu);
    } else if (action === "delete") {
      setMessages((prev) => prev.filter(m => m.id !== selectedMsgForMenu.id));
      showToast("Message deleted", "info");
    } else {
      showToast(`${action.toUpperCase()} action triggered`, "info");
    }
    setSelectedMsgForMenu(null);
  };

  const getChannelDisplayName = () => {
    if (activeChannel.includes("_dm_")) {
      const parts = activeChannel.split("_dm_");
      const otherUserId = parts.find(id => id !== currentUser?.id) || parts[0];
      const otherUser = allUsers.find(u => u.id === otherUserId);
      return otherUser?.name || "Direct Message";
    }
    return `#${activeChannel}`;
  };

  const getOtherUser = () => {
    if (activeChannel.includes("_dm_")) {
      const parts = activeChannel.split("_dm_");
      const otherUserId = parts.find(id => id !== currentUser?.id) || parts[0];
      return allUsers.find(u => u.id === otherUserId);
    }
    return null;
  };

  const otherUser = getOtherUser();

  const filteredMessages = messages.filter((m) => {
    if (!searchQuery.trim()) return true;
    return m.text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ flex: 1, display: "flex", width: "100%", height: "100%", minHeight: 0, overflow: "hidden", position: "relative" }}>
      
      {/* Channels & Direct Messages Left Sidebar Drawer */}
      {isSidebarOpen && (
        <div 
          className="glass-surface" 
          style={{
            width: "240px",
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
            borderRight: "1px solid rgba(255, 255, 255, 0.12)",
            background: "rgba(18, 24, 36, 0.95)",
            backdropFilter: "blur(40px)",
            padding: "20px 14px",
            flexShrink: 0,
            zIndex: 50,
            transition: "all 0.25s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", padding: "0 4px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "800", textTransform: "uppercase", color: "#0A84FF", letterSpacing: "0.05em" }}>
              Channels & DMs
            </span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="apple-btn apple-btn-glass"
              style={{ width: "30px", height: "30px", padding: 0 }}
              title="Close Drawer"
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-secondary-dark)", paddingLeft: "6px", marginBottom: "8px" }}>
            Public Channels
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            {channels.map((ch) => {
              const IconComp = ch.icon;
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelSelect(ch.id)}
                  className={`apple-btn ${isActive ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                  style={{
                    justifyContent: "flex-start",
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "0.88rem"
                  }}
                >
                  <IconComp size={17} />
                  <span>#{ch.name}</span>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-secondary-dark)", paddingLeft: "6px", marginBottom: "8px" }}>
            Direct Messages (DMs)
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {allUsers.filter(u => u.id !== currentUser?.id).map((u) => {
              const dmChannelId = [currentUser?.id, u.id].sort().join("_dm_");
              const isActive = activeChannel === dmChannelId;
              return (
                <button
                  key={u.id}
                  onClick={() => handleChannelSelect(dmChannelId)}
                  className={`apple-btn ${isActive ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                  style={{
                    justifyContent: "flex-start",
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "0.82rem"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img src={u.avatar} alt={u.name} style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: 0, right: 0, width: "8px", height: "8px", borderRadius: "50%", background: "#30D158", border: "1px solid #000" }} />
                  </div>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main iMessage Thread View */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden", position: "relative" }}>
        
        {/* Chat Conversation Header */}
        <div style={{
          height: "64px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          background: "rgba(18, 24, 36, 0.6)",
          backdropFilter: "blur(35px)",
          flexShrink: 0,
          zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="apple-btn apple-btn-glass"
              style={{ width: "38px", height: "38px", padding: 0 }}
              title={isSidebarOpen ? "Collapse Drawer" : "Open Drawer"}
            >
              <Menu size={18} color="#0A84FF" />
            </button>

            {otherUser ? (
              <div style={{ position: "relative" }}>
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                />
                <span style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", background: "#30D158", border: "2px solid #000" }} />
              </div>
            ) : (
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
                <MessageSquare size={19} />
              </div>
            )}

            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>
                {getChannelDisplayName()}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "#30D158", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#30D158" }}></span>
                {otherUser ? "Active now • Last seen 2m ago" : "Live stream connected"}
              </p>
            </div>
          </div>

          {/* Header Action Buttons (Call, Video, Search, Info) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: "140px", height: "36px", padding: "6px 12px", fontSize: "0.8rem" }}
              />
            )}

            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="apple-btn apple-btn-glass"
              style={{ width: "36px", height: "36px", padding: 0 }}
              title="Search conversation"
            >
              <Search size={16} color="#64D2FF" />
            </button>

            <button 
              onClick={() => showToast("Audio call initiated 📞", "info")}
              className="apple-btn apple-btn-glass"
              style={{ width: "36px", height: "36px", padding: 0 }}
              title="Start Audio Call"
            >
              <Phone size={16} color="#30D158" />
            </button>

            <button 
              onClick={() => showToast("FaceTime Video call initiated 📹", "info")}
              className="apple-btn apple-btn-glass"
              style={{ width: "36px", height: "36px", padding: 0 }}
              title="Start Video Call"
            >
              <Video size={16} color="#0A84FF" />
            </button>
          </div>
        </div>

        {/* Floating Pinned Message Banner */}
        {pinnedMessage && (
          <div style={{
            background: "rgba(10, 132, 255, 0.18)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(10, 132, 255, 0.3)",
            padding: "8px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.82rem",
            color: "#64D2FF"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Pin size={14} color="#0A84FF" />
              <span>{pinnedMessage}</span>
            </div>
            <button 
              onClick={() => setPinnedMessage(null)}
              style={{ background: "none", border: "none", color: "var(--text-secondary-dark)", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* iMessage Messages Thread Scroll Area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          {/* Unread Divider */}
          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <span className="badge" style={{ background: "rgba(10, 132, 255, 0.15)", color: "#0A84FF" }}>
              Unread Messages Below
            </span>
          </div>

          {filteredMessages.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", color: "var(--text-secondary-dark)", padding: "40px" }}>
              <MessageSquare size={44} color="#0A84FF" style={{ opacity: 0.5, marginBottom: "12px" }} />
              <h3 style={{ color: "#fff" }}>No messages in {getChannelDisplayName()} yet</h3>
              <p style={{ fontSize: "0.85rem", marginTop: "6px" }}>
                Be the first to send an iMessage, paste a photo, or drop a location pin!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              const isMe = currentUser && msg.senderId === currentUser.id;
              const isLastMsg = index === filteredMessages.length - 1;
              const msgReactionsList = reactions[msg.id] || [];
              const isHovered = hoveredMsgId === msg.id;
              const isMobileActive = activeMobileReactionMsgId === msg.id;
              const showPicker = isHovered || isMobileActive;

              const reactionCounts = msgReactionsList.reduce((acc, emoji) => {
                acc[emoji] = (acc[emoji] || 0) + 1;
                return acc;
              }, {});

              return (
                <div
                  key={msg.id}
                  className="animate-message-enter"
                  onMouseEnter={() => setHoveredMsgId(msg.id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                  onTouchStart={() => handleTouchStart(msg.id)}
                  onTouchEnd={handleTouchEnd}
                  onContextMenu={(e) => handleContextMenu(e, msg)}
                  style={{
                    display: "flex",
                    flexDirection: isMe ? "row-reverse" : "row",
                    gap: "12px",
                    alignItems: "flex-end",
                    position: "relative"
                  }}
                >
                  <img
                    src={msg.senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                    alt={msg.senderName}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: msg.senderRole === "admin" ? "2px solid #FF9F0A" : "1px solid rgba(255, 255, 255, 0.15)",
                      marginBottom: "4px"
                    }}
                  />

                  <div style={{
                    maxWidth: "68%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                    position: "relative"
                  }}>
                    {/* Floating Quick Reaction Picker */}
                    {showPicker && (
                      <div
                        className="animate-reaction-picker-enter"
                        style={{
                          position: "absolute",
                          top: "-42px",
                          right: isMe ? 0 : "auto",
                          left: isMe ? "auto" : 0,
                          background: "rgba(28, 28, 30, 0.95)",
                          backdropFilter: "blur(30px)",
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          borderRadius: "24px",
                          padding: "4px 10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                          zIndex: 100
                        }}
                      >
                        {["❤️", "😂", "👍", "🔥", "👀"].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg, emoji)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "1.1rem",
                              cursor: "pointer",
                              padding: "2px 4px",
                              transition: "transform 0.2s ease"
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          onClick={() => showToast("Full Emoji Picker opened ➕", "info")}
                          style={{
                            background: "rgba(255,255,255,0.12)",
                            border: "none",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#fff"
                          }}
                          title="Full Emoji Selector"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}

                    {/* Sender Metadata */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", padding: "0 4px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--text-secondary-dark)" }}>
                        {msg.senderName}
                      </span>
                      {msg.senderRole === "admin" && (
                        <span className="badge badge-admin" style={{ fontSize: "0.62rem", padding: "1px 5px" }}>
                          ADMIN
                        </span>
                      )}
                    </div>

                    {/* iMessage Bubble */}
                    <div
                      style={{
                        padding: "14px 20px",
                        borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                        background: isMe 
                          ? "linear-gradient(135deg, #0A84FF, #64D2FF)" 
                          : "rgba(255, 255, 255, 0.08)",
                        border: isMe ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#fff",
                        fontSize: "0.95rem",
                        lineHeight: "1.45",
                        boxShadow: isMe ? "0 8px 25px rgba(10, 132, 255, 0.35)" : "0 4px 15px rgba(0,0,0,0.2)",
                        wordBreak: "break-word",
                        position: "relative"
                      }}
                    >
                      {msg.text}

                      {/* File Attachment */}
                      {msg.file && (
                        <div style={{
                          marginTop: "8px",
                          padding: "10px 14px",
                          background: isMe ? "rgba(255,255,255,0.2)" : "rgba(191, 90, 242, 0.18)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <FileText size={18} />
                          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{msg.file.name}</span>
                        </div>
                      )}

                      {/* Camera / Paste Photo Attachment */}
                      {msg.media && (
                        <div style={{ marginTop: "10px", borderRadius: "16px", overflow: "hidden" }}>
                          <img 
                            src={msg.media} 
                            alt="Attached media" 
                            style={{
                              maxWidth: "100%",
                              maxHeight: "300px",
                              borderRadius: "16px",
                              objectFit: "cover",
                              display: "block"
                            }}
                          />
                        </div>
                      )}

                      {/* Location Pin Attachment */}
                      {msg.location && (
                        <LocationCard 
                          location={msg.location} 
                          onSelectLocation={onSelectLocation}
                        />
                      )}
                    </div>

                    {/* ONLY Display Active Added Reactions Pills */}
                    {Object.keys(reactionCounts).length > 0 && (
                      <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg, emoji)}
                            style={{
                              background: "rgba(255, 255, 255, 0.12)",
                              backdropFilter: "blur(15px)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              borderRadius: "16px",
                              padding: "2px 8px",
                              fontSize: "0.78rem",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer"
                            }}
                          >
                            <span>{emoji}</span>
                            <span style={{ fontWeight: "700" }}>{count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* REAL Backend Message Status Indicators */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", padding: "0 4px" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-secondary-dark)" }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {isMe && (
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          {msg.status === "sending" && <Loader2 size={12} className="animate-spin" color="var(--text-secondary-dark)" />}
                          {msg.status === "sent" && <Check size={14} color="var(--text-secondary-dark)" />}
                          {msg.status === "delivered" && <CheckCheck size={14} color="var(--text-secondary-dark)" />}
                          {msg.status === "read" && <CheckCheck size={14} color="#0A84FF" />}
                        </span>
                      )}
                    </div>

                    {/* REAL Backend Confirmed "Seen [Time]" Read Receipt (Only shown when backend status is "read" and readAt exists) */}
                    {isMe && isLastMsg && msg.status === "read" && msg.readAt && (
                      <div style={{ fontSize: "0.68rem", color: "#64D2FF", marginTop: "2px" }}>
                        Seen {new Date(msg.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Smooth Pulsing Typing Indicator */}
          {isTyping && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary-dark)" }}>Typing</span>
              <div style={{ display: "flex", gap: "4px" }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="apple-btn apple-btn-primary"
            style={{
              position: "absolute",
              bottom: "80px",
              right: "24px",
              padding: "8px 16px",
              fontSize: "0.8rem",
              zIndex: 30,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }}
          >
            <ChevronDown size={16} /> New Messages
          </button>
        )}

        {/* Context Menu for Message Options */}
        {selectedMsgForMenu && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedMsgForMenu(null)}
            style={{ background: "transparent" }}
          >
            <div
              className="glass-surface"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: Math.min(menuPos.y, window.innerHeight - 240),
                left: Math.min(menuPos.x, window.innerWidth - 200),
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                minWidth: "170px",
                zIndex: 99999
              }}
            >
              <button onClick={() => handleContextMenuAction("info")} className="apple-btn apple-btn-glass" style={{ justifyContent: "flex-start", padding: "8px 14px", fontSize: "0.85rem" }}>
                <Info size={14} color="#0A84FF" /> Message Info
              </button>
              <button onClick={() => handleContextMenuAction("copy")} className="apple-btn apple-btn-glass" style={{ justifyContent: "flex-start", padding: "8px 14px", fontSize: "0.85rem" }}>
                <Copy size={14} /> Copy
              </button>
              <button onClick={() => handleContextMenuAction("pin")} className="apple-btn apple-btn-glass" style={{ justifyContent: "flex-start", padding: "8px 14px", fontSize: "0.85rem" }}>
                <Pin size={14} color="#0A84FF" /> Pin Message
              </button>
              <button onClick={() => handleContextMenuAction("delete")} className="apple-btn apple-btn-glass" style={{ justifyContent: "flex-start", padding: "8px 14px", fontSize: "0.85rem", color: "#FF375F" }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Message Info Modal */}
        <MessageInfoModal
          isOpen={Boolean(infoModalMsg)}
          onClose={() => setInfoModalMsg(null)}
          message={infoModalMsg}
          reactions={infoModalMsg ? (reactions[infoModalMsg.id] || []) : []}
        />

        {/* Message Input Bar */}
        <div className="chat-message-composer" style={{ flexShrink: 0 }}>
          <MessageInput 
            onSendMessage={handleSendMessage} 
            onOpenCamera={onOpenCamera}
            onOpenMap={onOpenMap}
            pendingMedia={pendingMedia}
            setPendingMedia={setPendingMedia}
            pendingLocation={pendingLocation}
            setPendingLocation={setPendingLocation}
          />
        </div>
      </div>
    </div>
  );
};
