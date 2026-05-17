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
  panel.style.minWidth = "620px";
  panel.style.minHeight = "500px";
  panel.style.maxHeight = "90vh";
  panel.style.background = "rgba(0,0,0,0.85)";
  panel.style.border = "2px solid #00eaff";
  panel.style.boxShadow = "0 0 25px #00eaff";
  panel.style.borderRadius = "12px";
  panel.style.color = "#00ffea";
  panel.style.fontFamily = "Consolas, monospace";
  panel.style.fontSize = "13px";
  panel.style.padding = "0";
  panel.style.zIndex = "999999";
  panel.style.display = "none";
  panel.style.overflow = "hidden";
  panel.style.resize = "both";
  panel.style.boxSizing = "border-box";

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

  // Content area (scrolls)
  const content = document.createElement("div");
  content.id = "devUsers";
  content.style.whiteSpace = "pre";
  content.style.padding = "10px";
  content.style.overflowY = "auto";
  content.style.maxHeight = "50%";
  content.textContent = "Loading users...";

  // Graph area (auto-expands)
  const graphArea = document.createElement("div");
  graphArea.id = "devGraphs";
  graphArea.style.whiteSpace = "pre";
  graphArea.style.padding = "10px";
  graphArea.style.borderTop = "1px solid #00eaff";
  graphArea.style.background = "rgba(0,0,0,0.4)";
  graphArea.style.textShadow = "0 0 5px #00eaff";
  graphArea.style.overflow = "visible";
  graphArea.textContent = "Graphs loading...";

  panel.appendChild(dragBar);
  panel.appendChild(content);
  panel.appendChild(graphArea);
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

    panel.style.transform = "";
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
// ASCII BAR GRAPH HELPER
// ------------------------------
function makeBar(count, max) {
  const barLength = Math.floor((count / max) * 30);
  return "█".repeat(barLength) + " ".repeat(30 - barLength);
}

// ------------------------------
// Realtime User Updates (Analytics + Graphs)
// ------------------------------
function setupUserListener() {
  const box = document.getElementById("devUsers");
  const graphBox = document.getElementById("devGraphs");

  setTimeout(() => {
    onUsersUpdate((users) => {
      const keys = Object.keys(users || {});
      let out = "";

      // ------------------------------
      // 1. ACTIVE USERS
      // ------------------------------
      out += "ACTIVE USERS\n\n";
      out += `Total: ${keys.length}\n\n`;

      // ------------------------------
      // 2. GAME COUNTS
      // ------------------------------
      const gameCounts = {};
      keys.forEach((id) => {
        const g = users[id].game || "none";
        if (!gameCounts[g]) gameCounts[g] = 0;
        gameCounts[g]++;
      });

      out += "GAME COUNTS\n";
      Object.keys(gameCounts).forEach((g) => {
        out += `  ${g}: ${gameCounts[g]}\n`;
      });
      out += "\n";

      // ------------------------------
      // 3. DEVICE BREAKDOWN
      // ------------------------------
      const osCounts = {};
      const deviceCounts = {};

      keys.forEach((id) => {
        const u = users[id];

        const os = u.os || "Unknown";
        const dt = u.deviceType || "Unknown";

        if (!osCounts[os]) osCounts[os] = 0;
        osCounts[os]++;

        if (!deviceCounts[dt]) deviceCounts[dt] = 0;
        deviceCounts[dt]++;
      });

      out += "DEVICE BREAKDOWN\n";
      Object.keys(osCounts).forEach((os) => {
        out += `  ${os}: ${osCounts[os]}\n`;
      });
      out += "\n";

      out += "DEVICE TYPE\n";
      Object.keys(deviceCounts).forEach((d) => {
        out += `  ${d}: ${deviceCounts[d]}\n`;
      });
      out += "\n";

      // ------------------------------
      // 4. WHO'S PLAYING WHAT
      // ------------------------------
      const gamePlayers = {};
      keys.forEach((id) => {
        const g = users[id].game || "none";
        if (!gamePlayers[g]) gamePlayers[g] = [];
        gamePlayers[g].push(id);
      });

      out += "WHO'S PLAYING WHAT\n";
      Object.keys(gamePlayers).forEach((g) => {
        out += `\n${g}:\n`;
        gamePlayers[g].forEach((id) => {
          out += `  - ${id}\n`;
        });
      });

      box.textContent = out;

      // ------------------------------
      // GRAPHS (AUTO EXPANDING)
      // ------------------------------
      let graphOut = "";
      const maxGame = Math.max(...Object.values(gameCounts), 1);
      const maxOS = Math.max(...Object.values(osCounts), 1);
      const maxDevice = Math.max(...Object.values(deviceCounts), 1);

      graphOut += "GAME POPULARITY\n";
      Object.keys(gameCounts).forEach((g) => {
        graphOut += `${g.padEnd(15)} ${makeBar(gameCounts[g], maxGame)} ${gameCounts[g]}\n`;
      });

      graphOut += "\nOS BREAKDOWN\n";
      Object.keys(osCounts).forEach((os) => {
        graphOut += `${os.padEnd(15)} ${makeBar(osCounts[os], maxOS)} ${osCounts[os]}\n`;
      });

      graphOut += "\nDEVICE TYPE\n";
      Object.keys(deviceCounts).forEach((d) => {
        graphOut += `${d.padEnd(15)} ${makeBar(deviceCounts[d], maxDevice)} ${deviceCounts[d]}\n`;
      });

      graphBox.textContent = graphOut;

      // AUTO‑RESIZE PANEL TO FIT CONTENT
      panel.style.height = "auto";
      panel.style.maxHeight = "90vh";
    });
  }, 500);
}

// ------------------------------
// Init
// ------------------------------
createDevPanel();
createWatermark();
setupUserListener();
