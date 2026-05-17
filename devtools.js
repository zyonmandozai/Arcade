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
  panel.style.overflow = "hidden";
  panel.style.resize = "none";

  // Drag bar
  dragBar = document.createElement("div");
  dragBar.style.width = "100%";
  dragBar.style.height = "32px";
  dragBar.style.background = "rgba(0,0,0,0.6)";
  dragBar.style.borderBottom = "1px solid #00eaff";
  dragBar.style.cursor = "grab";
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
  content.textContent = "Loading users...";

  panel.appendChild(dragBar);
  panel.appendChild(content);
  document.body.appendChild(panel);

  // ------------------------------
  // PERFECT DRAGGING USING POINTER EVENTS
  // ------------------------------
  let dragging = false;
  let startX = 0, startY = 0;
  let startLeft = 0, startTop = 0;

  dragBar.addEventListener("pointerdown", (e) => {
    dragging = true;
    dragBar.setPointerCapture(e.pointerId);
    dragBar.style.cursor = "grabbing";

    startX = e.clientX;
    startY = e.clientY;

    startLeft = panel.offsetLeft;
    startTop = panel.offsetTop;

    panel.style.transform = ""; // stop centering after first drag
  });

  dragBar.addEventListener("pointerup", (e) => {
    dragging = false;
    dragBar.releasePointerCapture(e.pointerId);
    dragBar.style.cursor = "grab";
  });

  dragBar.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    panel.style.left = startLeft + dx + "px";
    panel.style.top = startTop + dy + "px";
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

    if (!blank) return;

    toggleDevMode();
  }
});

// ------------------------------
// Realtime User Updates (WORKING)
// ------------------------------
function setupUserListener() {
  const box = document.getElementById("devUsers");

  // Wait for Firebase to be ready
  setTimeout(() => {
    onUsersUpdate((users) => {
      let out = "ACTIVE USERS\n\n";

      const keys = Object.keys(users || {});
      out += `Total: ${keys.length}\n\n`;

      keys.forEach((id) => {
        const u = users[id];
        out += `${id}\n`;
        out += `  Game: ${u.game}\n`;
        out += `  OS: ${u.os}\n`;
        out += `  Browser: ${u.browser}\n`;
        out += `  Screen: ${u.screenSize}\n`;
        out += `\n`;
      });

      box.textContent = out;
    });
  }, 500);
}

// ------------------------------
// Init
// ------------------------------
createDevPanel();
createWatermark();
setupUserListener();
