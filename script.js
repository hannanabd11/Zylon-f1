// ============================================================
// ZYLON BY A.H — SCRIPT.JS (LOCAL VERSION)
// Features: Live timer, auto-open live timing, PKT schedule,
// auto-updating results, live green blinker, driver stats
// ============================================================

async function fetchWithTimeout(url, ms = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res;
    } catch(e) {
        clearTimeout(timer);
        throw e;
    }
}

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

    window._autoRefreshInterval = setInterval(() => { if (!window._viewingArchive) updateLatestResults(); }, 120000);
    setInterval(initStandings, 300000);
});

// ============================================================
// INJECT CSS
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
        @keyframes blink { 50% { opacity: 0.3; } }

        /* Driver number — anchored to right edge, sized to fit fully inside card */
        .driver-card-new { position: relative !important; overflow: hidden !important; }
        .driver-num-bg {
            position: absolute;
            top: 15%;
            right: 12px;
            font-size: 4.8rem;
            font-weight: 900;
            font-style: italic;
            line-height: 1;
            color: var(--team-color, #e10600);
            opacity: 0.22;
            pointer-events: none;
            user-select: none;
            z-index: 9;
            letter-spacing: -1px;
            transition: opacity 0.3s;
            white-space: nowrap;
            text-align: right;
        }
        .driver-card-new:hover .driver-num-bg { opacity: 0.45; }
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
// ZENITH TIMER
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

    // CHANGE 1: Skip cancelled rounds — Bahrain (R2) and Saudi Arabia (R3) cancelled 2026
    const CANCELLED_ROUNDS = [2, 3];
    let race = zenithRaceSchedule.find(r =>
        !CANCELLED_ROUNDS.includes(r.round) &&
        now < new Date(r.Race.iso).getTime() + RACE_DURATION_MS
    );
    if (!race) { label.innerText = "SEASON COMPLETE"; display.innerText = "SEE YOU IN 2027"; return; }

    const qualiTime = new Date(race.Qualifying.iso).getTime();
    const raceTime  = new Date(race.Race.iso).getTime();
    if (flagImg) flagImg.src = `https://flagcdn.com/w40/${getFlagForGP(race.gp)}.png`;

    let targetTime, sessionName, isLive = false;
    if (now < qualiTime)                          { targetTime = qualiTime; sessionName = "QUALIFYING"; }
    else if (now < qualiTime + QUALI_DURATION_MS) { sessionName = "QUALIFYING"; isLive = true; }
    else if (now < raceTime)                      { targetTime = raceTime;  sessionName = "GRAND PRIX"; }
    else                                          { sessionName = "GRAND PRIX"; isLive = true; }

    container.classList.remove('state-waiting', 'state-live', 'state-warning');
    const gpShort = race.gp.split(' ')[0].toUpperCase();

    if (isLive) {
        container.classList.add('state-live');
        label.innerHTML = `<span class="live-blink-dot"></span>${gpShort} ${sessionName} LIVE`;
        display.style.pointerEvents = "auto";
        display.style.overflow      = "visible";
        display.style.zIndex        = "999";
        display.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:8px;align-items:center;">
                <a href="https://www.formula1.com/en/live-timing" target="_blank" rel="noopener noreferrer"
                   style="pointer-events:auto;position:relative;z-index:999;display:inline-block;
                          background:#e10600;color:#fff;padding:8px 20px;border-radius:3px;
                          font-weight:900;font-size:0.85rem;text-decoration:none;letter-spacing:1px;">
                    🔴 WATCH LIVE TIMING ➔
                </a>
                <a href="live-timing.html" target="_blank" rel="noopener noreferrer"
                   style="pointer-events:auto;position:relative;z-index:999;display:inline-block;
                          background:#000;color:#00ff41;padding:8px 20px;border-radius:3px;
                          font-weight:900;font-size:0.85rem;text-decoration:none;letter-spacing:1px;
                          border:1px solid #00ff41;">
                    ⚡ ENTER COMMAND CENTER ➔
                </a>
            </div>`;
        updateLatestResults();
    } else {
        const diff = targetTime - now;
        if (diff < 3600000) container.classList.add('state-warning');
        else                container.classList.add('state-waiting');
        label.innerText = `${gpShort} ${sessionName}`;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000)  / 60000);
        const s = Math.floor((diff % 60000)    / 1000);
        display.style.pointerEvents = "";
        display.style.overflow      = "";
        display.style.zIndex        = "";
        display.innerHTML = `
            ${d}<span class="timer-unit">D</span>
            ${String(h).padStart(2,'0')}<span class="timer-unit">H</span>
            ${String(m).padStart(2,'0')}<span class="timer-unit">M</span>
            ${String(s).padStart(2,'0')}<span class="timer-unit">S</span>`;
    }
}

// ============================================================
// AUTO-OPEN LIVE TIMING when session starts (LOCAL ONLY)
// ============================================================
let _liveTabOpened = false;
function checkAndOpenLiveTiming() {
    if (_liveTabOpened) return;
    const now              = new Date().getTime();
    const RACE_DURATION_MS = 3 * 60 * 60 * 1000;
    const CANCELLED_ROUNDS = [2, 3];
    const race = zenithRaceSchedule.find(r =>
        !CANCELLED_ROUNDS.includes(r.round) &&
        now < new Date(r.Race.iso).getTime() + RACE_DURATION_MS
    );
    if (!race) return;
    const qualiTime = new Date(race.Qualifying.iso).getTime();
    const raceTime  = new Date(race.Race.iso).getTime();
    const qualiJustStarted = now >= qualiTime && now < qualiTime + 60000;
    const raceJustStarted  = now >= raceTime  && now < raceTime  + 60000;
    if (qualiJustStarted || raceJustStarted) {
        _liveTabOpened = true;
        const banner = document.createElement("div");
        banner.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;background:#e10600;color:#fff;
                text-align:center;padding:14px;font-family:'Titillium Web',sans-serif;
                font-weight:900;font-size:0.9rem;letter-spacing:3px;z-index:99999;
                display:flex;align-items:center;justify-content:center;gap:16px;">
                <span style="width:10px;height:10px;border-radius:50%;background:#fff;
                    display:inline-block;animation:blink 0.8s infinite;"></span>
                🔴 ${race.gp.toUpperCase()} — ${raceJustStarted ? 'RACE' : 'QUALIFYING'} IS LIVE
                <a href="live-timing.html" target="_blank"
                   style="background:#fff;color:#e10600;padding:5px 16px;
                          text-decoration:none;font-size:0.75rem;font-weight:900;letter-spacing:2px;">
                    OPEN LIVE TIMING →
                </a>
            </div>`;
        document.body.prepend(banner);
        setTimeout(() => window.open("live-timing.html", "_blank"), 3000);
    }
}

setInterval(() => { updateZenithTimer(); checkAndOpenLiveTiming(); }, 1000);
updateZenithTimer();
checkAndOpenLiveTiming();

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
    for (let n of document.getElementsByClassName("tab-item"))    { n.classList.remove("active"); }
    const sec = document.getElementById(targetId);
    if (sec) { sec.style.display="block"; sec.classList.add("active"); }
    if (evt?.currentTarget) evt.currentTarget.classList.add("active");
    window.scrollTo({ top:0, behavior:'instant' });
    handleTabLoading(targetId);
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => window.scrollTo(0,0));

function handleTabLoading(id) {
    if      (id === 'home')      { fetchLiveF1News(); updateLatestResults(); }
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
        const lastName    = rest.join(' ').toUpperCase();
        const accentColor = d.color || teamColors[d.team] || "#e10600";
        const card        = document.createElement('div');
        card.className    = "driver-card-new";
        card.style.setProperty('--team-color', accentColor);

        // CHANGE 2: Google search links (F1.com driver URLs are broken/inconsistent)
        const driverF1Url = `https://www.google.com/search?q=${encodeURIComponent(d.name)}+F1+driver+2026`;
        const teamF1Url   = `https://www.google.com/search?q=${encodeURIComponent(d.team.replace(/_/g,' '))}+F1+team+2026`;

        card.innerHTML = `
            <a href="${driverF1Url}" target="_blank" style="text-decoration:none;color:inherit;display:block;">
                <div class="driver-image-area">
                    <img src="images/Drivers/${d.id}.PNG" class="driver-portrait"
                         onerror="this.onerror=null;this.src='images/Drivers/placeholder.png'">
                    <div class="image-gradient"></div>
                </div>
            </a>
            <div class="driver-num-bg">${d.no}</div>
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
                            <h3 onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'"
                                style="cursor:pointer;transition:opacity 0.2s;">
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
                    <div class="stat-box"><span class="stat-n" id="podiums-${d.id}">${d.podiums ?? 0}</span><span class="stat-l">Podiums</span></div>
                    <div class="stat-box"><span class="stat-n" id="poles-${d.id}">${d.poles}</span><span class="stat-l">Poles</span></div>
                    <div class="stat-box"><span class="stat-n">${d.champ}</span><span class="stat-l">Titles</span></div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

// ============================================================
// AUTO-UPDATE DRIVER STATS (wins + podiums + poles)
// ============================================================
async function autoUpdateDriverStats() {
    renderDrivers();
    try {
        let standingsData = null;
        for (const year of ['2026','2025']) {
            const res  = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`);
            const json = await res.json();
            const list = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
            if (list?.length > 0) { standingsData = list; break; }
        }
        if (!standingsData) return;

        const polesMap   = {};
        const podiumsMap = {};

        for (let round = 1; round <= 24; round++) {
            try {
                // Poles
                const qr = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/2026/${round}/qualifying.json`);
                const qj = await qr.json();
                const qResults = qj.MRData?.RaceTable?.Races?.[0]?.QualifyingResults;
                if (!qResults?.length) break;
                const poleId = qResults[0].Driver.driverId.toLowerCase();
                polesMap[poleId] = (polesMap[poleId] || 0) + 1;

                // Podiums (top 3)
                const rr = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/2026/${round}/results.json?limit=3`);
                const rj = await rr.json();
                const rResults = rj.MRData?.RaceTable?.Races?.[0]?.Results || [];
                rResults.forEach(res => {
                    if (parseInt(res.position) <= 3) {
                        const dId = res.Driver.driverId.toLowerCase();
                        podiumsMap[dId] = (podiumsMap[dId] || 0) + 1;
                    }
                });
            } catch(e) { break; }
        }

        f1_2026_grid.forEach(driver => {
            const match = standingsData.find(ls =>
                ls.Driver.driverId.toLowerCase().includes(driver.id.toLowerCase()) ||
                driver.name.toLowerCase().includes(ls.Driver.familyName.toLowerCase())
            );
            if (match) {
                const seasonWins = parseInt(match.wins) || 0;
                if (driver._baseWins    === undefined) driver._baseWins    = driver.wins;
                if (driver._basePoles   === undefined) driver._basePoles   = driver.poles;
                if (driver._basePodiums === undefined) driver._basePodiums = driver.podiums ?? 0;
                driver.wins    = driver._baseWins    + seasonWins;
                const dId      = match.Driver.driverId.toLowerCase();
                driver.poles   = driver._basePoles   + (polesMap[dId]   || 0);
                driver.podiums = driver._basePodiums + (podiumsMap[dId] || 0);
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
function getTeamUrl(team) {
    const urls = {
        "McLaren":        "https://www.mclaren.com/racing/formula-1/",
        "Red Bull":       "https://www.redbullracing.com/",
        "Ferrari":        "https://www.ferrari.com/en-EN/formula1",
        "Mercedes":       "https://www.mercedesamgf1.com/",
        "Aston Martin":   "https://www.astonmartinf1.com/",
        "Williams":       "https://www.williamsf1.com/",
        "Alpine F1 Team": "https://www.alpinecars.com/",
        "Haas F1 Team":   "https://www.haasf1team.com/",
        "Audi":           "https://www.audi.com/en/sport/formula-1.html",
        "Sauber":         "https://www.sauber-group.com/motorsport/formula-1/",
        "Kick Sauber":    "https://www.sauber-group.com/motorsport/formula-1/",
        "VCARB":          "https://www.visacashapprb.com/",
        "RB F1 Team":     "https://www.visacashapprb.com/",
        "Racing Bulls":   "https://www.visacashapprb.com/",
        "Cadillac":       "https://www.cadillac.com/f1"
    };
    return urls[team] || `https://www.formula1.com/en/teams/${(team||'').toLowerCase().replace(/\s+/g,'-')}`;
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

async function initStandings() {
    const dContainer = document.getElementById('drivers-list');
    const tContainer = document.getElementById('teams-list');
    if (!dContainer || !tContainer) return;

    let dList = [], tList = [];
    for (const year of ['2026','2025']) {
        try {
            const [dRes, tRes] = await Promise.all([
                fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
                fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`)
            ]);
            const dJson = await dRes.json();
            const tJson = await tRes.json();
            const dl = dJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
            const tl = tJson.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
            if (dl.length > 0) {
                dList = dl; tList = tl;
                const yr = dJson.MRData?.StandingsTable?.StandingsLists?.[0]?.season;
                const rd = dJson.MRData?.StandingsTable?.StandingsLists?.[0]?.round;
                if (yr) dList._season = `${yr} • AFTER ROUND ${rd}`;
                break;
            }
        } catch(e) { continue; }
    }

    const seasonLabel = dList._season
        ? `<div style="padding:8px 20px;color:#444;font-size:0.65rem;letter-spacing:2px;font-weight:900;">${dList._season}</div>`
        : '';

    // ── DRIVER STANDINGS ──
    dContainer.innerHTML = seasonLabel + (dList.length ? dList.map((item, idx) => {
        const pos       = parseInt(item.position || item.positionText) || (idx + 1);
        const teamColor = getTeamColor(item.Constructors?.[0]?.name || '');
        const driverInfo = f1_2026_grid.find(d => d.name.toLowerCase().includes(item.Driver.familyName.toLowerCase()));
        const flag = driverInfo?.flag || 'un';
        // CHANGE 3: Google search link for driver name in standings
        const driverSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.Driver.givenName + ' ' + item.Driver.familyName)}+F1+2026`;
        return `
            <div class="standings-entry" style="--team-glow:${teamColor};transition:background 0.2s,transform 0.15s;"
                 onmouseover="this.style.background='${teamColor}15';this.style.transform='translateX(4px)';this.querySelector('.driver-text').style.color='${teamColor}';this.querySelector('.entry-pts-inner').style.color='${teamColor}'"
                 onmouseout="this.style.background='';this.style.transform='';this.querySelector('.driver-text').style.color='#fff';this.querySelector('.entry-pts-inner').style.color=''">
                <div class="pos-num">${pos}</div>
                <div class="team-strip" style="background:${teamColor}"></div>
                <div class="entry-name">
                    <span class="team-label">${item.Constructors?.[0]?.name || '—'}</span>
                    <div class="driver-name-row" style="display:flex;align-items:center;">
                        <img src="https://flagcdn.com/w40/${flag}.png" class="tiny-flag">
                        <a href="${driverSearchUrl}" target="_blank"
                           class="driver-text" style="transition:color 0.2s;text-decoration:none;color:#fff;"
                           onclick="event.stopPropagation()">
                            ${item.Driver.givenName} <strong>${item.Driver.familyName}</strong>
                        </a>
                    </div>
                </div>
                <div class="entry-pts"><span class="entry-pts-inner" style="transition:color 0.2s;">${item.points ?? 0}</span></div>
            </div>`;
    }).join('') : `<div style="padding:20px;color:#444;text-align:center;">NO 2026 DATA YET — SHOWING AFTER ROUND 1</div>`);

    // ── CONSTRUCTOR STANDINGS ──
    const teamFlagMap = {
        "McLaren":"gb","Red Bull":"at","Ferrari":"it","Mercedes":"de",
        "Aston Martin":"gb","Williams":"gb","VCARB":"it","Haas F1 Team":"us",
        "Alpine F1 Team":"fr","Audi":"de","Sauber":"ch","Kick Sauber":"ch",
        "RB F1 Team":"it","Cadillac":"us","Racing Bulls":"it"
    };
    tContainer.innerHTML = tList.length ? tList.map((item, idx) => {
        const pos       = parseInt(item.position || item.positionText) || (idx + 1);
        const teamColor = getTeamColor(item.Constructor?.name || '');
        const teamFlag  = teamFlagMap[item.Constructor?.name] || 'un';
        return `
            <div class="standings-entry" style="--team-glow:${teamColor};transition:background 0.2s,transform 0.15s;"
                 onmouseover="this.style.background='${teamColor}15';this.style.transform='translateX(4px)';this.querySelector('.team-name-glow').style.color='${teamColor}';this.querySelector('.cons-pts').style.color='${teamColor}'"
                 onmouseout="this.style.background='';this.style.transform='';this.querySelector('.team-name-glow').style.color='#fff';this.querySelector('.cons-pts').style.color=''">
                <div class="pos-num">${pos}</div>
                <div class="team-strip" style="background:${teamColor}"></div>
                <div class="entry-name">
                    <span class="team-label">CONSTRUCTOR</span>
                    <div class="driver-name-row" style="display:flex;align-items:center;gap:6px;">
                        <img src="https://flagcdn.com/w40/${teamFlag}.png" class="tiny-flag" alt="${item.Constructor?.name}">
                        <a href="${getTeamUrl(item.Constructor?.name)}" target="_blank"
                           class="team-name-glow driver-text"
                           style="color:#fff;font-weight:900;transition:color 0.2s;text-decoration:none;"
                           onclick="event.stopPropagation()">
                            ${item.Constructor?.name?.toUpperCase() || '—'}
                        </a>
                    </div>
                </div>
                <div class="entry-pts"><span class="cons-pts" style="transition:color 0.2s;">${item.points ?? 0}</span></div>
            </div>`;
    }).join('') : `<div style="padding:20px;color:#444;text-align:center;">NO 2026 DATA YET</div>`;
}

// ============================================================
// FETCH ALL RESULTS (paginated + sprint support)
// ============================================================
async function fetchAllResults(url) {
    const isQuali  = url.includes('qualifying');
    const isSprint = url.includes('sprint');
    const [res1, res2] = await Promise.all([
        fetchWithTimeout(`${url}.json?limit=20&offset=0`),
        fetchWithTimeout(`${url}.json?limit=10&offset=20`)
    ]);
    const data1 = await res1.json();
    const race1 = data1.MRData?.RaceTable?.Races?.[0];
    if (!race1) return null;

    let page1 = isQuali  ? (race1.QualifyingResults || [])
              : isSprint ? (race1.SprintResults     || [])
              :             (race1.Results           || []);
    let page2 = [];
    try {
        const data2 = await res2.json();
        const race2 = data2.MRData?.RaceTable?.Races?.[0];
        if (race2) {
            page2 = isQuali  ? (race2.QualifyingResults || [])
                  : isSprint ? (race2.SprintResults     || [])
                  :             (race2.Results           || []);
        }
    } catch(e) {}

    const allResults = [...page1];
    const existingPositions = new Set(page1.map(r => r.position));
    for (const r of page2) { if (!existingPositions.has(r.position)) allResults.push(r); }
    allResults.sort((a, b) => parseInt(a.position) - parseInt(b.position));

    if (isQuali)  return { ...race1, QualifyingResults: allResults };
    if (isSprint) return { ...race1, SprintResults:     allResults };
    return { ...race1, Results: allResults };
}

// ============================================================
// RESULTS ENGINE
// ============================================================
async function updateLatestResults() {
    window._viewingArchive = false;
    const container = document.getElementById('results-content');
    if (!container) return;
    container.innerHTML = "<div style='color:#666;padding:20px;'>ACCESSING TIMING DATA...</div>";
    const now = new Date();

    for (const year of ['2026','2025']) {
        try {
            const [race, qualy, sprint] = await Promise.all([
                fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/last/results`).catch(()=>null),
                fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/last/qualifying`).catch(()=>null),
                fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/last/sprint`).catch(()=>null)
            ]);
            if (!race && !qualy) continue;
            const raceDate  = race  ? new Date(`${race.date}T${race.time  || '12:00:00Z'}`) : null;
            const qualiDate = qualy ? new Date(`${qualy.date}T${qualy.time || '12:00:00Z'}`) : null;

            const sessions = [];
            if (race?.Results?.length  > 0 && raceDate  && raceDate  < now) sessions.push({ type:"RACE",       data:race,   time:raceDate });
            if (sprint?.SprintResults?.length > 0 && sprint.date)            sessions.push({ type:"SPRINT",     data:sprint, time:new Date(`${sprint.date}T${sprint.time||'12:00:00Z'}`) });
            if (qualy?.QualifyingResults?.length > 0 && qualiDate && qualiDate < now) sessions.push({ type:"QUALIFYING", data:qualy,  time:qualiDate });

            if (sessions.length > 0) { sessions.sort((a,b) => b.time-a.time); renderSessionTabs(sessions); return; }
            if (qualy?.QualifyingResults?.length > 0) { renderSessionTabs([{type:"QUALIFYING",data:qualy,time:qualiDate}]); return; }
            if (race?.Results?.length  > 0)           { renderSessionTabs([{type:"RACE",data:race,time:raceDate}]);         return; }
        } catch(e) { continue; }
    }

    container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;">
            <div style="font-size:2.5rem;margin-bottom:15px;">⏳</div>
            <h2 style="color:#fff;font-weight:900;text-transform:uppercase;margin-bottom:10px;letter-spacing:2px;">RESULTS INCOMING</h2>
            <p style="color:#555;font-size:0.8rem;margin-bottom:30px;letter-spacing:1px;line-height:1.8;">
                RACE DATA IS BEING PROCESSED<br><span style="color:#333;">CHECK BACK IN A FEW HOURS</span>
            </p>
            <button onclick="updateLatestResults()"
               style="background:#111;color:#555;padding:12px 30px;border-radius:4px;
                      font-weight:900;letter-spacing:2px;cursor:pointer;font-size:0.75rem;
                      text-transform:uppercase;border:1px solid #222;">↻ RETRY</button>
        </div>`;
}

// ============================================================
// SESSION TABS
// ============================================================
function renderSessionTabs(sessions) {
    const container = document.getElementById('results-content');
    if (!container || !sessions.length) return;
    const tabColors = { RACE:"#e10600", SPRINT:"#ff6600", QUALIFYING:"#b700ff" };
    const tabLabels = { RACE:"🏁 RACE", SPRINT:"🏃 SPRINT RACE", QUALIFYING:"⏱ QUALIFYING" };
    const tabBar = sessions.map((s,i) => `
        <button onclick="switchResultTab(${i})" id="rtab-${i}"
            style="background:${i===0?tabColors[s.type]:'#1a1a1a'};
                   color:${i===0?'#fff':'#555'};
                   border:1px solid ${tabColors[s.type]}44;
                   padding:8px 20px;border-radius:4px;font-weight:900;
                   font-size:0.75rem;cursor:pointer;letter-spacing:1px;
                   transition:all 0.2s;font-family:inherit;">
            ${tabLabels[s.type]||s.type}
        </button>`).join('');
    container.innerHTML = `
        <div style="display:flex;gap:8px;padding:20px 0 0 0;flex-wrap:wrap;" id="result-tab-bar">${tabBar}</div>
        <div id="result-tab-content"></div>`;
    window._resultSessions   = sessions;
    window._resultTabColors  = tabColors;
    switchResultTab(0);
}

function switchResultTab(idx) {
    const sessions  = window._resultSessions;
    const tabColors = window._resultTabColors;
    if (!sessions) return;
    sessions.forEach((s,i) => {
        const btn = document.getElementById(`rtab-${i}`);
        if (!btn) return;
        btn.style.background = i===idx ? tabColors[s.type] : '#1a1a1a';
        btn.style.color      = i===idx ? '#fff' : '#555';
    });
    const tabContent = document.getElementById('result-tab-content');
    if (!tabContent) return;
    renderResultsUIInto(tabContent, sessions[idx].data, sessions[idx].type);
}

function renderResultsUI(race, sessionType = "RACE") {
    renderResultsUIInto(document.getElementById('results-content'), race, sessionType);
}

function renderResultsUIInto(target, race, sessionType) {
    const container = target;
    if (!container) return;
    const tcMap = {
        "mercedes":"#27F4D2","red_bull":"#3671C6","ferrari":"#E80020",
        "mclaren":"#FF8000","aston_martin":"#229971","alpine":"#0093CC",
        "haas":"#B6BABD","williams":"#64C4FF","sauber":"#52E252",
        "rb":"#6692FF","racing_bulls":"#6692FF","cadillac":"#FFD700","audi":"#535151"
    };
    const isQualy       = sessionType === "QUALIFYING";
    const isSprint      = sessionType === "SPRINT";
    const isSprintQuali = sessionType === "SPRINT_QUALI";
    const accentColor   = isQualy ? "#b700ff" : isSprint ? "#ff6600" : isSprintQuali ? "#ff9900" : "#e10600";
    const resultsData   = (isQualy||isSprintQuali) ? race.QualifyingResults
                        : isSprint                 ? race.SprintResults
                        :                            race.Results;
    if (!resultsData?.length) return;

    const sessionLabel = isQualy ? "QUALIFYING RESULT" : isSprint ? "SPRINT RACE" : isSprintQuali ? "SPRINT QUALIFYING" : "LATEST RACE";
    const classLabel   = isQualy ? "QUALIFYING CLASSIFICATION" : isSprint ? "SPRINT CLASSIFICATION" : isSprintQuali ? "SPRINT QUALI CLASSIFICATION" : "OFFICIAL CLASSIFICATION";

    let html = `
        <div class="results-wrapper">
            <div style="padding:40px 0 20px 0;">
                <div style="margin-bottom:20px;">
                    <span style="background:${accentColor};color:#fff;padding:4px 12px;font-size:0.75rem;font-weight:900;text-transform:uppercase;letter-spacing:1px;">${sessionLabel}</span>
                </div>
                <h1 style="color:#fff;font-size:3rem;font-weight:900;margin:0;text-transform:uppercase;line-height:1;">
                    ${race.raceName.toUpperCase()} <span style="color:#444;">${race.season}</span>
                </h1>
                <p style="color:#aaa;font-size:0.9rem;margin-top:15px;text-transform:uppercase;letter-spacing:2px;">
                    ROUND ${race.round} • ${classLabel}
                </p>
                <div style="width:100%;height:2px;background:${accentColor};margin-top:30px;"></div>
            </div>
            <div style="display:grid;grid-template-columns:50px 1.5fr 1fr 150px 80px;padding:10px 25px;color:#444;font-size:0.75rem;font-weight:900;text-transform:uppercase;">
                <div>Pos</div><div>Driver</div><div>Team</div>
                <div style="text-align:right;">${(isQualy||isSprintQuali)?"Best Lap":"Time / Gap"}</div>
                <div style="text-align:right;">${(isQualy||isSprintQuali)?"Zone":"Pts"}</div>
            </div>`;

    resultsData.forEach((r,i) => {
        const isFirst      = i === 0;
        const isFastestLap = r.FastestLap != null && String(r.FastestLap.rank) === "1";
        const tc           = tcMap[r.Constructor?.constructorId] || "#888";
        const hl           = isFirst ? (isQualy||isSprintQuali ? "#b700ff" : "#00ff00") : isFastestLap ? "#b700ff" : tc;
        const flTime       = !(isQualy||isSprintQuali) && isFastestLap && r.FastestLap?.Time?.time
            ? ` <span style="font-size:0.65rem;color:#b700ff;display:block;">${r.FastestLap.Time.time}</span>` : '';
        const timeDisplay  = (isQualy||isSprintQuali)
            ? (r.Q3||r.Q2||r.Q1||"No Time")
            : (isFirst ? (r.Time?.time||"—") : (r.Time ? `+${r.Time.time}` : r.status));
        const zone = (isQualy||isSprintQuali)
            ? (i<10  ? `<span style="color:#00ff88;font-weight:900;font-size:0.7rem;">Q3 ✓</span>`
              :i<15  ? `<span style="color:#f9d71c;font-weight:900;font-size:0.7rem;">Q2 ✗</span>`
              :         `<span style="color:#e10600;font-weight:900;font-size:0.7rem;">Q1 ✗</span>`)
            : r.points;

        html += `
            <div class="${isFastestLap||(isFirst&&(isQualy||isSprintQuali))?'result-row highlight-purple':'result-row'}"
                 style="border-left:4px solid ${hl};${isFirst?'background:rgba(255,255,255,0.02);':''}transition:background 0.2s;"
                 onmouseover="this.style.background='${tc}18';this.style.borderLeftColor='${isFirst?hl:tc}';this.querySelector('.result-team-name').style.color='${tc}'"
                 onmouseout="this.style.background='${isFirst?'rgba(255,255,255,0.02)':'transparent'}';this.style.borderLeftColor='${hl}';this.querySelector('.result-team-name').style.color='#666'">
                <div style="font-weight:900;color:${isFirst?hl:'#555'};font-size:1.2rem;">${r.position}</div>
                <div class="result-driver-name" style="color:#fff;font-weight:900;font-size:1.1rem;display:flex;align-items:center;gap:8px;">
                    <span>${r.Driver.givenName[0]}. <span style="color:${isFirst?hl:'#fff'}">${r.Driver.familyName.toUpperCase()}</span></span>
                    ${(isFastestLap||(isFirst&&(isQualy||isSprintQuali)))?`<span style="background:#b700ff;color:#fff;padding:2px 6px;font-size:0.6rem;border-radius:2px;">${(isQualy||isSprintQuali)?'POLE':'FL'}</span>`:''}
                </div>
                <div class="result-team-name" style="color:#666;font-size:0.8rem;font-weight:bold;text-transform:uppercase;transition:color 0.2s;"
                     onmouseover="this.style.color='${tc}'" onmouseout="this.style.color='#666'">${r.Constructor?.name||'—'}</div>
                <div class="time-cell" style="color:${isFirst?hl:isFastestLap?'#b700ff':'#888'}">${timeDisplay}${flTime}</div>
                <div style="text-align:right;color:#fff;font-weight:900;">${zone}</div>
            </div>`;
    });
    container.innerHTML = html + `</div>`;
}

// ============================================================
// ARCHIVE SEARCH
// ============================================================
async function fetchSpecificRace() {
    const year      = document.getElementById('lookup-year').value;
    const round     = document.getElementById('lookup-round').value;
    const session   = document.getElementById('lookup-session')?.value || 'results';
    const container = document.getElementById('results-content');
    if (!round) { container.innerHTML = `<div style="padding:50px;text-align:center;color:#666;">SELECT A ROUND FIRST</div>`; return; }

    window._viewingArchive = true;
    container.innerHTML = `<div style="padding:50px;text-align:center;color:#666;font-weight:bold;">ACCESSING ARCHIVES...</div>`;
    try {
        const backBtn = `<div style="padding:10px 0 0 0;">
            <button onclick="updateLatestResults()" style="background:transparent;border:1px solid #333;color:#555;padding:6px 16px;border-radius:4px;font-size:0.7rem;font-weight:900;cursor:pointer;letter-spacing:1px;">← BACK TO LATEST</button>
        </div>`;
        if (session === 'qualifying') {
            const r = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/${round}/qualifying`);
            if (r?.QualifyingResults?.length) { renderResultsUI(r,"QUALIFYING"); container.innerHTML = backBtn + container.innerHTML; return; }
            container.innerHTML = backBtn + `<div style="padding:50px;text-align:center;"><h3 style="color:#e10600;">NO QUALIFYING DATA FOUND</h3></div>`;
        } else {
            const r = await fetchAllResults(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results`);
            if (r?.Results?.length) { renderResultsUI(r,"RACE"); container.innerHTML = backBtn + container.innerHTML; return; }
            container.innerHTML = backBtn + `<div style="padding:50px;text-align:center;"><h3 style="color:#e10600;">NO DATA FOUND</h3></div>`;
        }
    } catch(e) {
        container.innerHTML = `<div style="color:red;text-align:center;padding:20px;">SYSTEM ERROR</div>`;
    }
}

async function populateRoundSelector() {
    const yearInput = document.getElementById('lookup-year');
    const roundSel  = document.getElementById('lookup-round');
    if (!roundSel || !yearInput) return;
    const year = yearInput.value || new Date().getFullYear();
    roundSel.innerHTML = `<option value="">⏳ Loading rounds...</option>`;
    try {
        const res   = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${year}.json?limit=30`);
        const data  = await res.json();
        const races = data.MRData?.RaceTable?.Races || [];
        const now   = new Date();
        const done  = races.filter(r => new Date(`${r.date}T${r.time||'12:00:00Z'}`) < now);
        if (done.length === 0) { roundSel.innerHTML = `<option value="">No completed rounds for ${year}</option>`; return; }
        roundSel.innerHTML = done.map(r => `<option value="${r.round}">R${r.round.padStart(2,'0')} — ${r.raceName}${r.Sprint?' 🏃':''}</option>`).join('');
        roundSel.value = done[done.length-1].round;
    } catch(e) {
        roundSel.innerHTML = `<option value="">Error loading rounds</option>`;
    }
}

// ============================================================
// SCHEDULE — uses zenithRaceSchedule from data.js
// ============================================================
async function initSchedule() {
    const container = document.getElementById('schedule-list');
    if (!container) return;
    container.innerHTML = `<div class="loading-container"><div class="f1-spinner"></div><p>FETCHING 2026 CALENDAR...</p></div>`;

    function fmtISO(iso) {
        if (!iso) return null;
        const tMatch = iso.match(/T(\d{2}):(\d{2})/);
        const dMatch = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!tMatch || !dMatch) return null;
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        return {
            time: `${tMatch[1]}:${tMatch[2]} PKT`,
            date: `${parseInt(dMatch[3])} ${months[parseInt(dMatch[2])-1]}`,
            utc:  new Date(iso)
        };
    }

    const SESSION_COLORS = {
        FP1:'#44aaff', FP2:'#44aaff', FP3:'#44aaff',
        SprintQuali:'#ff9900', Sprint:'#ff6600',
        Qualifying:'#b700ff', Race:'#e10600'
    };
    const SESSION_DUR = {
        FP1:5400000, FP2:5400000, FP3:5400000,
        SprintQuali:3600000, Sprint:3600000,
        Qualifying:7200000, Race:10800000
    };

    try {
        let ergastRaces = [];
        try {
            for (const year of ['2026','2025']) {
                const res  = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${year}.json`);
                const data = await res.json();
                const list = data.MRData?.RaceTable?.Races || [];
                if (list.length > 0) { ergastRaces = list; break; }
            }
        } catch(e) {}

        const ergastByRound = {};
        ergastRaces.forEach(r => { ergastByRound[parseInt(r.round)] = r; });

        const now     = new Date();
        const nextIdx = zenithRaceSchedule.findIndex(r => new Date(r.Race.iso) > now);

        const rows = await Promise.all(zenithRaceSchedule.map(async (local, idx) => {
            const ergast   = ergastByRound[local.round] || {};
            const isSprint = !!local.sprint;
            const gpName   = ergast.raceName  || local.gp;
            const circuit  = ergast.Circuit?.circuitName || '';
            const season   = ergast.season    || '2026';
            const round    = ergast.round     || String(local.round);

            const raceUTC  = new Date(local.Race.iso);
            const qualiUTC = new Date(local.Qualifying.iso);

            const isFinished  = raceUTC  < now;
            const isRaceLive  = now >= raceUTC  && now < new Date(raceUTC.getTime()  + SESSION_DUR.Race);
            const isQualiLive = now >= qualiUTC && now < new Date(qualiUTC.getTime() + SESSION_DUR.Qualifying);

            let anyLive = isRaceLive || isQualiLive;
            const allKeys = isSprint
                ? ['FP1','SprintQuali','Sprint','Qualifying','Race']
                : ['FP1','FP2','FP3','Qualifying','Race'];
            if (!anyLive) {
                for (const k of allKeys) {
                    const iso = local[k]?.iso;
                    if (!iso) continue;
                    const t = new Date(iso);
                    if (now >= t && now < new Date(t.getTime() + (SESSION_DUR[k]||3600000))) { anyLive = true; break; }
                }
            }

            let raceWin = null, poleSitter = null, sprintWin = null;
            if (isFinished && ergast.season && ergast.round) {
                try {
                    const [rr, qr] = await Promise.all([
                        fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json?limit=3`).then(r=>r.json()).catch(()=>null),
                        fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${season}/${round}/qualifying.json`).then(r=>r.json()).catch(()=>null)
                    ]);
                    raceWin    = rr?.MRData?.RaceTable?.Races?.[0]?.Results?.[0]?.Driver?.code || null;
                    poleSitter = qr?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.[0]?.Driver?.code || null;
                    if (isSprint) {
                        const sr = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${season}/${round}/sprint.json`).then(r=>r.json()).catch(()=>null);
                        sprintWin = sr?.MRData?.RaceTable?.Races?.[0]?.SprintResults?.[0]?.Driver?.code || null;
                    }
                } catch(e) {}
            }

            const sessionRow = (key, label, winner = null) => {
                const iso = local[key]?.iso;
                if (!iso) return '';
                const fmt    = fmtISO(iso);
                if (!fmt) return '';
                const isPast = fmt.utc < now;
                const isLive = now >= fmt.utc && now < new Date(fmt.utc.getTime() + (SESSION_DUR[key]||3600000));
                const color  = SESSION_COLORS[key] || '#888';

                if (isLive) return `
                    <div class="session-item" style="background:rgba(0,255,65,0.06);border-left:2px solid #00ff41;padding-left:8px;">
                        <span style="color:#fff;font-weight:900;letter-spacing:1px;">${label}</span>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span class="live-blink-dot" style="width:7px;height:7px;margin:0;"></span>
                            <strong style="color:#00ff41;font-size:0.85rem;">LIVE NOW</strong>
                        </div>
                    </div>`;
                if (isPast && winner) return `
                    <div class="session-item">
                        <span style="color:#555;font-size:0.75rem;letter-spacing:1px;">${label}</span>
                        <a href="https://www.formula1.com/en/results.html/${season}/races.html" target="_blank" class="session-link">
                            <strong class="result-text">🏁 ${winner}</strong>
                            <span class="view-icon">VIEW ↗</span>
                        </a>
                    </div>`;
                if (isPast) return `
                    <div class="session-item">
                        <span style="color:#888;font-size:0.75rem;letter-spacing:1px;">${label}</span>
                        <strong style="color:#00cc44;font-size:0.78rem;letter-spacing:1px;">✓ DONE</strong>
                    </div>`;
                return `
                    <div class="session-item">
                        <span style="color:${color};font-size:0.75rem;letter-spacing:1px;font-weight:900;">▸ ${label}</span>
                        <div style="text-align:right;line-height:1.3;">
                            <strong style="color:#fff;font-size:0.9rem;">${fmt.time}</strong>
                            <div style="font-size:0.65rem;color:#666;letter-spacing:1px;margin-top:1px;">${fmt.date}</div>
                        </div>
                    </div>`;
            };

            const raceFmt  = fmtISO(local.Race.iso);
            const raceDay  = raceFmt.date.split(' ')[0];
            const raceMon  = raceFmt.date.split(' ')[1];
            const autoExpand = (idx === nextIdx) ? 'expanded' : '';

            return `
                <div class="schedule-row-container ${isFinished?'completed':''} ${anyLive?'live-weekend':''} ${autoExpand}">
                    <div class="schedule-main-row" onclick="toggleSchedule(this)">
                        <div class="col-rd">${local.round}</div>
                        <div class="col-date">
                            <span class="day">${raceDay}</span>
                            <span class="month">${raceMon}</span>
                        </div>
                        <div class="col-gp">
                            ${gpName.toUpperCase()}
                            ${isSprint ? '<span class="sprint-badge">SPRINT</span>' : ''}
                            ${anyLive  ? '<span class="live-blink-dot" style="margin-left:8px;width:8px;height:8px;"></span>' : ''}
                        </div>
                        <div class="col-circuit">${circuit}</div>
                        <div class="col-status">
                            ${isRaceLive  ? `<span style="color:#00ff41;font-weight:900;">● RACE LIVE</span>`  :
                              isQualiLive ? `<span style="color:#00ff41;font-weight:900;">● QUALI LIVE</span>` :
                              anyLive     ? `<span style="color:#00ff41;font-weight:900;">● LIVE</span>`       :
                              isFinished  ? `<span class="winner-label">🏆 ${raceWin||'FIN'}</span>`           :
                              '<span>UPCOMING ❯</span>'}
                        </div>
                    </div>
                    <div class="schedule-details">
                        <div class="details-grid">
                            ${isSprint
                                ? sessionRow('FP1',        'FREE PRACTICE 1')
                                + sessionRow('SprintQuali','SPRINT QUALIFYING')
                                + sessionRow('Sprint',     'SPRINT RACE',  sprintWin)
                                + sessionRow('Qualifying', 'QUALIFYING',   poleSitter)
                                + sessionRow('Race',       'GRAND PRIX',   raceWin)
                                : sessionRow('FP1',        'FREE PRACTICE 1')
                                + sessionRow('FP2',        'FREE PRACTICE 2')
                                + sessionRow('FP3',        'FREE PRACTICE 3')
                                + sessionRow('Qualifying', 'QUALIFYING',   poleSitter)
                                + sessionRow('Race',       'GRAND PRIX',   raceWin)
                            }
                        </div>
                    </div>
                </div>`;
        }));

        container.innerHTML = rows.join('');
        const nextEl = container.querySelector('.schedule-row-container.expanded');
        if (nextEl) nextEl.scrollIntoView({ behavior:'smooth', block:'nearest' });

    } catch(e) {
        container.innerHTML = `<p style="color:#e10600;text-align:center;padding:40px;">Error loading schedule.</p>`;
        console.error('Schedule error:', e);
    }
}

function toggleSchedule(el) { el.parentElement.classList.toggle('expanded'); }

// ============================================================
// CARS — LOCAL PATHS
// ============================================================
function initCarsTab() {
    const grid = document.getElementById('cars-display-grid');
    if (!grid) return;
    grid.innerHTML = f1Cars2026.map(car => {
        let imgs = '';
        for (let i = 1; i <= 5; i++) {
            imgs += `<img src="images/Cars/${car.id}-${i}.avif" id="img-${car.id}-${i}" data-ext="avif" onerror="tryNextExt(this,'${car.id}',${i})" alt="Angle ${i}">`;
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
        const img = document.getElementById(`img-${teamId}-${i}`);
        const ext = img?.getAttribute('data-ext') || 'avif';
        html += `<img src="images/Cars/${teamId}-${i}.${ext}" onerror="this.onerror=null;this.src='https://placehold.co/800x450/111/333?text=No+Image'">`;
    }
    content.innerHTML = html;
    overlay.style.display = 'flex';
}

function tryNextExt(img, teamId, num) {
    const fmts = ['avif','webp','png','jpg'];
    const next = fmts[fmts.indexOf(img.getAttribute('data-ext')||'avif') + 1];
    if (next) { img.setAttribute('data-ext', next); img.src = `images/Cars/${teamId}-${num}.${next}`; }
    else { img.src = 'https://placehold.co/400x225/111/333?text=Image+Not+Found'; img.onerror = null; }
}

function closeGallery() { document.getElementById('gallery-overlay').style.display = 'none'; }

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
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${race.lat}&longitude=${race.lon}`
            + `&current=temperature_2m,apparent_temperature,precipitation,precipitation_probability,`
            + `weather_code,wind_speed_10m,wind_gusts_10m,surface_pressure,`
            + `soil_temperature_0cm,shortwave_radiation&timezone=auto`;
        const res  = await fetch(url);
        const data = await res.json();
        const live = data.current;
        setTimeout(() => {
            const set = (id,v) => { const el=document.getElementById(id); if(el) el.innerText=v; };
            const airTemp    = Math.round(live.temperature_2m);
            const radiation  = live.shortwave_radiation || 0;
            const solarBoost = Math.round(radiation / 40);
            const trackTemp  = Math.round((live.soil_temperature_0cm || airTemp) + solarBoost);
            const rainProb   = live.precipitation_probability ?? Math.round(live.precipitation > 0 ? Math.min(live.precipitation*100,99) : 0);
            const isWet      = live.precipitation > 0.1;
            const isRain     = live.weather_code >= 51;
            let status = "CLEAR";
            const wc = live.weather_code;
            if      (wc<=1)  status="CLEAR";
            else if (wc<=3)  status="PARTLY CLOUDY";
            else if (wc<=48) status="OVERCAST";
            else if (wc<=67) status="RAIN";
            else if (wc<=77) status="SNOW";
            else if (wc<=82) status="SHOWERS";
            else             status="STORM";
            set('air-temp',       `${airTemp}°C`);
            set('track-temp',     `${trackTemp}°C`);
            set('rain-risk',      `${rainProb}%`);
            set('wind-speed',     `${Math.round(live.wind_speed_10m)} km/h`);
            set('weather-status', status);
            if (gripEl) {
                if (isWet||isRain)      { gripEl.innerText="SLIPPERY"; gripEl.className="weather-value slippery"; }
                else if (rainProb > 60) { gripEl.innerText="DAMP RISK"; gripEl.className="weather-value slippery"; }
                else                    { gripEl.innerText="OPTIMAL";   gripEl.className="weather-value optimal"; }
            }
            if (icon) icon.classList.remove('fa-spin');
        }, 500);
    } catch(e) {
        console.error("Weather error:", e);
        if (gripEl) gripEl.innerText = "OFFLINE";
        if (icon) icon.classList.remove('fa-spin');
    }
}
