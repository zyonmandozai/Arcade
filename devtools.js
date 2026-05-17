import { onUsersUpdate } from "./firebase.js";

let devMode = false;
let panel, watermark, dragBar;

// ------------------------------
// Create Dev Panel UI
// ------------------------------
function createDevPanel() {
  panel = document.createElement("div");
  panel.id = "devPanel";
  panel.style.position = "fixed";
  panel.style.left = "50%";
  panel.style.top = "50%";
  panel.style.transform = "translate(-50%, -50%)";
  panel.style.width = "420px";
  panel.style.height = "380px";
  panel.style.background = "rgba(0,0,0,0.85)";
  panel.style.border = "2px solid #00eaff";
  panel.style.boxShadow = "0 0 20px #00eaff";
  panel.style.borderRadius = "12px";
  panel.style.color = "#00ffea";
  panel.style.fontFamily = "Consolas, monospace";
  panel.style.fontSize = "13px";
  panel.style.padding = "0";
  panel.style.zIndex = "999999";
  panel.style.display = "none";
  panel.style.resize = "both";
  panel.style.overflow = "auto";

  // Drag bar (only this moves the panel)
  dragBar = document.createElement("div");
  dragBar.style.width = "100%";
  dragBar.style.height = "32px";
  dragBar.style.background = "rgba(0,0,0,0.6)";
  dragBar.style.borderBottom = "1px solid #00eaff";
  dragBar.style.cursor = "move";
  dragBar.style.display = "flex";
  dragBar.style.alignItems = "center";
  dragBar.style.paddingLeft = "10px";
  dragBar.textContent = "DEV CONSOLE";

  const content = document.createElement("div");
  content.id = "devUsers";
  content.style.whiteSpace = "pre";
  content.style.padding = "10px";
  content.style.height = "calc(100% - 32px)";
  content.style.overflowY = "auto";

  panel.appendChild(dragBar);
  panel.appendChild(content);
  document.body.appendChild(panel);

  // Dragging logic
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  dragBar.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    panel.style.transform = ""; // stop centering
  });

  document.addEventListener("mouseup", () => dragging = false);

  document.addEventListener("mousemove", (e) => {
    if (dragging) {
      panel.style.left = e.clientX - offsetX + "px";
      panel.style.top = e.clientY - offsetY + "px";
    }
  });
}

// ------------------------------
// Watermark (bottom-left)
// ------------------------------
function createWatermark() {
  watermark = document.createElement("div");
  watermark.textContent = "DEV MODE ACTIVE";
  watermark.style.position = "fixed";
  watermark.style.bottom = "10px";
  watermark.style.left = "10px";
  watermark.style.color = "#00eaff";
  watermark.style.fontFamily = "Consolas";
  watermark.style.fontSize = "14px";
  watermark.style.opacity = "0.8";
  watermark.style.textShadow = "0 0 10px #00eaff";
  watermark.style.zIndex = "999999";
  watermark.style.display = "none";
  document.body.appendChild(watermark);
}

// ------------------------------
// Toggle Dev Mode
// ------------------------------
function toggleDevMode() {
  devMode = !devMode;
  panel.style.display = devMode ? "block" : "none";
  watermark.style.display = devMode ? "block" : "none";
}

// ------------------------------
// Keybind: CTRL + ALT + SHIFT + D
// ------------------------------
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === "d") {
    const iframe = document.querySelector("iframe");
    const blank =
      !iframe ||
      iframe.src === "" ||
      iframe.src === "about:blank" ||
      iframe.src.endsWith("about:blank");

    if (!blank) return; // only when no game is loaded

    toggleDevMode();
  }
});

// ------------------------------
// Realtime User Updates
// ------------------------------
function setupUserListener() {
  const box = document.getElementById("devUsers");

  onUsersUpdate((users) => {
    let out = "ACTIVE USERS:\n\n";
    const keys = Object.keys(users || {});
    out += `Total: ${keys.length}\n\n`;

    keys.forEach((id) => {
      const u = users[id];
      out += `${id} — ${u.game} — ${u.os} — ${u.browser} — ${u.screenSize}\n`;
    });

    box.textContent = out;
  });
}

// ------------------------------
// Init
// ------------------------------
createDevPanel();
createWatermark();
setupUserListener();
