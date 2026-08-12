import React, { useRef, useState, useEffect } from "react";
import { X, Camera, RefreshCw, Check, Sparkles } from "lucide-react";
import { compressImage } from "../../utils/imageCompressor";

export const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera access warning:", err.message);
      setCameraError("Camera unavailable. You can upload photos directly from your device!");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const compressed = await compressImage(rawDataUrl);
      setCapturedImage(compressed);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
          background: "rgba(18, 24, 36, 0.95)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.15)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Camera size={20} color="#0A84FF" /> Camera Snap
          </h3>
          <button onClick={onClose} className="apple-btn apple-btn-glass" style={{ width: "32px", height: "32px", padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {cameraError ? (
          <div style={{ padding: "30px 20px", textAlign: "center", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
            <p style={{ color: "var(--text-secondary-dark)", fontSize: "0.9rem" }}>{cameraError}</p>
          </div>
        ) : (
          <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "4/3", background: "#000", marginBottom: "16px" }}>
            {!capturedImage ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            ) : (
              <img 
                src={capturedImage} 
                alt="Snap preview" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
          {!capturedImage ? (
            <button 
              onClick={takePhoto} 
              className="apple-btn apple-btn-primary" 
              style={{ width: "60px", height: "60px", borderRadius: "50%", padding: 0 }}
              disabled={Boolean(cameraError)}
            >
              <Camera size={26} color="#fff" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => setCapturedImage(null)} 
                className="apple-btn apple-btn-glass" 
                style={{ padding: "10px 20px" }}
              >
                <RefreshCw size={16} /> Retake
              </button>
              <button 
                onClick={handleConfirm} 
                className="apple-btn apple-btn-primary" 
                style={{ padding: "10px 20px" }}
              >
                <Check size={16} /> Use Snap
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
