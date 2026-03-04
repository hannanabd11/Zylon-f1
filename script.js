// --- 1. STARTUP ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Core Functions
    fetchLiveF1News();      
    updateCountdown();      
    updateLiveTelemetry();   
    
    // 2. Data Rendering
    renderDrivers();        
    renderTeams();          
    
    // 3. Tab Initializations
    initCarsTab();          
    initScheduleTab();      
    initStandings();        
    updateLatestResults();  

    
    // 4. Intervals (Fixed logic to prevent browser lag)
    setInterval(updateLiveTelemetry, 300000); 
});


// --- 1. SESSION HELPER (Enhanced) ---
function getSessionStatus(race) {
    const now = new Date();
    
    // Normalize sessions into a standard array
    const sessions = [
        { name: 'FP1', time: race.FirstPractice },
        { name: 'FP2', time: race.SecondPractice || race.SprintQualifying },
        { name: 'FP3', time: race.ThirdPractice || race.Sprint },
        { name: 'QUALIFYING', time: race.Qualifying },
        { name: 'GRAND PRIX', time: { date: race.date, time: race.time } }
    ].filter(s => s.time && s.time.date); // Filter out TBC sessions

    // Find the current or next session
    return sessions.find(s => {
        const start = new Date(`${s.time.date}T${s.time.time || '00:00:00'}Z`);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h window
        return end > now;
    }) || sessions[sessions.length - 1];
}

// --- 2. THE TELEMETRY & TIMER ENGINE ---
async function updateLiveDashboard() {
    const now = new Date();
    let upcomingRace = null;

    // 1. Find the next valid race automatically
    for (let race of f1Calendar2026) {
        const raceEndTime = new Date(`${race.date.replace(/-/g, '/')} ${race.time}`);
        if (now < new Date(raceEndTime.getTime() + (3 * 60 * 60 * 1000))) {
            upcomingRace = race;
            break;
        }
    }

    if (!upcomingRace) return;

    // 2. Target the specific elements to prevent flickering
    const headerCountdown = document.getElementById('header-countdown');
    const headerLabel = document.getElementById('header-label');

    const qStr = upcomingRace.Qualifying.date.replace(/-/g, '/');
    const rStr = upcomingRace.date.replace(/-/g, '/');
    
    const targetQuali = new Date(`${qStr} ${upcomingRace.Qualifying.time}`);
    const targetRace = new Date(`${rStr} ${upcomingRace.time}`);
    
    let target = (now < targetQuali) ? targetQuali : targetRace;
    let sessionType = (now < targetQuali) ? "QUALI" : "RACE";
    
    // Automatic GP Name from Dataset
    const gpName = upcomingRace.gp.split(' ')[0].toUpperCase();
    headerLabel.innerText = `${gpName} ${sessionType}:`;

    const diff = target - now;

    if (diff <= 0 && now < new Date(target.getTime() + (2 * 60 * 60 * 1000))) {
        headerCountdown.innerText = "LIVE";
        headerCountdown.style.color = "#00ff41"; // Neon green for live
    } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        
        // Update text only - stops the "refresh" blink
        headerCountdown.innerText = `${d}D ${h}:${m}:${s}`;
        headerCountdown.style.color = ""; // Reverts to CSS color
    }
}

const flagCodes = {
    "Australian": "au", "Chinese": "cn", "Japanese": "jp", "Bahrain": "bh",
    "Saudi Arabian": "sa", "Miami": "us", "Emilia Romagna": "it", "Monaco": "mc",
    "Spanish": "es", "Canadian": "ca", "Austrian": "at", "British": "gb",
    "Belgian": "be", "Hungarian": "hu", "Dutch": "nl", "Italian": "it"
};

function updateZenithTimer() {
    // Force "now" to be a clean timestamp
    const now = new Date().getTime();
    const container = document.getElementById('zenith-timer-container');
    const label = document.getElementById('header-label');
    const display = document.getElementById('header-countdown');
    const flagImg = document.getElementById('country-flag');

    if (!container || !label || !display) return;

    // 1. Find the active race
    let race = zenithRaceSchedule.find(r => {
        // Keeps the race active for 3 hours after start
        const raceStartTime = new Date(r.Race.iso).getTime();
        return now < (raceStartTime + 10800000); 
    });

    if (!race) {
        label.innerText = "SEASON COMPLETE";
        display.innerText = "SEE YOU IN 2027";
        return;
    }

    // 2. Setup Sessions
    const qualiTime = new Date(race.Qualifying.iso).getTime();
    const raceTime = new Date(race.Race.iso).getTime();
    
    let targetTime, sessionName;

    if (now < qualiTime) {
        targetTime = qualiTime;
        sessionName = "QUALI";
    } else if (now < raceTime) {
        targetTime = raceTime;
        sessionName = "GRAND PRIX";
    } else {
        targetTime = raceTime;
        sessionName = "LIVE";
    }

    const diff = targetTime - now;

    // 3. UI State Management
    container.classList.remove('state-waiting', 'state-live', 'state-warning');

    if (sessionName === "LIVE" || diff <= 0) {
        container.classList.add('state-live');
        label.innerText = `${race.gp.split(' ')[0].toUpperCase()} LIVE`;
        display.innerHTML = `<a href="${race.hubUrl}" class="live-btn-link">ENTER COMMAND CENTER ➔</a>`;
    } else {
        if (diff < 3600000) container.classList.add('state-warning');
        else container.classList.add('state-waiting');

        label.innerText = `${race.gp.split(' ')[0].toUpperCase()} ${sessionName}`;

        // Precise Math Calculations
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        display.innerHTML = `
            ${d}<span class="timer-unit">D</span> 
            ${h.toString().padStart(2, '0')}<span class="timer-unit">H</span> 
            ${m.toString().padStart(2, '0')}<span class="timer-unit">M</span> 
            ${s.toString().padStart(2, '0')}<span class="timer-unit">S</span>
        `;
    }
}

setInterval(updateZenithTimer, 1000);
updateZenithTimer();

// --- 4. DRIVER & TEAM RENDERING ---
function renderTeams() {
    const grid = document.getElementById('teams-grid');
    grid.innerHTML = f1Teams2026.map(team => `
        <div class="card-scene" onclick="this.querySelector('.card-inner').classList.toggle('is-flipped')">
            <div class="card-inner" style="--team-color: ${team.color}; --glow-color: ${team.color}44">
                
                <div class="card-front">
                    <div class="flex-between">
                        <div style="flex: 1;">
                            <a href="${team.teamLink}" target="_blank" onclick="event.stopPropagation()" class="team-title-link">
                                ${team.name.toUpperCase()}
                            </a>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <img src="${team.flagUrl}" style="width: 16px; height: auto;" alt="flag">
                                <span style="font-size: 0.7rem; color: #888; font-weight: 700; letter-spacing: 1px;">${team.country}</span>
                            </div>
                        </div>

                        <div class="text-right" style="flex: 1;">
                            <a href="https://www.google.com/search?q=${team.principal.replace(' ', '+')}+F1+Team+Principal" 
                            target="_blank" 
                            onclick="event.stopPropagation()" 
                            style="color: #e10600; font-size: 0.65rem; font-weight: 900; text-decoration: none;">
                                PRINCIPAL: ${team.principal.toUpperCase()}
                            </a>
                            <div style="display: flex; gap: 15px; margin-top: 10px; justify-content: flex-end;">
                                <div style="text-align:center;"><span class="stat-lab">WCC</span><span class="stat-val">${team.constructors}</span></div>
                                <div style="text-align:center;"><span class="stat-lab">WDC</span><span class="stat-val">${team.drivers_titles}</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="flex-between" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; align-items: flex-end;">
                        <div style="font-size: 0.55rem; color: #444; letter-spacing: 1px;">2026 REGULATION STATUS: <span style="color:#00ff00;">COMPLIANT</span></div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end;">
                            <a href="${team.drivers[0].link}" target="_blank" onclick="event.stopPropagation()" class="driver-pill">
                                ${team.drivers[0].name.toUpperCase()}
                            </a>
                            <a href="${team.drivers[1].link}" target="_blank" onclick="event.stopPropagation()" class="driver-pill">
                                ${team.drivers[1].name.toUpperCase()}
                            </a>
                        </div>
                    </div>
                </div>

                <div class="card-back">
                    <h4 style="color: var(--team-color); margin: 0 0 10px 0; font-size: 0.9rem;">TEAM HISTORY</h4>
                    <p style="font-size: 0.8rem; color: #ccc; line-height: 1.4;">${team.history}</p>
                    <div style="margin-top: auto; font-size: 0.6rem; color: #555;">CLICK TO FLIP BACK</div>
                </div>
            </div>
        </div>
    `).join('');
}


// --- 5. TABS & NAVIGATION ---
function openTab(evt, tabName) {
    const targetId = tabName.toLowerCase();

    // 1. Hide all sections
    const sections = document.getElementsByClassName("tab-content");
    for (let i = 0; i < sections.length; i++) {
        sections[i].style.display = "none";
        sections[i].classList.remove("active");
    }

    // 2. Remove 'active' from all tab items (buttons)
    const navItems = document.getElementsByClassName("tab-item");
    for (let i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove("active");
    }

    // 3. Show the target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.style.display = "block";
        targetSection.classList.add("active");
    }

    // 4. Set the clicked tab to active
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }

    // --- NEW: RESET SCROLL TO TOP ---
    // This ensures the new tab content starts from the top view
    window.scrollTo({
        top: 0,
        behavior: 'instant' 
    });

    // 5. Run the specific data loaders
    handleTabLoading(targetId);
}

// --- NEW: GLOBAL PAGE RELOAD RESET ---
// Forces the browser to ignore previous scroll position on refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

function handleTabLoading(id) {
    console.log("Loading data for tab:", id);

    if (id === 'home' || id === 'results') {
        if (typeof updateLatestResults === "function") updateLatestResults();
        if (id === 'home' && typeof fetchLiveF1News === "function") fetchLiveF1News();
    } 
    else if (id === 'schedule') {
        if (typeof initSchedule === "function") initSchedule(); 
    }
    else if (id === 'standings') {
        if (typeof initStandings === "function") initStandings();
    } 
    else if (id === 'drivers') {
        // Since we want 2 per row, let's ensure the render function is called
        if (typeof autoUpdateDriverStats === "function") autoUpdateDriverStats();
        if (typeof renderDrivers === "function") renderDrivers();
    } 
    else if (id === 'teams') {
        if (typeof renderTeams === "function") renderTeams();
    }
    else if (id === 'cars') {
        if (typeof initCarsTab === "function") {
            initCarsTab();
        } else {
            console.error("Function initCarsTab not found!");
        }
    }
}
// 2. RENDER DRIVERS (The Glow Design)
function renderDrivers() {
    try {
        const container = document.getElementById('drivers-grid');
        if (!container) return;

        // Clear existing content safely
        container.innerHTML = "";

        f1_2026_grid.forEach(d => {
            // 1. FIX: Define Names inside the loop
            const nameParts = d.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ').toUpperCase();

            // 2. FIX: Get correct color (Look in driver object first, then teamColors map)
            const accentColor = d.color || teamColors[d.team] || "#e10600";

            const card = document.createElement('div');
            card.className = "driver-card-new";
            
            // 3. FIX: Apply CSS variable correctly
            card.style.setProperty('--team-color', accentColor);
        card.innerHTML = `
    <div class="driver-number-overlay">${d.no}</div>
    
    <a href="https://www.google.com/search?tbm=isch&q=${firstName}+${lastName}+F1+2026+Portrait" target="_blank" style="text-decoration: none; color: inherit; display: block;">
        <div class="driver-image-area">
            <img src="./Drivers/${d.id}.PNG" class="driver-portrait" onerror="this.src='https://dummyimage.com/400x600/111/fff&text=DRIVER'">
            <div class="image-gradient"></div>
        </div>
    </a>

    <div class="driver-info-area">
        <div class="driver-header-row">
            <div class="driver-name-stack">
                <a href="https://www.google.com/search?q=${d.team.replace('_', '+')}+F1+Team+Official+Website" target="_blank" style="text-decoration: none; color: inherit;">
                    <div class="driver-team-tag">${d.team.replace('_', ' ')}</div>
                </a>
                
                <a href="https://www.google.com/search?q=${firstName}+${lastName}+F1+Driver" target="_blank" style="text-decoration: none; color: inherit;">
                    <h3>${firstName} <b>${lastName}</b></h3>
                </a>
            </div>
            
            <div class="driver-flag-side">
                <a href="https://www.google.com/search?tbm=isch&q=Flag+of+${d.flag}" target="_blank" style="text-decoration: none;">
                    <img src="https://flagcdn.com/w80/${d.flag}.png" class="mini-flag" alt="Flag">
                </a>
            </div>
        </div>
        
        <div class="driver-stats-container">
            <div class="stat-box"><span class="stat-n">${d.wins}</span><span class="stat-l">Wins</span></div>
            <div class="stat-box"><span class="stat-n">${d.poles}</span><span class="stat-l">Poles</span></div>
            <div class="stat-box"><span class="stat-n">${d.champ}</span><span class="stat-l">Titles</span></div>
        </div>
    </div>
`;
            
            container.appendChild(card);
        });
        console.log("2026 Grid successfully rendered.");
    } catch (error) {
        console.error("The driver function hit a bump, but the rest of the site is safe!", error);
    }
}


// --- 6. STANDINGS & RESULTS ---

async function initStandings() {
    const dContainer = document.getElementById('drivers-list');
    const tContainer = document.getElementById('teams-list');
    if (!dContainer || !tContainer) return;

    try {
        const [dRes, tRes] = await Promise.all([
            fetch('https://api.jolpi.ca/ergast/f1/2025/driverStandings.json'),
            fetch('https://api.jolpi.ca/ergast/f1/2025/constructorStandings.json')
        ]);

        const dData = await dRes.json();
        const tData = await tRes.json();
        const dList = dData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        const tList = tData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];

        // Render Drivers
        dContainer.innerHTML = dList.map(item => {
            const teamName = item.Constructors[0].name;
            const teamColor = getTeamColor(teamName);
            const driverInfo = f1_2026_grid.find(d => item.Driver.familyName.toLowerCase().includes(d.name.toLowerCase().split(' ').pop()));
            const flag = driverInfo ? driverInfo.flag : 'un';

            return `
                <div class="standings-entry" style="--team-glow: ${teamColor}">
                    <div class="pos-num">${item.position}</div>
                    <div class="team-strip" style="background: ${teamColor}"></div>
                    <div class="entry-name">
                        <a href="https://www.google.com/search?q=F1+${encodeURIComponent(teamName)}" target="_blank" class="team-link" style="text-decoration: none;">
                            <span class="team-label">${teamName}</span>
                        </a>
                        <div class="driver-name-row" style="display:flex; align-items:center;">
                            <img src="https://flagcdn.com/w40/${flag.toLowerCase()}.png" class="tiny-flag">
                            <a href="https://www.google.com/search?q=F1+driver+${encodeURIComponent(item.Driver.givenName + ' ' + item.Driver.familyName)}" target="_blank" class="driver-link" style="text-decoration: none;">
                                <span class="driver-text">${item.Driver.givenName} <strong>${item.Driver.familyName}</strong></span>
                            </a>
                        </div>
                    </div>
                    <div class="entry-pts">${item.points}</div>
                </div>`;
        }).join('');

        // Render Teams
        tContainer.innerHTML = tList.map(item => {
            const teamName = item.Constructor.name;
            const teamColor = getTeamColor(teamName);
            return `
                <div class="standings-entry" style="--team-glow: ${teamColor}">
                    <div class="pos-num">${item.position}</div>
                    <div class="team-strip" style="background: ${teamColor}"></div>
                    <div class="entry-name">
                        <span class="team-label">CONSTRUCTOR</span>
                        <a href="https://www.google.com/search?q=F1+team+${encodeURIComponent(teamName)}" target="_blank" class="team-link" style="text-decoration: none;">
                            <div class="driver-text" style="color: ${teamColor}; font-weight: 900; text-shadow: 0 0 15px ${teamColor};">
                                ${teamName.toUpperCase()}
                            </div>
                        </a>
                    </div>
                    <div class="entry-pts">${item.points}</div>
                </div>`;
        }).join('');

    } catch (error) { console.error(error); }
}
// Global Team Color Helper
function getTeamColor(team) {
    const colors = {
        "McLaren": "#FF8700", "Red Bull": "#3671C6", "Ferrari": "#E80020",
        "Mercedes": "#27F4D2", "Aston Martin": "#229971", "Williams": "#64C4FF",
        "VCARB": "#6692FF", "Haas F1 Team": "#B6BABD", "Alpine F1 Team": "#d816c2", "Audi": "#000000",
        "Sauber": "#52E252", "Kick Sauber": "#52E252", "RB F1 Team": "#6692FF",    "Cadillac": "#FFD700"
    
    };
    return colors[team] || "#444";
}


// --- 7. CARS & GALLERY ---
function initCarsTab() {
    const grid = document.getElementById('cars-display-grid');
    if (!grid) return;

    grid.innerHTML = f1Cars2026.map(car => {
        const photoCount = 5; // Restored to 5 angles
        let imgHtml = '';
        
        for (let i = 1; i <= photoCount; i++) {
            imgHtml += `
                <img src="./Cars/${car.id}-${i}.avif"
                
                     id="img-${car.id}-${i}" 
                     data-ext="avif" 
                     onerror="tryNextExt(this, '${car.id}', ${i})" 
                     alt="Angle ${i}">`;
        }
                        <img src="./Cars/${car.id}-${i}.jpg"
                
                     id="img-${car.id}-${i}" 
                     data-ext="avif" 
                     onerror="tryNextExt(this, '${car.id}', ${i})" 
                     alt="Angle ${i}">`;
        }
                        <img src="./Cars/${car.id}-${i}.webp"
                
                     id="img-${car.id}-${i}" 
                     data-ext="avif" 
                     onerror="tryNextExt(this, '${car.id}', ${i})" 
                     alt="Angle ${i}">`;
        }

        return `
        <div class="car-card" onclick="openGallery('${car.id}', ${photoCount})">
            <div class="car-badge">${car.team}</div>
            <div class="car-slider">
                ${imgHtml}
            </div>
            <div class="car-info">
                <h3>${car.name}</h3>
                <p>${car.drivers}</p>
                <div class="action-hint">Slide to view ${photoCount} angles</div>
            </div>
        </div>`;
    }).join('');
}

function openGallery(teamId, photoCount = 5) {
    const overlay = document.getElementById('gallery-overlay');
    const content = document.getElementById('gallery-content');
    if(!overlay || !content) return;

    let galleryHtml = '';
    
    for (let i = 1; i <= photoCount; i++) {
        // Look at the image already on the page to see which extension worked (avif, webp, etc)
        const activeImg = document.getElementById(`img-${teamId}-${i}`);
        const currentExt = activeImg ? activeImg.getAttribute('data-ext') : 'jpg';
        
        galleryHtml += `<img src="images/Cars/${teamId}-${i}.${currentExt}" onerror="this.src='https://placehold.co/800x450?text=Image+Missing'">`;
    }

    content.innerHTML = galleryHtml;
    overlay.style.display = 'flex';
}

function tryNextExt(img, teamId, photoNum) {
    const formats = ['avif', 'webp', 'png', 'jpg'];
    let currentExt = img.getAttribute('data-ext');
    let nextIndex = formats.indexOf(currentExt) + 1;

    if (nextIndex < formats.length) {
        let nextExt = formats[nextIndex];
        img.setAttribute('data-ext', nextExt);
        img.src = `images/Cars/${teamId}-${photoNum}.${nextExt}`;
    } else {
        img.src = 'https://placehold.co/400x225?text=2026+Car+Missing';
        img.onerror = null; 
    }
}

function closeGallery() {
    document.getElementById('gallery-overlay').style.display = 'none';
}


async function initSchedule() {
    const container = document.getElementById('schedule-list');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-container">
            <div class="f1-spinner"></div>
            <p>FETCHING 2025 SEASON DATA...</p>
        </div>
    `;

    try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/2025.json');
        const data = await response.json();
        const races = data.MRData.RaceTable.Races || [];
        const now = new Date();

        const rows = await Promise.all(races.map(async (race) => {
            const raceDateTime = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
            const isFinished = raceDateTime < now;
            const isSprintWeekend = !!race.Sprint;

            let raceWin = null, sprintWin = null, sqWin = null, poleSitter = null;

            if (isFinished) {
                try {
                    const [res, qRes] = await Promise.all([
                        fetch(`https://api.jolpi.ca/ergast/f1/2025/${race.round}/results.json`).then(r => r.json()),
                        fetch(`https://api.jolpi.ca/ergast/f1/2025/${race.round}/qualifying.json`).then(r => r.json())
                    ]);
                    raceWin = res.MRData.RaceTable.Races[0]?.Results[0]?.Driver.code;
                    poleSitter = qRes.MRData.RaceTable.Races[0]?.QualifyingResults[0]?.Driver.code;

                    if (isSprintWeekend) {
                        const sRes = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${race.round}/sprint.json`).then(r => r.json());
                        sprintWin = sRes.MRData.RaceTable.Races[0]?.SprintResults[0]?.Driver.code;
                        sqWin = sprintWin; 
                    }
                } catch (e) { console.warn("Results pending..."); }
            }

            // HELPER: Generate F1.com link based on race name
            const getF1Link = (raceName) => {
                const slug = raceName.toLowerCase()
                    .replace(/grand prix/g, '')
                    .trim()
                    .replace(/\s+/g, '-');
                return `https://www.formula1.com/en/results.html/2025/races.html`; 
                // Note: Deep linking to specific practice tabs is restricted by F1's dynamic IDs,
                // so linking to the 2025 results hub is the most reliable way to jump to the right tab.
            };

            const renderSession = (session, winner = null) => {
                if (!session || !session.time) return `<strong>TBC</strong>`;
                const sTime = new Date(`${session.date}T${session.time}`);
                
                if (sTime < now) {
                    const f1Url = getF1Link(race.raceName);
                    return `
                        <a href="${f1Url}" target="_blank" class="session-link">
                            <strong class="result-text">${winner ? '🏁 ' + winner : 'DONE'}</strong>
                            <span class="view-icon">VIEW ↗</span>
                        </a>`;
                }
                return `<strong>${sTime.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>`;
            };

            return `
                <div class="schedule-row-container ${isFinished ? 'completed' : ''}">
                    <div class="schedule-main-row" onclick="toggleSchedule(this)">
                        <div class="col-rd">${race.round}</div>
                        <div class="col-date">
                            <span class="day">${raceDateTime.getDate()}</span>
                            <span class="month">${raceDateTime.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                        </div>
                        <div class="col-gp">${race.raceName.toUpperCase()} ${isSprintWeekend ? '<span class="sprint-badge">SPRINT</span>' : ''}</div>
                        <div class="col-circuit">${race.Circuit.circuitName}</div>
                        <div class="col-status">
                            ${isFinished ? `<span class="winner-label">🏆 ${raceWin || 'FIN'}</span>` : '<span>UPCOMING ❯</span>'}
                        </div>
                    </div>
                    <div class="schedule-details">
                        <div class="details-grid">
                            <div class="session-item"><span>FP1</span> ${renderSession(race.FirstPractice)}</div>
                            <div class="session-item ${isSprintWeekend ? 'sprint-highlight' : ''}">
                                <span>${isSprintWeekend ? 'SPRINT QUALI' : 'FP2'}</span>
                                ${renderSession(isSprintWeekend ? race.SprintQualifying : race.SecondPractice, isSprintWeekend ? sqWin : null)}
                            </div>
                            <div class="session-item ${isSprintWeekend ? 'sprint-highlight' : ''}">
                                <span>${isSprintWeekend ? 'SPRINT RACE' : 'FP3'}</span>
                                ${renderSession(isSprintWeekend ? race.Sprint : race.ThirdPractice, isSprintWeekend ? sprintWin : null)}
                            </div>
                            <div class="session-item highlight"><span>QUALIFYING</span> ${renderSession(race.Qualifying, poleSitter)}</div>
                            <div class="session-item race"><span>GRAND PRIX</span> ${renderSession(race, raceWin)}</div>
                        </div>
                    </div>
                </div>`;
        }));

        container.innerHTML = rows.join('');
    } catch (e) {
        container.innerHTML = `<p style="color:white; text-align:center;">Error loading schedule.</p>`;
    }
}
function toggleSchedule(element) {
    element.parentElement.classList.toggle('expanded');
}
// 1. THE NEWS ENGINE 
async function fetchLiveF1News() {
    const newsGrid = document.getElementById('news-feed');
    if (!newsGrid) return;

    newsGrid.innerHTML = `<div style="color: #444; font-family: 'JetBrains Mono'; padding: 20px;">FETCHING SATELLITE FEED...</div>`;

    try {
        const rssUrl = encodeURIComponent('https://www.autosport.com/rss/f1/news/');
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await response.json();

        if (!data.items || data.items.length === 0) throw new Error("No news items");

        newsGrid.innerHTML = data.items.slice(0, 8).map(item => {
            const image = item.thumbnail || (item.enclosure && item.enclosure.link) || "images/news-placeholder.jpg";
            
            // This was the fix: ensuring the variable name matches below
            const formattedDate = new Date(item.pubDate).toLocaleDateString('en-GB', { 
                day: '2-digit', month: 'short', year: 'numeric' 
            }).toUpperCase();

            return `
            <a href="${item.link}" target="_blank" class="news-card-link">
                <div class="news-card">
                    <div class="news-img-container">
                        <img src="${image}" onerror="this.src='https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=800'" class="news-pic">
                    </div>
                    <div class="news-content" style="padding: 15px;">
                        <span class="news-date" style="font-family: 'JetBrains Mono'; color: #888; font-size: 0.7rem;">${formattedDate}</span>
                        <h4 style="margin: 10px 0; color: #fff; font-family: 'Formula1-Bold'; font-size: 1.1rem;">${item.title}</h4>
                        <p style="color: #666; font-size: 0.85rem; line-height: 1.4; margin-bottom: 10px;">${item.description.replace(/<[^>]*>/g, '').slice(0, 80)}...</p>
                        <div class="news-source-tag">SOURCE: AUTOSPORT</div>
                    </div>
                </div>
            </a>`;
        }).join('');

    } catch (e) {
        newsGrid.innerHTML = `<p style="color: #e10600; font-family: 'JetBrains Mono'; padding: 20px;">SIGNAL LOST: NEWS FEED OFFLINE</p>`;
        console.error("News error:", e);
    }
}
// CRITICAL: Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchLiveF1News);
// 2. THE RESULTS ENGINE 
async function updateLatestResults() {
    const container = document.getElementById('results-content');
    if (!container) return;

    container.innerHTML = "<div style='color: white; padding: 20px; font-family: var(--f1-font);'>ACCESSING TIMING DATA...</div>";

    try {
        // 1. Fetch both Race and Qualifying concurrently for speed
        const [raceResponse, qualyResponse] = await Promise.all([
            fetch("https://api.jolpi.ca/ergast/f1/2026/last/results.json"),
            fetch("https://api.jolpi.ca/ergast/f1/2026/last/qualifying.json")
        ]);

        const raceData = await raceResponse.json();
        const qualyData = await qualyResponse.json();

        const race = raceData.MRData.RaceTable.Races[0];
        const qualy = qualyData.MRData.RaceTable.Races[0];

        // 2. Determine which session is the "Latest"
        // If there is no race yet, or if Qualifying happened after the last recorded race
        if (qualy && (!race || new Date(qualy.date + 'T' + qualy.time) > new Date(race.date + 'T' + race.time))) {
            renderResultsUI(qualy, "QUALIFYING");
        } else if (race) {
            renderResultsUI(race, "RACE");
        } else {
            // Fallback to 2025 if 2026 hasn't started yet
            const fallback = await fetch("https://api.jolpi.ca/ergast/f1/2025/last/results.json");
            const fbData = await fallback.json();
            renderResultsUI(fbData.MRData.RaceTable.Races[0], "LATEST 2025 RACE");
        }
    } catch (e) {
        container.innerHTML = "<div style='color: #e10600; padding: 20px;'>CONNECTION LOST: PIT WALL OFFLINE</div>";
        console.error("Results Load Fail:", e);
    }
}
function renderResultsUI(race, sessionType = "RACE") {
    const container = document.getElementById('results-content');
    if (!container) return;

    const teamColors = {
        "mercedes": "#27F4D2", "red_bull": "#3671C6", "ferrari": "#E80020",
        "mclaren": "#FF8000", "aston_martin": "#229971", "alpine": "#0093CC",
        "haas": "#B6BABD", "williams": "#64C4FF", "sauber": "#52E252", "rb": "#6692FF"
    };

    const isQualy = sessionType === "QUALIFYING";
    const accentColor = isQualy ? "#b700ff" : "#e10600"; // Purple for Pole/Qualy, Red for Race
    const badgeText = isQualy ? "QUALIFYING RESULT" : "LATEST RACE";
    
    const resultsData = isQualy ? race.QualifyingResults : race.Results;

    let html = `
        <div class="results-wrapper">
            <div style="text-align: center; padding: 40px 0 20px 0;">
                
                <div style="display: flex; justify-content: flex-start; margin-bottom: 20px;">
                    <span style="background: ${accentColor}; color: white; padding: 4px 12px; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
                        ${badgeText}
                    </span>
                </div>

                <h1 style="color: white; font-size: 3.5rem; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px; line-height: 1;">
                    ${race.raceName.toUpperCase()} <span style="color: #444;">${race.season}</span>
                </h1>

                <p style="color: #aaa; font-size: 0.9rem; font-weight: 500; margin-top: 15px; text-transform: uppercase; letter-spacing: 2px;">
                    ROUND ${race.round} • ${isQualy ? 'QUALIFYING CLASSIFICATION' : 'OFFICIAL CLASSIFICATION'}
                </p>

                <div style="width: 100%; height: 2px; background: ${accentColor}; margin-top: 30px;"></div>
            </div>

            <div style="display: grid; grid-template-columns: 50px 1.5fr 1fr 150px 80px; padding: 10px 25px; color: #444; font-size: 0.75rem; font-weight: 900; text-transform: uppercase;">
                <div>Pos</div>
                <div>Driver</div>
                <div>Team</div>
                <div style="text-align: right;">${isQualy ? "Best Lap" : "Time / Gap"}</div>
                <div style="text-align: right;">${isQualy ? "Status" : "Pts"}</div>
            </div>
    `;

    resultsData.forEach((r, index) => {
        const isFirst = index === 0;
        const isFastestLap = r.FastestLap && r.FastestLap.rank === "1";
        const teamColor = teamColors[r.Constructor.constructorId] || "#fff";
        
        // Color Logic: Purple for Pole/Fastest Lap, Green for Race Winner
        let highlightColor = teamColor;
        if (isFirst) {
            highlightColor = isQualy ? "#b700ff" : "#00ff00";
        } else if (isFastestLap) {
            highlightColor = "#b700ff";
        }

        let timeDisplay = "---";
        if (isQualy) {
            timeDisplay = r.Q3 || r.Q2 || r.Q1 || "No Time";
        } else {
            if (r.Time) {
                timeDisplay = isFirst ? r.Time.time : `+${r.Time.time}`;
            } else {
                timeDisplay = r.status;
            }
        }

        const rowClass = (isFastestLap || (isFirst && isQualy)) ? "result-row highlight-purple" : "result-row";

        html += `
            <div class="${rowClass}" style="border-left: 4px solid ${highlightColor}; ${isFirst ? 'background: rgba(255,255,255,0.02);' : ''}">
                <div style="font-weight: 900; color: ${isFirst ? highlightColor : '#555'}; font-size: 1.2rem;">
                    ${r.position}
                </div>
                
                <div style="color: white; font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                    <span>${r.Driver.givenName[0]}. <span style="color: ${isFirst ? highlightColor : 'white'}">${r.Driver.familyName.toUpperCase()}</span></span>
                    ${(isFastestLap || (isFirst && isQualy)) ? 
                        `<span style="background: #b700ff; color: white; padding: 2px 6px; font-size: 0.6rem; border-radius: 2px;">${isQualy ? 'POLE' : 'FL'}</span>` 
                        : ''}
                </div>

                <div style="color: #666; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">
                    ${r.Constructor.name}
                </div>

                <div class="time-cell" style="color: ${isFirst ? highlightColor : (isFastestLap ? '#b700ff' : '#888')}">
                    ${timeDisplay}
                </div>

                <div style="text-align: right; color: white; font-weight: 900; font-size: 1.2rem;">
                    ${isQualy ? "—" : r.points}
                </div>
            </div>
        `;
    });

    container.innerHTML = html + `</div>`;
}
async function autoUpdateDriverStats() {
    try {
        // 1. Fetch 2026 Results (Wins & Standings)
        const response = await fetch('https://api.jolpi.ca/ergast/f1/2026/driverStandings.json');
        const data = await response.json();
        const liveStandings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        // 2. Update the numbers in the browser's memory
        f1_2026_grid.forEach(localDriver => {
            const liveMatch = liveStandings.find(ls => 
                ls.Driver.driverId.toLowerCase().includes(localDriver.id.toLowerCase())
            );

            if (liveMatch) {
                // We ADD the 2026 wins to your data.js career wins
                const seasonWins = parseInt(liveMatch.wins) || 0;
                localDriver.wins = (localDriver.wins || 0) + seasonWins;
                
                // Update Titles if it's the end of the season
                if (liveMatch.position === "1" && new Date().getMonth() > 10) { 
                    localDriver.champ += 1; 
                }
            }
        }); // <-- Closed the forEach loop here

        console.log("2026 Stats Updated!");
        
        // RE-RENDER HERE, after the loop finishes
        renderDrivers(); 

    } catch (error) {
        console.log("Using local data or API not yet available.");
        renderDrivers(); // Still render even if API fails
    }
} // <-- Closed the function here

async function fetchSpecificRace() {
    const year = document.getElementById('lookup-year').value;
    const round = document.getElementById('lookup-round').value;
    const container = document.getElementById('results-content');

    container.innerHTML = `<div style="padding: 50px; text-align: center; color: #666; font-weight: bold;">ACCESSING ARCHIVES...</div>`;

    try {
        const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`);
        const data = await response.json();
        
        const raceData = data.MRData.RaceTable.Races[0];

        if (raceData) {
            // Send the API data to your classy render function
            renderResultsUI(raceData);
        } else {
            container.innerHTML = `
                <div style="padding: 50px; text-align: center;">
                    <h3 style="color: #e10600;">NO DATA FOUND</h3>
                    <p style="color: #666;">The race for ${year} Round ${round} hasn't occurred or isn't in the database.</p>
                </div>`;
        }
    } catch (error) {
        console.error("Search Error:", error);
        container.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">SYSTEM ERROR: CONNECTION FAILED</div>`;
    }
}


// Run the update 3 seconds after page load
setTimeout(autoUpdateDriverStats, 3000);


// Initialize on load
async function updateF1Weather() {
    const icon = document.getElementById('refresh-icon');
    const gripEl = document.getElementById('track-grip');
    const watermarkEl = document.getElementById('dynamic-watermark');
    
    // 1. Visual Feedback
    if(icon) icon.classList.add('fa-spin');
    if(gripEl) gripEl.innerText = "SYNCING...";

    try {
        const now = new Date();
        const currentRace = f1Calendar2026.find(race => new Date(race.date) >= now) || f1Calendar2026[0];

        // 2. Update Watermark
        if (watermarkEl) {
            let fullName = currentRace.circuit; 
            let cleanName = fullName.replace(/GP|Circuit|Grand Prix/gi, "").trim();
            watermarkEl.innerText = cleanName.toUpperCase();
        }

        // 3. Fetch Data
        const lat = currentRace.lat;
        const lon = currentRace.lon;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;

        const response = await fetch(url);
        const data = await response.json();
        const live = data.current;

        // 4. Update UI
        setTimeout(() => {
            const air = Math.round(live.temperature_2m);
            
            // Check if element exists before updating to avoid console errors
            if(document.getElementById('air-temp')) document.getElementById('air-temp').innerText = `${air}°C`;
            if(document.getElementById('track-temp')) document.getElementById('track-temp').innerText = `${air + 5}°C`;
            if(document.getElementById('rain-risk')) document.getElementById('rain-risk').innerText = `${live.relative_humidity_2m}%`;
            if(document.getElementById('wind-speed')) document.getElementById('wind-speed').innerText = `${Math.round(live.wind_speed_10m)} km/h`;

            // Status Logic
            const statusEl = document.getElementById('weather-status');
            if (statusEl) {
                const code = live.weather_code;
                if (code <= 3) statusEl.innerText = "CLEAR";
                else if (code <= 65) statusEl.innerText = "CLOUDY";
                else statusEl.innerText = "RAINY";
            }

            // Grip Logic - Using classList for cleaner styling
            if (gripEl) {
                if (live.precipitation > 0.1) {
                    gripEl.innerText = "SLIPPERY";
                    gripEl.className = "weather-value slippery";
                } else {
                    gripEl.innerText = "OPTIMAL";
                    gripEl.className = "weather-value optimal";
                }
            }

            if(icon) icon.classList.remove('fa-spin');
        }, 1000);

    } catch (error) {
        console.error("F1 Weather Error:", error);
        if(gripEl) gripEl.innerText = "OFFLINE";
        if(icon) icon.classList.remove('fa-spin');
    }
}
/** * THIS IS THE FIX: 
 * It triggers the update automatically when the page finishes loading.
 */

window.addEventListener('DOMContentLoaded', updateF1Weather);




