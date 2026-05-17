// ------------------------------------------------------
// FIREBASE IMPORTS
// ------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  update, 
  remove,
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
// DEVICE + OS + BROWSER DETECTION
// ------------------------------------------------------
function getDeviceInfo() {
  const ua = navigator.userAgent.toLowerCase();

  let os = "Unknown";
  if (ua.includes("cros")) os = "ChromeOS";
  else if (/ipad|iphone|ipod/.test(ua)) os = "iOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "Mac";
  else if (ua.includes("linux")) os = "Linux";

  let deviceType = "Desktop";
  if (ua.includes("cros")) deviceType = "Chromebook";
  else if (/ipad/.test(ua)) deviceType = "Tablet";
  else if (/iphone|ipod/.test(ua)) deviceType = "Phone";
  else if (/android/.test(ua)) {
    deviceType = window.innerWidth > 900 ? "Tablet" : "Phone";
  }

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
// CHECK BAN ON LOAD
// ------------------------------------------------------
export function checkBanOnLoad() {
  const bannedRef = ref(db, "banned/" + userId);

  onValue(bannedRef, (snap) => {
    const isBanned = snap.exists();

    if (isBanned || localStorage.getItem("arcade_banned") === "true") {
      localStorage.setItem("arcade_banned", "true");
      showBannedScreen();
    }
  });
}

// ------------------------------------------------------
// SHOW BANNED SCREEN
// ------------------------------------------------------
function showBannedScreen() {
  document.body.innerHTML = `
    <div style="
      position:fixed; 
      inset:0; 
      background:black; 
      color:#00eaff; 
      font-family:Consolas; 
      display:flex; 
      align-items:center; 
      justify-content:center; 
      font-size:32px; 
      text-shadow:0 0 15px #00eaff;
    ">
      ACCESS DENIED — BANNED
    </div>
  `;
}

// ------------------------------------------------------
// SHOW KICKED SCREEN
// ------------------------------------------------------
function showKickedScreen() {
  document.body.innerHTML = `
    <div style="
      position:fixed; 
      inset:0; 
      background:black; 
      color:#00eaff; 
      font-family:Consolas; 
      display:flex; 
      align-items:center; 
      justify-content:center; 
      font-size:32px; 
      text-shadow:0 0 15px #00eaff;
    ">
      ACCESS DENIED — KICKED
    </div>
  `;
}

// ------------------------------------------------------
// REGISTER USER
// ------------------------------------------------------
export function registerUser() {
  const info = getDeviceInfo();
  const userRef = ref(db, "users/" + userId);

  // If banned, show screen
  checkBanOnLoad();

  set(userRef, {
    os: info.os,
    browser: info.browser,
    screen: info.screenSize,
    deviceType: info.deviceType,
    game: "none",
    timestamp: Date.now()
  });

  // Auto-remove on disconnect
  onDisconnect(userRef).remove();
}

// ------------------------------------------------------
// UPDATE GAME
// ------------------------------------------------------
export function updateGame(gameName) {
  const userRef = ref(db, "users/" + userId);
  update(userRef, {
    game: gameName,
    timestamp: Date.now()
  });
}

// ------------------------------------------------------
// LISTEN FOR USERS
// ------------------------------------------------------
export function onUsersUpdate(callback) {
  const usersRef = ref(db, "users/");
  onValue(usersRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
}

// ------------------------------------------------------
// GET BANNED LIST
// ------------------------------------------------------
export function getBannedList(callback) {
  const bannedRef = ref(db, "banned/");
  onValue(bannedRef, (snap) => {
    callback(snap.val() || {});
  });
}

// ------------------------------------------------------
// KICK USER
// ------------------------------------------------------
export function kickUser(id) {
  const userRef = ref(db, "users/" + id);
  remove(userRef);

  // If kicking yourself, show screen
  if (id === userId) {
    showKickedScreen();
  }
}

// ------------------------------------------------------
// BAN USER
// ------------------------------------------------------
export function banUser(id) {
  const bannedRef = ref(db, "banned/" + id);
  set(bannedRef, true);

  const userRef = ref(db, "users/" + id);
  remove(userRef);

  // If banning yourself
  if (id === userId) {
    localStorage.setItem("arcade_banned", "true");
    showBannedScreen();
  }
}

// ------------------------------------------------------
// UNBAN USER
// ------------------------------------------------------
export function unbanUser(id) {
  const bannedRef = ref(db, "banned/" + id);
  remove(bannedRef);

  if (id === userId) {
    localStorage.removeItem("arcade_banned");
    location.reload();
  }
}
