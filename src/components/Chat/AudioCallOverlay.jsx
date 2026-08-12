import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

export const AudioCallOverlay = ({ call, remoteStream, isMuted, onAccept, onDecline, onEnd, onToggleMute }) => {
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (!call) return null;

  const person = call.outgoing ? call.recipient : { name: call.callerName, avatar: call.callerAvatar };
  const isIncoming = call.phase === "incoming";
  const isConnected = call.phase === "connected";

  return (
    <div className="audio-call-overlay" role="dialog" aria-modal="true" aria-label="Audio call">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div className="audio-call-card">
        {person?.avatar ? <img className="audio-call-avatar" src={person.avatar} alt={person.name} /> : <div className="audio-call-avatar audio-call-avatar-fallback">☎</div>}
        <h2>{person?.name || "Guff member"}</h2>
        <p>{isIncoming ? "Incoming audio call" : isConnected ? "Audio call connected" : "Calling…"}</p>
        <small>Free test call · microphone only</small>
        <div className="audio-call-actions">
          {isIncoming ? (
            <>
              <button className="audio-call-action decline" onClick={() => onDecline("declined")}><PhoneOff size={22} /> Decline</button>
              <button className="audio-call-action accept" onClick={onAccept}><Phone size={22} /> Accept</button>
            </>
          ) : (
            <>
              {isConnected && <button className="audio-call-action mute" onClick={onToggleMute}>{isMuted ? <MicOff size={22} /> : <Mic size={22} />}{isMuted ? "Unmute" : "Mute"}</button>}
              <button className="audio-call-action decline" onClick={() => onEnd("ended")}><PhoneOff size={22} /> End call</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
