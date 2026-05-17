import { onUsersUpdate } from "./firebase.js";

let devMode = false;
let panel, watermark;

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
  panel.style.padding = "12px";
  panel.style.zIndex = "999999";
  panel.style.display = "none";
  panel.style.resize = "both";
  panel.style.overflow = "auto";
  panel.style.cursor = "move";

  panel.innerHTML = `
    <div style="font-size:16px;margin-bottom:8px;">DEV CONSOLE</div>
    <div id="devUsers" style="white-space:pre;overflow-y:auto;height:300px;"></div>
  `;

  document.body.appendChild(panel);

  // Dragging
  let dragging = false;
  let offsetX, offsetY;

  panel.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
  });

  document.addEventListener("mouseup", () => dragging = false);

  document.addEventListener("mousemove", (e) => {
    if (dragging) {
      panel.style.left = e.clientX - offsetX + "px";
      panel.style.top = e.clientY - offsetY + "px";
      panel.style.transform = ""; // stop centering once moved
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
// Show / Hide Dev Mode
// ------------------------------
function showDevMode() {
  devMode = true;
  if (panel) panel.style.display = "block";
  if (watermark) watermark.style.display = "block";
}

function hideDevMode() {
  devMode = false;
  if (panel) panel.style.display = "none";
  if (watermark) watermark.style.display = "none";
}

// ------------------------------
// Toggle with CTRL+ALT+SHIFT+D
// ------------------------------
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === "d") {
    const iframe = document.querySelector("iframe");
    const blank =
      !iframe ||
      iframe.src === "" ||
      iframe.src === "about:blank" ||
      iframe.src.endsWith("about:blank");

    // Only allow dev mode when no game is loaded
    if (!blank) return;

    if (devMode) {
      hideDevMode();
    } else {
      showDevMode();
    }
  }
});

// ------------------------------
// Realtime User Updates
// ------------------------------
function setupUserListener() {
  const box = document.getElementById("devUsers");
  if (!box) return;

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
