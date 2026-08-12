import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfigKeys } from "./firebaseConfigKeys";

// Combine config from firebaseConfigKeys.js, localStorage, and .env
export const getFirebaseConfig = () => {
  // 1. Check firebaseConfigKeys.js
  if (firebaseConfigKeys && firebaseConfigKeys.apiKey && firebaseConfigKeys.apiKey.trim().length > 5) {
    return firebaseConfigKeys;
  }

  // 2. Check localStorage
  try {
    const custom = localStorage.getItem("guff_firebase_config");
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.apiKey.trim().length > 5) return parsed;
    }
  } catch (err) {}

  // 3. Fallback to .env
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigKeys.apiKey || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigKeys.authDomain || "guff-app-74476.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigKeys.projectId || "guff-app-74476",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigKeys.storageBucket || "guff-app-74476.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigKeys.messagingSenderId || "389567236021",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigKeys.appId || "1:389567236021:web:6cbd00fcc56b8d0ae9fbfc",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
  };
};

export const firebaseConfig = getFirebaseConfig();

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (firebaseConfig.apiKey && firebaseConfig.apiKey.trim().length > 10) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  } catch (err) {
    console.warn("Firebase App init notice:", err.message);
  }

  if (app) {
    try {
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    } catch (authErr) {
      console.warn("Firebase Auth notice:", authErr.message);
    }

    try {
      db = getFirestore(app);
    } catch (dbErr) {
      console.warn("Firebase Firestore notice:", dbErr.message);
    }
  }
} else {
  console.info("ℹ️ Firebase API Key not provided yet in firebaseConfigKeys.js or .env. Interactive mode active.");
}

export { app, auth, db, googleProvider };
