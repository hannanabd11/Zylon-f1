// ================================
// ZENITH F1 LIVE ENGINE – PRO
// LIVE TIMING via Jolpi/Ergast API
// ================================

const JOLPI = "https://api.jolpi.ca/ergast/f1";

let activeSession = "QUALIFYING";
let qPhase = 1;
let drivers = [];
let currentRound = null;
let currentYear = 2026;

// ================================
// INIT
// ================================
window.onload = async () => {
    showLoadingState("CONNECTING TO F1 TIMING SYSTEM...");
    await initSession();
};

// ================================
// UI HELPERS
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
            ${msg}
        </td></tr>`;
    document.getElementById("sess-label").innerText = "NO ACTIVE SESSION";
    document.getElementById("sess-timer").innerText = "STANDBY";
}

// ================================
// DETECT CURRENT ROUND
// ================================
async function initSession() {
    try {
        // Get current season schedule
        const res = await fetch(`${JOLPI}/${currentYear}.json`);
        const data = await res.json();
        const races = data.MRData.RaceTable.Races;

        const now = new Date();

        // Find the current or most recent race weekend
        let picked = null;
        for (let race of races) {
            const raceDate = new Date(race.date + "T" + (race.time || "12:00:00Z"));
            // If race is within the last 4 days or upcoming next 3 days = active weekend
            const diffDays = (raceDate - now) / (1000 * 60 * 60 * 24);
            if (diffDays > -4 && diffDays < 4) {
                picked = race;
                break;
            }
        }

        // Fallback: pick the next upcoming race
        if (!picked) {
            picked = races.find(r => new Date(r.date) >= now) || races[races.length - 1];
        }

        currentRound = picked.round;

        // Update circuit info
        document.getElementById("round-name").innerText = `ROUND ${picked.round} • ${currentYear}`;
        document.getElementById("circuit-name").innerText = picked.Circuit?.circuitName || picked.raceName || "—";

        console.log(`✅ Active weekend: ${picked.raceName} | Round: ${currentRound}`);

        // Now figure out which session is live/latest
        await detectLiveSession(picked);

    } catch (err) {
        console.error("Init failed:", err);
        showError("FAILED TO CONNECT — CHECK NETWORK");
    }
}

// ================================
// DETECT LIVE SESSION
// ================================
async function detectLiveSession(race) {
    const now = new Date();

    // Check qualifying time
    const qualiDate = race.Qualifying ? new Date(race.Qualifying.date + "T" + (race.Qualifying.time || "12:00:00Z")) : null;
    const raceDate = new Date(race.date + "T" + (race.time || "12:00:00Z"));

    // Determine which session to load
    // Qualifying window: from quali start to quali start + 2 hours
    // Race window: from race start to race start + 3 hours
    const qualiEnd = qualiDate ? new Date(qualiDate.getTime() + 2 * 3600000) : null;
    const raceEnd = new Date(raceDate.getTime() + 3 * 3600000);

    if (qualiDate && now >= qualiDate && now <= qualiEnd) {
        activeSession = "QUALIFYING";
        document.getElementById("sess-label").innerText = "QUALIFYING — LIVE";
        await loadQualifyingData();
    } else if (now >= raceDate && now <= raceEnd) {
        activeSession = "RACE";
        document.getElementById("sess-label").innerText = "RACE — LIVE";
        await loadRaceData();
    } else if (qualiDate && now > qualiEnd && now < raceDate) {
        // Between quali and race - show quali results
        activeSession = "QUALIFYING";
        document.getElementById("sess-label").innerText = "QUALIFYING RESULT";
        await loadQualifyingData();
    } else {
        // Default: try to load qualifying, fallback to race
        activeSession = "QUALIFYING";
        await loadQualifyingData();
    }

    // Start refresh intervals
    startRefreshIntervals();
    updateTimer();
    setInterval(updateTimer, 1000);
}

// ================================
// START REFRESH INTERVALS
// ================================
function startRefreshIntervals() {
    // Refresh data every 10 seconds during live session
    setInterval(async () => {
        if (activeSession === "QUALIFYING") {
            await loadQualifyingData();
        } else {
            await loadRaceData();
        }
    }, 10000);
}

// ================================
// LOAD QUALIFYING DATA
// ================================
async function loadQualifyingData() {
    try {
        showLoadingState("FETCHING QUALIFYING DATA...");

        const res = await fetch(`${JOLPI}/${currentYear}/${currentRound}/qualifying.json`);
        const data = await res.json();
        const results = data.MRData.RaceTable.Races[0]?.QualifyingResults;

        if (!results || results.length === 0) {
            // Try last qualifying
            const res2 = await fetch(`${JOLPI}/${currentYear}/last/qualifying.json`);
            const data2 = await res2.json();
            const results2 = data2.MRData.RaceTable.Races[0]?.QualifyingResults;

            if (!results2 || results2.length === 0) {
                showError("QUALIFYING DATA NOT YET AVAILABLE<br><span style='font-size:0.8rem; color:#555'>Data publishes after session ends</span>");
                return;
            }
            renderQualifying(results2, data2.MRData.RaceTable.Races[0]);
            return;
        }

        renderQualifying(results, data.MRData.RaceTable.Races[0]);

    } catch (err) {
        console.error("Qualifying load failed:", err);
        showError("QUALIFYING DATA UNAVAILABLE");
    }
}

// ================================
// RENDER QUALIFYING
// ================================
function renderQualifying(results, race) {
    const tbody = document.getElementById("leaderboard");
    const headers = document.getElementById("table-headers");

    if (race) {
        document.getElementById("round-name").innerText = `ROUND ${race.round} • ${race.season}`;
        document.getElementById("circuit-name").innerText = race.Circuit?.circuitName || "—";
    }

    headers.innerHTML = `
        <th>POS</th>
        <th>DRIVER</th>
        <th>TEAM</th>
        <th>Q1</th>
        <th>Q2</th>
        <th>Q3</th>
        <th>STATUS</th>
    `;

    const teamColors = {
        "mclaren": "#FF8000", "ferrari": "#E80020", "mercedes": "#27F4D2",
        "red_bull": "#3671C6", "aston_martin": "#229971", "alpine": "#0093CC",
        "williams": "#64C4FF", "haas": "#B6BABD", "sauber": "#52E252",
        "rb": "#6692FF", "kick_sauber": "#52E252", "racing_bulls": "#6692FF",
        "cadillac": "#FFD700", "audi": "#F50537"
    };

    const getTeamColor = (constructorId) => teamColors[constructorId.toLowerCase()] || "#888";

    // Find fastest Q3 time for purple highlight
    const q3Times = results.filter(r => r.Q3).map(r => timeToSeconds(r.Q3));
    const fastestQ3 = q3Times.length > 0 ? Math.min(...q3Times) : null;

    tbody.innerHTML = results.map((r, i) => {
        const color = getTeamColor(r.Constructor.constructorId);
        const isFirst = i === 0;
        const isFastest = fastestQ3 && r.Q3 && Math.abs(timeToSeconds(r.Q3) - fastestQ3) < 0.001;

        // Gap calculation
        let gap = "—";
        if (i > 0 && r.Q3 && results[0].Q3) {
            gap = `+${(timeToSeconds(r.Q3) - timeToSeconds(results[0].Q3)).toFixed(3)}`;
        } else if (i === 0) {
            gap = "POLE";
        }

        // Red zone (knocked out)
        let rowBg = "";
        if (i >= 15) rowBg = "background:#1a0000;";
        else if (i >= 10) rowBg = "background:#1a0a00;";
        else if (isFirst) rowBg = "background:rgba(183,0,255,0.05);";

        const posColor = isFirst ? "var(--f1-purple)" : i < 3 ? "#fff" : "#555";

        return `
        <tr style="${rowBg}">
            <td style="font-weight:900; color:${posColor}; font-size:1.1rem;">
                ${i + 1}
                ${isFirst ? '<span style="background:var(--f1-purple);color:#fff;font-size:0.5rem;padding:1px 6px;border-radius:2px;margin-left:4px;font-weight:900;">POLE</span>' : ''}
            </td>

            <td>
                <div style="display:flex; align-items:center; gap:8px; border-left:3px solid ${color}; padding-left:10px;">
                    <div>
                        <div style="font-weight:900; color:${isFastest ? 'var(--f1-purple)' : '#fff'}; font-size:0.95rem;">
                            ${r.Driver.code || r.Driver.familyName.toUpperCase()}
                        </div>
                        <div style="font-size:0.6rem; color:#555;">${r.Driver.givenName} ${r.Driver.familyName}</div>
                    </div>
                </div>
            </td>

            <td style="font-size:0.75rem; color:${color}; font-weight:900;">${r.Constructor.name.toUpperCase()}</td>

            <td class="time-cell" style="color:${!r.Q2 ? 'var(--f1-red)' : '#777'};">${r.Q1 || "—"}</td>
            <td class="time-cell" style="color:${!r.Q3 && r.Q2 ? 'var(--f1-yellow)' : '#777'};">${r.Q2 || "—"}</td>
            <td class="time-cell" style="color:${isFastest ? 'var(--f1-purple)' : r.Q3 ? '#fff' : '#444'}; font-weight:${isFastest ? '900' : '700'};">
                ${r.Q3 || "—"}
                ${isFastest ? '<span style="background:var(--f1-purple);color:#fff;font-size:0.5rem;padding:1px 5px;border-radius:2px;margin-left:4px;">FL</span>' : ''}
            </td>

            <td>
                ${i < 10 ? '<span style="color:var(--f1-green); font-weight:900; font-size:0.75rem;">✓ Q3</span>' :
                  i < 15 ? '<span style="color:var(--f1-yellow); font-weight:900; font-size:0.75rem;">✗ Q2</span>' :
                  '<span style="color:var(--f1-red); font-weight:900; font-size:0.75rem;">✗ Q1</span>'}
            </td>
        </tr>`;
    }).join("");

    document.getElementById("sess-label").innerText = "QUALIFYING";
    document.getElementById("sess-timer").innerText = `P${results.length}`;

    console.log(`✅ Qualifying rendered: ${results.length} drivers`);
}

// ================================
// LOAD RACE DATA
// ================================
async function loadRaceData() {
    try {
        showLoadingState("FETCHING RACE DATA...");

        const res = await fetch(`${JOLPI}/${currentYear}/${currentRound}/results.json`);
        const data = await res.json();
        const results = data.MRData.RaceTable.Races[0]?.Results;

        if (!results || results.length === 0) {
            const res2 = await fetch(`${JOLPI}/${currentYear}/last/results.json`);
            const data2 = await res2.json();
            const results2 = data2.MRData.RaceTable.Races[0]?.Results;

            if (!results2 || results2.length === 0) {
                showError("RACE DATA NOT YET AVAILABLE<br><span style='font-size:0.8rem;color:#555'>Data publishes after session ends</span>");
                return;
            }
            renderRace(results2, data2.MRData.RaceTable.Races[0]);
            return;
        }

        renderRace(results, data.MRData.RaceTable.Races[0]);

    } catch (err) {
        console.error("Race load failed:", err);
        showError("RACE DATA UNAVAILABLE");
    }
}

// ================================
// RENDER RACE
// ================================
function renderRace(results, race) {
    const tbody = document.getElementById("leaderboard");
    const headers = document.getElementById("table-headers");

    if (race) {
        document.getElementById("round-name").innerText = `ROUND ${race.round} • ${race.season}`;
        document.getElementById("circuit-name").innerText = race.Circuit?.circuitName || "—";
    }

    headers.innerHTML = `
        <th>POS</th>
        <th>DRIVER</th>
        <th>TEAM</th>
        <th>GAP</th>
        <th>LAPS</th>
        <th>PTS</th>
        <th>STATUS</th>
    `;

    const teamColors = {
        "mclaren": "#FF8000", "ferrari": "#E80020", "mercedes": "#27F4D2",
        "red_bull": "#3671C6", "aston_martin": "#229971", "alpine": "#0093CC",
        "williams": "#64C4FF", "haas": "#B6BABD", "sauber": "#52E252",
        "rb": "#6692FF", "kick_sauber": "#52E252", "racing_bulls": "#6692FF",
        "cadillac": "#FFD700", "audi": "#F50537"
    };

    const getTeamColor = (id) => teamColors[id.toLowerCase()] || "#888";

    tbody.innerHTML = results.map((r, i) => {
        const color = getTeamColor(r.Constructor.constructorId);
        const isFirst = i === 0;
        const isFastestLap = r.FastestLap?.rank === "1";

        let rowBg = "";
        if (isFirst) rowBg = "background:rgba(0,255,136,0.03);";
        else if (isFastestLap) rowBg = "background:rgba(183,0,255,0.05);";

        const posColor = isFirst ? "var(--f1-green)" : i < 3 ? "#fff" : "#555";

        const gap = isFirst ? "LEADER" : (r.Time?.time ? `+${r.Time.time}` : r.status);
        const statusColor = r.status === "Finished" || r.Time ? "var(--f1-green)" : "var(--f1-red)";

        return `
        <tr style="${rowBg}">
            <td style="font-weight:900; color:${posColor}; font-size:1.1rem;">
                ${r.position}
                ${isFirst ? '<span style="background:var(--f1-green);color:#000;font-size:0.5rem;padding:1px 6px;border-radius:2px;margin-left:4px;font-weight:900;">WIN</span>' : ''}
            </td>

            <td>
                <div style="display:flex; align-items:center; gap:8px; border-left:3px solid ${color}; padding-left:10px;">
                    <div>
                        <div style="font-weight:900; color:${isFastestLap ? 'var(--f1-purple)' : '#fff'}; font-size:0.95rem;">
                            ${r.Driver.code || r.Driver.familyName.toUpperCase()}
                            ${isFastestLap ? '<span style="background:var(--f1-purple);color:#fff;font-size:0.5rem;padding:1px 5px;border-radius:2px;margin-left:4px;">FL</span>' : ''}
                        </div>
                        <div style="font-size:0.6rem; color:#555;">${r.Driver.givenName} ${r.Driver.familyName}</div>
                    </div>
                </div>
            </td>

            <td style="font-size:0.75rem; color:${color}; font-weight:900;">${r.Constructor.name.toUpperCase()}</td>

            <td class="time-cell" style="color:${isFirst ? 'var(--f1-green)' : '#888'};">${gap}</td>
            <td style="color:#777; font-weight:700;">${r.laps}</td>
            <td style="color:#fff; font-weight:900; font-size:1.1rem;">${r.points}</td>

            <td>
                <span style="color:${statusColor}; font-weight:900; font-size:0.75rem;">
                    ${r.status === "Finished" || r.Time ? "✓ FIN" : r.status.toUpperCase()}
                </span>
            </td>
        </tr>`;
    }).join("");

    document.getElementById("sess-label").innerText = "RACE RESULT";
    document.getElementById("sess-timer").innerText = `P${results.length}`;

    console.log(`✅ Race rendered: ${results.length} drivers`);
}

// ================================
// SESSION TIMER
// ================================
function updateTimer() {
    // Timer is updated by session type in detectLiveSession
    // Just keep the label alive
}

// ================================
// TAB SWITCHING
// ================================
function setSession(s) {
    activeSession = s;
    document.getElementById('tab-qual')?.classList.toggle('active', s === 'QUALIFYING');
    document.getElementById('tab-race')?.classList.toggle('active', s === 'RACE');

    if (s === "QUALIFYING") {
        loadQualifyingData();
    } else {
        loadRaceData();
    }
}

// ================================
// HELPERS
// ================================
function timeToSeconds(t) {
    if (!t) return 9999;
    const parts = t.split(":");
    if (parts.length === 2) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(t);
}
