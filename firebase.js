// ------------------------------
// Firebase Initialization
// ------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onDisconnect, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrg276CwNLSwbRc0l-rEH5vga5GvbBU_Q",
  authDomain: "arcade-database-443a9.firebaseapp.com",
  databaseURL: "https://arcade-database-443a9-default-rtdb.firebaseio.com",
  projectId: "arcade-database-443a9",
  storageBucket: "arcade-database-443a9.firebasestorage.app",
  messagingSenderId: "247055306423",
  appId: "1:247055306423:web:a66546856e6c823f228732",
  measurementId: "G-Y6DPYFCV7K"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ------------------------------
// Anonymous Session ID
// ------------------------------
export const sessionID = "User_" + Math.random().toString(36).substring(2, 10).toUpperCase();

// ------------------------------
// Device Info (allowed + safe)
// ------------------------------
function getDeviceInfo() {
  const ua = navigator.userAgent.toLowerCase();
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "Mac";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  let browser = "Unknown";
  if (ua.includes("chrome")) browser = "Chrome";
  if (ua.includes("edg")) browser = "Edge";
  if (ua.includes("firefox")) browser = "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";

  const screenSize = `${window.innerWidth}x${window.innerHeight}`;
  const deviceType = window.innerWidth < 768 ? "Phone" : "Desktop";

  return { os, browser, screenSize, deviceType };
}

// ------------------------------
// Register User Online
// ------------------------------
export function registerUser() {
  const info = getDeviceInfo();

  const userRef = ref(db, "users/" + sessionID);
  set(userRef, {
    sessionID,
    game: "none",
    online: true,
    ...info,
    timestamp: Date.now()
  });

  // Auto-remove on disconnect
  onDisconnect(userRef).remove();
}

// ------------------------------
// Update Game
// ------------------------------
export function updateGame(gameName) {
  const userRef = ref(db, "users/" + sessionID);
  update(userRef, {
    game: gameName,
    timestamp: Date.now()
  });
}

// ------------------------------
// Listen for all users (Dev Mode)
// ------------------------------
export function onUsersUpdate(callback) {
  const usersRef = ref(db, "users/");
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
}
