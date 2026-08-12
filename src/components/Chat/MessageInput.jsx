import React, { useState, useRef } from "react";
import { Camera, MapPin, Send, Paperclip, FileText, Image as ImageIcon, X, Smile, Mic, MicOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { compressImage } from "../../utils/imageCompressor";

export const MessageInput = ({
  onSendMessage,
  onOpenCamera,
  onOpenMap,
  pendingMedia,
  setPendingMedia,
  pendingLocation,
  setPendingLocation
}) => {
  const { showToast } = useAuth();
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const emojis = ["😊", "😂", "❤️", "🔥", "👍", "🚀", "🎉", "☕", "🍕", "✨"];

  // Handle Clipboard Paste (Cmd + V / Ctrl + V) with Image Compression
  const handlePaste = async (e) => {
    const clipboardItems = e.clipboardData?.items || e.clipboardData?.files;
    if (!clipboardItems) return;

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      const file = item.getAsFile ? item.getAsFile() : item;

      if (file && file.type.startsWith("image/")) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = async (event) => {
          const rawDataUrl = event.target?.result;
          const compressed = await compressImage(rawDataUrl);
          setPendingMedia(compressed);
          if (showToast) showToast("Image pasted & compressed! 📋", "success");
        };
        reader.readAsDataURL(file);
        break;
      } else if (file) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => {
          setPendingFile({
            name: file.name || "Pasted_File",
            size: (file.size / 1024).toFixed(1) + " KB",
            type: file.type,
            url: event.target?.result,
            isImage: false
          });
          if (showToast) showToast("File pasted from clipboard! 📋", "success");
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result;
      if (file.type.startsWith("image/")) {
        const compressed = await compressImage(rawDataUrl);
        setPendingMedia(compressed);
      } else {
        setPendingFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: file.type,
          url: rawDataUrl,
          isImage: false
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleVoiceRecording = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      if (showToast) showToast("Recording voice message... 🎙️", "info");
    } else {
      setIsRecordingVoice(false);
      setText((prev) => prev + " 🎙️ [Voice Note attached]");
      if (showToast) showToast("Voice message recorded!", "success");
    }
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !pendingMedia && !pendingLocation && !pendingFile) return;

    let finalMedia = pendingMedia;
    if (finalMedia && finalMedia.length > 200000) {
      finalMedia = await compressImage(finalMedia);
    }

    onSendMessage({
      text: text.trim(),
      media: finalMedia,
      file: pendingFile,
      location: pendingLocation
    });

    setText("");
    setPendingMedia(null);
    setPendingLocation(null);
    setPendingFile(null);
  };

  return (
    <div 
      onPaste={handlePaste}
      style={{
        padding: "16px 20px",
        background: "rgba(18, 24, 36, 0.8)",
        backdropFilter: "blur(35px)",
        WebkitBackdropFilter: "blur(35px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative"
      }}
    >
      {/* Emoji Picker Bar */}
      {showEmojiPicker && (
        <div style={{
          position: "absolute",
          bottom: "75px",
          left: "20px",
          background: "rgba(28, 28, 30, 0.95)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          display: "flex",
          gap: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 100
        }}>
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.3rem",
                cursor: "pointer",
                transition: "transform 0.2s ease"
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attachments Preview Bar */}
      {(pendingMedia || pendingLocation || pendingFile) && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {pendingMedia && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={pendingMedia}
                alt="Snap Preview"
                style={{ width: "64px", height: "64px", borderRadius: "14px", objectFit: "cover", border: "2px solid #0A84FF" }}
              />
              <button
                type="button"
                onClick={() => setPendingMedia(null)}
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#FF375F",
                  color: "#fff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {pendingFile && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(191, 90, 242, 0.18)",
              border: "1px solid rgba(191, 90, 242, 0.35)",
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              color: "#BF5AF2",
              fontSize: "0.82rem"
            }}>
              <FileText size={14} />
              <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {pendingFile.name}
              </span>
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                style={{ background: "none", border: "none", color: "#FF375F", cursor: "pointer", marginLeft: "4px" }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {pendingLocation && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(10, 132, 255, 0.18)",
              border: "1px solid rgba(10, 132, 255, 0.35)",
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              color: "#64D2FF",
              fontSize: "0.82rem"
            }}>
              <MapPin size={14} />
              <span>{pendingLocation.name}</span>
              <button
                type="button"
                onClick={() => setPendingLocation(null)}
                style={{ background: "none", border: "none", color: "#FF375F", cursor: "pointer", marginLeft: "4px" }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden Device File Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
        style={{ display: "none" }}
      />

      {/* iMessage Sleek Glass Pill Input Container */}
      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
        {/* Device File Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="apple-btn apple-btn-glass"
          style={{ width: "44px", height: "44px", padding: 0, borderRadius: "50%", flexShrink: 0 }}
          title="Attach Image or File"
        >
          <Paperclip size={19} color="#BF5AF2" />
        </button>

        {/* Camera Snap Button */}
        <button
          type="button"
          onClick={onOpenCamera}
          className="apple-btn apple-btn-glass"
          style={{ width: "44px", height: "44px", padding: 0, borderRadius: "50%", flexShrink: 0 }}
          title="Camera Snap"
        >
          <Camera size={19} color="#0A84FF" />
        </button>

        {/* Location Pin Button */}
        <button
          type="button"
          onClick={onOpenMap}
          className="apple-btn apple-btn-glass"
          style={{ width: "44px", height: "44px", padding: 0, borderRadius: "50%", flexShrink: 0 }}
          title="Map Location Pin"
        >
          <MapPin size={19} color="#30D158" />
        </button>

        {/* iMessage Input Bar Container */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder={isRecordingVoice ? "Recording audio note..." : "iMessage or Cmd+V paste..."}
            className="form-input"
            style={{
              height: "48px",
              paddingLeft: "18px",
              paddingRight: "84px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.95rem",
              background: "rgba(255, 255, 255, 0.08)",
              border: isRecordingVoice ? "1px solid #FF375F" : "1px solid rgba(255, 255, 255, 0.15)"
            }}
          />

          {/* Emoji Trigger Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              position: "absolute",
              right: "46px",
              background: "none",
              border: "none",
              color: "#FF9F0A",
              cursor: "pointer",
              padding: "4px"
            }}
            title="Emoji Picker"
          >
            <Smile size={20} />
          </button>

          {/* Voice Record Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              color: isRecordingVoice ? "#FF375F" : "var(--text-secondary-dark)",
              cursor: "pointer",
              padding: "4px"
            }}
            title={isRecordingVoice ? "Stop Voice Recording" : "Record Voice Message"}
          >
            {isRecordingVoice ? <MicOff size={20} className="animate-like-pop" /> : <Mic size={20} />}
          </button>
        </div>

        {/* iMessage Apple Blue Send Button */}
        <button
          type="submit"
          disabled={!text.trim() && !pendingMedia && !pendingLocation && !pendingFile}
          className="apple-btn apple-btn-primary"
          style={{
            width: "48px",
            height: "48px",
            padding: 0,
            borderRadius: "50%",
            flexShrink: 0,
            opacity: (!text.trim() && !pendingMedia && !pendingLocation && !pendingFile) ? 0.5 : 1,
            cursor: (!text.trim() && !pendingMedia && !pendingLocation && !pendingFile) ? "not-allowed" : "pointer"
          }}
          title="Send iMessage"
        >
          <Send size={19} color="#fff" />
        </button>
      </form>
    </div>
  );
};
