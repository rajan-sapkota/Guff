import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

const requireFirestore = () => {
  if (!db || !auth?.currentUser) {
    throw new Error("Please sign in with Firebase before starting a call.");
  }
};

export const callService = {
  async createCall({ caller, recipient, offer }) {
    requireFirestore();
    const call = await addDoc(collection(db, "calls"), {
      callerId: caller.id,
      callerName: caller.name,
      callerAvatar: caller.avatar || "",
      recipientId: recipient.id,
      recipientName: recipient.name,
      status: "ringing",
      offer,
      answer: null,
      createdAt: new Date().toISOString()
    });
    return call.id;
  },

  async updateCall(callId, updates) {
    requireFirestore();
    await updateDoc(doc(db, "calls", callId), updates);
  },

  async addIceCandidate(callId, role, candidate) {
    requireFirestore();
    await addDoc(collection(db, "calls", callId, `${role}Candidates`), candidate.toJSON());
  },

  listenToCall(callId, callback) {
    if (!db) return () => {};
    return onSnapshot(doc(db, "calls", callId), (snapshot) => {
      if (snapshot.exists()) callback({ id: snapshot.id, ...snapshot.data() });
    });
  },

  listenToCandidates(callId, role, callback) {
    if (!db) return () => {};
    return onSnapshot(collection(db, "calls", callId, `${role}Candidates`), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") callback(change.doc.data());
      });
    });
  },

  subscribeToIncomingCalls(userId, callback) {
    if (!db || !userId) return () => {};
    const incomingCalls = query(collection(db, "calls"), where("recipientId", "==", userId));
    return onSnapshot(incomingCalls, (snapshot) => {
      const ringingCall = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .find((call) => call.status === "ringing");
      callback(ringingCall || null);
    });
  }
};
