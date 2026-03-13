const f1_2026_grid = [
  { id: "norris", name: "Lando Norris", team: "mclaren", no: "1", wins: 12, poles: 15, champ: 1, flag: "gb", color: "#FF8000" },
  { id: "piastri", name: "Oscar Piastri", team: "mclaren", no: "81", wins: 5, poles: 4, champ: 0, flag: "au", color: "#FF8000" },
  { id: "hamilton", name: "Lewis Hamilton", team: "ferrari", no: "44", wins: 106, poles: 105, champ: 7, flag: "gb", color: "#E80020" },
  { id: "leclerc", name: "Charles Leclerc", team: "ferrari", no: "16", wins: 10, poles: 28, champ: 0, flag: "mc", color: "#E80020" },
  { id: "verstappen", name: "Max Verstappen", team: "red_bull", no: "3", wins: 64, poles: 44, champ: 4, flag: "nl", color: "#3671C6" },
  { id: "hadjar", name: "Isack Hadjar", team: "red_bull", no: "6", wins: 0, poles: 0, champ: 0, flag: "fr", color: "#3671C6" },
  { id: "russell", name: "George Russell", team: "mercedes", no: "63", wins: 5, poles: 7, champ: 0, flag: "gb", color: "#27F4D2" },
  { id: "antonelli", name: "Kimi Antonelli", team: "mercedes", no: "12", wins: 0, poles: 1, champ: 0, flag: "it", color: "#27F4D2" },
  { id: "perez", name: "Sergio Pérez", team: "cadillac", no: "11", wins: 6, poles: 3, champ: 0, flag: "mx", color: "#fabd33" },
  { id: "bottas", name: "Valtteri Bottas", team: "cadillac", no: "77", wins: 10, poles: 20, champ: 0, flag: "fi", color: "#fabd33" },
  { id: "hulkenberg", name: "Nico Hülkenberg", team: "audi", no: "27", wins: 0, poles: 1, champ: 0, flag: "de", color: "#484545" },
  { id: "bortoleto", name: "Gabriel Bortoleto", team: "audi", no: "5", wins: 0, poles: 0, champ: 0, flag: "br", color: "#484545" },
  { id: "gasly", name: "Pierre Gasly", team: "alpine", no: "10", wins: 1, poles: 0, champ: 0, flag: "fr", color: "#0093CC" },
  { id: "colapinto", name: "Franco Colapinto", team: "alpine", no: "43", wins: 0, poles: 0, champ: 0, flag: "ar", color: "#0093CC" },
  { id: "sainz", name: "Carlos Sainz", team: "williams", no: "55", wins: 4, poles: 6, champ: 0, flag: "es", color: "#64C4FF" },
  { id: "albon", name: "Alexander Albon", team: "williams", no: "23", wins: 0, poles: 0, champ: 0, flag: "th", color: "#64C4FF" },
  { id: "lawson", name: "Liam Lawson", team: "racing_bulls", no: "30", wins: 0, poles: 0, champ: 0, flag: "nz", color: "#6692FF" },
  { id: "lindblad", name: "Arvid Lindblad", team: "racing_bulls", no: "41", wins: 0, poles: 0, champ: 0, flag: "gb", color: "#6692FF" },
  { id: "ocon", name: "Esteban Ocon", team: "haas", no: "31", wins: 1, poles: 0, champ: 0, flag: "fr", color: "#b53b3b" },
  { id: "bearman", name: "Oliver Bearman", team: "haas", no: "87", wins: 0, poles: 0, champ: 0, flag: "gb", color: "#b53b3b" },
  { id: "stroll", name: "Lance Stroll", team: "aston_martin", no: "18", wins: 0, poles: 1, champ: 0, flag: "ca", color: "#229971" },
  { id: "alonso", name: "Fernando Alonso", team: "aston_martin", no: "14", wins: 32, poles: 22, champ: 2, flag: "es", color: "#229971" }
];

const teamColors = {
    mclaren: "#FF8000", ferrari: "#E80020", red_bull: "#0600EF",
    mercedes: "#27F4D2", cadillac: "#FFD700", audi: "#F50537",
    aston_martin: "#229971", alpine: "#0093CC", williams: "#64C4FF",
    haas: "#B6BABD", racing_bulls: "#6692FF"
};

const teamsData = [
    { name: "McLaren", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/66/McLaren_Racing_logo.svg/1200px-McLaren_Racing_logo.svg.png", color: "#FF8700", pu: "Mercedes", car: "MCL40", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Ferrari", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Ferrari-Logo.svg/800px-Ferrari-Logo.svg.png", color: "#EF1A2D", pu: "Ferrari", car: "SF-26", carImg: "https://images.tntsports.co.uk/mode=crop&width=1200&height=675/2024/02/13/ferrari-sf-24-1.jpg" },
    { name: "Mercedes", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Mercedes-AMG_Petronas_F1_Team_Logo.svg/1200px-Mercedes-AMG_Petronas_F1_Team_Logo.svg.png", color: "#00D2BE", pu: "Mercedes", car: "W17", carImg: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/409095163456885.63e6396827038.jpg" },
    { name: "Red Bull", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/66/Red_Bull_Racing_logo.svg/1200px-Red_Bull_Racing_logo.svg.png", color: "#0600EF", pu: "Red Bull Ford", car: "RB22", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Audi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Audi_logo_detail.svg/2560px-Audi_logo_detail.svg.png", color: "#ff003c", pu: "Audi", car: "R26", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Cadillac", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Cadillac_logo.svg/1200px-Cadillac_logo.svg.png", color: "#f1f1f1", pu: "Ferrari", car: "MAC-26", carImg: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/409095163456885.63e6396827038.jpg" },
    { name: "Aston Martin", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Aston_Martin_Lagonda_brand_logo.svg/1200px-Aston_Martin_Lagonda_brand_logo.svg.png", color: "#006F62", pu: "Honda", car: "AMR26", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Williams", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Williams_F1_logo.svg/1200px-Williams_F1_logo.svg.png", color: "#005AFF", pu: "Mercedes", car: "FW48", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Alpine", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Alpine_F1_Team_Logo.svg/1200px-Alpine_F1_Team_Logo.svg.png", color: "#0090FF", pu: "Mercedes", car: "A526", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Haas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Haas_F1_Team_logo.svg/1200px-Haas_F1_Team_logo.svg.png", color: "#FFFFFF", pu: "Ferrari", car: "VF-26", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Racing Bulls", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b2/RB_F1_Team_logo.svg/1200px-RB_F1_Team_logo.svg.png", color: "#6692FF", pu: "Red Bull Ford", car: "VCARB03", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" }
];

const f1Calendar2026 = [
    { gp: "Australian Grand Prix",          circuit: "Albert Park Circuit",              date: "2026-03-08", time: "09:00:00", lat: -37.84, lon: 144.97, Qualifying: { date: "2026-03-07", time: "09:00:00" } },
    { gp: "Chinese Grand Prix",             circuit: "Shanghai International Circuit",   date: "2026-03-15", time: "12:00:00", lat:  31.33, lon: 121.22, Qualifying: { date: "2026-03-14", time: "12:00:00" } },
    { gp: "Japanese Grand Prix",            circuit: "Suzuka Circuit",                   date: "2026-03-29", time: "10:00:00", lat:  34.84, lon: 136.54, Qualifying: { date: "2026-03-28", time: "11:00:00" } },
    { gp: "Bahrain Grand Prix",             circuit: "Bahrain International Circuit",    date: "2026-04-12", time: "20:00:00", lat:  26.03, lon:  50.51, Qualifying: { date: "2026-04-10", time: "20:00:00" } },
    { gp: "Saudi Arabian Grand Prix",       circuit: "Jeddah Corniche Circuit",          date: "2026-04-19", time: "22:00:00", lat:  21.63, lon:  39.10, Qualifying: { date: "2026-04-17", time: "23:00:00" } },
    { gp: "Miami Grand Prix",               circuit: "Miami International Autodrome",    date: "2026-05-04", time: "01:00:00", lat:  25.95, lon: -80.23, Qualifying: { date: "2026-05-02", time: "23:00:00" } },
    { gp: "Canadian Grand Prix",            circuit: "Circuit Gilles-Villeneuve",        date: "2026-05-24", time: "23:00:00", lat:  45.50, lon: -73.52, Qualifying: { date: "2026-05-23", time: "00:00:00" } },
    { gp: "Monaco Grand Prix",              circuit: "Circuit de Monaco",                date: "2026-06-07", time: "18:00:00", lat:  43.73, lon:   7.42, Qualifying: { date: "2026-06-06", time: "19:00:00" } },
    { gp: "Barcelona-Catalunya Grand Prix", circuit: "Circuit de Barcelona-Catalunya",   date: "2026-06-14", time: "18:00:00", lat:  41.57, lon:   2.26, Qualifying: { date: "2026-06-13", time: "19:00:00" } },
    { gp: "Austrian Grand Prix",            circuit: "Red Bull Ring",                    date: "2026-06-28", time: "18:00:00", lat:  47.21, lon:  14.76, Qualifying: { date: "2026-06-27", time: "19:00:00" } },
    { gp: "British Grand Prix",             circuit: "Silverstone Circuit",              date: "2026-07-05", time: "19:00:00", lat:  52.07, lon:  -1.01, Qualifying: { date: "2026-07-04", time: "20:00:00" } },
    { gp: "Belgian Grand Prix",             circuit: "Circuit de Spa-Francorchamps",     date: "2026-07-19", time: "18:00:00", lat:  50.43, lon:   5.97, Qualifying: { date: "2026-07-18", time: "19:00:00" } },
    { gp: "Hungarian Grand Prix",           circuit: "Hungaroring",                      date: "2026-07-26", time: "18:00:00", lat:  47.58, lon:  19.24, Qualifying: { date: "2026-07-25", time: "19:00:00" } },
    { gp: "Dutch Grand Prix",               circuit: "Circuit Zandvoort",                date: "2026-08-23", time: "18:00:00", lat:  52.38, lon:   4.54, Qualifying: { date: "2026-08-22", time: "18:00:00" } },
    { gp: "Italian Grand Prix",             circuit: "Monza Circuit",                    date: "2026-09-06", time: "18:00:00", lat:  45.62, lon:   9.28, Qualifying: { date: "2026-09-05", time: "19:00:00" } },
    { gp: "Spanish Grand Prix",             circuit: "Madrid Street Circuit",            date: "2026-09-13", time: "18:00:00", lat:  40.41, lon:  -3.70, Qualifying: { date: "2026-09-12", time: "19:00:00" } },
    { gp: "Azerbaijan Grand Prix",          circuit: "Baku City Circuit",                date: "2026-09-26", time: "16:00:00", lat:  40.37, lon:  49.85, Qualifying: { date: "2026-09-25", time: "17:00:00" } },
    { gp: "Singapore Grand Prix",           circuit: "Marina Bay Street Circuit",        date: "2026-10-11", time: "17:00:00", lat:   1.29, lon: 103.86, Qualifying: { date: "2026-10-10", time: "17:00:00" } },
    { gp: "United States Grand Prix",       circuit: "Circuit of the Americas",          date: "2026-10-25", time: "00:00:00", lat:  30.13, lon: -97.64, Qualifying: { date: "2026-10-24", time: "01:00:00" } },
    { gp: "Mexico City Grand Prix",         circuit: "Autódromo Hermanos Rodríguez",     date: "2026-11-01", time: "01:00:00", lat:  19.40, lon: -99.09, Qualifying: { date: "2026-10-31", time: "02:00:00" } },
    { gp: "São Paulo Grand Prix",           circuit: "Interlagos",                       date: "2026-11-08", time: "22:00:00", lat: -23.70, lon: -46.69, Qualifying: { date: "2026-11-07", time: "23:00:00" } },
    { gp: "Las Vegas Grand Prix",           circuit: "Las Vegas Strip Circuit",          date: "2026-11-22", time: "10:00:00", lat:  36.11, lon:-115.17, Qualifying: { date: "2026-11-21", time: "10:00:00" } },
    { gp: "Qatar Grand Prix",               circuit: "Lusail International Circuit",     date: "2026-11-29", time: "21:00:00", lat:  25.48, lon:  51.45, Qualifying: { date: "2026-11-28", time: "20:00:00" } },
    { gp: "Abu Dhabi Grand Prix",           circuit: "Yas Marina Circuit",               date: "2026-12-06", time: "18:00:00", lat:  24.47, lon:  54.60, Qualifying: { date: "2026-12-05", time: "18:00:00" } }
];

const f1Cars2026 = [
    { id: "ferrari",     name: "SF-26",    team: "Scuderia Ferrari HP",            drivers: "C. Leclerc & L. Hamilton",     photos: ["ferrari-1.jpg",  "ferrari-2.jpg",  "ferrari-3.jpg"]  },
    { id: "mclaren",     name: "MCL40",    team: "McLaren F1 Team",                drivers: "L. Norris & O. Piastri",       photos: ["mclaren-1.jpg",  "mclaren-2.jpg",  "mclaren-3.jpg"]  },
    { id: "mercedes",    name: "W17",      team: "Mercedes-AMG Petronas F1 Team",  drivers: "G. Russell & A. K. Antonelli", photos: ["mercedes-1.jpg", "mercedes-2.jpg", "mercedes-3.jpg"] },
    { id: "redbull",     name: "RB22",     team: "Oracle Red Bull Racing",         drivers: "M. Verstappen & I. Hadjar",    photos: ["redbull-1.jpg",  "redbull-2.jpg",  "redbull-3.jpg"]  },
    { id: "aston",       name: "AMR26",    team: "Aston Martin Aramco F1 Team",    drivers: "F. Alonso & L. Stroll",        photos: ["aston-1.jpg",    "aston-2.jpg",    "aston-3.jpg"]    },
    { id: "alpine",      name: "A526",     team: "BWT Alpine F1 Team",             drivers: "P. Gasly & F.Colapinto",       photos: ["alpine-1.jpg",   "alpine-2.jpg",   "alpine-3.jpg"]   },
    { id: "williams",    name: "FW48",     team: "Williams Racing",                drivers: "A. Albon & C. Sainz",          photos: ["williams-1.jpg", "williams-2.jpg", "williams-3.jpg"] },
    { id: "audi",        name: "C44",      team: "Audi F1 Team (formerly Sauber)", drivers: "N. Hülkenberg & G. Bortoleto", photos: ["audi-1.jpg",     "audi-2.jpg",     "audi-3.jpg"]     },
    { id: "racingbulls", name: "VCARB 01", team: "Racing Bulls",                   drivers: "L. Lawson & A. Lindblad",      photos: ["rb-1.jpg",       "rb-2.jpg",       "rb-3.jpg"]       },
    { id: "haas",        name: "VF-26",    team: "MoneyGram Haas F1 Team",         drivers: "E. Ocon & O. Bearman",         photos: ["haas-1.jpg",     "haas-2.jpg",     "haas-3.jpg"]     },
    { id: "cadillac",    name: "CTF1",     team: "Cadillac F1 Team",               drivers: "S. Perez & V. Bottas",         photos: ["cadillac-1.jpg", "cadillac-2.jpg", "cadillac-3.jpg"] }
];

const f1Teams2026 = [
{
    name: "Ferrari", country: "ITALY", flagUrl: "https://flagcdn.com/w40/it.png", color: "#E8002D",
    principal: "Fred Vasseur", principalLink: "https://www.ferrari.com/en-EN/formula1/fred-vasseur", teamLink: "https://www.ferrari.com/en-EN/formula1",
    constructors: 16, drivers_titles: 15,
    drivers: [{ name: "C. Leclerc", link: "https://www.formula1.com/en/drivers/charles-leclerc" }, { name: "L. Hamilton", link: "https://www.formula1.com/en/drivers/lewis-hamilton" }],
    history: "Formula 1's most legendary team enters a new era as Lewis Hamilton joins Charles Leclerc, blending unmatched experience with raw speed to chase glory under the 2026 regulations."
},
{
    name: "McLaren", country: "UNITED KINGDOM", flagUrl: "https://flagcdn.com/w40/gb.png", color: "#FF8000",
    principal: "Andrea Stella", principalLink: "https://www.mclaren.com/racing/team/andrea-stella/", teamLink: "https://www.mclaren.com/racing/formula-1/",
    constructors: 10, drivers_titles: 13,
    drivers: [{ name: "L. Norris", link: "https://www.formula1.com/en/drivers/lando-norris" }, { name: "O. Piastri", link: "https://www.formula1.com/en/drivers/oscar-piastri" }],
    history: "Fresh off their 2025 Constructors' title, McLaren leads the grid with exceptional car balance, sharp strategy, and one of the strongest driver pairings in Formula 1."
},
{
    name: "Mercedes", country: "GERMANY", flagUrl: "https://flagcdn.com/w40/de.png", color: "#27F4D2",
    principal: "Toto Wolff", principalLink: "https://www.mercedesamgf1.com/team/management/toto-wolff", teamLink: "https://www.mercedesamgf1.com/",
    constructors: 8, drivers_titles: 7,
    drivers: [{ name: "G. Russell", link: "https://www.formula1.com/en/drivers/george-russell" }, { name: "K. Antonelli", link: "https://www.formula1.com/en/drivers/kimi-antonelli" }],
    history: "After dominating the hybrid era, Mercedes resets for the future with George Russell as team leader and prodigy Kimi Antonelli symbolizing the next generation."
},
{
    name: "Red Bull", country: "AUSTRIA", flagUrl: "https://flagcdn.com/w40/at.png", color: "#1628b0",
    principal: "Laurent Mekies", principalLink: "https://www.redbullracing.com/", teamLink: "https://www.redbullracing.com/",
    constructors: 6, drivers_titles: 8,
    drivers: [{ name: "M. Verstappen", link: "https://www.formula1.com/en/drivers/max-verstappen" }, { name: "I. Hadjar", link: "https://www.formula1.com/en/drivers/isack-hadjar" }],
    history: "Red Bull enters a bold new chapter with its own power unit as Max Verstappen leads the team through the most ambitious transformation in its history."
},
{
    name: "Aston Martin", country: "UNITED KINGDOM", flagUrl: "https://flagcdn.com/w40/gb.png", color: "#006F62",
    principal: "Mike Krack", principalLink: "https://www.astonmartinf1.com/", teamLink: "https://www.astonmartinf1.com/",
    constructors: 0, drivers_titles: 2,
    drivers: [{ name: "F. Alonso", link: "https://www.formula1.com/en/drivers/fernando-alonso" }, { name: "L. Stroll", link: "https://www.formula1.com/en/drivers/lance-stroll" }],
    history: "Aston Martin continues its steady rise with world champion Fernando Alonso providing experience while long-term investment targets future championship contention."
},
{
    name: "Alpine", country: "FRANCE", flagUrl: "https://flagcdn.com/w40/fr.png", color: "#d041bd",
    principal: "Bruno Famin", principalLink: "https://www.alpinecars.com/", teamLink: "https://www.alpinecars.com/",
    constructors: 2, drivers_titles: 2,
    drivers: [{ name: "P. Gasly", link: "https://www.formula1.com/en/drivers/pierre-gasly" }, { name: "F. Colapinto", link: "https://www.formula1.com/en/drivers/franco-colapinto" }],
    history: "Alpine blends its championship heritage with a renewed focus on youth as it looks to rebuild into a consistent front-running force."
},
{
    name: "Williams", country: "UNITED KINGDOM", flagUrl: "https://flagcdn.com/w40/gb.png", color: "#247ba0",
    principal: "James Vowles", principalLink: "https://www.williamsf1.com/", teamLink: "https://www.williamsf1.com/",
    constructors: 9, drivers_titles: 7,
    drivers: [{ name: "C. Sainz", link: "https://www.formula1.com/en/drivers/carlos-sainz" }, { name: "A. Albon", link: "https://www.formula1.com/en/drivers/alexander-albon" }],
    history: "One of Formula 1's most historic teams continues its revival with Carlos Sainz bringing race-winning experience to a proud racing institution."
},
{
    name: "Racing Bulls", country: "ITALY", flagUrl: "https://flagcdn.com/w40/it.png", color: "#e0d375",
    principal: "Peter Bayer", principalLink: "https://www.visacashapprb.com/", teamLink: "https://www.visacashapprb.com/",
    constructors: 0, drivers_titles: 0,
    drivers: [{ name: "L. Lawson", link: "https://www.formula1.com/en/drivers/liam-lawson" }, { name: "A. Lindblad", link: "https://www.formula1.com/en/drivers/arvid-lindblad" }],
    history: "Known as Formula 1's ultimate talent factory, Racing Bulls focuses on fearless racing and developing future stars for the top teams."
},
{
    name: "Haas", country: "UNITED STATES", flagUrl: "https://flagcdn.com/w40/us.png", color: "#c35353",
    principal: "Ayao Komatsu", principalLink: "https://www.haasf1team.com/", teamLink: "https://www.haasf1team.com/",
    constructors: 0, drivers_titles: 0,
    drivers: [{ name: "E. Ocon", link: "https://www.formula1.com/en/drivers/esteban-ocon" }, { name: "O. Bearman", link: "https://www.formula1.com/en/drivers/oliver-bearman" }],
    history: "Haas continues to grow as America's established Formula 1 team, combining experience and youth to push deeper into the midfield."
},
{
    name: "Audi", country: "GERMANY", flagUrl: "https://flagcdn.com/w40/de.png", color: "#535151",
    principal: "Jonathan Wheatley", principalLink: "https://www.audi.com/en/sport/formula-1.html", teamLink: "https://www.audi.com/en/sport/formula-1.html",
    constructors: 0, drivers_titles: 0,
    drivers: [{ name: "N. Hülkenberg", link: "https://www.formula1.com/en/drivers/nico-hulkenberg" }, { name: "G. Bortoleto", link: "https://www.formula1.com/en/drivers/gabriel-bortoleto" }],
    history: "Audi launches its full factory Formula 1 program with German engineering precision and long-term ambition to fight at the front."
},
{
    name: "Cadillac", country: "UNITED STATES", flagUrl: "https://flagcdn.com/w40/us.png", color: "#ffffff",
    principal: "Graeme Lowdon", principalLink: "https://www.cadillac.com/f1", teamLink: "https://www.cadillac.com/f1",
    constructors: 0, drivers_titles: 0,
    drivers: [{ name: "S. Pérez", link: "https://www.formula1.com/en/drivers/sergio-perez" }, { name: "V. Bottas", link: "https://www.formula1.com/en/drivers/valtteri-bottas" }],
    history: "Cadillac enters Formula 1 as the 11th team with strong manufacturer backing and experienced drivers to build a serious American contender."
}
];

/**
 * Zenith Race Schedule 2026 — Pakistan Standard Time (PKT = UTC+5)
 * All session times converted from official local circuit times.
 *
 * SPRINT WEEKENDS (6): China★, Miami★, Canada★, Britain★, Netherlands★, Singapore★
 *   Sprint format: FP1 + SprintQuali (Fri) → Sprint + Quali (Sat) → Race (Sun)
 * SATURDAY RACES (2): Azerbaijan (R17), Las Vegas (R22)
 * ALL OTHERS: FP1+FP2 (Fri) → FP3+Quali (Sat) → Race (Sun)
 *   Bahrain & Saudi: Thu/Fri/Sun format (Ramadan consideration)
 */
const zenithRaceSchedule = [

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R1  AUSTRALIA — Albert Park (AEDT = UTC+11)
    // FP1 Fri 13:30 AEDT = 07:30 PKT
    // FP2 Fri 17:00 AEDT = 11:00 PKT
    // FP3 Sat 11:30 AEDT = 05:30 PKT
    // Quali Sat 15:00 AEDT = 09:00 PKT
    // Race Sun 15:00 AEDT = 09:00 PKT
    {
        round: 1, gp: "Australian Grand Prix",
        FP1:   { iso: "2026-03-06T07:30:00+05:00" },
        FP2:   { iso: "2026-03-06T11:00:00+05:00" },
        FP3:   { iso: "2026-03-07T05:30:00+05:00" },
        Qualifying: { iso: "2026-03-07T09:00:00+05:00" },
        Race:  { iso: "2026-03-08T09:00:00+05:00" },
        hubUrl: "race-hub-aus.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R2  CHINA ★SPRINT — Shanghai (CST = UTC+8)
    // FP1 Fri 11:30 CST = 08:30 PKT
    // SprintQuali Fri 15:30 CST = 12:30 PKT
    // Sprint Sat 11:00 CST = 08:00 PKT
    // Quali Sat 15:00 CST = 12:00 PKT
    // Race Sun 15:00 CST = 12:00 PKT
    {
        round: 2, gp: "Chinese Grand Prix", sprint: true,
        FP1:          { iso: "2026-03-13T08:30:00+05:00" },
        SprintQuali:  { iso: "2026-03-13T12:30:00+05:00" },
        Sprint:       { iso: "2026-03-14T08:00:00+05:00" },
        Qualifying:   { iso: "2026-03-14T12:00:00+05:00" },
        Race:         { iso: "2026-03-15T12:00:00+05:00" },
        hubUrl: "race-hub-chn.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R3  JAPAN — Suzuka (JST = UTC+9)
    // FP1 Fri 10:30 JST = 06:30 PKT
    // FP2 Fri 14:00 JST = 10:00 PKT
    // FP3 Sat 11:00 JST = 07:00 PKT
    // Quali Sat 15:00 JST = 11:00 PKT
    // Race Sun 14:00 JST = 10:00 PKT
    {
        round: 3, gp: "Japanese Grand Prix",
        FP1:   { iso: "2026-03-27T06:30:00+05:00" },
        FP2:   { iso: "2026-03-27T10:00:00+05:00" },
        FP3:   { iso: "2026-03-28T07:00:00+05:00" },
        Qualifying: { iso: "2026-03-28T11:00:00+05:00" },
        Race:  { iso: "2026-03-29T10:00:00+05:00" },
        hubUrl: "race-hub-jpn.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R4  BAHRAIN — BIC (AST = UTC+3) — Thu/Fri/Sun format
    // FP1 Thu 15:30 AST = 17:30 PKT
    // FP2 Thu 19:00 AST = 21:00 PKT
    // FP3 Fri 14:00 AST = 16:00 PKT
    // Quali Fri 18:00 AST = 20:00 PKT
    // Race Sun 18:00 AST = 20:00 PKT
    {
        round: 4, gp: "Bahrain Grand Prix",
        FP1:   { iso: "2026-04-09T17:30:00+05:00" },
        FP2:   { iso: "2026-04-09T21:00:00+05:00" },
        FP3:   { iso: "2026-04-10T16:00:00+05:00" },
        Qualifying: { iso: "2026-04-10T20:00:00+05:00" },
        Race:  { iso: "2026-04-12T20:00:00+05:00" },
        hubUrl: "race-hub-bhr.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R5  SAUDI ARABIA — Jeddah (AST = UTC+3) — Thu/Fri/Sun format
    // FP1 Thu 17:30 AST = 19:30 PKT
    // FP2 Thu 21:00 AST = 23:00 PKT
    // FP3 Fri 17:30 AST = 19:30 PKT
    // Quali Fri 21:00 AST = 23:00 PKT
    // Race Sun 20:00 AST = 22:00 PKT
    {
        round: 5, gp: "Saudi Arabian Grand Prix",
        FP1:   { iso: "2026-04-16T19:30:00+05:00" },
        FP2:   { iso: "2026-04-16T23:00:00+05:00" },
        FP3:   { iso: "2026-04-17T19:30:00+05:00" },
        Qualifying: { iso: "2026-04-17T23:00:00+05:00" },
        Race:  { iso: "2026-04-19T22:00:00+05:00" },
        hubUrl: "race-hub-sau.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R6  MIAMI ★SPRINT — Miami Autodrome (EDT = UTC-4)
    // FP1 Fri 12:30 EDT = 21:30 PKT
    // SprintQuali Fri 16:30 EDT = 01:30 PKT Sat
    // Sprint Sat 10:00 EDT = 19:00 PKT
    // Quali Sat 14:00 EDT = 23:00 PKT
    // Race Sun 16:00 EDT = 01:00 PKT Mon
    {
        round: 6, gp: "Miami Grand Prix", sprint: true,
        FP1:         { iso: "2026-05-01T21:30:00+05:00" },
        SprintQuali: { iso: "2026-05-02T01:30:00+05:00" },
        Sprint:      { iso: "2026-05-02T19:00:00+05:00" },
        Qualifying:  { iso: "2026-05-02T23:00:00+05:00" },
        Race:        { iso: "2026-05-04T01:00:00+05:00" },
        hubUrl: "race-hub-mia.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R7  CANADA ★SPRINT — Gilles Villeneuve (EDT = UTC-4)
    // FP1 Fri 13:30 EDT = 22:30 PKT
    // SprintQuali Fri 17:30 EDT = 02:30 PKT Sat
    // Sprint Sat 11:00 EDT = 20:00 PKT
    // Quali Sat 15:00 EDT = 00:00 PKT Sun
    // Race Sun 14:00 EDT = 23:00 PKT
    {
        round: 7, gp: "Canadian Grand Prix", sprint: true,
        FP1:         { iso: "2026-05-22T22:30:00+05:00" },
        SprintQuali: { iso: "2026-05-23T02:30:00+05:00" },
        Sprint:      { iso: "2026-05-23T20:00:00+05:00" },
        Qualifying:  { iso: "2026-05-24T00:00:00+05:00" },
        Race:        { iso: "2026-05-24T23:00:00+05:00" },
        hubUrl: "race-hub-can.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R8  MONACO — Circuit de Monaco (CEST = UTC+2)
    // FP1 Fri 13:30 CEST = 16:30 PKT
    // FP2 Fri 17:00 CEST = 20:00 PKT
    // FP3 Sat 12:30 CEST = 15:30 PKT
    // Quali Sat 16:00 CEST = 19:00 PKT
    // Race Sun 15:00 CEST = 18:00 PKT
    {
        round: 8, gp: "Monaco Grand Prix",
        FP1:   { iso: "2026-06-05T16:30:00+05:00" },
        FP2:   { iso: "2026-06-05T20:00:00+05:00" },
        FP3:   { iso: "2026-06-06T15:30:00+05:00" },
        Qualifying: { iso: "2026-06-06T19:00:00+05:00" },
        Race:  { iso: "2026-06-07T18:00:00+05:00" },
        hubUrl: "race-hub-mon.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R9  BARCELONA-CATALUNYA (CEST = UTC+2)
    {
        round: 9, gp: "Barcelona Grand Prix",
        FP1:   { iso: "2026-06-12T16:30:00+05:00" },
        FP2:   { iso: "2026-06-12T20:00:00+05:00" },
        FP3:   { iso: "2026-06-13T15:30:00+05:00" },
        Qualifying: { iso: "2026-06-13T19:00:00+05:00" },
        Race:  { iso: "2026-06-14T18:00:00+05:00" },
        hubUrl: "race-hub-esp-cat.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R10 AUSTRIA — Red Bull Ring (CEST = UTC+2)
    {
        round: 10, gp: "Austrian Grand Prix",
        FP1:   { iso: "2026-06-26T16:30:00+05:00" },
        FP2:   { iso: "2026-06-26T20:00:00+05:00" },
        FP3:   { iso: "2026-06-27T15:30:00+05:00" },
        Qualifying: { iso: "2026-06-27T19:00:00+05:00" },
        Race:  { iso: "2026-06-28T18:00:00+05:00" },
        hubUrl: "race-hub-aut.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R11 BRITAIN ★SPRINT — Silverstone (BST = UTC+1)
    // FP1 Fri 13:30 BST = 17:30 PKT
    // SprintQuali Fri 17:30 BST = 21:30 PKT
    // Sprint Sat 12:00 BST = 16:00 PKT
    // Quali Sat 16:00 BST = 20:00 PKT
    // Race Sun 15:00 BST = 19:00 PKT
    {
        round: 11, gp: "British Grand Prix", sprint: true,
        FP1:         { iso: "2026-07-03T17:30:00+05:00" },
        SprintQuali: { iso: "2026-07-03T21:30:00+05:00" },
        Sprint:      { iso: "2026-07-04T16:00:00+05:00" },
        Qualifying:  { iso: "2026-07-04T20:00:00+05:00" },
        Race:        { iso: "2026-07-05T19:00:00+05:00" },
        hubUrl: "race-hub-gbr.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R12 BELGIUM — Spa (CEST = UTC+2)
    {
        round: 12, gp: "Belgian Grand Prix",
        FP1:   { iso: "2026-07-17T16:30:00+05:00" },
        FP2:   { iso: "2026-07-17T20:00:00+05:00" },
        FP3:   { iso: "2026-07-18T15:30:00+05:00" },
        Qualifying: { iso: "2026-07-18T19:00:00+05:00" },
        Race:  { iso: "2026-07-19T18:00:00+05:00" },
        hubUrl: "race-hub-bel.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R13 HUNGARY — Hungaroring (CEST = UTC+2)
    {
        round: 13, gp: "Hungarian Grand Prix",
        FP1:   { iso: "2026-07-24T16:30:00+05:00" },
        FP2:   { iso: "2026-07-24T20:00:00+05:00" },
        FP3:   { iso: "2026-07-25T15:30:00+05:00" },
        Qualifying: { iso: "2026-07-25T19:00:00+05:00" },
        Race:  { iso: "2026-07-26T18:00:00+05:00" },
        hubUrl: "race-hub-hun.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R14 NETHERLANDS ★SPRINT — Zandvoort (CEST = UTC+2)
    // FP1 Fri 13:30 CEST = 16:30 PKT
    // SprintQuali Fri 17:30 CEST = 20:30 PKT (estimated)
    // Sprint Sat 12:00 CEST = 15:00 PKT
    // Quali Sat 16:00 CEST = 19:00 PKT (wait, standard is 16:00 CEST = 19:00 PKT but last session said 18:00 PKT)
    // Race Sun 15:00 CEST = 18:00 PKT
    {
        round: 14, gp: "Dutch Grand Prix", sprint: true,
        FP1:         { iso: "2026-08-21T16:30:00+05:00" },
        SprintQuali: { iso: "2026-08-21T20:30:00+05:00" },
        Sprint:      { iso: "2026-08-22T15:00:00+05:00" },
        Qualifying:  { iso: "2026-08-22T19:00:00+05:00" },
        Race:        { iso: "2026-08-23T18:00:00+05:00" },
        hubUrl: "race-hub-ned.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R15 ITALY — Monza (CEST = UTC+2)
    {
        round: 15, gp: "Italian Grand Prix",
        FP1:   { iso: "2026-09-04T16:30:00+05:00" },
        FP2:   { iso: "2026-09-04T20:00:00+05:00" },
        FP3:   { iso: "2026-09-05T15:30:00+05:00" },
        Qualifying: { iso: "2026-09-05T19:00:00+05:00" },
        Race:  { iso: "2026-09-06T18:00:00+05:00" },
        hubUrl: "race-hub-ita.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R16 SPAIN MADRID — Madring (CEST = UTC+2)
    {
        round: 16, gp: "Spanish Grand Prix (Madrid)",
        FP1:   { iso: "2026-09-11T16:30:00+05:00" },
        FP2:   { iso: "2026-09-11T20:00:00+05:00" },
        FP3:   { iso: "2026-09-12T15:30:00+05:00" },
        Qualifying: { iso: "2026-09-12T19:00:00+05:00" },
        Race:  { iso: "2026-09-13T18:00:00+05:00" },
        hubUrl: "race-hub-esp-mad.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R17 AZERBAIJAN — Baku (AZT = UTC+4) ★SATURDAY RACE
    // FP1 Thu 12:30 AZT = 13:30 PKT
    // FP2 Thu 16:00 AZT = 17:00 PKT
    // FP3 Fri 12:30 AZT = 13:30 PKT
    // Quali Fri 16:00 AZT = 17:00 PKT
    // Race SAT 15:00 AZT = 16:00 PKT
    {
        round: 17, gp: "Azerbaijan Grand Prix",
        FP1:   { iso: "2026-09-24T13:30:00+05:00" },
        FP2:   { iso: "2026-09-24T17:00:00+05:00" },
        FP3:   { iso: "2026-09-25T13:30:00+05:00" },
        Qualifying: { iso: "2026-09-25T17:00:00+05:00" },
        Race:  { iso: "2026-09-26T16:00:00+05:00" },
        hubUrl: "race-hub-aze.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R18 SINGAPORE ★SPRINT — Marina Bay (SGT = UTC+8)
    // FP1 Fri 18:30 SGT = 15:30 PKT
    // SprintQuali Fri 22:30 SGT = 19:30 PKT
    // Sprint Sat 16:00 SGT = 13:00 PKT
    // Quali Sat 20:00 SGT = 17:00 PKT
    // Race Sun 20:00 SGT = 17:00 PKT
    {
        round: 18, gp: "Singapore Grand Prix", sprint: true,
        FP1:         { iso: "2026-10-09T15:30:00+05:00" },
        SprintQuali: { iso: "2026-10-09T19:30:00+05:00" },
        Sprint:      { iso: "2026-10-10T13:00:00+05:00" },
        Qualifying:  { iso: "2026-10-10T17:00:00+05:00" },
        Race:        { iso: "2026-10-11T17:00:00+05:00" },
        hubUrl: "race-hub-sin.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R19 USA COTA — Austin (CDT = UTC-5)
    // FP1 Fri 13:30 CDT = 23:30 PKT
    // FP2 Fri 17:00 CDT = 03:00 PKT Sat
    // FP3 Sat 11:30 CDT = 21:30 PKT
    // Quali Sat 15:00 CDT = 01:00 PKT Sun
    // Race Sun 14:00 CDT = 00:00 PKT Mon
    {
        round: 19, gp: "United States Grand Prix",
        FP1:   { iso: "2026-10-23T23:30:00+05:00" },
        FP2:   { iso: "2026-10-24T03:00:00+05:00" },
        FP3:   { iso: "2026-10-24T21:30:00+05:00" },
        Qualifying: { iso: "2026-10-25T01:00:00+05:00" },
        Race:  { iso: "2026-10-26T00:00:00+05:00" },
        hubUrl: "race-hub-usa.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R20 MEXICO CITY — Hermanos Rodriguez (CST = UTC-6)
    // FP1 Fri 13:30 CST = 00:30 PKT Sat
    // FP2 Fri 17:00 CST = 04:00 PKT Sat
    // FP3 Sat 11:00 CST = 22:00 PKT
    // Quali Sat 15:00 CST = 02:00 PKT Sun
    // Race Sun 14:00 CST = 01:00 PKT Mon
    {
        round: 20, gp: "Mexico City Grand Prix",
        FP1:   { iso: "2026-10-31T00:30:00+05:00" },
        FP2:   { iso: "2026-10-31T04:00:00+05:00" },
        FP3:   { iso: "2026-10-31T22:00:00+05:00" },
        Qualifying: { iso: "2026-11-01T02:00:00+05:00" },
        Race:  { iso: "2026-11-02T01:00:00+05:00" },
        hubUrl: "race-hub-mex.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R21 SÃO PAULO — Interlagos (BRT = UTC-3)
    // FP1 Fri 14:30 BRT = 22:30 PKT
    // FP2 Fri 18:00 BRT = 02:00 PKT Sat
    // FP3 Sat 11:30 BRT = 19:30 PKT
    // Quali Sat 15:00 BRT = 23:00 PKT
    // Race Sun 14:00 BRT = 22:00 PKT
    {
        round: 21, gp: "São Paulo Grand Prix",
        FP1:   { iso: "2026-11-06T22:30:00+05:00" },
        FP2:   { iso: "2026-11-07T02:00:00+05:00" },
        FP3:   { iso: "2026-11-07T19:30:00+05:00" },
        Qualifying: { iso: "2026-11-07T23:00:00+05:00" },
        Race:  { iso: "2026-11-08T22:00:00+05:00" },
        hubUrl: "race-hub-bra.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R22 LAS VEGAS — Strip Circuit (PDT = UTC-7) ★SATURDAY RACE
    // FP1 Thu 19:00 PDT = 07:00 PKT Fri
    // FP2 Thu 23:00 PDT = 11:00 PKT Fri
    // FP3 Fri 19:00 PDT = 07:00 PKT Sat
    // Quali Fri 22:00 PDT = 10:00 PKT Sat
    // Race SAT 22:00 PDT = 10:00 PKT Sun
    {
        round: 22, gp: "Las Vegas Grand Prix",
        FP1:   { iso: "2026-11-20T07:00:00+05:00" },
        FP2:   { iso: "2026-11-20T11:00:00+05:00" },
        FP3:   { iso: "2026-11-21T07:00:00+05:00" },
        Qualifying: { iso: "2026-11-21T10:00:00+05:00" },
        Race:  { iso: "2026-11-22T10:00:00+05:00" },
        hubUrl: "race-hub-vegas.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R23 QATAR — Lusail (AST = UTC+3)
    // FP1 Fri 15:30 AST = 17:30 PKT
    // FP2 Fri 19:00 AST = 21:00 PKT
    // FP3 Sat 14:30 AST = 16:30 PKT
    // Quali Sat 18:00 AST = 20:00 PKT
    // Race Sun 19:00 AST = 21:00 PKT
    {
        round: 23, gp: "Qatar Grand Prix",
        FP1:   { iso: "2026-11-27T17:30:00+05:00" },
        FP2:   { iso: "2026-11-27T21:00:00+05:00" },
        FP3:   { iso: "2026-11-28T16:30:00+05:00" },
        Qualifying: { iso: "2026-11-28T20:00:00+05:00" },
        Race:  { iso: "2026-11-29T21:00:00+05:00" },
        hubUrl: "race-hub-qat.html"
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // R24 ABU DHABI — Yas Marina (GST = UTC+4)
    // FP1 Fri 14:30 GST = 15:30 PKT
    // FP2 Fri 18:00 GST = 19:00 PKT
    // FP3 Sat 13:30 GST = 14:30 PKT
    // Quali Sat 17:00 GST = 18:00 PKT
    // Race Sun 17:00 GST = 18:00 PKT
    {
        round: 24, gp: "Abu Dhabi Grand Prix",
        FP1:   { iso: "2026-12-04T15:30:00+05:00" },
        FP2:   { iso: "2026-12-04T19:00:00+05:00" },
        FP3:   { iso: "2026-12-05T14:30:00+05:00" },
        Qualifying: { iso: "2026-12-05T18:00:00+05:00" },
        Race:  { iso: "2026-12-06T18:00:00+05:00" },
        hubUrl: "race-hub-uae.html"
    }

];
