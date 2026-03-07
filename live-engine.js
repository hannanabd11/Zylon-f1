// ================================
// ZENITH F1 LIVE ENGINE
// Source: F1 Official Live Timing
// ================================

const F1_TIMING = "https://livetiming.formula1.com/static";

let activeSession = "QUALIFYING";
let drivers = {};
let timingData = {};
let sessionInfo = {};

// ================================
// INIT
// ================================
window.onload = async () => {
    showLoadingState("CONNECTING TO F1 LIVE TIMING...");
    await loadSessionPath();
};

// ================================
// UI HELPERS
// ================================
function showLoadingState(msg) {
    document.getElementById("leaderboard").innerHTML = `
        <tr><td colspan="10" style="text-align:center; padding:60px; color:#444; font-family:'JetBrains Mono'; letter-spacing:2px;">
            <div style="font-size:2rem; margin-bottom:15px; animation:purple-pulse 1s infinite;">⏳</div>
            ${msg}
        </td></tr>`;
}

function showError(msg) {
    document.getElementById("leaderboard").innerHTML = `
        <tr><td colspan="10" style="text-align:center; padding:60px; color:var(--f1-red); font-family:'JetBrains Mono'; letter-spacing:2px;">
            <div style="font-size:2rem; margin-bottom:15px;">📡</div>
            ${msg}
        </td></tr>`;
    document.getElementById("sess-label").innerText = "NO ACTIVE SESSION";
    document.getElementById("sess-timer").innerText = "STANDBY";
}

// ================================
// LOAD SESSION PATH FROM F1
// ================================
async function loadSessionPath() {
    try {
        // F1 live timing index - tells us current session path
        const res = await fetch(`${F1_TIMING}/StreamingStatus.json`);

        if (!res.ok) throw new Error("Cannot reach F1 timing");

        const status = await res.json();
        console.log("F1 Status:", status);

        if (status.Status === "Available") {
            // Live session available
            await loadLiveData();
            setInterval(loadLiveData, 5000);
        } else {
            // No live session - load latest from Jolpi
            showLoadingState("NO LIVE SESSION — LOADING LATEST RESULTS...");
            await loadFromJolpi();
        }

    } catch(err) {
        console.warn("F1 timing blocked (CORS), trying Jolpi:", err.message);
        // CORS blocks direct F1 timing access from browser
        // Fall back to Jolpi which has post-session data
        await loadFromJolpi();
    }
}

// ================================
// LOAD LIVE DATA FROM F1 TIMING
// ================================
async function loadLiveData() {
    try {
        const [driversRes, timingRes, sessionRes] = await Promise.all([
            fetch(`${F1_TIMING}/DriverList.json`),
            fetch(`${F1_TIMING}/TimingData.json`),
            fetch(`${F1_TIMING}/SessionInfo.json`)
        ]);

        const driverList = await driversRes.json();
        timingData = await timingRes.json();
        sessionInfo = await sessionRes.json();

        // Update session info
        document.getElementById("round-name").innerText = `ROUND ${sessionInfo.Meeting?.Key || "—"} • ${sessionInfo.StartDate?.substring(0,4) || "2026"}`;
        document.getElementById("circuit-name").innerText = sessionInfo.Meeting?.Circuit?.ShortName || "—";
        document.getElementById("sess-label").innerText = sessionInfo.Name || "SESSION LIVE";

        // Detect session type
        const sName = (sessionInfo.Name || "").toLowerCase();
        if (sName.includes("qualifying")) activeSession = "QUALIFYING";
        else if (sName.includes("race")) activeSession = "RACE";
        else if (sName.includes("sprint")) activeSession = "SPRINT";

        // Build driver objects
        drivers = {};
        for (const [num, d] of Object.entries(driverList)) {
            drivers[num] = {
                number: num,
                code: d.Tla || "???",
                name: `${d.FirstName || ""} ${d.LastName || ""}`.trim(),
                teamName: d.TeamName || "—",
                teamColor: d.TeamColour ? `#${d.TeamColour}` : "#888",
                flag: (d.CountryCode || "un").toLowerCase(),
                ...getTimingForDriver(num, timingData)
            };
        }

        renderDashboard();

    } catch(err) {
        console.error("Live data error:", err);
        await loadFromJolpi();
    }
}

function getTimingForDriver(num, timing) {
    const d = timing?.Lines?.[num] || {};
    return {
        position: d.Position || 99,
        gap: d.GapToLeader || "—",
        interval: d.IntervalToPositionAhead?.Value || "—",
        bestLap: d.BestLapTime?.Value || "—",
        lastLap: d.LastLapTime?.Value || "—",
        s1: d.Sectors?.[0]?.Value || "—",
        s2: d.Sectors?.[1]?.Value || "—",
        s3: d.Sectors?.[2]?.Value || "—",
        inPit: d.InPit || false,
        pitOut: d.PitOut || false,
        stopped: d.Stopped || false,
        knockedOut: d.KnockedOut || false,
        retired: d.Retired || false,
        status: d.Status || "—"
    };
}

// ================================
// LOAD FROM JOLPI (post-session)
// ================================
async function loadFromJolpi() {
    try {
        // Try 2026 qualifying first
        const attempts = [
            `https://api.jolpi.ca/ergast/f1/2026/last/qualifying.json`,
            `https://api.jolpi.ca/ergast/f1/2026/1/qualifying.json`,
            `https://api.jolpi.ca/ergast/f1/2025/last/qualifying.json`
        ];

        let results = null;
        let raceInfo = null;

        for (const url of attempts) {
            try {
                const res = await fetch(url);
                const data = await res.json();
                const race = data.MRData?.RaceTable?.Races?.[0];
                if (race?.QualifyingResults?.length > 0) {
                    results = race.QualifyingResults;
                    raceInfo = race;
                    break;
                }
            } catch(e) { continue; }
        }

        if (!results) {
            // Try race results
            const attempts2 = [
                `https://api.jolpi.ca/ergast/f1/2026/last/results.json`,
                `https://api.jolpi.ca/ergast/f1/2025/last/results.json`
            ];
            for (const url of attempts2) {
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    const race = data.MRData?.RaceTable?.Races?.[0];
                    if (race?.Results?.length > 0) {
                        renderRaceFromJolpi(race.Results, race);
                        return;
                    }
                } catch(e) { continue; }
            }

            showError("NO SESSION DATA AVAILABLE YET<br><span style='font-size:0.75rem;color:#555;margin-top:10px;display:block'>Australian GP qualifying data will appear here after the session ends.<br>Refresh in a few minutes.</span>");
            return;
        }

        renderQualifyingFromJolpi(results, raceInfo);
        // Refresh every 60 seconds to catch new data
        setInterval(loadFromJolpi, 60000);

    } catch(err) {
        console.error("Jolpi failed:", err);
        showError("DATA UNAVAILABLE — REFRESH AFTER SESSION");
    }
}

// ================================
// RENDER QUALIFYING FROM JOLPI
// ================================
function renderQualifyingFromJolpi(results, race) {
    const tbody = document.getElementById("leaderboard");
    const headers = document.getElementById("table-headers");

    document.getElementById("round-name").innerText = `ROUND ${race?.round || "1"} • ${race?.season || "2026"}`;
    document.getElementById("circuit-name").innerText = race?.Circuit?.circuitName || "—";
    document.getElementById("sess-label").innerText = "QUALIFYING";
    document.getElementById("sess-timer").innerText = `${results.length} CLASSIFIED`;

    headers.innerHTML = `
        <th>POS</th><th>DRIVER</th><th>TEAM</th>
        <th>Q1</th><th>Q2</th><th>Q3</th><th>ZONE</th>
    `;

    const teamColors = getTeamColorsMap();

    const q3Times = results.filter(r => r.Q3).map(r => timeToSeconds(r.Q3));
    const fastestQ3 = q3Times.length > 0 ? Math.min(...q3Times) : null;

    tbody.innerHTML = results.map((r, i) => {
        const color = teamColors[r.Constructor.constructorId.toLowerCase()] || "#888";
        const isFirst = i === 0;
        const isFastest = fastestQ3 && r.Q3 && Math.abs(timeToSeconds(r.Q3) - fastestQ3) < 0.001;

        let rowBg = i >= 15 ? "background:#1a0000;" : i >= 10 ? "background:#150a00;" : isFirst ? "background:rgba(183,0,255,0.06);" : "";
        const posColor = isFirst ? "var(--f1-purple)" : i < 3 ? "#fff" : "#555";

        const zone = i < 10
            ? `<span style="color:var(--f1-green);font-weight:900;font-size:0.75rem;">Q3 ✓</span>`
            : i < 15
            ? `<span style="color:var(--f1-yellow);font-weight:900;font-size:0.75rem;">Q2 ✗</span>`
            : `<span style="color:var(--f1-red);font-weight:900;font-size:0.75rem;">Q1 ✗</span>`;

        return `
        <tr style="${rowBg}">
            <td style="font-weight:900;color:${posColor};font-size:1.1rem;">
                ${i + 1}
                ${isFirst ? `<span style="background:var(--f1-purple);color:#fff;font-size:0.5rem;padding:1px 6px;border-radius:2px;margin-left:4px;font-weight:900;">POLE</span>` : ""}
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;border-left:3px solid ${color};padding-left:10px;">
                    <div>
                        <div style="font-weight:900;color:${isFastest ? 'var(--f1-purple)' : '#fff'};font-size:0.95rem;">
                            ${r.Driver.code || r.Driver.familyName.toUpperCase()}
                        </div>
                        <div style="font-size:0.6rem;color:#555;">${r.Driver.givenName} ${r.Driver.familyName}</div>
                    </div>
                </div>
            </td>
            <td style="font-size:0.75rem;color:${color};font-weight:900;">${r.Constructor.name.toUpperCase()}</td>
            <td class="time-cell" style="color:${!r.Q2 ? 'var(--f1-red)' : '#666'};">${r.Q1 || "—"}</td>
            <td class="time-cell" style="color:${!r.Q3 && r.Q2 ? 'var(--f1-yellow)' : '#666'};">${r.Q2 || "—"}</td>
            <td class="time-cell" style="color:${isFastest ? 'var(--f1-purple)' : r.Q3 ? '#fff' : '#333'};font-weight:${isFastest ? '900' : '700'};">
                ${r.Q3 || "—"}
                ${isFastest ? `<span style="background:var(--f1-purple);color:#fff;font-size:0.5rem;padding:1px 5px;border-radius:2px;margin-left:4px;">FL</span>` : ""}
            </td>
            <td>${zone}</td>
        </tr>`;
    }).join("");

    console.log(`✅ Qualifying rendered: ${results.length} drivers`);
}

// ================================
// RENDER RACE FROM JOLPI
// ================================
function renderRaceFromJolpi(results, race) {
    const tbody = document.getElementById("leaderboard");
    const headers = document.getElementById("table-headers");

    document.getElementById("round-name").innerText = `ROUND ${race?.round || "1"} • ${race?.season || "2026"}`;
    document.getElementById("circuit-name").innerText = race?.Circuit?.circuitName || "—";
    document.getElementById("sess-label").innerText = "RACE RESULT";
    document.getElementById("sess-timer").innerText = `${results.length} CLASSIFIED`;

    headers.innerHTML = `
        <th>POS</th><th>DRIVER</th><th>TEAM</th>
        <th>GAP</th><th>LAPS</th><th>PTS</th><th>STATUS</th>
    `;

    const teamColors = getTeamColorsMap();

    tbody.innerHTML = results.map((r, i) => {
        const color = teamColors[r.Constructor.constructorId.toLowerCase()] || "#888";
        const isFirst = i === 0;
        const isFastestLap = r.FastestLap?.rank === "1";
        let rowBg = isFirst ? "background:rgba(0,255,136,0.03);" : isFastestLap ? "background:rgba(183,0,255,0.05);" : "";
        const posColor = isFirst ? "var(--f1-green)" : i < 3 ? "#fff" : "#555";
        const gap = isFirst ? "LEADER" : (r.Time?.time ? `+${r.Time.time}` : r.status);

        return `
        <tr style="${rowBg}">
            <td style="font-weight:900;color:${posColor};font-size:1.1rem;">
                ${r.position}
                ${isFirst ? `<span style="background:var(--f1-green);color:#000;font-size:0.5rem;padding:1px 6px;border-radius:2px;margin-left:4px;font-weight:900;">WIN</span>` : ""}
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;border-left:3px solid ${color};padding-left:10px;">
                    <div>
                        <div style="font-weight:900;color:${isFastestLap ? 'var(--f1-purple)' : '#fff'};font-size:0.95rem;">
                            ${r.Driver.code || r.Driver.familyName.toUpperCase()}
                            ${isFastestLap ? `<span style="background:var(--f1-purple);color:#fff;font-size:0.5rem;padding:1px 5px;border-radius:2px;margin-left:4px;">FL</span>` : ""}
                        </div>
                        <div style="font-size:0.6rem;color:#555;">${r.Driver.givenName} ${r.Driver.familyName}</div>
                    </div>
                </div>
            </td>
            <td style="font-size:0.75rem;color:${color};font-weight:900;">${r.Constructor.name.toUpperCase()}</td>
            <td class="time-cell" style="color:${isFirst ? 'var(--f1-green)' : '#888'};">${gap}</td>
            <td style="color:#777;font-weight:700;">${r.laps}</td>
            <td style="color:#fff;font-weight:900;font-size:1.1rem;">${r.points}</td>
            <td><span style="color:${r.Time ? 'var(--f1-green)' : 'var(--f1-red)'};font-weight:900;font-size:0.75rem;">${r.Time ? "✓ FIN" : r.status.toUpperCase()}</span></td>
        </tr>`;
    }).join("");

    console.log(`✅ Race rendered: ${results.length} drivers`);
}

// ================================
// RENDER FROM F1 LIVE TIMING
// ================================
function renderDashboard() {
    const tbody = document.getElementById("leaderboard");
    const headers = document.getElementById("table-headers");
    const isRace = activeSession === "RACE" || activeSession === "SPRINT";

    headers.innerHTML = `
        <th>POS</th><th>DRIVER</th><th>TEAM</th>
        <th>${isRace ? "GAP" : "Δ AHEAD"}</th>
        <th>BEST LAP</th><th>LAST LAP</th>
        <th>S1</th><th>S2</th><th>S3</th><th>STATUS</th>
    `;

    const sorted = Object.values(drivers).sort((a, b) => a.position - b.position);

    tbody.innerHTML = sorted.map((d, i) => {
        const isFirst = i === 0;
        const posColor = isFirst ? "var(--f1-green)" : i < 3 ? "#fff" : "#555";
        const statusColor = d.inPit ? "var(--f1-yellow)" : d.retired ? "var(--f1-red)" : "var(--f1-green)";
        const statusText = d.inPit ? "🔧 PIT" : d.retired ? "OUT" : "● LIVE";

        return `
        <tr>
            <td style="font-weight:900;color:${posColor};font-size:1.1rem;">${i + 1}</td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;border-left:3px solid ${d.teamColor};padding-left:10px;">
                    <div>
                        <div style="font-weight:900;color:#fff;">${d.code}</div>
                        <div style="font-size:0.6rem;color:#555;">${d.name}</div>
                    </div>
                </div>
            </td>
            <td style="font-size:0.75rem;color:${d.teamColor};font-weight:900;">${d.teamName}</td>
            <td class="time-cell" style="color:${isFirst ? 'var(--f1-green)' : '#888'};">${isRace ? d.gap : d.interval}</td>
            <td class="time-cell" style="color:#fff;">${d.bestLap}</td>
            <td class="time-cell" style="color:#777;">${d.lastLap}</td>
            <td class="time-cell" style="color:#555;">${d.s1}</td>
            <td class="time-cell" style="color:#555;">${d.s2}</td>
            <td class="time-cell" style="color:#555;">${d.s3}</td>
            <td><span style="color:${statusColor};font-weight:900;font-size:0.75rem;">${statusText}</span></td>
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
    if (s === "QUALIFYING") loadQualifyingData ? loadQualifyingData() : loadFromJolpi();
    else loadRaceData ? loadRaceData() : loadFromJolpi();
}

// ================================
// HELPERS
// ================================
function getTeamColorsMap() {
    return {
        "mclaren": "#FF8000", "ferrari": "#E80020", "mercedes": "#27F4D2",
        "red_bull": "#3671C6", "aston_martin": "#229971", "alpine": "#0093CC",
        "williams": "#64C4FF", "haas": "#B6BABD", "sauber": "#52E252",
        "rb": "#6692FF", "kick_sauber": "#52E252", "racing_bulls": "#6692FF",
        "cadillac": "#FFD700", "audi": "#F50537"
    };
}

function timeToSeconds(t) {
    if (!t) return 9999;
    const parts = t.split(":");
    if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    return parseFloat(t);
}

function updateTimer() {}
