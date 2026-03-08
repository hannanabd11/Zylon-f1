// ============================================================
// ZYLON BY A.H — SCRIPT.JS
// Features: Live timer with flag, PKT schedule dates/times,
// auto-updating results, live green blinker, driver stats
// ============================================================

// --- STARTUP ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveF1News();
    renderDrivers();
    renderTeams();
    initCarsTab();
    initStandings();
    updateLatestResults();
    updateF1Weather();
    populateRoundSelector();

    // Auto-refresh results every 2 minutes
    setInterval(updateLatestResults, 120000);
    // Auto-refresh standings every 5 minutes
    setInterval(initStandings, 300000);
});

// ============================================================
// INJECT LIVE BLINKER CSS
// ============================================================
(function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .live-blink-dot {
            display: inline-block;
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #00ff41;
            margin-right: 6px;
            animation: live-pulse 1s infinite;
            vertical-align: middle;
        }
        @keyframes live-pulse {
            0%   { opacity:1; transform:scale(1);   box-shadow:0 0 0 0 #00ff4188; }
            50%  { opacity:.5; transform:scale(1.3); box-shadow:0 0 0 6px #00ff4100; }
            100% { opacity:1; transform:scale(1);   box-shadow:0 0 0 0 #00ff4100; }
        }
        .live-weekend { border-left: 3px solid #00ff41 !important; }
    `;
    document.head.appendChild(style);
})();

// ============================================================
// COUNTRY FLAG MAP
// ============================================================
const gpFlagMap = {
    "Australian":"au","Chinese":"cn","Japanese":"jp","Bahrain":"bh",
    "Saudi":"sa","Miami":"us","Canadian":"ca","Monaco":"mc",
    "Barcelona":"es","Austrian":"at","British":"gb","Belgian":"be",
    "Hungarian":"hu","Dutch":"nl","Italian":"it","Spanish":"es",
    "Azerbaijan":"az","Singapore":"sg","United":"us","Mexico":"mx",
    "São":"br","Las":"us","Qatar":"qa","Abu":"ae"
};

function getFlagForGP(gpName) {
    return gpFlagMap[gpName.split(' ')[0]] || "un";
}

// ============================================================
// ZENITH TIMER — flag + country + live blinker
// ============================================================
function updateZenithTimer() {
    const now       = new Date().getTime();
    const container = document.getElementById('zenith-timer-container');
    const label     = document.getElementById('header-label');
    const display   = document.getElementById('header-countdown');
    const flagImg   = document.getElementById('country-flag');

    if (!container || !label || !display) return;

    const QUALI_DURATION_MS = 2 * 60 * 60 * 1000;
    const RACE_DURATION_MS  = 3 * 60 * 60 * 1000;

    let race = zenithRaceSchedule.find(r => {
        return now < new Date(r.Race.iso).getTime() + RACE_DURATION_MS;
    });

    if (!race) {
        label.innerText = "SEASON COMPLETE";
        display.innerText = "SEE YOU IN 2027";
        return;
    }

    const qualiTime = new Date(race.Qualifying.iso).getTime();
    const raceTime  = new Date(race.Race.iso).getTime();

    // Update flag
    if (flagImg) flagImg.src = `https://flagcdn.com/w40/${getFlagForGP(race.gp)}.png`;

    let targetTime, sessionName, isLive = false;

    if (now < qualiTime) {
        targetTime  = qualiTime;
        sessionName = "QUALIFYING";
    } else if (now < qualiTime + QUALI_DURATION_MS) {
        sessionName = "QUALIFYING";
        isLive = true;
    } else if (now < raceTime) {
        targetTime  = raceTime;
        sessionName = "GRAND PRIX";
    } else {
        sessionName = "GRAND PRIX";
        isLive = true;
    }

    container.classList.remove('state-waiting', 'state-live', 'state-warning');
    const gpShort = race.gp.split(' ')[0].toUpperCase();

    if (isLive) {
        container.classList.add('state-live');
        label.innerHTML = `<span class="live-blink-dot"></span>${gpShort} ${sessionName} LIVE`;

        display.style.pointerEvents = "auto";
        display.style.overflow = "visible";
        display.style.zIndex = "999";
        display.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:8px;align-items:center;">
                <a href="https://www.formula1.com/en/live-timing"
                   target="_blank" rel="noopener noreferrer"
                   style="pointer-events:auto;position:relative;z-index:999;display:inline-block;
                          background:#e10600;color:#fff;padding:8px 20px;border-radius:3px;
                          font-weight:900;font-size:0.85rem;text-decoration:none;letter-spacing:1px;">
                    🔴 WATCH LIVE TIMING ➔
                </a>
                <a href="${race.hubUrl}" target="_blank" rel="noopener noreferrer"
                   class="live-btn-link"
                   style="pointer-events:auto;position:relative;z-index:999;display:inline-block;">
                    ENTER COMMAND CENTER ➔
                </a>
            </div>`;

        // Trigger results refresh when session goes live
        updateLatestResults();

    } else {
        const diff = targetTime - now;
        if (diff < 3600000) container.classList.add('state-warning');
        else container.classList.add('state-waiting');

        label.innerText = `${gpShort} ${sessionName}`;

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        display.style.pointerEvents = "";
        display.style.overflow = "";
        display.style.zIndex = "";
        display.innerHTML = `
            ${d}<span class="timer-unit">D</span>
            ${String(h).padStart(2,'0')}<span class="timer-unit">H</span>
            ${String(m).padStart(2,'0')}<span class="timer-unit">M</span>
            ${String(s).padStart(2,'0')}<span class="timer-unit">S</span>
        `;
    }
}

setInterval(updateZenithTimer, 1000);
updateZenithTimer();

// ============================================================
// TEAMS
// ============================================================
function renderTeams() {
    const grid = document.getElementById('teams-grid');
    if (!grid) return;
    grid.innerHTML = f1Teams2026.map(team => `
        <div class="card-scene" onclick="this.querySelector('.card-inner').classList.toggle('is-flipped')">
            <div class="card-inner" style="--team-color:${team.color};--glow-color:${team.color}44">
                <div class="card-front">
                    <div class="flex-between">
                        <div style="flex:1;">
                            <a href="${team.teamLink}" target="_blank" onclick="event.stopPropagation()" class="team-title-link">
                                ${team.name.toUpperCase()}
                            </a>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <img src="${team.flagUrl}" style="width:16px;height:auto;" alt="flag">
                                <span style="font-size:0.7rem;color:#888;font-weight:700;letter-spacing:1px;">${team.country}</span>
                            </div>
                        </div>
                        <div class="text-right" style="flex:1;">
                            <a href="https://www.google.com/search?q=${encodeURIComponent(team.principal)}+F1+Team+Principal"
                               target="_blank" onclick="event.stopPropagation()"
                               style="color:#e10600;font-size:0.65rem;font-weight:900;text-decoration:none;">
                                PRINCIPAL: ${team.principal.toUpperCase()}
                            </a>
                            <div style="display:flex;gap:15px;margin-top:10px;justify-content:flex-end;">
                                <div style="text-align:center;"><span class="stat-lab">WCC</span><span class="stat-val">${team.constructors}</span></div>
                                <div style="text-align:center;"><span class="stat-lab">WDC</span><span class="stat-val">${team.drivers_titles}</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-between" style="border-top:1px solid rgba(255,255,255,0.05);padding-top:15px;align-items:flex-end;">
                        <div style="font-size:0.55rem;color:#444;letter-spacing:1px;">2026 REGULATION STATUS: <span style="color:#00ff00;">COMPLIANT</span></div>
                        <div style="display:flex;flex-direction:column;align-items:flex-end;">
                            <a href="${team.drivers[0].link}" target="_blank" onclick="event.stopPropagation()" class="driver-pill">${team.drivers[0].name.toUpperCase()}</a>
                            <a href="${team.drivers[1].link}" target="_blank" onclick="event.stopPropagation()" class="driver-pill">${team.drivers[1].name.toUpperCase()}</a>
                        </div>
                    </div>
                </div>
                <div class="card-back">
                    <h4 style="color:var(--team-color);margin:0 0 10px 0;font-size:0.9rem;">TEAM HISTORY</h4>
                    <p style="font-size:0.8rem;color:#ccc;line-height:1.4;">${team.history}</p>
                    <div style="margin-top:auto;font-size:0.6rem;color:#555;">CLICK TO FLIP BACK</div>
                </div>
            </div>
        </div>`).join('');
}

// ============================================================
// TABS
// ============================================================
function openTab(evt, tabName) {
    const targetId = tabName.toLowerCase();
    for (let s of document.getElementsByClassName("tab-content")) { s.style.display="none"; s.classList.remove("active"); }
    for (let n of document.getElementsByClassName("tab-item")) { n.classList.remove("active"); }
    const sec = document.getElementById(targetId);
    if (sec) { sec.style.display="block"; sec.classList.add("active"); }
    if (evt?.currentTarget) evt.currentTarget.classList.add("active");
    window.scrollTo({ top:0, behavior:'instant' });
    handleTabLoading(targetId);
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => window.scrollTo(0,0));

function handleTabLoading(id) {
    if (id === 'home')       { fetchLiveF1News(); updateLatestResults(); }
    else if (id === 'results')   updateLatestResults();
    else if (id === 'schedule')  initSchedule();
    else if (id === 'standings') initStandings();
    else if (id === 'drivers')   autoUpdateDriverStats();
    else if (id === 'teams')     renderTeams();
    else if (id === 'cars')      initCarsTab();
}

// ============================================================
// DRIVERS
// ============================================================
function renderDrivers() {
    const container = document.getElementById('drivers-grid');
    if (!container) return;
    container.innerHTML = "";

    f1_2026_grid.forEach(d => {
        const [firstName, ...rest] = d.name.split(' ');
        const lastName = rest.join(' ').toUpperCase();
        const accentColor = d.color || teamColors[d.team] || "#e10600";
        const card = document.createElement('div');
        card.className = "driver-card-new";
        card.style.setProperty('--team-color', accentColor);
        const driverF1Url = `https://www.formula1.com/en/drivers/${d.id}`;
        const teamF1Url   = `https://www.formula1.com/en/teams/${d.team.toLowerCase().replace(/_/g,'-').replace(/\s+/g,'-')}`;

        card.innerHTML = `
            <div class="driver-number-overlay">${d.no}</div>
            <a href="${driverF1Url}" target="_blank" style="text-decoration:none;color:inherit;display:block;">
                <div class="driver-image-area">
                    <img src="./Drivers/${d.id}.PNG" class="driver-portrait" onerror="this.onerror=null;this.src='./Drivers/placeholder.png'">
                    <div class="image-gradient"></div>
                </div>
            </a>
            <div class="driver-info-area">
                <div class="driver-header-row">
                    <div class="driver-name-stack">
                        <a href="${teamF1Url}" target="_blank" style="text-decoration:none;">
                            <div class="driver-team-tag" style="cursor:pointer;"
                                 onmouseover="this.style.color='var(--team-color)';this.style.textDecoration='underline'"
                                 onmouseout="this.style.color='';this.style.textDecoration=''">
                                ${d.team.replace(/_/g,' ')}
                            </div>
                        </a>
                        <a href="${driverF1Url}" target="_blank" style="text-decoration:none;color:inherit;">
                            <h3 onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'" style="cursor:pointer;transition:opacity 0.2s;">
                                ${firstName} <b>${lastName}</b>
                            </h3>
                        </a>
                    </div>
                    <div class="driver-flag-side">
                        <img src="https://flagcdn.com/w80/${d.flag}.png" class="mini-flag" alt="Flag">
                    </div>
                </div>
                <div class="driver-stats-container">
                    <div class="stat-box"><span class="stat-n" id="wins-${d.id}">${d.wins}</span><span class="stat-l">Wins</span></div>
                    <div class="stat-box"><span class="stat-n" id="poles-${d.id}">${d.poles}</span><span class="stat-l">Poles</span></div>
                    <div class="stat-box"><span class="stat-n">${d.champ}</span><span class="stat-l">Titles</span></div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

// ============================================================
// AUTO-UPDATE DRIVER WINS + POLES
// ============================================================
async function autoUpdateDriverStats() {
    renderDrivers(); // Show local data immediately

    try {
        let standingsData = null;

        for (const year of ['2026','2025']) {
            const res  = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`);
            const json = await res.json();
            const list = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
            if (list?.length > 0) { standingsData = list; break; }
        }

        if (!standingsData) return;

        // Count 2026 poles round by round
        const polesMap = {};
        for (let round = 1; round <= 24; round++) {
            try {
                const r = await fetch(`https://api.jolpi.ca/ergast/f1/2026/${round}/qualifying.json`);
                const j = await r.json();
                const qr = j.MRData?.RaceTable?.Races?.[0]?.QualifyingResults;
                if (!qr?.length) break;
                const dId = qr[0].Driver.driverId.toLowerCase();
                polesMap[dId] = (polesMap[dId] || 0) + 1;
            } catch(e) { break; }
        }

        f1_2026_grid.forEach(driver => {
            const match = standingsData.find(ls =>
                ls.Driver.driverId.toLowerCase().includes(driver.id.toLowerCase()) ||
                driver.name.toLowerCase().includes(ls.Driver.familyName.toLowerCase())
            );
            if (match) {
                // Only add 2026 season wins/poles on top of career stats (not cumulative on re-render)
                const seasonWins = parseInt(match.wins) || 0;
                // Store original career stats once to avoid double-adding on re-render
                if (driver._baseWins === undefined) driver._baseWins = driver.wins;
                if (driver._basePoles === undefined) driver._basePoles = driver.poles;
                driver.wins  = driver._baseWins  + seasonWins;
                const dId = match.Driver.driverId.toLowerCase();
                driver.poles = driver._basePoles + (polesMap[dId] || 0);
            }
        });

        renderDrivers();
        console.log("✅ Driver stats updated");

    } catch(e) {
        console.log("Driver stats: using local data");
    }
}

setTimeout(autoUpdateDriverStats, 3000);

// ============================================================
// STANDINGS
// ============================================================
async function initStandings() {
    const dContainer = document.getElementById('drivers-list');
    const tContainer = document.getElementById('teams-list');
    if (!dContainer || !tContainer) return;

    let dList = [], tList = [];

    // Try 2026 current standings first (after round 1+), fall back to 2025 only if NO 2026 data at all
    for (const year of ['2026','2025']) {
        try {
            const [dRes, tRes] = await Promise.all([
                fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
                fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`)
            ]);
            const dJson = await dRes.json();
            const tJson = await tRes.json();
            const dl = dJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
            const tl = tJson.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
            // Only accept 2025 data if 2026 truly has nothing
            if (dl.length > 0) {
                dList = dl; tList = tl;
                // Show year label
                const yr = dJson.MRData?.StandingsTable?.StandingsLists?.[0]?.season;
                const rd = dJson.MRData?.StandingsTable?.StandingsLists?.[0]?.round;
                if (yr) {
                    ['drivers-list','teams-list'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.setAttribute('data-season', `${yr} • AFTER ROUND ${rd}`);
                    });
                }
                break;
            }
        } catch(e) { continue; }
    }

    dContainer.innerHTML = dList.map((item, i) => {
        const teamColor = getTeamColor(item.Constructors[0].name);
        const driverInfo = f1_2026_grid.find(d => d.name.toLowerCase().includes(item.Driver.familyName.toLowerCase()));
        const flag = driverInfo?.flag || 'un';
        const seasonLabel = i === 0 ? `<div style="padding:10px 20px 0;color:#333;font-size:0.65rem;letter-spacing:2px;font-weight:900;">${dContainer.getAttribute('data-season') || ''}</div>` : '';
        return seasonLabel + `
            <div class="standings-entry" style="--team-glow:${teamColor}">
                <div class="pos-num">${item.position}</div>
                <div class="team-strip" style="background:${teamColor}"></div>
                <div class="entry-name">
                    <span class="team-label">${item.Constructors[0].name}</span>
                    <div class="driver-name-row" style="display:flex;align-items:center;">
                        <img src="https://flagcdn.com/w40/${flag}.png" class="tiny-flag">
                        <span class="driver-text">${item.Driver.givenName} <strong>${item.Driver.familyName}</strong></span>
                    </div>
                </div>
                <div class="entry-pts">${item.points}</div>
            </div>`;
    }).join('') || `<div style="padding:20px;color:#444;text-align:center;">NO 2026 DATA YET — SHOWING AFTER ROUND 1</div>`;

    tContainer.innerHTML = tList.map(item => {
        const teamColor = getTeamColor(item.Constructor.name);
        return `
            <div class="standings-entry" style="--team-glow:${teamColor}">
                <div class="pos-num">${item.position}</div>
                <div class="team-strip" style="background:${teamColor}"></div>
                <div class="entry-name">
                    <span class="team-label">CONSTRUCTOR</span>
                    <div class="driver-text" style="color:${teamColor};font-weight:900;">${item.Constructor.name.toUpperCase()}</div>
                </div>
                <div class="entry-pts">${item.points}</div>
            </div>`;
    }).join('') || `<div style="padding:20px;color:#444;text-align:center;">NO 2026 DATA YET</div>`;
}

function getTeamColor(team) {
    const colors = {
        "McLaren":"#FF8700","Red Bull":"#3671C6","Ferrari":"#E80020",
        "Mercedes":"#27F4D2","Aston Martin":"#229971","Williams":"#64C4FF",
        "VCARB":"#6692FF","Haas F1 Team":"#B6BABD","Alpine F1 Team":"#d816c2",
        "Audi":"#535151","Sauber":"#52E252","Kick Sauber":"#52E252",
        "RB F1 Team":"#6692FF","Cadillac":"#FFD700","Racing Bulls":"#6692FF"
    };
    return colors[team] || "#444";
}

// ============================================================
// FETCH ALL RESULTS (paginated — gets all 20+ drivers)
// ============================================================
async function fetchAllResults(url) {
    // Determine if this is a qualifying or race URL
    const isQuali = url.includes('qualifying');

    // Always fetch two pages to cover all 22 drivers
    const [res1, res2] = await Promise.all([
        fetch(`${url}.json?limit=20&offset=0`),
        fetch(`${url}.json?limit=10&offset=20`)
    ]);

    const data1 = await res1.json();
    const race1 = data1.MRData?.RaceTable?.Races?.[0];
    if (!race1) return null;

    let page1 = isQuali
        ? (race1.QualifyingResults || [])
        : (race1.Results || []);

    // Try to get page 2
    let page2 = [];
    try {
        const data2 = await res2.json();
        const race2 = data2.MRData?.RaceTable?.Races?.[0];
        if (race2) {
            page2 = isQuali
                ? (race2.QualifyingResults || [])
                : (race2.Results || []);
        }
    } catch(e) {}

    // Merge, deduplicate by position
    const allResults = [...page1];
    const existingPositions = new Set(page1.map(r => r.position));
    for (const r of page2) {
        if (!existingPositions.has(r.position)) {
            allResults.push(r);
        }
    }

    // Sort by position
    allResults.sort((a, b) => parseInt(a.position) - parseInt(b.position));

    console.log(`✅ ${isQuali ? 'Qualifying' : 'Race'} results: ${allResults.length} drivers loaded`);

    if (isQuali) {
        return { ...race1, QualifyingResults: allResults };
    } else {
        return { ...race1, Results: allResults };
    }
}

// ============================================================
// RESULTS ENGINE
// ============================================================
async function updateLatestResults() {
    const container = document.getElementById('results-content');
    if (!container) return;
    container.innerHTML = "<div style='color:#666;padding:20px;'>ACCESSING TIMING DATA...</div>";

    const now = new Date();

    for (const year of ['2026','2025']) {
        try {
            const [race, qualy] = await Promise.all([
                fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/last/results`),
                fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/last/qualifying`)
            ]);

            if (!race && !qualy) continue;

            const raceDate = race ? new Date(`${race.date}T${race.time || '12:00:00Z'}`) : null;

            // Race is finished and has results → ALWAYS show race result
            if (race?.Results?.length > 0 && raceDate && raceDate < now) {
                renderResultsUI(race, "RACE");
                return;
            }

            // Race not finished yet → show qualifying
            if (qualy?.QualifyingResults?.length > 0) {
                renderResultsUI(qualy, "QUALIFYING");
                return;
            }

            // Fallback
            if (race?.Results?.length > 0) { renderResultsUI(race, "RACE"); return; }

        } catch(e) { continue; }
    }

    container.innerHTML = `
        <div style="text-align:center; padding:60px 20px;">
            <div style="font-size:2.5rem; margin-bottom:15px;">⏳</div>
            <h2 style="color:#fff; font-weight:900; text-transform:uppercase; margin-bottom:10px; letter-spacing:2px;">
                RESULTS INCOMING
            </h2>
            <p style="color:#555; font-family:'JetBrains Mono'; font-size:0.8rem; margin-bottom:30px; letter-spacing:1px; line-height:1.8;">
                RACE DATA IS BEING PROCESSED<br>
                <span style="color:#333;">CHECK BACK IN A FEW HOURS</span>
            </p>
            <button onclick="updateLatestResults()"
               style="background:#111; color:#555; padding:12px 30px; border-radius:4px;
                      font-weight:900; letter-spacing:2px; cursor:pointer; font-size:0.75rem;
                      text-transform:uppercase; border:1px solid #222;">
                ↻ RETRY
            </button>
        </div>`;
}

function renderResultsUI(race, sessionType = "RACE") {
    const container = document.getElementById('results-content');
    if (!container) return;

    const tcMap = {
        "mercedes":"#27F4D2","red_bull":"#3671C6","ferrari":"#E80020",
        "mclaren":"#FF8000","aston_martin":"#229971","alpine":"#0093CC",
        "haas":"#B6BABD","williams":"#64C4FF","sauber":"#52E252",
        "rb":"#6692FF","racing_bulls":"#6692FF","cadillac":"#FFD700","audi":"#535151"
    };

    const isQualy     = sessionType === "QUALIFYING";
    const accentColor = isQualy ? "#b700ff" : "#e10600";
    const resultsData = isQualy ? race.QualifyingResults : race.Results;
    if (!resultsData?.length) return;

    let html = `
        <div class="results-wrapper">
            <div style="padding:40px 0 20px 0;">
                <div style="margin-bottom:20px;">
                    <span style="background:${accentColor};color:#fff;padding:4px 12px;font-size:0.75rem;font-weight:900;text-transform:uppercase;letter-spacing:1px;">
                        ${isQualy ? "QUALIFYING RESULT" : "LATEST RACE"}
                    </span>
                </div>
                <h1 style="color:#fff;font-size:3rem;font-weight:900;margin:0;text-transform:uppercase;line-height:1;">
                    ${race.raceName.toUpperCase()} <span style="color:#444;">${race.season}</span>
                </h1>
                <p style="color:#aaa;font-size:0.9rem;margin-top:15px;text-transform:uppercase;letter-spacing:2px;">
                    ROUND ${race.round} • ${isQualy ? 'QUALIFYING CLASSIFICATION' : 'OFFICIAL CLASSIFICATION'}
                </p>
                <div style="width:100%;height:2px;background:${accentColor};margin-top:30px;"></div>
            </div>
            <div style="display:grid;grid-template-columns:50px 1.5fr 1fr 150px 80px;padding:10px 25px;color:#444;font-size:0.75rem;font-weight:900;text-transform:uppercase;">
                <div>Pos</div><div>Driver</div><div>Team</div>
                <div style="text-align:right;">${isQualy ? "Best Lap" : "Time / Gap"}</div>
                <div style="text-align:right;">${isQualy ? "Zone" : "Pts"}</div>
            </div>`;

    resultsData.forEach((r, i) => {
        const isFirst      = i === 0;
        const isFastestLap = r.FastestLap?.rank === "1";
        const tc           = tcMap[r.Constructor?.constructorId] || "#888";
        const hl           = isFirst ? (isQualy ? "#b700ff" : "#00ff00") : isFastestLap ? "#b700ff" : tc;

        const flTime = !isQualy && isFastestLap && r.FastestLap?.Time?.time
            ? ` <span style="font-size:0.65rem;color:#b700ff;display:block;">${r.FastestLap.Time.time}</span>` : '';
        const timeDisplay = isQualy
            ? (r.Q3 || r.Q2 || r.Q1 || "No Time")
            : (isFirst ? (r.Time?.time || "—") : (r.Time ? `+${r.Time.time}` : r.status));

        const zone = isQualy
            ? (i < 10  ? `<span style="color:#00ff88;font-weight:900;font-size:0.7rem;">Q3 ✓</span>`
              : i < 15 ? `<span style="color:#f9d71c;font-weight:900;font-size:0.7rem;">Q2 ✗</span>`
              :           `<span style="color:#e10600;font-weight:900;font-size:0.7rem;">Q1 ✗</span>`)
            : r.points;

        html += `
            <div class="${isFastestLap||(isFirst&&isQualy)?'result-row highlight-purple':'result-row'}"
                 style="border-left:4px solid ${hl};${isFirst?'background:rgba(255,255,255,0.02);':''}">
                <div style="font-weight:900;color:${isFirst?hl:'#555'};font-size:1.2rem;">${r.position}</div>
                <div style="color:#fff;font-weight:900;font-size:1.1rem;display:flex;align-items:center;gap:8px;">
                    <span>${r.Driver.givenName[0]}. <span style="color:${isFirst?hl:'#fff'}">${r.Driver.familyName.toUpperCase()}</span></span>
                    ${(isFastestLap||(isFirst&&isQualy))?`<span style="background:#b700ff;color:#fff;padding:2px 6px;font-size:0.6rem;border-radius:2px;">${isQualy?'POLE':'FL'}</span>`:''}
                </div>
                <div style="color:#666;font-size:0.8rem;font-weight:bold;text-transform:uppercase;cursor:default;transition:color 0.2s;"
                     onmouseover="this.style.color='${tc}'" onmouseout="this.style.color='#666'">${r.Constructor?.name||'—'}</div>
                <div class="time-cell" style="color:${isFirst?hl:isFastestLap?'#b700ff':'#888'}">${timeDisplay}${flTime}</div>
                <div style="text-align:right;color:#fff;font-weight:900;">${zone}</div>
            </div>`;
    });

    container.innerHTML = html + `</div>`;
}

// Archive search
async function fetchSpecificRace() {
    const year  = document.getElementById('lookup-year').value;
    const round = document.getElementById('lookup-round').value;
    const container = document.getElementById('results-content');
    container.innerHTML = `<div style="padding:50px;text-align:center;color:#666;font-weight:bold;">ACCESSING ARCHIVES...</div>`;
    try {
        const r = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results`);
        if (r) renderResultsUI(r, "RACE");
        else container.innerHTML = `<div style="padding:50px;text-align:center;"><h3 style="color:#e10600;">NO DATA FOUND</h3></div>`;
    } catch(e) {
        container.innerHTML = `<div style="color:red;text-align:center;padding:20px;">SYSTEM ERROR</div>`;
    }
}

// Populate round selector dynamically based on year
async function populateRoundSelector() {
    const yearInput = document.getElementById('lookup-year');
    const roundSel  = document.getElementById('lookup-round');
    if (!roundSel || !yearInput) return;

    const year = yearInput.value || new Date().getFullYear();
    roundSel.innerHTML = `<option value="">⏳ Loading rounds...</option>`;

    try {
        const res  = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json?limit=30`);
        const data = await res.json();
        const races = data.MRData?.RaceTable?.Races || [];
        const now   = new Date();

        // Show all past rounds for selected year
        const done = races.filter(r => new Date(`${r.date}T${r.time || '12:00:00Z'}`) < now);

        if (done.length === 0) {
            roundSel.innerHTML = `<option value="">No completed rounds for ${year}</option>`;
            return;
        }

        roundSel.innerHTML = done.map(r =>
            `<option value="${r.round}">R${r.round.padStart(2,'0')} — ${r.raceName}</option>`
        ).join('');

        // Default to latest completed round
        roundSel.value = done[done.length - 1].round;

    } catch(e) {
        roundSel.innerHTML = `<option value="">Error loading rounds</option>`;
        console.error('Round selector error:', e);
    }
}

// ============================================================
// SCHEDULE — PKT date + time on each session, live badge
// ============================================================
async function initSchedule() {
    const container = document.getElementById('schedule-list');
    if (!container) return;
    container.innerHTML = `<div class="loading-container"><div class="f1-spinner"></div><p>FETCHING 2026 CALENDAR...</p></div>`;

    // Convert UTC datetime string to PKT (UTC+5)
    function toPKT(dateStr, timeStr) {
        return new Date(new Date(`${dateStr}T${timeStr || '00:00:00Z'}`).getTime() + 5 * 3600000);
    }

    function fmtPKT(dateStr, timeStr) {
        const d = toPKT(dateStr, timeStr);
        return {
            date: `${String(d.getDate()).padStart(2,'0')} ${d.toLocaleString('default',{month:'short'}).toUpperCase()}`,
            time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} PKT`
        };
    }

    try {
        let races = [];
        for (const year of ['2026','2025']) {
            const res  = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
            const data = await res.json();
            races = data.MRData?.RaceTable?.Races || [];
            if (races.length > 0) break;
        }

        const now = new Date();

        const rows = await Promise.all(races.map(async (race) => {
            const raceUTC    = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
            const qualiUTC   = race.Qualifying ? new Date(`${race.Qualifying.date}T${race.Qualifying.time || '00:00:00Z'}`) : null;
            const isFinished = raceUTC < now;
            const isQualiLive = qualiUTC && now >= qualiUTC && now < new Date(qualiUTC.getTime() + 2*3600000);
            const isRaceLive  = now >= raceUTC && now < new Date(raceUTC.getTime() + 3*3600000);
            const isSprint    = !!race.Sprint;

            let raceWin = null, poleSitter = null, sprintWin = null;
            if (isFinished) {
                try {
                    const [rr, qr] = await Promise.all([
                        fetch(`https://api.jolpi.ca/ergast/f1/${race.season}/${race.round}/results.json?limit=30`).then(r=>r.json()),
                        fetch(`https://api.jolpi.ca/ergast/f1/${race.season}/${race.round}/qualifying.json`).then(r=>r.json())
                    ]);
                    raceWin    = rr.MRData?.RaceTable?.Races?.[0]?.Results?.[0]?.Driver.code;
                    poleSitter = qr.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.[0]?.Driver.code;
                    if (isSprint) {
                        const sr = await fetch(`https://api.jolpi.ca/ergast/f1/${race.season}/${race.round}/sprint.json`).then(r=>r.json());
                        sprintWin = sr.MRData?.RaceTable?.Races?.[0]?.SprintResults?.[0]?.Driver.code;
                    }
                } catch(e) {}
            }

            // Render a single session row with PKT date + time
            const sessionRow = (session, label, winner = null, isLive = false) => {
                if (!session?.date) return `
                    <div class="session-item">
                        <span>${label}</span>
                        <strong style="color:#333">TBC</strong>
                    </div>`;

                const pkt     = fmtPKT(session.date, session.time);
                const sessUTC = new Date(`${session.date}T${session.time || '00:00:00Z'}`);
                const isPast  = sessUTC < now;

                if (isLive) return `
                    <div class="session-item" style="background:rgba(0,255,65,0.06);border-left:2px solid #00ff41;padding-left:8px;">
                        <span>${label}</span>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span class="live-blink-dot" style="width:7px;height:7px;margin:0;"></span>
                            <strong style="color:#00ff41">LIVE NOW</strong>
                        </div>
                    </div>`;

                if (isPast && winner) return `
                    <div class="session-item">
                        <span>${label}</span>
                        <a href="https://www.formula1.com/en/results.html/${race.season}/races.html" target="_blank" class="session-link">
                            <strong class="result-text">🏁 ${winner}</strong>
                            <span class="view-icon">VIEW ↗</span>
                        </a>
                    </div>`;

                if (isPast) return `
                    <div class="session-item">
                        <span>${label}</span>
                        <strong style="color:#444">DONE</strong>
                    </div>`;

                return `
                    <div class="session-item">
                        <span>${label}</span>
                        <div style="text-align:right;line-height:1.4;">
                            <strong style="color:#fff;font-size:0.9rem;">${pkt.time}</strong>
                            <div style="font-size:0.65rem;color:#555;letter-spacing:1px;">${pkt.date}</div>
                        </div>
                    </div>`;
            };

            const racePKT = fmtPKT(race.date, race.time);

            return `
                <div class="schedule-row-container ${isFinished ? 'completed' : ''} ${isRaceLive||isQualiLive ? 'live-weekend' : ''}">
                    <div class="schedule-main-row" onclick="toggleSchedule(this)">
                        <div class="col-rd">${race.round}</div>
                        <div class="col-date">
                            <span class="day">${racePKT.date.split(' ')[0]}</span>
                            <span class="month">${racePKT.date.split(' ')[1]}</span>
                        </div>
                        <div class="col-gp">
                            ${race.raceName.toUpperCase()}
                            ${isSprint ? '<span class="sprint-badge">SPRINT</span>' : ''}
                            ${isRaceLive||isQualiLive ? '<span class="live-blink-dot" style="margin-left:8px;width:8px;height:8px;"></span>' : ''}
                        </div>
                        <div class="col-circuit">${race.Circuit.circuitName}</div>
                        <div class="col-status">
                            ${isRaceLive  ? `<span style="color:#00ff41;font-weight:900;">● RACE LIVE</span>` :
                              isQualiLive ? `<span style="color:#00ff41;font-weight:900;">● QUALI LIVE</span>` :
                              isFinished  ? `<span class="winner-label">🏆 ${raceWin||'FIN'}</span>` :
                              '<span>UPCOMING ❯</span>'}
                        </div>
                    </div>
                    <div class="schedule-details">
                        <div class="details-grid">
                            ${sessionRow(race.FirstPractice, 'FP1')}
                            ${isSprint
                                ? sessionRow(race.SprintQualifying, 'SPRINT QUALI')
                                : sessionRow(race.SecondPractice, 'FP2')}
                            ${isSprint
                                ? sessionRow(race.Sprint, 'SPRINT RACE', sprintWin)
                                : sessionRow(race.ThirdPractice, 'FP3')}
                            ${sessionRow(race.Qualifying, 'QUALIFYING', poleSitter, isQualiLive)}
                            ${sessionRow({date:race.date,time:race.time}, 'GRAND PRIX', raceWin, isRaceLive)}
                        </div>
                    </div>
                </div>`;
        }));

        container.innerHTML = rows.join('');

    } catch(e) {
        container.innerHTML = `<p style="color:#e10600;text-align:center;padding:40px;">Error loading schedule.</p>`;
    }
}

function toggleSchedule(el) {
    el.parentElement.classList.toggle('expanded');
}

// ============================================================
// CARS
// ============================================================
function initCarsTab() {
    const grid = document.getElementById('cars-display-grid');
    if (!grid) return;
    grid.innerHTML = f1Cars2026.map(car => {
        let imgs = '';
        for (let i = 1; i <= 5; i++) {
            imgs += `<img src="./Cars/${car.id}-${i}.avif" id="img-${car.id}-${i}" onerror="tryNextExt(this,'${car.id}',${i})" alt="Angle ${i}">`;
        }
        return `
        <div class="car-card" onclick="openGallery('${car.id}',5)">
            <div class="car-badge">${car.team}</div>
            <div class="car-slider">${imgs}</div>
            <div class="car-info">
                <h3>${car.name}</h3><p>${car.drivers}</p>
                <div class="action-hint">Slide to view 5 angles</div>
            </div>
        </div>`;
    }).join('');
}

function openGallery(teamId, photoCount = 5) {
    const overlay = document.getElementById('gallery-overlay');
    const content = document.getElementById('gallery-content');
    if (!overlay || !content) return;
    let html = '';
    for (let i = 1; i <= photoCount; i++) {
        html += `<img src="./Cars/${teamId}-${i}.avif" onerror="this.onerror=null;this.src='https://placehold.co/800x450/111/333?text=No+Image'">`;
    }
    content.innerHTML = html;
    overlay.style.display = 'flex';
}

function tryNextExt(img, teamId, num) {
    // Cars are .avif only — on error just show placeholder
    img.onerror = null;
    img.src = 'https://placehold.co/800x450/111/333?text=Image+Not+Found';
}

function closeGallery() {
    document.getElementById('gallery-overlay').style.display = 'none';
}

// ============================================================
// NEWS
// ============================================================
async function fetchLiveF1News() {
    const el = document.getElementById('news-feed');
    if (!el) return;
    el.innerHTML = `<div style="color:#444;padding:20px;">FETCHING SATELLITE FEED...</div>`;
    try {
        const res  = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://www.autosport.com/rss/f1/news/')}`);
        const data = await res.json();
        if (!data.items?.length) throw new Error();
        el.innerHTML = data.items.slice(0,8).map(item => {
            const img  = item.thumbnail || item.enclosure?.link || "images/news-placeholder.jpg";
            const date = new Date(item.pubDate).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
            return `
            <a href="${item.link}" target="_blank" class="news-card-link">
                <div class="news-card">
                    <div class="news-img-container">
                        <img src="${img}" onerror="this.src='https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=800'" class="news-pic">
                    </div>
                    <div class="news-content" style="padding:15px;">
                        <span class="news-date" style="color:#888;font-size:0.7rem;">${date}</span>
                        <h4 style="margin:10px 0;color:#fff;font-size:1.1rem;">${item.title}</h4>
                        <p style="color:#666;font-size:0.85rem;line-height:1.4;margin-bottom:10px;">${item.description.replace(/<[^>]*>/g,'').slice(0,80)}...</p>
                        <div class="news-source-tag">SOURCE: AUTOSPORT</div>
                    </div>
                </div>
            </a>`;
        }).join('');
    } catch(e) {
        el.innerHTML = `<p style="color:#e10600;padding:20px;">SIGNAL LOST: NEWS FEED OFFLINE</p>`;
    }
}

// ============================================================
// WEATHER
// ============================================================
async function updateF1Weather() {
    const icon   = document.getElementById('refresh-icon');
    const gripEl = document.getElementById('track-grip');
    const wm     = document.getElementById('dynamic-watermark');
    if (icon) icon.classList.add('fa-spin');
    if (gripEl) gripEl.innerText = "SYNCING...";

    try {
        const now  = new Date();
        const race = f1Calendar2026.find(r => new Date(r.date) >= now) || f1Calendar2026[0];
        if (wm) wm.innerText = race.circuit.replace(/GP|Circuit|Grand Prix/gi,'').trim().toUpperCase();

        // Request real track temp (soil_temperature_0cm), real rain probability,
        // real precipitation, and surface pressure for better accuracy
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${race.lat}&longitude=${race.lon}`
            + `&current=temperature_2m,apparent_temperature,precipitation,precipitation_probability,`
            + `weather_code,wind_speed_10m,wind_gusts_10m,surface_pressure,`
            + `soil_temperature_0cm,shortwave_radiation`
            + `&timezone=auto`;

        const res  = await fetch(url);
        const data = await res.json();
        const live = data.current;

        setTimeout(() => {
            const set = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };

            const airTemp   = Math.round(live.temperature_2m);
            const feelsLike = Math.round(live.apparent_temperature);

            // Real track temp: soil surface + solar radiation effect
            // On a sunny day track can be 20-30°C above air; cloudy much less
            const radiation  = live.shortwave_radiation || 0;          // W/m²
            const solarBoost = Math.round(radiation / 40);              // ~0–25°C boost
            const trackTemp  = Math.round((live.soil_temperature_0cm || airTemp) + solarBoost);

            // Real rain probability from API
            const rainProb = live.precipitation_probability ?? Math.round(
                live.precipitation > 0 ? Math.min(live.precipitation * 100, 99) : 0
            );

            const isWet  = live.precipitation > 0.1;
            const isRain = live.weather_code >= 51;

            // Weather status from WMO code
            let status = "CLEAR";
            const wc = live.weather_code;
            if (wc <= 1)       status = "CLEAR";
            else if (wc <= 3)  status = "PARTLY CLOUDY";
            else if (wc <= 48) status = "OVERCAST";
            else if (wc <= 67) status = "RAIN";
            else if (wc <= 77) status = "SNOW";
            else if (wc <= 82) status = "SHOWERS";
            else               status = "STORM";

            set('air-temp',      `${airTemp}°C`);
            set('track-temp',    `${trackTemp}°C`);
            set('rain-risk',     `${rainProb}%`);
            set('wind-speed',    `${Math.round(live.wind_speed_10m)} km/h`);
            set('weather-status', status);

            if (gripEl) {
                if (isWet || isRain) {
                    gripEl.innerText   = "SLIPPERY";
                    gripEl.className   = "weather-value slippery";
                } else if (rainProb > 60) {
                    gripEl.innerText   = "DAMP RISK";
                    gripEl.className   = "weather-value slippery";
                } else {
                    gripEl.innerText   = "OPTIMAL";
                    gripEl.className   = "weather-value optimal";
                }
            }

            if (icon) icon.classList.remove('fa-spin');
        }, 500);

    } catch(e) {
        console.error("Weather error:", e);
        if (gripEl) gripEl.innerText = "OFFLINE";
        if (icon) icon.classList.remove('fa-spin');
    }
}
