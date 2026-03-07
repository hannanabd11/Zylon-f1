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
let flagStatus = "GREEN";

// ================================
// INIT
// ================================
window.onload = async () => {
    showLoadingState("CONNECTING TO TIMING SYSTEM...");
    await detectSession();
};

// ================================
// LOADING / ERROR UI
// ================================
function showLoadingState(msg) {
    document.getElementById("leaderboard").innerHTML = `
        <tr><td colspan="13" style="text-align:center; padding:60px; color:#444; font-family:'JetBrains Mono'; letter-spacing:2px;">
            <div style="font-size:2rem; margin-bottom:15px; animation:purple-pulse 1s infinite;">⏳</div>
            ${msg}
        </td></tr>`;
}

function showError(msg) {
    document.getElementById("leaderboard").innerHTML = `
        <tr><td colspan="13" style="text-align:center; padding:60px; color:var(--f1-red); font-family:'JetBrains Mono'; letter-spacing:2px;">
            <div style="font-size:2rem; margin-bottom:15px;">📡</div>
            ${msg}<br>
            <span style="color:#444; font-size:0.7rem; margin-top:15px; display:block;">
                Live data is only available during F1 session weekends.<br>
                This page will auto-load when a session goes live.
            </span>
        </td></tr>`;
    document.getElementById("sess-label").innerText = "NO ACTIVE SESSION";
    document.getElementById("sess-timer").innerText = "STANDBY";
    document.getElementById("round-name").innerText = "AWAITING SESSION";
    document.getElementById("circuit-name").innerText = "—";
}

// ================================
// SESSION DETECTION
// ================================
async function detectSession() {
    try {
        // Try 2026 first, fallback to 2025
        let sessions = [];
        try {
            const r1 = await fetch(`${API}/sessions?year=2026`);
            sessions = await r1.json();
        } catch(e) {}

        if (!sessions || sessions.length === 0) {
            const r2 = await fetch(`${API}/sessions?year=2025`);
            sessions = await r2.json();
        }

        if (!sessions || sessions.length === 0) {
            showError("NO SESSION DATA AVAILABLE");
            return;
        }

        const now = new Date();

        // 1. Find currently live session
        let picked = sessions.find(s => {
            const start = new Date(s.date_start);
            const end = s.date_end ? new Date(s.date_end) : null;
            return start <= now && (!end || end >= now);
        });

        // 2. Find most recent session ended within last 4 hours
        if (!picked) {
            const recent = sessions
                .filter(s => s.date_end && new Date(s.date_end) < now)
                .sort((a, b) => new Date(b.date_end) - new Date(a.date_end))[0];
            if (recent && (now - new Date(recent.date_end)) < 4 * 3600000) {
                picked = recent;
            }
        }

        // 3. Fallback to last session in list
        if (!picked) picked = sessions[sessions.length - 1];

        sessionKey = picked.session_key;
        sessionEnd = picked.date_end ? new Date(picked.date_end) : null;

        // Detect type
        const sName = (picked.session_name || "").toLowerCase();
        if (sName.includes("qualifying")) {
            activeSession = "QUALIFYING";
            const m = picked.session_name.match(/\d/);
            qPhase = m ? parseInt(m[0]) : 1;
        } else if (sName.includes("sprint")) {
            activeSession = "SPRINT";
        } else if (sName.includes("practice")) {
            activeSession = "PRACTICE";
        } else {
            activeSession = "RACE";
        }

        // Update circuit info in top bar
        document.getElementById("round-name").innerText = `ROUND ${picked.meeting_key || "—"} • ${picked.year || ""}`;
        document.getElementById("circuit-name").innerText = picked.circuit_short_name || picked.location || "—";

        console.log(`✅ Session: ${picked.session_name} | Key: ${sessionKey} | Type: ${activeSession}`);

        await loadDrivers();
        startLiveIntervals();

    } catch (err) {
        console.error("Session detection failed:", err);
        showError("TIMING SYSTEM OFFLINE");
    }
}

// ================================
// START ALL LIVE INTERVALS
// ================================
function startLiveIntervals() {
    // Fetch immediately
    fetchWeather();
    fetchTelemetry();
    fetchRaceControl();
    fetchCarData();
    fetchIntervals();
    updateTimer();

    // Every 1 second
    setInterval(fetchTelemetry, 1000);
    setInterval(fetchCarData, 1000);
    setInterval(fetchIntervals, 1000);
    setInterval(updateTimer, 1000);

    // Every 2 seconds
    setInterval(fetchRaceControl, 2000);

    // Every 15 seconds
    setInterval(fetchWeather, 15000);
}

// ================================
// LOAD DRIVERS
// ================================
async function loadDrivers() {
    try {
        showLoadingState("LOADING DRIVER DATA...");
        const res = await fetch(`${API}/drivers?session_key=${sessionKey}`);
        const data = await res.json();

        if (!data || data.length === 0) {
            showError("NO DRIVER DATA FOR THIS SESSION");
            return;
        }

        drivers = data.map(d => ({
            number: d.driver_number,
            code: d.name_acronym || "???",
            name: `${d.first_name || ""} ${d.last_name || ""}`.trim().toUpperCase(),
            iso: (d.country_code || "un").toLowerCase(),
            teamColor: d.team_colour ? `#${d.team_colour}` : "#444",
            teamName: d.team_name || "—",
            lap: 0,
            lastLapTime: null,
            bestLapTime: null,
            bestLapDisplay: "—",
            lastLapDisplay: "—",
            deltaAhead: "—",
            gapToLeader: "—",
            s1: null, s2: null, s3: null,
            s1Display: "—", s2Display: "—", s3Display: "—",
            currentSector: 0,
            pits: 0,
            tyre: "—",
            tyreAge: 0,
            speed: 0,
            drs: false,
            position: 99,
            status: "ON TRACK"
        }));

        console.log(`✅ Loaded ${drivers.length} drivers`);
        updateDashboard();

    } catch (err) {
        console.error("Driver load failed:", err);
        showError("DRIVER DATA UNAVAILABLE");
    }
}

// ================================
// FETCH LAP DATA (every 1s)
// ================================
async function fetchTelemetry() {
    if (!sessionKey || drivers.length === 0) return;
    try {
        const res = await fetch(`${API}/laps?session_key=${sessionKey}`);
        const laps = await res.json();
        if (!laps || laps.length === 0) return;

        drivers.forEach(d => {
            const driverLaps = laps.filter(l => l.driver_number === d.number);
            if (driverLaps.length === 0) return;

            const last = driverLaps[driverLaps.length - 1];
            d.lap = last.lap_number || d.lap;

            if (last.lap_duration) {
                d.lastLapTime = last.lap_duration;
                d.lastLapDisplay = formatTime(last.lap_duration);
            }

            // Best lap
            const best = driverLaps.filter(l => l.lap_duration).sort((a, b) => a.lap_duration - b.lap_duration)[0];
            if (best) {
                d.bestLapTime = best.lap_duration;
                d.bestLapDisplay = formatTime(best.lap_duration);
            }

            // Sectors
            if (last.duration_sector_1) { d.s1 = last.duration_sector_1; d.s1Display = last.duration_sector_1.toFixed(3); }
            if (last.duration_sector_2) { d.s2 = last.duration_sector_2; d.s2Display = last.duration_sector_2.toFixed(3); }
            if (last.duration_sector_3) { d.s3 = last.duration_sector_3; d.s3Display = last.duration_sector_3.toFixed(3); }

            // Current sector
            if (last.duration_sector_1 && !last.duration_sector_2) d.currentSector = 1;
            else if (last.duration_sector_2 && !last.duration_sector_3) d.currentSector = 2;
            else if (last.duration_sector_3) d.currentSector = 3;
            else d.currentSector = 0;

            // Tyre
            if (last.compound) { d.tyre = last.compound.charAt(0); d.tyreAge = last.tyre_age_at_start || d.tyreAge; }
            if (last.stint_number) d.pits = Math.max(0, last.stint_number - 1);
            d.status = (last.pit_in_time && !last.pit_out_time) ? "PIT" : "ON TRACK";
        });

        // Sort
        if (activeSession === "QUALIFYING" || activeSession === "PRACTICE") {
            drivers.sort((a, b) => {
                if (!a.bestLapTime) return 1;
                if (!b.bestLapTime) return -1;
                return a.bestLapTime - b.bestLapTime;
            });
        }

        // Calculate deltas
        const leader = drivers[0];
        drivers.forEach((d, i) => {
            d.position = i + 1;
            if (i === 0) { d.deltaAhead = "LEADER"; d.gapToLeader = "—"; return; }
            const prev = drivers[i - 1];
            if (d.bestLapTime && leader.bestLapTime) {
                d.gapToLeader = `+${(d.bestLapTime - leader.bestLapTime).toFixed(3)}`;
            }
            if (d.bestLapTime && prev.bestLapTime) {
                d.deltaAhead = `+${(d.bestLapTime - prev.bestLapTime).toFixed(3)}`;
            }
        });

        updateDashboard();
    } catch (err) {
        console.error("Telemetry error:", err);
    }
}

// ================================
// FETCH CAR DATA - Speed/DRS (every 1s)
// ================================
async function fetchCarData() {
    if (!sessionKey || drivers.length === 0) return;
    try {
        const res = await fetch(`${API}/car_data?session_key=${sessionKey}`);
        const data = await res.json();
        if (!data || data.length === 0) return;

        drivers.forEach(d => {
            const items = data.filter(c => c.driver_number === d.number);
            if (items.length === 0) return;
            const latest = items[items.length - 1];
            d.speed = latest.speed || 0;
            d.drs = latest.drs >= 10;
            d.gear = latest.n_gear || 0;
            d.throttle = latest.throttle || 0;
        });
    } catch (err) { /* optional */ }
}

// ================================
// FETCH INTERVALS - Live gaps (every 1s)
// ================================
async function fetchIntervals() {
    if (!sessionKey || drivers.length === 0) return;
    try {
        const res = await fetch(`${API}/intervals?session_key=${sessionKey}`);
        const data = await res.json();
        if (!data || data.length === 0) return;

        drivers.forEach(d => {
            const items = data.filter(i => i.driver_number === d.number);
            if (items.length === 0) return;
            const latest = items[items.length - 1];
            if (latest.gap_to_leader !== null && latest.gap_to_leader !== undefined) {
                d.gapToLeader = latest.gap_to_leader === 0 ? "LEADER" : `+${Number(latest.gap_to_leader).toFixed(3)}`;
            }
            if (latest.interval !== null && latest.interval !== undefined) {
                d.deltaAhead = latest.interval === 0 ? "LEADER" : `+${Number(latest.interval).toFixed(3)}`;
            }
        });
    } catch (err) { /* optional */ }
}

// ================================
// FETCH WEATHER (every 15s)
// ================================
async function fetchWeather() {
    if (!sessionKey) return;
    try {
        const res = await fetch(`${API}/weather?session_key=${sessionKey}`);
        const data = await res.json();
        if (!data || data.length === 0) return;
        const w = data[data.length - 1];
        document.getElementById("weather-status").innerHTML = `
            <span>AIR <b style="color:#fff">${w.air_temperature?.toFixed(1) || "—"}°C</b></span>
            <span>TRACK <b style="color:#fff">${w.track_temperature?.toFixed(1) || "—"}°C</b></span>
            <span style="color:${w.rainfall > 0 ? 'var(--f1-purple)' : 'var(--f1-green)'}">${w.rainfall > 0 ? "🌧️ WET" : "☀️ DRY"}</span>
            <span>WIND <b style="color:#fff">${w.wind_speed?.toFixed(1) || "—"} m/s</b></span>
            <span>HUM <b style="color:#fff">${w.humidity?.toFixed(0) || "—"}%</b></span>
        `;
    } catch (err) { console.error("Weather error:", err); }
}

// ================================
// FETCH FLAGS (every 2s)
// ================================
async function fetchRaceControl() {
    if (!sessionKey) return;
    try {
        const res = await fetch(`${API}/race_control?session_key=${sessionKey}`);
        const data = await res.json();
        if (!data || data.length === 0) return;

        const strip = document.getElementById("status-strip");
        const flagMsgs = data.filter(d => d.flag || d.category === "Flag");
        if (flagMsgs.length === 0) return;

        const latest = flagMsgs[flagMsgs.length - 1];
        const flag = (latest.flag || "").toUpperCase();
        const msg = (latest.message || "").toUpperCase();

        strip.className = "";
        if (flag === "GREEN" || msg.includes("GREEN")) {
            strip.classList.add("status-green");
            strip.innerText = "🏁 TRACK CLEAR — GREEN FLAG";
        } else if (flag === "DOUBLE YELLOW" || msg.includes("DOUBLE YELLOW")) {
            strip.classList.add("status-yellow");
            strip.innerText = `⚠️⚠️ DOUBLE YELLOW${latest.sector ? ' — SECTOR ' + latest.sector : ''}`;
        } else if (flag === "YELLOW" || msg.includes("YELLOW")) {
            strip.classList.add("status-yellow");
            strip.innerText = `⚠️ YELLOW FLAG${latest.sector ? ' — SECTOR ' + latest.sector : ''}`;
        } else if (flag === "RED" || msg.includes("RED FLAG")) {
            strip.classList.add("status-red");
            strip.innerText = "⛔ RED FLAG — SESSION SUSPENDED";
        } else if (flag === "CHEQUERED" || msg.includes("CHEQUERED")) {
            strip.classList.add("status-green");
            strip.innerText = "🏁 CHEQUERED FLAG — SESSION ENDED";
        } else if (msg.includes("VIRTUAL SAFETY CAR")) {
            strip.classList.add("status-yellow");
            strip.innerText = "🟡 VIRTUAL SAFETY CAR";
        } else if (msg.includes("SAFETY CAR")) {
            strip.classList.add("status-yellow");
            strip.innerText = "🚓 SAFETY CAR DEPLOYED";
        }
    } catch (err) { console.error("Race control error:", err); }
}

// ================================
// SESSION TIMER (every 1s)
// ================================
function updateTimer() {
    const label = document.getElementById("sess-label");
    const timer = document.getElementById("sess-timer");
    const now = new Date();

    if (activeSession === "QUALIFYING") {
        label.innerText = `Q${qPhase} — QUALIFYING`;
        if (sessionEnd && sessionEnd > now) {
            const diff = sessionEnd - now;
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            timer.innerText = `${m}:${s.toString().padStart(2, "0")}`;
        } else {
            timer.innerText = sessionEnd ? "ENDED" : "LIVE";
        }
    } else if (activeSession === "RACE" || activeSession === "SPRINT") {
        label.innerText = activeSession === "SPRINT" ? "SPRINT RACE" : "RACE — LIVE";
        const leader = drivers[0];
        timer.innerText = leader && leader.lap ? `LAP ${leader.lap}` : "LIVE";
    } else if (activeSession === "PRACTICE") {
        label.innerText = "PRACTICE SESSION";
        if (sessionEnd && sessionEnd > now) {
            const diff = sessionEnd - now;
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            timer.innerText = `${m}:${s.toString().padStart(2, "0")}`;
        } else {
            timer.innerText = "LIVE";
        }
    } else {
        label.innerText = "SESSION LIVE";
        timer.innerText = "LIVE";
    }
}

// ================================
// DASHBOARD RENDER
// ================================
function updateDashboard() {
    const tbody = document.getElementById("leaderboard");
    const headers = document.getElementById("table-headers");
    const isRace = activeSession === "RACE" || activeSession === "SPRINT";

    headers.innerHTML = `
        <th>POS</th>
        <th>DRIVER</th>
        <th>TEAM</th>
        <th>${isRace ? "GAP TO LEADER" : "Δ AHEAD"}</th>
        <th>BEST LAP</th>
        <th>LAST LAP</th>
        <th>S1</th><th>S2</th><th>S3</th>
        <th>TYRE</th>
        ${isRace ? "<th>PITS</th>" : ""}
        <th>SPEED</th>
        <th>STATUS</th>
    `;

    if (drivers.length === 0) { showLoadingState("AWAITING DRIVER DATA..."); return; }

    const fastestDriver = drivers.filter(d => d.bestLapTime).sort((a, b) => a.bestLapTime - b.bestLapTime)[0];

    const tyreColors = { "S": "#ff1e1e", "M": "#f9d71c", "H": "#ffffff", "I": "#39b54a", "W": "#0067ff" };

    tbody.innerHTML = drivers.map((d, i) => {
        const redZone = activeSession === "QUALIFYING" && ((qPhase == 1 && i >= 15) || (qPhase == 2 && i >= 10));
        const isFastest = fastestDriver && d.number === fastestDriver.number;
        const isLeader = i === 0;
        const tyreColor = tyreColors[d.tyre] || "#888";

        let rowBg = "";
        if (redZone) rowBg = "background:#1a0000;";
        else if (isLeader) rowBg = "background:rgba(0,255,136,0.03);";
        else if (isFastest) rowBg = "background:rgba(183,0,255,0.05);";

        return `
        <tr style="${rowBg}">
            <td style="font-weight:900; color:${isLeader ? 'var(--f1-green)' : i < 3 ? '#fff' : '#555'}; font-size:1.1rem;">${i + 1}</td>

            <td>
                <div style="display:flex; align-items:center; gap:8px; border-left:3px solid ${d.teamColor}; padding-left:10px;">
                    <span class="fi fi-${d.iso}" style="font-size:1rem;"></span>
                    <div>
                        <div style="font-weight:900; color:${isFastest ? 'var(--f1-purple)' : '#fff'};">
                            ${d.code}
                            ${d.drs ? '<span style="background:#00ff88;color:#000;font-size:0.5rem;padding:1px 4px;border-radius:2px;font-weight:900;margin-left:4px;">DRS</span>' : ''}
                        </div>
                        <div style="font-size:0.6rem; color:#555;">${d.name}</div>
                    </div>
                </div>
            </td>

            <td style="font-size:0.7rem; color:${d.teamColor}; font-weight:900;">${d.teamName}</td>

            <td class="time-cell" style="color:${isLeader ? 'var(--f1-green)' : '#888'};">
                ${isRace ? d.gapToLeader : d.deltaAhead}
            </td>

            <td class="time-cell" style="color:${isFastest ? 'var(--f1-purple)' : '#fff'}; font-weight:${isFastest ? '900' : '700'};">
                ${d.bestLapDisplay}
                ${isFastest ? '<span style="background:var(--f1-purple);color:#fff;font-size:0.5rem;padding:1px 5px;border-radius:2px;margin-left:4px;">FL</span>' : ''}
            </td>

            <td class="time-cell" style="color:#777;">${d.lastLapDisplay}</td>

            <td class="time-cell" style="color:${d.currentSector === 1 ? 'var(--f1-purple)' : '#555'};">
                ${d.currentSector === 1 ? `<span class="purple-blink">${d.s1Display}</span>` : d.s1Display}
            </td>
            <td class="time-cell" style="color:${d.currentSector === 2 ? 'var(--f1-purple)' : '#555'};">
                ${d.currentSector === 2 ? `<span class="purple-blink">${d.s2Display}</span>` : d.s2Display}
            </td>
            <td class="time-cell" style="color:${d.currentSector === 3 ? 'var(--f1-purple)' : '#555'};">
                ${d.currentSector === 3 ? `<span class="purple-blink">${d.s3Display}</span>` : d.s3Display}
            </td>

            <td>
                <span style="color:${tyreColor}; font-weight:900;">◉ ${d.tyre}</span>
                <div style="color:#444; font-size:0.6rem;">${d.tyreAge ? d.tyreAge + 'L' : ''}</div>
            </td>

            ${isRace ? `<td style="color:#888; font-weight:900; text-align:center;">${d.pits}</td>` : ''}

            <td class="time-cell" style="color:#aaa;">
                ${d.speed ? d.speed + '<span style="color:#444;font-size:0.6rem;"> km/h</span>' : '—'}
            </td>

            <td>
                <span style="color:${d.status === 'PIT' ? 'var(--f1-yellow)' : 'var(--f1-green)'}; font-weight:900; font-size:0.75rem;">
                    ${d.status === 'PIT' ? '🔧 PIT' : '● LIVE'}
                </span>
            </td>
        </tr>`;
    }).join("");
}

// ================================
// TAB SWITCHING
// ================================
function setSession(s) {
    activeSession = s;
    document.getElementById('tab-qual')?.classList.toggle('active', s === 'QUALIFYING');
    document.getElementById('tab-race')?.classList.toggle('active', s === 'RACE');
    if (s === "QUALIFYING") {
        drivers.sort((a, b) => {
            if (!a.bestLapTime) return 1;
            if (!b.bestLapTime) return -1;
            return a.bestLapTime - b.bestLapTime;
        });
    }
    updateDashboard();
}

// ================================
// HELPERS
// ================================
function formatTime(t) {
    if (!t || t === 0) return "—";
    const m = Math.floor(t / 60);
    const s = (t % 60).toFixed(3);
    return `${m}:${parseFloat(s) < 10 ? "0" + s : s}`;
}
