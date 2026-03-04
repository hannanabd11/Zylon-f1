// ================================
// ZENITH F1 LIVE ENGINE – PRO
// FLAGS • DELTA • QUALI ZONES
// ================================

const API = "https://api.openf1.org/v1";

let sessionKey = null;
let activeSession = "RACE";
let qPhase = 1;
let sessionEnd = null;

let drivers = [];
let flags = "GREEN";

// ================================
// INIT
// ================================
window.onload = async () => {
  await detectSession();
  await loadDrivers();

  setInterval(updateTimer, 1000);
  setInterval(fetchWeather, 10000);
  setInterval(fetchTelemetry, 1000);
  setInterval(fetchRaceControl, 2000);
};

// ================================
// SESSION DETECTION
// ================================
async function detectSession() {
  const res = await fetch(`${API}/sessions`);
  const sessions = await res.json();
  const live = sessions.find(s => s.date_end === null) || sessions.at(-1);

  sessionKey = live.session_key;
  sessionEnd = new Date(live.date_end);

  if (live.session_name.includes("Qualifying")) {
    activeSession = "QUALIFYING";
    qPhase = live.session_name.match(/\d/)?.[0] || 1;
  } else {
    activeSession = "RACE";
  }
}

// ================================
// DRIVERS
// ================================
async function loadDrivers() {
  const res = await fetch(`${API}/drivers?session_key=${sessionKey}`);
  const data = await res.json();

  drivers = data.map(d => ({
    number: d.driver_number,
    name: `${d.first_name.toUpperCase()} ${d.last_name.toUpperCase()}`,
    iso: d.country_code.toLowerCase(),
    team: `#${d.team_colour}`,
    lap: 0,
    time: 9999,
    deltaAhead: "—",
    s1: 0, s2: 0, s3: 0,
    best: "—",
    sector: 0,
    pits: 0,
    tyre: "—"
  }));

  updateDashboard();
}

// ================================
// WEATHER
// ================================
async function fetchWeather() {
  const res = await fetch(`${API}/weather?session_key=${sessionKey}`);
  const w = (await res.json()).at(-1);

  document.getElementById("weather-status").innerHTML = `
    <span>AIR <b>${w.air_temperature.toFixed(1)}°C</b></span>
    <span>TRACK <b>${w.track_temperature.toFixed(1)}°C</b></span>
    <span>${w.rainfall > 0 ? "🌧️ WET" : "☀️ DRY"}</span>
    <span>GRIP <b>${w.track_grip}</b></span>
  `;
}

// ================================
// FLAGS / SAFETY CAR
// ================================
async function fetchRaceControl() {
  const res = await fetch(`${API}/race_control?session_key=${sessionKey}`);
  const data = await res.json();
  if (!data.length) return;

  const msg = data.at(-1).message.toUpperCase();
  const strip = document.getElementById("status-strip");

  if (msg.includes("SAFETY CAR")) flags = "SC";
  else if (msg.includes("RED")) flags = "RED";
  else if (msg.includes("YELLOW")) flags = "YELLOW";
  else flags = "GREEN";

  strip.className = "";
  if (flags === "GREEN") {
    strip.classList.add("status-green");
    strip.innerText = "🏁 TRACK CLEAR";
  }
  if (flags === "YELLOW") {
    strip.classList.add("status-yellow");
    strip.innerText = "⚠️ YELLOW FLAG";
  }
  if (flags === "RED") {
    strip.classList.add("status-red");
    strip.innerText = "⛔ RED FLAG";
  }
  if (flags === "SC") {
    strip.classList.add("status-yellow");
    strip.innerText = "🚓 SAFETY CAR DEPLOYED";
  }
}

// ================================
// TELEMETRY + DELTA
// ================================
async function fetchTelemetry() {
  const res = await fetch(`${API}/laps?session_key=${sessionKey}`);
  const laps = await res.json();

  drivers.forEach(d => {
    const last = laps.filter(l => l.driver_number === d.number).at(-1);
    if (!last) return;

    d.lap = last.lap_number;
    d.time = last.lap_duration || d.time;
    d.best = formatTime(last.lap_duration);
    d.s1 = last.duration_sector_1 || 0;
    d.s2 = last.duration_sector_2 || 0;
    d.s3 = last.duration_sector_3 || 0;
    d.tyre = last.compound?.[0] || d.tyre;
    d.pits = last.stint || d.pits;

    if (d.s1 && !d.s2) d.sector = 1;
    else if (d.s2 && !d.s3) d.sector = 2;
    else if (d.s3) d.sector = 3;
  });

  drivers.sort((a, b) => a.time - b.time);

  drivers.forEach((d, i) => {
    if (i === 0) d.deltaAhead = "LEADER";
    else d.deltaAhead = `+${(d.time - drivers[i - 1].time).toFixed(3)}`;
  });

  updateDashboard();
}

// ================================
// TIMER
// ================================
function updateTimer() {
  const label = document.getElementById("sess-label");
  const timer = document.getElementById("sess-timer");

  if (activeSession === "QUALIFYING") {
    const diff = Math.max(0, sessionEnd - new Date());
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    timer.innerText = `${m}:${s.toString().padStart(2, "0")}`;
    label.innerText = `QUALIFYING Q${qPhase}`;
  } else {
    label.innerText = "RACE LIVE";
    timer.innerText = `LAP ${drivers[0]?.lap || 0}/58`;
  }
}

// ================================
// DASHBOARD + QUALI RED ZONES
// ================================
function updateDashboard() {
  const tbody = document.getElementById("leaderboard");
  const headers = document.getElementById("table-headers");

  headers.innerHTML = `
    <th>POS</th><th>DRIVER</th>
    <th>Δ AHEAD</th>
    <th>BEST</th><th>S1</th><th>S2</th><th>S3</th>
    ${activeSession === "RACE" ? "<th>TYRE</th><th>PITS</th>" : ""}
    <th>STATUS</th>
  `;

  tbody.innerHTML = drivers.map((d, i) => {
    let redZone = false;
    if (activeSession === "QUALIFYING") {
      if (qPhase === 1 && i >= 15) redZone = true;
      if (qPhase === 2 && i >= 10) redZone = true;
    }

    return `
    <tr style="${redZone ? "background:#2a0000" : ""}">
      <td>${i + 1}</td>
      <td>
        <span style="border-left:3px solid ${d.team}; padding-left:10px; display:flex; gap:8px">
          <span class="flag-icon fi fi-${d.iso}"></span>${d.name}
        </span>
      </td>
      <td class="time-cell">${d.deltaAhead}</td>
      <td class="time-cell">${d.best}</td>
      <td class="time-cell">${formatSector(d.s1, d.sector === 1)}</td>
      <td class="time-cell">${formatSector(d.s2, d.sector === 2)}</td>
      <td class="time-cell">${formatSector(d.s3, d.sector === 3)}</td>
      ${activeSession === "RACE" ? `<td>${d.tyre}</td><td>${d.pits}</td>` : ""}
      <td><span style="color:var(--f1-green)">● LIVE</span></td>
    </tr>`;
  }).join("");
}

// ================================
// HELPERS
// ================================
function formatTime(t) {
  if (!t) return "—";
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}

function formatSector(v, live) {
  if (!v) return "—";
  return live ? `<span class="purple-blink">${v.toFixed(3)}</span>` : v.toFixed(3);
}   

function setSession(s) {
    activeSession = s;

    // FORCE UI UPDATE EVEN IF API FAILS
    document.getElementById('tab-qual')?.classList.toggle('active', s === 'QUALIFYING');
    document.getElementById('tab-race')?.classList.toggle('active', s === 'RACE');

    updateTopBar();
    updateDashboard();
}