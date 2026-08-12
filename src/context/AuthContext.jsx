import React, { createContext, useContext, useState, useEffect } from "react";
import { firebaseService } from "../firebase/firebaseService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Pure In-Memory User Session
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Read URL Hash for active tab routing (/#feed, /#chat, /#map, /#admin, /#search, /#profile)
  const getTabFromHash = () => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (["feed", "chat", "map", "admin", "search", "profile"].includes(hash)) {
      return hash;
    }
    return "feed";
  };

  const [activeTab, setActiveTabState] = useState(getTabFromHash);
  const [activeChannel, setActiveChannel] = useState("general");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const setActiveTab = (tabName) => {
    setActiveTabState(tabName);
    window.location.hash = `#${tabName}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getTabFromHash();
      setActiveTabState(newTab);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!currentUser && (activeTab === "chat" || activeTab === "admin")) {
      setActiveTab("feed");
    }
  }, [currentUser]);

  // Real-time subscription to real database notifications for currentUser
  useEffect(() => {
    const unsub = firebaseService.subscribeNotifications(currentUser?.id, (fetchedNotifs) => {
      setNotifications(fetchedNotifs);
    });

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [currentUser]);

  const showToast = (msg, type = "info") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const requireAuthForTab = (tabName) => {
    if (!currentUser && (tabName === "chat" || tabName === "admin" || tabName === "profile")) {
      setAuthPromptReason("Sign in to access Live Messages, Profiles, or Admin Panel.");
      setIsAuthModalOpen(true);
      return false;
    }
    setActiveTab(tabName);
    return true;
  };

  // Real Follow / Unfollow System with Database Notification Event
  const toggleFollow = async (targetUserId, targetUserName = "User") => {
    if (!currentUser) {
      showToast("Please sign in to follow members", "error");
      setIsAuthModalOpen(true);
      return;
    }

    const currentFollowing = currentUser.following || [];
    const isFollowing = currentFollowing.includes(targetUserId);

    let updatedFollowing;
    if (isFollowing) {
      updatedFollowing = currentFollowing.filter(id => id !== targetUserId);
      showToast(`Unfollowed ${targetUserName}`, "info");
    } else {
      updatedFollowing = [...currentFollowing, targetUserId];
      showToast(`Now following ${targetUserName}! 🎉`, "success");

      // Trigger Real Database Notification for Follow Event
      await firebaseService.addNotification({
        userId: targetUserId,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorAvatar: currentUser.avatar,
        notificationType: "follow",
        targetId: currentUser.id,
        targetType: "user",
        metadata: { text: "started following you" }
      });
    }

    const updatedUser = {
      ...currentUser,
      following: updatedFollowing
    };

    setCurrentUser(updatedUser);
    await firebaseService.saveUser(updatedUser);
  };

  const loginGoogle = async (customGoogleData) => {
    try {
      const user = await firebaseService.loginWithGoogle(customGoogleData);
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      setAuthPromptReason("");
      showToast(`Logged in with Google as ${user.name} (${user.email})`, "success");
    } catch (err) {
      showToast("Google login error: " + err.message, "error");
    }
  };

  const loginManual = async (email, password) => {
    try {
      const user = await firebaseService.loginManual(email, password);
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      setAuthPromptReason("");
      showToast(`Signed in as ${user.name} (${user.role.toUpperCase()})`, "success");
    } catch (err) {
      showToast("Login error: " + err.message, "error");
    }
  };

  const logout = async () => {
    await firebaseService.logout();
    setCurrentUser(null);
    setActiveTab("feed");
    showToast("Logged out successfully.", "info");
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const unreadDirectMessageNotifications = notifications.filter(
    (notification) => !notification.read && notification.notificationType === "direct_message"
  );
  const unreadMessageSenderIds = [...new Set(
    unreadDirectMessageNotifications.map((notification) => notification.actorId).filter(Boolean)
  )];

  const markDirectMessageNotificationsAsRead = async (channelId) => {
    const matchingNotifications = notifications.filter(
      (notification) => !notification.read
        && notification.notificationType === "direct_message"
        && notification.targetId === channelId
    );

    if (!matchingNotifications.length) return;

    const notificationIds = new Set(matchingNotifications.map((notification) => notification.id));
    setNotifications((current) => current.map((notification) => (
      notificationIds.has(notification.id) ? { ...notification, read: true } : notification
    )));

    await Promise.all(matchingNotifications.map((notification) => (
      firebaseService.markNotificationAsRead(notification.id)
    )));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        requireAuthForTab,
        activeChannel,
        setActiveChannel,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authPromptReason,
        setAuthPromptReason,
        toastMessage,
        showToast,
        toggleFollow,
        notifications,
        unreadNotificationCount,
        unreadDirectMessageNotifications,
        unreadMessageSenderIds,
        unreadMessageSenderCount: unreadMessageSenderIds.length,
        markDirectMessageNotificationsAsRead,
        loginGoogle,
        loginManual,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
