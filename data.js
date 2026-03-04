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
    mclaren: "#FF8000",
    ferrari: "#E80020",
    red_bull: "#0600EF",
    mercedes: "#27F4D2",
    cadillac: "#FFD700", // Cadillac Gold/Silver
    audi: "#F50537",     // Audi Sport Red
    aston_martin: "#229971",
    alpine: "#0093CC",
    williams: "#64C4FF",
    haas: "#B6BABD",
    racing_bulls: "#6692FF"
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
    { name: "Alpine", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Alpine_F1_Team_Logo.svg/1200px-Alpine_F1_Team_Logo.svg.png", color: "#0090FF", pu: "Renault", car: "A526", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Haas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Haas_F1_Team_logo.svg/1200px-Haas_F1_Team_logo.svg.png", color: "#FFFFFF", pu: "Ferrari", car: "VF-26", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" },
    { name: "Racing Bulls", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b2/RB_F1_Team_logo.svg/1200px-RB_F1_Team_logo.svg.png", color: "#6692FF", pu: "Red Bull Ford", car: "VCARB03", carImg: "https://images.lifestyleasia.com/wp-content/uploads/sites/2/2022/08/29124407/Audi-F1-1.jpg" }
];
const f1Calendar2026 = [
    {
        gp: "Australian Grand Prix",
        circuit: "Albert Park Circuit",
        date: "2026-03-08",
        time: "09:00:00",
        lat: -37.84,
        lon: 144.97,
        Qualifying: { date: "2026-03-07", time: "10:00:00" }
    },
    {
        gp: "Chinese Grand Prix",
        circuit: "Shanghai International Circuit",
        date: "2026-03-15",
        time: "12:00:00",
        lat: 31.33,
        lon: 121.22,
        Qualifying: { date: "2026-03-14", time: "12:00:00" }
    },
    {
        gp: "Japanese Grand Prix",
        circuit: "Suzuka Circuit",
        date: "2026-03-29",
        time: "10:00:00",
        lat: 34.84,
        lon: 136.54,
        Qualifying: { date: "2026-03-28", time: "11:00:00" }
    },
    {
        gp: "Bahrain Grand Prix",
        circuit: "Bahrain International Circuit",
        date: "2026-04-12",
        time: "20:00:00",
        lat: 26.03,
        lon: 50.51,
        Qualifying: { date: "2026-04-11", time: "21:00:00" }
    },
    {
        gp: "Saudi Arabian Grand Prix",
        circuit: "Jeddah Corniche Circuit",
        date: "2026-04-19",
        time: "22:00:00",
        lat: 21.63,
        lon: 39.10,
        Qualifying: { date: "2026-04-18", time: "22:00:00" }
    },
    {
        gp: "Miami Grand Prix",
        circuit: "Miami International Autodrome",
        date: "2026-05-04",
        time: "01:00:00",
        lat: 25.95,
        lon: -80.23,
        Qualifying: { date: "2026-05-03", time: "01:00:00" }
    },
    {
        gp: "Canadian Grand Prix",
        circuit: "Circuit Gilles-Villeneuve",
        date: "2026-05-25",
        time: "01:00:00",
        lat: 45.50,
        lon: -73.52,
        Qualifying: { date: "2026-05-24", time: "01:00:00" }
    },
    {
        gp: "Monaco Grand Prix",
        circuit: "Circuit de Monaco",
        date: "2026-06-07",
        time: "18:00:00",
        lat: 43.73,
        lon: 7.42,
        Qualifying: { date: "2026-06-06", time: "19:00:00" }
    },
    {
        gp: "Barcelona-Catalunya Grand Prix",
        circuit: "Circuit de Barcelona-Catalunya",
        date: "2026-06-14",
        time: "18:00:00",
        lat: 41.57,
        lon: 2.26,
        Qualifying: { date: "2026-06-13", time: "19:00:00" }
    },
    {
        gp: "Austrian Grand Prix",
        circuit: "Red Bull Ring",
        date: "2026-06-28",
        time: "18:00:00",
        lat: 47.21,
        lon: 14.76,
        Qualifying: { date: "2026-06-27", time: "19:00:00" }
    },
    {
        gp: "British Grand Prix",
        circuit: "Silverstone Circuit",
        date: "2026-07-05",
        time: "19:00:00",
        lat: 52.07,
        lon: -1.01,
        Qualifying: { date: "2026-07-04", time: "20:00:00" }
    },
    {
        gp: "Belgian Grand Prix",
        circuit: "Circuit de Spa-Francorchamps",
        date: "2026-07-19",
        time: "18:00:00",
        lat: 50.43,
        lon: 5.97,
        Qualifying: { date: "2026-07-18", time: "19:00:00" }
    },
    {
        gp: "Hungarian Grand Prix",
        circuit: "Hungaroring",
        date: "2026-07-26",
        time: "18:00:00",
        lat: 47.58,
        lon: 19.24,
        Qualifying: { date: "2026-07-25", time: "19:00:00" }
    },
    {
        gp: "Dutch Grand Prix",
        circuit: "Circuit Zandvoort",
        date: "2026-08-23",
        time: "18:00:00",
        lat: 52.38,
        lon: 4.54,
        Qualifying: { date: "2026-08-22", time: "19:00:00" }
    },
    {
        gp: "Italian Grand Prix",
        circuit: "Monza Circuit",
        date: "2026-09-06",
        time: "18:00:00",
        lat: 45.62,
        lon: 9.28,
        Qualifying: { date: "2026-09-05", time: "19:00:00" }
    },
    {
        gp: "Spanish Grand Prix",
        circuit: "Madrid Street Circuit",
        date: "2026-09-13",
        time: "18:00:00",
        lat: 40.41,
        lon: -3.70,
        Qualifying: { date: "2026-09-12", time: "19:00:00" }
    },
    {
        gp: "Azerbaijan Grand Prix",
        circuit: "Baku City Circuit",
        date: "2026-09-26",
        time: "16:00:00",
        lat: 40.37,
        lon: 49.85,
        Qualifying: { date: "2026-09-25", time: "17:00:00" }
    },
    {
        gp: "Singapore Grand Prix",
        circuit: "Marina Bay Street Circuit",
        date: "2026-10-11",
        time: "17:00:00",
        lat: 1.29,
        lon: 103.86,
        Qualifying: { date: "2026-10-10", time: "18:00:00" }
    },
    {
        gp: "United States Grand Prix",
        circuit: "Circuit of the Americas",
        date: "2026-10-25",
        time: "01:00:00",
        lat: 30.13,
        lon: -97.64,
        Qualifying: { date: "2026-10-25", time: "01:00:00" }
    },
    {
        gp: "Mexico City Grand Prix",
        circuit: "Autódromo Hermanos Rodríguez",
        date: "2026-11-01",
        time: "01:00:00",
        lat: 19.40,
        lon: -99.09,
        Qualifying: { date: "2026-11-01", time: "00:00:00" }
    },
    {
        gp: "São Paulo Grand Prix",
        circuit: "Interlagos",
        date: "2026-11-08",
        time: "22:00:00",
        lat: -23.70,
        lon: -46.69,
        Qualifying: { date: "2026-11-07", time: "23:00:00" }
    },
    {
        gp: "Las Vegas Grand Prix",
        circuit: "Las Vegas Strip Circuit",
        date: "2026-11-22",
        time: "09:00:00",
        lat: 36.11,
        lon: -115.17,
        Qualifying: { date: "2026-11-21", time: "10:00:00" }
    },
    {
        gp: "Qatar Grand Prix",
        circuit: "Lusail International Circuit",
        date: "2026-11-29",
        time: "21:00:00",
        lat: 25.48,
        lon: 51.45,
        Qualifying: { date: "2026-11-28", time: "22:00:00" }
    },
    {
        gp: "Abu Dhabi Grand Prix",
        circuit: "Yas Marina Circuit",
        date: "2026-12-06",
        time: "18:00:00",
        lat: 24.47,
        lon: 54.60,
        Qualifying: { date: "2026-12-05", time: "19:00:00" }
    }
];
const f1Cars2026 = [
    { 
        id: "ferrari", 
        name: "SF-26", 
        team: "Scuderia Ferrari HP", 
        drivers: "C. Leclerc & L. Hamilton",
        photos: ["ferrari-1.jpg", "ferrari-2.jpg", "ferrari-3.jpg"]
    },
    { 
        id: "mclaren", 
        name: "MCL40", 
        team: "McLaren F1 Team", 
        drivers: "L. Norris & O. Piastri",
        photos: ["mclaren-1.jpg", "mclaren-2.jpg", "mclaren-3.jpg"]
    },
    { 
        id: "mercedes", 
        name: "W17", 
        team: "Mercedes-AMG Petronas F1 Team", 
        drivers: "G. Russell & A. K. Antonelli",
        photos: ["mercedes-1.jpg", "mercedes-2.jpg", "mercedes-3.jpg"]
    },
    { 
        id: "redbull", 
        name: "RB22", 
        team: "Oracle Red Bull Racing", 
        drivers: "M. Verstappen & I. Hadjar",
        photos: ["redbull-1.jpg", "redbull-2.jpg", "redbull-3.jpg"]
    },
    { 
        id: "aston", 
        name: "AMR26", 
        team: "Aston Martin Aramco F1 Team", 
        drivers: "F. Alonso & L. Stroll",
        photos: ["aston-1.jpg", "aston-2.jpg", "aston-3.jpg"]
    },
    { 
        id: "alpine", 
        name: "A526", 
        team: "BWT Alpine F1 Team", 
        drivers: "E. Ocon & O. Bearman",
        photos: ["alpine-1.jpg", "alpine-2.jpg", "alpine-3.jpg"]
    },
    { 
        id: "williams", 
        name: "FW48", 
        team: "Williams Racing", 
        drivers: "A. Albon & C. Sainz",
        photos: ["williams-1.jpg", "williams-2.jpg", "williams-3.jpg"]
    },
    { 
        id: "audi", 
        name: "C44", 
        team: "Audi F1 Team (formerly Sauber)", 
        drivers: "N. Hülkenberg & G. Zhou",
        photos: ["audi-1.jpg", "audi-2.jpg", "audi-3.jpg"]
    },
    { 
        id: "racingbulls", 
        name: "VCARB 01", 
        team: "Racing Bulls", 
        drivers: "L. Lawson & A. Lindblad",
        photos: ["rb-1.jpg", "rb-2.jpg", "rb-3.jpg"]
    },
    { 
        id: "haas", 
        name: "VF-26", 
        team: "MoneyGram Haas F1 Team", 
        drivers: "K. Magnussen & P. Doohan",
        photos: ["haas-1.jpg", "haas-2.jpg", "haas-3.jpg"]
    },
    { 
        id: "cadillac", 
        name: "CTF1", 
        team: "Cadillac F1 Team", 
        drivers: "C. Colapinto & T. Pourchaire",
        photos: ["cadillac-1.jpg", "cadillac-2.jpg", "cadillac-3.jpg"]
    }
];

const f1Teams2026 = [

{
    name: "Ferrari",
    country: "ITALY",
    flagUrl: "https://flagcdn.com/w40/it.png",
    color: "#E8002D",
    principal: "Fred Vasseur",
    principalLink: "https://www.ferrari.com/en-EN/formula1/fred-vasseur",
    teamLink: "https://www.ferrari.com/en-EN/formula1",
    constructors: 16, drivers_titles: 15,
    drivers: [
        { name: "C. Leclerc", link: "https://www.formula1.com/en/drivers/charles-leclerc" },
        { name: "L. Hamilton", link: "https://www.formula1.com/en/drivers/lewis-hamilton" }
    ],
    history: "Formula 1’s most legendary team enters a new era as Lewis Hamilton joins Charles Leclerc, blending unmatched experience with raw speed to chase glory under the 2026 regulations."
},

{
    name: "McLaren",
    country: "UNITED KINGDOM",
    flagUrl: "https://flagcdn.com/w40/gb.png",
    color: "#FF8000",
    principal: "Andrea Stella",
    principalLink: "https://www.mclaren.com/racing/team/andrea-stella/",
    teamLink: "https://www.mclaren.com/racing/formula-1/",
    constructors: 10, drivers_titles: 13,
    drivers: [
        { name: "L. Norris", link: "https://www.formula1.com/en/drivers/lando-norris" },
        { name: "O. Piastri", link: "https://www.formula1.com/en/drivers/oscar-piastri" }
    ],
    history: "Fresh off their 2025 Constructors’ title, McLaren leads the grid with exceptional car balance, sharp strategy, and one of the strongest driver pairings in Formula 1."
},

{
    name: "Mercedes",
    country: "GERMANY",
    flagUrl: "https://flagcdn.com/w40/de.png",
    color: "#27F4D2",
    principal: "Toto Wolff",
    principalLink: "https://www.mercedesamgf1.com/team/management/toto-wolff",
    teamLink: "https://www.mercedesamgf1.com/",
    constructors: 8, drivers_titles: 7,
    drivers: [
        { name: "G. Russell", link: "https://www.formula1.com/en/drivers/george-russell" },
        { name: "K. Antonelli", link: "https://www.formula1.com/en/drivers/kimi-antonelli" }
    ],
    history: "After dominating the hybrid era, Mercedes resets for the future with George Russell as team leader and prodigy Kimi Antonelli symbolizing the next generation."
},

{
    name: "Red Bull",
    country: "AUSTRIA",
    flagUrl: "https://flagcdn.com/w40/at.png",
    color: "#1628b0",
    principal: "Laurent Mekies",
    principalLink: "https://www.redbullracing.com/",
    teamLink: "https://www.redbullracing.com/",
    constructors: 6, drivers_titles: 8,
    drivers: [
        { name: "M. Verstappen", link: "https://www.formula1.com/en/drivers/max-verstappen" },
        { name: "I. Hadjar", link: "https://www.formula1.com/en/drivers/isack-hadjar" }
    ],
    history: "Red Bull enters a bold new chapter with its own power unit as Max Verstappen leads the team through the most ambitious transformation in its history."
},

{
    name: "Aston Martin",
    country: "UNITED KINGDOM",
    flagUrl: "https://flagcdn.com/w40/gb.png",
    color: "#006F62",
    principal: "Mike Krack",
    principalLink: "https://www.astonmartinf1.com/",
    teamLink: "https://www.astonmartinf1.com/",
    constructors: 0, drivers_titles: 2,
    drivers: [
        { name: "F. Alonso", link: "https://www.formula1.com/en/drivers/fernando-alonso" },
        { name: "L. Stroll", link: "https://www.formula1.com/en/drivers/lance-stroll" }
    ],
    history: "Aston Martin continues its steady rise with world champion Fernando Alonso providing experience while long-term investment targets future championship contention."
},

{
    name: "Alpine",
    country: "FRANCE",
    flagUrl: "https://flagcdn.com/w40/fr.png",
    color: "#d041bd",
    principal: "Bruno Famin",
    principalLink: "https://www.alpinecars.com/",
    teamLink: "https://www.alpinecars.com/",
    constructors: 2, drivers_titles: 2,
    drivers: [
        { name: "E. Ocon", link: "https://www.formula1.com/en/drivers/esteban-ocon" },
        { name: "F. Colapinto", link: "https://www.formula1.com/en/drivers/franco-colapinto" }
    ],
    history: "Alpine blends its championship heritage with a renewed focus on youth as it looks to rebuild into a consistent front-running force."
},

{
    name: "Williams",
    country: "UNITED KINGDOM",
    flagUrl: "https://flagcdn.com/w40/gb.png",
    color: "#247ba0",
    principal: "James Vowles",
    principalLink: "https://www.williamsf1.com/",
    teamLink: "https://www.williamsf1.com/",
    constructors: 9, drivers_titles: 7,
    drivers: [
        { name: "C. Sainz", link: "https://www.formula1.com/en/drivers/carlos-sainz" },
        { name: "A. Albon", link: "https://www.formula1.com/en/drivers/alexander-albon" }
    ],
    history: "One of Formula 1’s most historic teams continues its revival with Carlos Sainz bringing race-winning experience to a proud racing institution."
},

{
    name: "Racing Bulls",
    country: "ITALY",
    flagUrl: "https://flagcdn.com/w40/it.png",
    color: "#e0d375",
    principal: "Peter Bayer",
    principalLink: "https://www.visacashapprb.com/",
    teamLink: "https://www.visacashapprb.com/",
    constructors: 0, drivers_titles: 0,
    drivers: [
        { name: "L. Lawson", link: "https://www.formula1.com/en/drivers/liam-lawson" },
        { name: "A. Lindblad", link: "https://www.formula1.com/en/drivers/arvid-lindblad" }
    ],
    history: "Known as Formula 1’s ultimate talent factory, Racing Bulls focuses on fearless racing and developing future stars for the top teams."
},

{
    name: "Haas",
    country: "UNITED STATES",
    flagUrl: "https://flagcdn.com/w40/us.png",
    color: "#c35353",
    principal: "Ayao Komatsu",
    principalLink: "https://www.haasf1team.com/",
    teamLink: "https://www.haasf1team.com/",
    constructors: 0, drivers_titles: 0,
    drivers: [
        { name: "E. Ocon", link: "https://www.formula1.com/en/drivers/esteban-ocon" },
        { name: "O. Bearman", link: "https://www.formula1.com/en/drivers/oliver-bearman" }
    ],
    history: "Haas continues to grow as America’s established Formula 1 team, combining experience and youth to push deeper into the midfield."
},

{
    name: "Audi",
    country: "GERMANY",
    flagUrl: "https://flagcdn.com/w40/de.png",
    color: "#535151",
    principal: "Jonathan Wheatley",
    principalLink: "https://www.audi.com/en/sport/formula-1.html",
    teamLink: "https://www.audi.com/en/sport/formula-1.html",
    constructors: 0, drivers_titles: 0,
    drivers: [
        { name: "N. Hülkenberg", link: "https://www.formula1.com/en/drivers/nico-hulkenberg" },
        { name: "G. Bortoleto", link: "https://www.formula1.com/en/drivers/gabriel-bortoleto" }
    ],
    history: "Audi launches its full factory Formula 1 program with German engineering precision and long-term ambition to fight at the front."
},

{
    name: "Cadillac",
    country: "UNITED STATES",
    flagUrl: "https://flagcdn.com/w40/us.png",
    color: "#ffffff",
    principal: "Graeme Lowdon",
    principalLink: "https://www.cadillac.com/f1",
    teamLink: "https://www.cadillac.com/f1",
    constructors: 0, drivers_titles: 0,
    drivers: [
        { name: "S. Pérez", link: "https://www.formula1.com/en/drivers/sergio-perez" },
        { name: "V. Bottas", link: "https://www.formula1.com/en/drivers/valtteri-bottas" }
    ],
    history: "Cadillac enters Formula 1 as the 11th team with strong manufacturer backing and experienced drivers to build a serious American contender."
}

];


/**
 * Zenith Race Schedule 2026 - Pakistan Standard Time (PKT)
 * Logic: UTC + 5 Hours
 */
const zenithRaceSchedule = [
    { round: 1, gp: "Australian Grand Prix", Qualifying: { iso: "2026-03-07T10:00:00+05:00" }, Race: { iso: "2026-03-08T09:00:00+05:00" }, hubUrl: "race-hub-aus.html" },
    { round: 2, gp: "Chinese Grand Prix", Qualifying: { iso: "2026-03-14T12:00:00+05:00" }, Race: { iso: "2026-03-15T12:00:00+05:00" }, hubUrl: "race-hub-chn.html" },
    { round: 3, gp: "Japanese Grand Prix", Qualifying: { iso: "2026-03-28T11:00:00+05:00" }, Race: { iso: "2026-03-29T10:00:00+05:00" }, hubUrl: "race-hub-jpn.html" },
    { round: 4, gp: "Bahrain Grand Prix", Qualifying: { iso: "2026-04-11T21:00:00+05:00" }, Race: { iso: "2026-04-12T20:00:00+05:00" }, hubUrl: "race-hub-bhr.html" },
    { round: 5, gp: "Saudi Arabian Grand Prix", Qualifying: { iso: "2026-04-18T22:00:00+05:00" }, Race: { iso: "2026-04-19T22:00:00+05:00" }, hubUrl: "race-hub-sau.html" },
    { round: 6, gp: "Miami Grand Prix", Qualifying: { iso: "2026-05-03T01:00:00+05:00" }, Race: { iso: "2026-05-04T01:00:00+05:00" }, hubUrl: "race-hub-mia.html" },
    { round: 7, gp: "Canadian Grand Prix", Qualifying: { iso: "2026-05-24T01:00:00+05:00" }, Race: { iso: "2026-05-25T01:00:00+05:00" }, hubUrl: "race-hub-can.html" },
    { round: 8, gp: "Monaco Grand Prix", Qualifying: { iso: "2026-06-06T19:00:00+05:00" }, Race: { iso: "2026-06-07T18:00:00+05:00" }, hubUrl: "race-hub-mon.html" },
    { round: 9, gp: "Barcelona Grand Prix", Qualifying: { iso: "2026-06-13T19:00:00+05:00" }, Race: { iso: "2026-06-14T18:00:00+05:00" }, hubUrl: "race-hub-esp-cat.html" },
    { round: 10, gp: "Austrian Grand Prix", Qualifying: { iso: "2026-06-27T19:00:00+05:00" }, Race: { iso: "2026-06-28T18:00:00+05:00" }, hubUrl: "race-hub-aut.html" },
    { round: 11, gp: "British Grand Prix", Qualifying: { iso: "2026-07-04T19:00:00+05:00" }, Race: { iso: "2026-07-05T19:00:00+05:00" }, hubUrl: "race-hub-gbr.html" },
    { round: 12, gp: "Belgian Grand Prix", Qualifying: { iso: "2026-07-18T19:00:00+05:00" }, Race: { iso: "2026-07-19T18:00:00+05:00" }, hubUrl: "race-hub-bel.html" },
    { round: 13, gp: "Hungarian Grand Prix", Qualifying: { iso: "2026-07-25T19:00:00+05:00" }, Race: { iso: "2026-07-26T18:00:00+05:00" }, hubUrl: "race-hub-hun.html" },
    { round: 14, gp: "Dutch Grand Prix", Qualifying: { iso: "2026-08-22T19:00:00+05:00" }, Race: { iso: "2026-08-23T18:00:00+05:00" }, hubUrl: "race-hub-ned.html" },
    { round: 15, gp: "Italian Grand Prix", Qualifying: { iso: "2026-09-05T19:00:00+05:00" }, Race: { iso: "2026-09-06T18:00:00+05:00" }, hubUrl: "race-hub-ita.html" },
    { round: 16, gp: "Spanish Grand Prix (Madrid)", Qualifying: { iso: "2026-09-12T19:00:00+05:00" }, Race: { iso: "2026-09-13T18:00:00+05:00" }, hubUrl: "race-hub-esp-mad.html" },
    { round: 17, gp: "Azerbaijan Grand Prix", Qualifying: { iso: "2026-09-25T19:00:00+05:00" }, Race: { iso: "2026-09-26T18:00:00+05:00" }, hubUrl: "race-hub-aze.html" },
    { round: 18, gp: "Singapore Grand Prix", Qualifying: { iso: "2026-10-10T18:00:00+05:00" }, Race: { iso: "2026-10-11T17:00:00+05:00" }, hubUrl: "race-hub-sin.html" },
    { round: 19, gp: "United States Grand Prix", Qualifying: { iso: "2026-10-25T01:00:00+05:00" }, Race: { iso: "2026-10-26T01:00:00+05:00" }, hubUrl: "race-hub-usa.html" },
    { round: 20, gp: "Mexico City Grand Prix", Qualifying: { iso: "2026-11-01T02:00:00+05:00" }, Race: { iso: "2026-11-02T02:00:00+05:00" }, hubUrl: "race-hub-mex.html" },
    { round: 21, gp: "São Paulo Grand Prix", Qualifying: { iso: "2026-11-07T22:00:00+05:00" }, Race: { iso: "2026-11-08T22:00:00+05:00" }, hubUrl: "race-hub-bra.html" },
    { round: 22, gp: "Las Vegas Grand Prix", Qualifying: { iso: "2026-11-21T11:00:00+05:00" }, Race: { iso: "2026-11-22T11:00:00+05:00" }, hubUrl: "race-hub-vegas.html" },
    { round: 23, gp: "Qatar Grand Prix", Qualifying: { iso: "2026-11-28T21:00:00+05:00" }, Race: { iso: "2026-11-29T20:00:00+05:00" }, hubUrl: "race-hub-qat.html" },
    { round: 24, gp: "Abu Dhabi Grand Prix", Qualifying: { iso: "2026-12-05T19:00:00+05:00" }, Race: { iso: "2026-12-06T18:00:00+05:00" }, hubUrl: "race-hub-uae.html" }
];