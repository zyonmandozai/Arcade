import { onUsersUpdate, banUser, unbanUser, kickUser, getBannedList } from "./firebase.js";

let devMode = false;
let panel, watermark, dragBar;
let tabs = {};
let popup;

// ------------------------------------------------------
// CREATE DEV PANEL
// ------------------------------------------------------
function createDevPanel() {
  panel = document.createElement("div");
  panel.id = "devPanel";
  Object.assign(panel.style, {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: "700px",
    minHeight: "550px",
    maxHeight: "90vh",
    background: "rgba(0,0,0,0.85)",
    border: "2px solid #00eaff",
    boxShadow: "0 0 25px #00eaff",
    borderRadius: "0px",
    color: "#00ffea",
    fontFamily: "Consolas, monospace",
    fontSize: "13px",
    padding: "0",
    zIndex: "999999",
    display: "none",
    overflow: "hidden",
    resize: "both",
    boxSizing: "border-box"
  });

  // Drag bar
  dragBar = document.createElement("div");
  Object.assign(dragBar.style, {
    width: "100%",
    height: "32px",
    background: "rgba(0,0,0,0.6)",
    borderBottom: "1px solid #00eaff",
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    paddingLeft: "10px",
    fontWeight: "bold"
  });
  dragBar.textContent = "DEV CONSOLE";

  // Tabs container
  const tabBar = document.createElement("div");
  Object.assign(tabBar.style, {
    display: "flex",
    borderBottom: "1px solid #00eaff",
    background: "rgba(0,0,0,0.4)"
  });

  const tabNames = ["Users", "Graphs", "Manage Users", "Banned"];
  tabNames.forEach((name) => {
    const tab = document.createElement("div");
    tab.textContent = name.toUpperCase();
    Object.assign(tab.style, {
      padding: "8px 14px",
      borderRight: "1px solid #00eaff",
      cursor: "pointer",
      userSelect: "none"
    });

    tab.addEventListener("click", () => switchTab(name));
    tabBar.appendChild(tab);
    tabs[name] = tab;
  });

  // Content areas
  const contentContainer = document.createElement("div");
  contentContainer.style.height = "calc(100% - 32px - 32px)";
  contentContainer.style.overflow = "auto";

  const usersBox = makeContentBox("Loading users...");
  const graphsBox = makeContentBox("Loading graphs...");
  const manageBox = makeContentBox("Loading...");
  const bannedBox = makeContentBox("Loading...");

  panel.appendChild(dragBar);
  panel.appendChild(tabBar);
  panel.appendChild(contentContainer);

  contentContainer.appendChild(usersBox);
  contentContainer.appendChild(graphsBox);
  contentContainer.appendChild(manageBox);
  contentContainer.appendChild(bannedBox);

  tabs.Users.box = usersBox;
  tabs.Graphs.box = graphsBox;
  tabs["Manage Users"].box = manageBox;
  tabs.Banned.box = bannedBox;

  switchTab("Users");

  document.body.appendChild(panel);

  enableDragging();
}

// ------------------------------------------------------
// CONTENT BOX MAKER
// ------------------------------------------------------
function makeContentBox(text) {
  const box = document.createElement("div");
  Object.assign(box.style, {
    padding: "10px",
    whiteSpace: "pre",
    display: "none"
  });
  box.textContent = text;
  return box;
}

// ------------------------------------------------------
// SWITCH TABS
// ------------------------------------------------------
function switchTab(name) {
  Object.keys(tabs).forEach((t) => {
    tabs[t].style.background = "transparent";
    tabs[t].style.boxShadow = "none";
    tabs[t].box.style.display = "none";
  });

  tabs[name].style.background = "rgba(0,0,0,0.6)";
  tabs[name].style.boxShadow = "0 0 10px #00eaff inset";
  tabs[name].box.style.display = "block";

  if (name === "Manage Users") updateManageUsers();
  if (name === "Banned") updateBannedUsers();
}

// ------------------------------------------------------
// DRAGGING
// ------------------------------------------------------
function enableDragging() {
  let dragging = false;
  let startX, startY, startLeft, startTop;

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

// ------------------------------------------------------
// WATERMARK
// ------------------------------------------------------
function createWatermark() {
  watermark = document.createElement("div");
  watermark.textContent = "DEV MODE ACTIVE";
  Object.assign(watermark.style, {
    position: "fixed",
    bottom: "10px",
    left: "10px",
    color: "#00eaff",
    fontFamily: "Consolas",
    fontSize: "14px",
    opacity: "0.8",
    textShadow: "0 0 10px #00eaff",
    zIndex: "999999",
    display: "none"
  });
  document.body.appendChild(watermark);
}

// ------------------------------------------------------
// TOGGLE DEV MODE
// ------------------------------------------------------
function toggleDevMode() {
  devMode = !devMode;
  panel.style.display = devMode ? "block" : "none";
  watermark.style.display = devMode ? "block" : "none";
}

// ------------------------------------------------------
// KEYBIND
// ------------------------------------------------------
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

// ------------------------------------------------------
// POPUP (A2 STYLE)
// ------------------------------------------------------
function showPopup(userId) {
  if (popup) popup.remove();

  popup = document.createElement("div");
  Object.assign(popup.style, {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "420px",
    background: "rgba(0,0,0,0.9)",
    border: "2px solid #00eaff",
    boxShadow: "0 0 25px #00eaff",
    padding: "20px",
    fontFamily: "Consolas",
    color: "#00eaff",
    zIndex: "9999999",
    textAlign: "center"
  });

  popup.innerHTML = `
    <div style="font-size:18px; margin-bottom:10px;">REMOVE USER</div>
    <div style="margin-bottom:20px;">Choose an action for:<br><b>${userId}</b></div>

    <button id="kickBtn" style="margin:5px; padding:8px 20px; background:black; border:1px solid #00eaff; color:#00eaff;">KICK USER</button>
    <button id="banBtn" style="margin:5px; padding:8px 20px; background:black; border:1px solid #00eaff; color:#00eaff;">BAN USER</button>

    <div style="margin-top:20px;">
      <button id="cancelBtn" style="padding:6px 20px; background:black; border:1px solid #00eaff; color:#00eaff;">CANCEL</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("kickBtn").onclick = () => {
    kickUser(userId);
    popup.remove();
  };

  document.getElementById("banBtn").onclick = () => {
    banUser(userId);
    popup.remove();
  };

  document.getElementById("cancelBtn").onclick = () => popup.remove();
}

// ------------------------------------------------------
// MANAGE USERS TAB
// ------------------------------------------------------
function updateManageUsers() {
  const box = tabs["Manage Users"].box;
  box.textContent = "MANAGE USERS\n\n";

  onUsersUpdate((users) => {
    box.textContent = "MANAGE USERS\n\n";

    Object.keys(users).forEach((id) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.marginBottom = "6px";

      const label = document.createElement("span");
      label.textContent = id;

      const trash = document.createElement("span");
      trash.textContent = "🗑️";
      trash.style.cursor = "pointer";
      trash.onclick = () => showPopup(id);

      row.appendChild(label);
      row.appendChild(trash);
      box.appendChild(row);
    });
  });
}

// ------------------------------------------------------
// BANNED USERS TAB
// ------------------------------------------------------
function updateBannedUsers() {
  const box = tabs.Banned.box;
  box.textContent = "BANNED USERS\n\n";

  getBannedList((list) => {
    Object.keys(list).forEach((id) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.marginBottom = "6px";

      const label = document.createElement("span");
      label.textContent = id;

      const unban = document.createElement("span");
      unban.textContent = "[UNBAN]";
      unban.style.cursor = "pointer";
      unban.style.color = "#00eaff";
      unban.onclick = () => unbanUser(id);

      row.appendChild(label);
      row.appendChild(unban);
      box.appendChild(row);
    });
  });
}

// ------------------------------------------------------
// GRAPHS + USERS (existing functionality)
// ------------------------------------------------------
function setupUserListener() {
  const usersBox = tabs.Users.box;
  const graphsBox = tabs.Graphs.box;

  onUsersUpdate((users) => {
    const keys = Object.keys(users || {});
    let out = "";

    out += "ACTIVE USERS\n\n";
    out += `Total: ${keys.length}\n\n`;

    const gameCounts = {};
    const osCounts = {};
    const deviceCounts = {};
    const gamePlayers = {};

    keys.forEach((id) => {
      const u = users[id];

      const g = u.game || "none";
      const os = u.os || "Unknown";
      const dt = u.deviceType || "Unknown";

      gameCounts[g] = (gameCounts[g] || 0) + 1;
      osCounts[os] = (osCounts[os] || 0) + 1;
      deviceCounts[dt] = (deviceCounts[dt] || 0) + 1;

      if (!gamePlayers[g]) gamePlayers[g] = [];
      gamePlayers[g].push(id);
    });

    out += "GAME COUNTS\n";
    Object.keys(gameCounts).forEach((g) => {
      out += `  ${g}: ${gameCounts[g]}\n`;
    });
    out += "\n";

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

    out += "WHO'S PLAYING WHAT\n";
    Object.keys(gamePlayers).forEach((g) => {
      out += `\n${g}:\n`;
      gamePlayers[g].forEach((id) => {
        out += `  - ${id}\n`;
      });
    });

    usersBox.textContent = out;

    // GRAPHS
    let graphOut = "";
    const maxGame = Math.max(...Object.values(gameCounts), 1);
    const maxOS = Math.max(...Object.values(osCounts), 1);
    const maxDevice = Math.max(...Object.values(deviceCounts), 1);

    const makeBar = (count, max) =>
      "█".repeat(Math.floor((count / max) * 30)).padEnd(30, " ");

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

    graphsBox.textContent = graphOut;
  });
}

// ------------------------------------------------------
// INIT
// ------------------------------------------------------
createDevPanel();
createWatermark();
setupUserListener();
