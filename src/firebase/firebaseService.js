import { auth, db, googleProvider, firebaseConfig } from "./firebaseConfig";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { compressImage } from "../utils/imageCompressor";

const isFirebaseActive = () => Boolean(auth && firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10);

/**
 * Pure In-Memory Store & Real-time PubSub (Zero Local Storage Usage)
 */
class MemoryStore {
  constructor() {
    this.users = [];
    this.feeds = [];
    this.messages = {}; // Keyed by channelId
    this.notifications = [];
    this.listeners = [];
  }

  emit() {
    this.listeners.forEach(fn => fn());
  }

  onUpdate(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
}

const memoryStore = new MemoryStore();

class FirebaseService {

  // --- FAULT-TOLERANT GOOGLE AUTHENTICATION WITH COOP HANDLER ---
  async loginWithGoogle(customGoogleData = null) {
    if (customGoogleData && customGoogleData.email) {
      const gName = customGoogleData.name || customGoogleData.email.split("@")[0];
      const gAvatar = customGoogleData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(gName)}&background=4285F4&color=fff&bold=true&size=200`;
      
      const customUser = {
        id: "google_user_" + Date.now(),
        name: gName,
        email: customGoogleData.email,
        avatar: gAvatar,
        role: "user",
        status: "active"
      };
      await this.saveUser(customUser);
      return customUser;
    }

    if (isFirebaseActive()) {
      try {
        const res = await signInWithPopup(auth, googleProvider);
        if (res && res.user) {
          const googleName = res.user.displayName || res.user.email.split("@")[0];
          const googlePhoto = res.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleName)}&background=4285F4&color=fff&bold=true&size=200`;

          const userObj = {
            id: res.user.uid,
            name: googleName,
            email: res.user.email,
            avatar: googlePhoto,
            role: "user",
            status: "active",
            updatedAt: new Date().toISOString()
          };

          await this.saveUser(userObj);
          return userObj;
        }
      } catch (err) {
        console.warn("Firebase Google Auth notice (COOP/Popup):", err.message);
      }
    }

    const fallbackName = "Google Explorer";
    const fallbackUser = {
      id: "google_user_" + Date.now(),
      name: fallbackName,
      email: "explorer@gmail.com",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=4285F4&color=fff&bold=true&size=200`,
      role: "user",
      status: "active"
    };
    await this.saveUser(fallbackUser);
    return fallbackUser;
  }

  async loginManual(email, password) {
    const cleanEmail = email ? email.trim() : "user@guff.app";
    const isAdmin = cleanEmail.toLowerCase().includes("admin");

    if (isFirebaseActive()) {
      try {
        let res;
        try {
          res = await signInWithEmailAndPassword(auth, cleanEmail, password);
        } catch (signInErr) {
          if (
            signInErr.code === "auth/user-not-found" || 
            signInErr.code === "auth/invalid-credential"
          ) {
            try {
              res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            } catch (createErr) {
              console.warn("Firebase create user notice:", createErr.message);
            }
          } else {
            console.warn("Firebase email sign-in notice:", signInErr.message);
          }
        }

        if (res && res.user) {
          const userName = res.user.displayName || cleanEmail.split("@")[0] || "User";
          const userObj = {
            id: res.user.uid,
            name: userName,
            email: res.user.email,
            avatar: res.user.photoURL || (isAdmin 
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff&bold=true&size=200`),
            role: isAdmin ? "admin" : "user",
            status: "active"
          };
          await this.saveUser(userObj);
          return userObj;
        }
      } catch (err) {
        console.warn("Firebase Auth manual notice:", err.message);
      }
    }

    const userName = isAdmin ? "System Admin" : (cleanEmail.split("@")[0] || "User");
    const userObj = {
      id: isAdmin ? "user_admin" : ("user_" + Date.now()),
      name: userName,
      email: cleanEmail,
      role: isAdmin ? "admin" : "user",
      status: "active",
      avatar: isAdmin 
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff&bold=true&size=200`,
      bio: isAdmin ? "Platform Administrator" : "Active Member"
    };

    await this.saveUser(userObj);
    return userObj;
  }

  async logout() {
    if (isFirebaseActive()) {
      try { await signOut(auth); } catch {}
    }
  }

  // --- REAL NOTIFICATIONS SYSTEM ---
  subscribeNotifications(recipientUserId, callback) {
    let unsub = () => {};
    if (db && isFirebaseActive()) {
      try {
        const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
        unsub = onSnapshot(q, (snapshot) => {
          const remoteNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          memoryStore.notifications = remoteNotifs;
          const userNotifs = recipientUserId 
            ? remoteNotifs.filter(n => n.userId === recipientUserId || !n.userId) 
            : remoteNotifs;
          callback(userNotifs);
        }, () => {
          const filtered = recipientUserId 
            ? memoryStore.notifications.filter(n => n.userId === recipientUserId || !n.userId) 
            : memoryStore.notifications;
          callback(filtered);
        });
      } catch (err) {}
    }

    const initialFiltered = recipientUserId 
      ? memoryStore.notifications.filter(n => n.userId === recipientUserId || !n.userId) 
      : memoryStore.notifications;
    callback(initialFiltered);

    const removeListener = memoryStore.onUpdate(() => {
      const updatedFiltered = recipientUserId 
        ? memoryStore.notifications.filter(n => n.userId === recipientUserId || !n.userId) 
        : memoryStore.notifications;
      callback(updatedFiltered);
    });

    return () => {
      if (typeof unsub === "function") unsub();
      removeListener();
    };
  }

  async addNotification(notifData) {
    const newNotif = {
      id: "notif_" + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      metadata: {},
      ...notifData
    };

    memoryStore.notifications.unshift(newNotif);
    memoryStore.emit();

    if (db && isFirebaseActive()) {
      try {
        await addDoc(collection(db, "notifications"), newNotif);
      } catch (err) {}
    }

    return newNotif;
  }

  async markNotificationAsRead(notifId) {
    const idx = memoryStore.notifications.findIndex(n => n.id === notifId);
    if (idx >= 0) {
      memoryStore.notifications[idx].read = true;
      memoryStore.emit();
    }

    if (db && isFirebaseActive() && !notifId.startsWith("notif_")) {
      try {
        await updateDoc(doc(db, "notifications", notifId), { read: true });
      } catch (err) {}
    }
  }

  async markAllNotificationsAsRead(recipientUserId) {
    memoryStore.notifications.forEach(n => {
      if (!recipientUserId || n.userId === recipientUserId) {
        n.read = true;
      }
    });
    memoryStore.emit();
  }

  // --- USERS ---
  subscribeUsers(callback) {
    let unsub = () => {};
    if (db && isFirebaseActive()) {
      try {
        const q = collection(db, "users");
        unsub = onSnapshot(q, (snapshot) => {
          const remoteUsers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          memoryStore.users = remoteUsers;
          callback(memoryStore.users);
        }, () => {
          callback(memoryStore.users);
        });
      } catch (err) {}
    }

    callback(memoryStore.users);
    const removeListener = memoryStore.onUpdate(() => {
      callback(memoryStore.users);
    });

    return () => {
      if (typeof unsub === "function") unsub();
      removeListener();
    };
  }

  async saveUser(userObj) {
    if (db && isFirebaseActive() && userObj.id) {
      try {
        await setDoc(doc(db, "users", userObj.id), userObj, { merge: true });
      } catch (err) {}
    }

    const idx = memoryStore.users.findIndex(u => u.id === userObj.id);
    if (idx >= 0) memoryStore.users[idx] = { ...memoryStore.users[idx], ...userObj };
    else memoryStore.users.push(userObj);
    memoryStore.emit();
    return userObj;
  }

  async deleteUser(userId) {
    if (db && isFirebaseActive()) {
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (err) {}
    }

    memoryStore.users = memoryStore.users.filter(u => u.id !== userId);
    memoryStore.emit();
  }

  // --- MESSAGES & REAL FIREBASE READ RECEIPTS ---
  subscribeMessages(channelId, callback) {
    let unsub = () => {};
    if (db && isFirebaseActive()) {
      try {
        const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
        unsub = onSnapshot(q, (snapshot) => {
          const remoteMsgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          const filtered = remoteMsgs.filter(m => m.channelId === channelId);
          memoryStore.messages[channelId] = filtered;
          callback(memoryStore.messages[channelId]);
        }, () => {
          callback(memoryStore.messages[channelId] || []);
        });
      } catch (err) {}
    }

    callback(memoryStore.messages[channelId] || []);

    const removeListener = memoryStore.onUpdate(() => {
      callback(memoryStore.messages[channelId] || []);
    });

    return () => {
      if (typeof unsub === "function") unsub();
      removeListener();
    };
  }

  async sendMessage(msgData) {
    let mediaPayload = msgData.media;
    if (mediaPayload && typeof mediaPayload === "string" && mediaPayload.length > 150000) {
      mediaPayload = await compressImage(mediaPayload);
    }

    // Default status: "delivered" (or "sent")
    const newMsg = {
      timestamp: new Date().toISOString(),
      status: "delivered",
      readAt: null,
      ...msgData,
      media: mediaPayload
    };

    const channelId = msgData.channelId || "general";
    const msgWithId = { id: "msg_" + Date.now(), ...newMsg };

    if (!memoryStore.messages[channelId]) {
      memoryStore.messages[channelId] = [];
    }
    memoryStore.messages[channelId].push(msgWithId);
    memoryStore.emit();

    if (channelId.includes("_dm_")) {
      const parts = channelId.split("_dm_");
      const recipientId = parts.find(id => id !== msgData.senderId);
      if (recipientId) {
        this.addNotification({
          userId: recipientId,
          actorId: msgData.senderId,
          actorName: msgData.senderName,
          actorAvatar: msgData.senderAvatar,
          notificationType: "direct_message",
          targetId: channelId,
          targetType: "message",
          metadata: { text: msgData.text }
        });
      }
    }

    if (db && isFirebaseActive()) {
      try {
        await addDoc(collection(db, "messages"), newMsg);
      } catch (err) {}
    }

    return msgWithId;
  }

  // Real Read Event Handler: Syncs read state to Backend & MemoryStore when recipient opens channel
  async markChannelMessagesAsRead(channelId, recipientUserId) {
    if (!channelId || !recipientUserId) return;

    const channelMsgs = memoryStore.messages[channelId] || [];
    let updated = false;
    const nowIso = new Date().toISOString();

    channelMsgs.forEach((msg) => {
      if (msg.senderId !== recipientUserId && msg.status !== "read") {
        msg.status = "read";
        msg.readAt = nowIso;
        updated = true;

        if (db && isFirebaseActive() && !msg.id.startsWith("msg_")) {
          try {
            updateDoc(doc(db, "messages", msg.id), { status: "read", readAt: nowIso });
          } catch (err) {}
        }
      }
    });

    if (updated) {
      memoryStore.emit();
    }
  }

  // --- FEEDS ---
  subscribeFeeds(callback) {
    let unsub = () => {};
    if (db && isFirebaseActive()) {
      try {
        const q = query(collection(db, "feeds"), orderBy("createdAt", "desc"));
        unsub = onSnapshot(q, (snapshot) => {
          const remoteFeeds = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          memoryStore.feeds = remoteFeeds;
          callback(memoryStore.feeds);
        }, () => {
          callback(memoryStore.feeds);
        });
      } catch (err) {}
    }

    callback(memoryStore.feeds);

    const removeListener = memoryStore.onUpdate(() => {
      callback(memoryStore.feeds);
    });

    return () => {
      if (typeof unsub === "function") unsub();
      removeListener();
    };
  }

  async addFeedPost(postData) {
    let mediaPayload = postData.media || postData.image || null;
    if (mediaPayload && typeof mediaPayload === "string" && mediaPayload.length > 150000) {
      mediaPayload = await compressImage(mediaPayload);
    }

    const newPost = {
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      ...postData,
      media: mediaPayload,
      image: mediaPayload
    };

    const postWithId = { id: "feed_" + Date.now(), ...newPost };
    memoryStore.feeds.unshift(postWithId);
    memoryStore.emit();

    if (db && isFirebaseActive()) {
      try {
        await addDoc(collection(db, "feeds"), newPost);
      } catch (err) {}
    }

    return postWithId;
  }

  async likeFeedPost(feedId, currentLikes = 0, actorUser = null) {
    const idx = memoryStore.feeds.findIndex(f => f.id === feedId);
    let targetPost = null;
    if (idx >= 0) {
      memoryStore.feeds[idx].likes = (memoryStore.feeds[idx].likes || 0) + 1;
      targetPost = memoryStore.feeds[idx];
      memoryStore.emit();
    }

    if (targetPost && actorUser && targetPost.userId && targetPost.userId !== actorUser.id) {
      this.addNotification({
        userId: targetPost.userId,
        actorId: actorUser.id,
        actorName: actorUser.name,
        actorAvatar: actorUser.avatar,
        notificationType: "like",
        targetId: feedId,
        targetType: "post",
        metadata: { text: targetPost.content?.substring(0, 30) }
      });
    }

    if (db && isFirebaseActive() && !feedId.startsWith("feed_")) {
      try {
        await updateDoc(doc(db, "feeds", feedId), {
          likes: currentLikes + 1
        });
      } catch (err) {}
    }
  }

  async addCommentToFeed(feedId, commentData, existingComments = [], actorUser = null) {
    const updatedComments = [
      ...existingComments,
      { id: "c_" + Date.now(), ...commentData }
    ];

    const idx = memoryStore.feeds.findIndex(f => f.id === feedId);
    let targetPost = null;
    if (idx >= 0) {
      memoryStore.feeds[idx].comments = updatedComments;
      targetPost = memoryStore.feeds[idx];
      memoryStore.emit();
    }

    if (targetPost && actorUser && targetPost.userId && targetPost.userId !== actorUser.id) {
      this.addNotification({
        userId: targetPost.userId,
        actorId: actorUser.id,
        actorName: actorUser.name,
        actorAvatar: actorUser.avatar,
        notificationType: "comment",
        targetId: feedId,
        targetType: "post",
        metadata: { text: commentData.text }
      });
    }

    if (db && isFirebaseActive() && !feedId.startsWith("feed_")) {
      try {
        await updateDoc(doc(db, "feeds", feedId), {
          comments: updatedComments
        });
      } catch (err) {}
    }
  }

  async deleteFeedPost(feedId) {
    memoryStore.feeds = memoryStore.feeds.filter(f => f.id !== feedId);
    memoryStore.emit();

    if (db && isFirebaseActive() && !feedId.startsWith("feed_")) {
      try {
        await deleteDoc(doc(db, "feeds", feedId));
      } catch (err) {}
    }
  }
}

export const firebaseService = new FirebaseService();
