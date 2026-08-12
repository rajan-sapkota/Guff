import { useEffect, useRef, useState } from "react";
import { callService } from "../firebase/callService";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

export const useAudioCall = (currentUser, showToast) => {
  const [call, setCall] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const unsubscribeRef = useRef([]);
  const callRef = useRef(null);

  const cleanUpConnection = () => {
    unsubscribeRef.current.forEach((unsubscribe) => unsubscribe?.());
    unsubscribeRef.current = [];
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setRemoteStream(null);
    setIsMuted(false);
  };

  const connectPeer = async (callId, localStream, remoteCandidateRole) => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnectionRef.current = peerConnection;
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = (event) => setRemoteStream(event.streams[0]);
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        callService.addIceCandidate(callId, remoteCandidateRole === "caller" ? "callee" : "caller", event.candidate);
      }
    };

    unsubscribeRef.current.push(
      callService.listenToCandidates(callId, remoteCandidateRole, async (candidate) => {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.warn("Unable to add call connection candidate", error);
        }
      })
    );

    return peerConnection;
  };

  const startAudioCall = async (recipient) => {
    if (!currentUser || !recipient) return;
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;
      setCall({ recipient, phase: "calling" });
      const peerConnection = new RTCPeerConnection({ iceServers });
      peerConnectionRef.current = peerConnection;
      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
      peerConnection.ontrack = (event) => setRemoteStream(event.streams[0]);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      const callId = await callService.createCall({ caller: currentUser, recipient, offer: offer.toJSON() });
      callRef.current = callId;
      setCall({ id: callId, recipient, phase: "calling", outgoing: true });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) callService.addIceCandidate(callId, "caller", event.candidate);
      };

      unsubscribeRef.current.push(
        callService.listenToCall(callId, async (updatedCall) => {
          if (updatedCall.status === "accepted" && updatedCall.answer && !peerConnection.currentRemoteDescription) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(updatedCall.answer));
            setCall((current) => current ? { ...current, phase: "connected" } : current);
          }
          if (updatedCall.status === "declined" || updatedCall.status === "ended") {
            cleanUpConnection();
            callRef.current = null;
            setCall(null);
          }
        }),
        callService.listenToCandidates(callId, "callee", async (candidate) => {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.warn("Unable to add call connection candidate", error);
          }
        })
      );
    } catch (error) {
      cleanUpConnection();
      setCall(null);
      showToast(error.message || "Microphone access is required to start a call.", "error");
    }
  };

  const acceptAudioCall = async () => {
    if (!call?.id || !call.offer) return;
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;
      const peerConnection = await connectPeer(call.id, localStream, "caller");
      await peerConnection.setRemoteDescription(new RTCSessionDescription(call.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      await callService.updateCall(call.id, { answer: answer.toJSON(), status: "accepted" });
      setCall((current) => current ? { ...current, phase: "connected" } : current);
    } catch (error) {
      cleanUpConnection();
      setCall(null);
      showToast(error.message || "Unable to connect the call.", "error");
    }
  };

  const endAudioCall = async (status = "ended") => {
    const callId = callRef.current || call?.id;
    if (callId) {
      try {
        await callService.updateCall(callId, { status, endedAt: new Date().toISOString() });
      } catch (error) {
        console.warn("Unable to update call status", error);
      }
    }
    cleanUpConnection();
    callRef.current = null;
    setCall(null);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !nextMuted; });
    setIsMuted(nextMuted);
  };

  useEffect(() => {
    if (!currentUser?.id) return undefined;
    const unsubscribe = callService.subscribeToIncomingCalls(currentUser.id, (incomingCall) => {
      if (incomingCall && !callRef.current) {
        callRef.current = incomingCall.id;
        setCall({ ...incomingCall, phase: "incoming", outgoing: false });
      }
    });
    return () => unsubscribe?.();
  }, [currentUser?.id]);

  useEffect(() => () => cleanUpConnection(), []);

  return { call, remoteStream, isMuted, startAudioCall, acceptAudioCall, endAudioCall, toggleMute };
};
