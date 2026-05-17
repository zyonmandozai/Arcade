// ------------------------------------------------------
// FIREBASE IMPORTS
// ------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  update, 
  onValue, 
  onDisconnect 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ------------------------------------------------------
// YOUR FIREBASE CONFIG
// ------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCrg276CwNLSwbRc0l-rEH5vga5GvbBU_Q",
  authDomain: "arcade-database-443a9.firebaseapp.com",
  projectId: "arcade-database-443a9",
  storageBucket: "arcade-database-443a9.firebasestorage.app",
  messagingSenderId: "247055306423",
  appId: "1:247055306423:web:a66546856e6c823f228732",
  measurementId: "G-Y6DPYFCV7K",
  databaseURL: "https://arcade-database-443a9-default-rtdb.firebaseio.com"
};

// ------------------------------------------------------
// INIT FIREBASE
// ------------------------------------------------------
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ------------------------------------------------------
// DEVICE + OS + BROWSER DETECTION (BULLETPROOF)
// ------------------------------------------------------
function getDeviceInfo() {
  const ua = navigator.userAgent.toLowerCase();

  // ------------------------------
  // OS DETECTION
  // ------------------------------
  let os = "Unknown";

  if (ua.includes("cros")) os = "ChromeOS";                     // Chromebooks
  else if (/ipad|iphone|ipod/.test(ua)) os = "iOS";             // iPad + iPhone
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "Mac";
  else if (ua.includes("linux")) os = "Linux";

  // ------------------------------
  // DEVICE TYPE DETECTION
  // ------------------------------
  let deviceType = "Desktop";

  if (ua.includes("cros")) deviceType = "Chromebook";
  else if (/ipad/.test(ua)) deviceType = "Tablet";
  else if (/iphone|ipod/.test(ua)) deviceType = "Phone";
  else if (/android/.test(ua)) {
    if (window.innerWidth > 900) deviceType = "Tablet";
    else deviceType = "Phone";
  }

  // ------------------------------
  // BROWSER DETECTION
  // ------------------------------
  let browser = "Unknown";
  if (ua.includes("opr") || ua.includes("opera")) browser = "Opera";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari")) browser = "Safari";

  const screenSize = `${window.innerWidth}x${window.innerHeight}`;

  return { os, browser, screenSize, deviceType };
}

// ------------------------------------------------------
// USER ID GENERATION
// ------------------------------------------------------
function generateUserId() {
  return "User_" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

let userId = sessionStorage.getItem("arcadeUserId");
if (!userId) {
  userId = generateUserId();
  sessionStorage.setItem("arcadeUserId", userId);
}

// ------------------------------------------------------
// REGISTER USER IN FIREBASE
// ------------------------------------------------------
export function registerUser() {
  const info = getDeviceInfo();
  const userRef = ref(db, "users/" + userId);

  set(userRef, {
    os: info.os,
    browser: info.browser,
    screen: info.screenSize,
    deviceType: info.deviceType,
    game: "none",
    timestamp: Date.now()
  });

  // Remove user when tab closes, browser closes, device sleeps, etc.
  onDisconnect(userRef).remove();
}

// ------------------------------------------------------
// UPDATE GAME (WHEN USER SELECTS A GAME)
// ------------------------------------------------------
export function updateGame(gameName) {
  const userRef = ref(db, "users/" + userId);
  update(userRef, {
    game: gameName,
    timestamp: Date.now()
  });
}

// ------------------------------------------------------
// REALTIME LISTENER FOR DEVTOOLS
// ------------------------------------------------------
export function onUsersUpdate(callback) {
  const usersRef = ref(db, "users/");
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
}
