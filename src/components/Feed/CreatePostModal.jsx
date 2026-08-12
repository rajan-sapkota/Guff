import React, { useState, useRef } from "react";
import { X, Camera, MapPin, Image as ImageIcon, Paperclip, Sparkles, Send } from "lucide-react";

export const CreatePostModal = ({
  isOpen,
  onClose,
  onSubmit,
  onOpenCamera,
  onOpenMap,
  pendingMedia,
  setPendingMedia,
  pendingLocation,
  setPendingLocation
}) => {
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("#Guff #Nepal #Travel");
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handlePaste = (e) => {
    const items = e.clipboardData?.items || e.clipboardData?.files;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const file = item.getAsFile ? item.getAsFile() : item;

      if (file && file.type.startsWith("image/")) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => {
          setPendingMedia(event.target?.result);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (file.type.startsWith("image/")) {
        setPendingMedia(event.target?.result);
      } else {
        setAttachedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          url: event.target?.result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !pendingMedia && !pendingLocation && !attachedFile) return;

    onSubmit({
      content: content.trim(),
      hashtags: hashtags.trim(),
      media: pendingMedia,
      file: attachedFile,
      location: pendingLocation
    });

    setContent("");
    setPendingMedia(null);
    setPendingLocation(null);
    setAttachedFile(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onPaste={handlePaste}
        style={{
          maxWidth: "520px",
          width: "100%",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          background: "rgba(28, 28, 30, 0.95)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)"
        }}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
          style={{ display: "none" }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={20} color="#0A84FF" /> Create Guff Post
          </h3>
          <button onClick={onClose} className="apple-btn apple-btn-glass" style={{ width: "32px", height: "32px", padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Text Area Input */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder="What's happening? Type a post or press Cmd+V to paste pictures..."
              className="form-input"
              style={{
                width: "100%",
                minHeight: "110px",
                padding: "14px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.95rem",
                resize: "none",
                lineHeight: "1.5"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#Guff #Travel #Food"
              className="form-input"
              style={{ padding: "10px 14px", fontSize: "0.85rem" }}
            />
          </div>

          {/* Attachments Preview */}
          {(pendingMedia || pendingLocation || attachedFile) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
              {pendingMedia && (
                <div style={{ position: "relative" }}>
                  <img src={pendingMedia} alt="Media" style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover", border: "2px solid #0A84FF" }} />
                  <button type="button" onClick={() => setPendingMedia(null)} style={{ position: "absolute", top: "-6px", right: "-6px", background: "#FF375F", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer" }}>
                    <X size={12} />
                  </button>
                </div>
              )}

              {attachedFile && (
                <div style={{ background: "rgba(191, 90, 242, 0.15)", border: "1px solid rgba(191, 90, 242, 0.3)", padding: "8px 14px", borderRadius: "var(--radius-pill)", color: "#BF5AF2", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Paperclip size={14} />
                  {attachedFile.name} ({attachedFile.size})
                  <button type="button" onClick={() => setAttachedFile(null)} style={{ background: "none", border: "none", color: "#FF375F", cursor: "pointer", marginLeft: "6px" }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {pendingLocation && (
                <div style={{ background: "rgba(10, 132, 255, 0.15)", border: "1px solid rgba(10, 132, 255, 0.3)", padding: "8px 14px", borderRadius: "var(--radius-pill)", color: "#64D2FF", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={14} />
                  {pendingLocation.name}
                  <button type="button" onClick={() => setPendingLocation(null)} style={{ background: "none", border: "none", color: "#FF375F", cursor: "pointer", marginLeft: "6px" }}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="create-post-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="create-post-attachments" style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="apple-btn apple-btn-glass"
                style={{ padding: "8px 12px", fontSize: "0.82rem" }}
                title="Attach Picture or File"
              >
                <ImageIcon size={16} color="#BF5AF2" /> Photo / File
              </button>

              <button
                type="button"
                onClick={onOpenCamera}
                className="apple-btn apple-btn-glass"
                style={{ padding: "8px 12px", fontSize: "0.82rem" }}
                title="Take Camera Snap"
              >
                <Camera size={16} color="#0A84FF" /> Snap
              </button>

              <button
                type="button"
                onClick={onOpenMap}
                className="apple-btn apple-btn-glass"
                style={{ padding: "8px 12px", fontSize: "0.82rem" }}
                title="Attach Map Location"
              >
                <MapPin size={16} color="#30D158" /> Location
              </button>
            </div>

            <button
              type="submit"
              disabled={!content.trim() && !pendingMedia && !pendingLocation && !attachedFile}
              className="apple-btn apple-btn-primary create-post-publish"
              style={{ padding: "10px 22px", opacity: (!content.trim() && !pendingMedia && !pendingLocation && !attachedFile) ? 0.5 : 1 }}
            >
              <Send size={16} /> Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
