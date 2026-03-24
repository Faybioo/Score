// Real 2026 FIFA World Cup Data

export const teams = [
  // Group A
  "Mexico", "South Africa", "South Korea", "UEFA Playoff D Winner",
  // Group B
  "Canada", "Switzerland", "UEFA Playoff A Winner", "Honduras",
  // Group C
  "Brazil", "Scotland", "Morocco", "Haiti",
  // Group D
  "USA", "Paraguay", "UEFA Playoff C Winner", "Panama",
  // Group E
  "Germany", "Curaçao", "Ecuador", "Tunisia",
  // Group F
  "Netherlands", "Japan", "UEFA Playoff B Winner", "Tunisia",
  // Group G
  "New Zealand", "Iran", "Belgium", "Ukraine",
  // Group H
  "Spain", "Cape Verde", "Saudi Arabia", "Uruguay",
  // Group I
  "Norway", "Intercontinental Playoff 2 Winner", "Colombia", "Portugal",
  // Group J
  "Argentina", "Algeria", "Jordan", "Austria",
  // Group K
  "Colombia", "Uzbekistan", "Portugal", "Intercontinental Playoff 1 Winner",
  // Group L
  "England", "Croatia", "Ghana", "Senegal"
];

export const cities = [
  // USA
  { name: "New York / New Jersey", country: "USA", code: "NYC" },
  { name: "Los Angeles",           country: "USA", code: "LAX" },
  { name: "Dallas",                country: "USA", code: "DAL" },
  { name: "San Francisco",         country: "USA", code: "SFO" },
  { name: "Miami",                 country: "USA", code: "MIA" },
  { name: "Atlanta",               country: "USA", code: "ATL" },
  { name: "Seattle",               country: "USA", code: "SEA" },
  { name: "Houston",               country: "USA", code: "HOU" },
  { name: "Kansas City",           country: "USA", code: "MCI" },
  { name: "Boston",                country: "USA", code: "BOS" },
  { name: "Philadelphia",          country: "USA", code: "PHL" },
  // Canada
  { name: "Toronto",               country: "Canada", code: "YYZ" },
  { name: "Vancouver",             country: "Canada", code: "YVR" },
  // Mexico
  { name: "Mexico City",           country: "Mexico", code: "MEX" },
  { name: "Guadalajara",           country: "Mexico", code: "GDL" },
  { name: "Monterrey",             country: "Mexico", code: "MTY" },
];

export const mockMatches = [
  // ── GROUP STAGE ──────────────────────────────────────────────────────────────

  // Group A
  {
    id: "1",
    stage: "Group Stage",
    group: "A",
    date: "2026-06-11",
    time: "13:00",
    homeTeam: "Mexico",
    awayTeam: "South Africa",
    venue: "Estadio Azteca",
    city: "Mexico City",
  },
  {
    id: "2",
    stage: "Group Stage",
    group: "A",
    date: "2026-06-18",
    time: "18:00",
    homeTeam: "Mexico",
    awayTeam: "South Korea",
    venue: "Estadio Azteca",
    city: "Mexico City",
  },
  {
    id: "3",
    stage: "Group Stage",
    group: "A",
    date: "2026-06-24",
    time: "18:00",
    homeTeam: "South Africa",
    awayTeam: "South Korea",
    venue: "Levi's Stadium",
    city: "San Francisco",
  },

  // Group B
  {
    id: "4",
    stage: "Group Stage",
    group: "B",
    date: "2026-06-12",
    time: "15:00",
    homeTeam: "Canada",
    awayTeam: "UEFA Playoff A Winner",
    venue: "BMO Field",
    city: "Toronto",
  },
  {
    id: "5",
    stage: "Group Stage",
    group: "B",
    date: "2026-06-18",
    time: "12:00",
    homeTeam: "Switzerland",
    awayTeam: "UEFA Playoff A Winner",
    venue: "Hard Rock Stadium",
    city: "Miami",
  },
  {
    id: "6",
    stage: "Group Stage",
    group: "B",
    date: "2026-06-22",
    time: "15:00",
    homeTeam: "Canada",
    awayTeam: "Switzerland",
    venue: "BC Place",
    city: "Vancouver",
  },

  // Group C
  {
    id: "7",
    stage: "Group Stage",
    group: "C",
    date: "2026-06-13",
    time: "18:00",
    homeTeam: "Brazil",
    awayTeam: "Morocco",
    venue: "MetLife Stadium",
    city: "New York / New Jersey",
  },
  {
    id: "8",
    stage: "Group Stage",
    group: "C",
    date: "2026-06-13",
    time: "15:00",
    homeTeam: "Haiti",
    awayTeam: "Scotland",
    venue: "BMO Field",
    city: "Toronto",
  },
  {
    id: "9",
    stage: "Group Stage",
    group: "C",
    date: "2026-06-24",
    time: "21:00",
    homeTeam: "Scotland",
    awayTeam: "Brazil",
    venue: "Hard Rock Stadium",
    city: "Miami",
  },

  // Group D
  {
    id: "10",
    stage: "Group Stage",
    group: "D",
    date: "2026-06-12",
    time: "18:00",
    homeTeam: "USA",
    awayTeam: "Paraguay",
    venue: "SoFi Stadium",
    city: "Los Angeles",
  },
  {
    id: "11",
    stage: "Group Stage",
    group: "D",
    date: "2026-06-19",
    time: "21:00",
    homeTeam: "USA",
    awayTeam: "UEFA Playoff C Winner",
    venue: "SoFi Stadium",
    city: "Los Angeles",
  },

  // Group E
  {
    id: "12",
    stage: "Group Stage",
    group: "E",
    date: "2026-06-14",
    time: "12:00",
    homeTeam: "Germany",
    awayTeam: "Curaçao",
    venue: "NRG Stadium",
    city: "Houston",
  },
  {
    id: "13",
    stage: "Group Stage",
    group: "E",
    date: "2026-06-20",
    time: "18:00",
    homeTeam: "Ecuador",
    awayTeam: "Curaçao",
    venue: "GEHA Field at Arrowhead Stadium",
    city: "Kansas City",
  },

  // Group F
  {
    id: "14",
    stage: "Group Stage",
    group: "F",
    date: "2026-06-14",
    time: "15:00",
    homeTeam: "Netherlands",
    awayTeam: "Japan",
    venue: "AT&T Stadium",
    city: "Dallas",
  },
  {
    id: "15",
    stage: "Group Stage",
    group: "F",
    date: "2026-06-20",
    time: "22:00",
    homeTeam: "Tunisia",
    awayTeam: "Japan",
    venue: "Estadio BBVA",
    city: "Monterrey",
  },

  // Group G
  {
    id: "16",
    stage: "Group Stage",
    group: "G",
    date: "2026-06-15",
    time: "18:00",
    homeTeam: "Iran",
    awayTeam: "New Zealand",
    venue: "Hard Rock Stadium",
    city: "Miami",
  },
  {
    id: "17",
    stage: "Group Stage",
    group: "G",
    date: "2026-06-21",
    time: "15:00",
    homeTeam: "Belgium",
    awayTeam: "Iran",
    venue: "Levi's Stadium",
    city: "San Francisco",
  },

  // Group H
  {
    id: "18",
    stage: "Group Stage",
    group: "H",
    date: "2026-06-15",
    time: "21:00",
    homeTeam: "Spain",
    awayTeam: "Cape Verde",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
  },
  {
    id: "19",
    stage: "Group Stage",
    group: "H",
    date: "2026-06-15",
    time: "15:00",
    homeTeam: "Saudi Arabia",
    awayTeam: "Uruguay",
    venue: "Hard Rock Stadium",
    city: "Miami",
  },
  {
    id: "20",
    stage: "Group Stage",
    group: "H",
    date: "2026-06-21",
    time: "18:00",
    homeTeam: "Spain",
    awayTeam: "Saudi Arabia",
    venue: "Estadio Akron",
    city: "Guadalajara",
  },

  // Group J
  {
    id: "21",
    stage: "Group Stage",
    group: "J",
    date: "2026-06-16",
    time: "21:00",
    homeTeam: "Argentina",
    awayTeam: "Algeria",
    venue: "GEHA Field at Arrowhead Stadium",
    city: "Kansas City",
  },
  {
    id: "22",
    stage: "Group Stage",
    group: "J",
    date: "2026-06-22",
    time: "18:00",
    homeTeam: "Argentina",
    awayTeam: "Austria",
    venue: "AT&T Stadium",
    city: "Dallas",
  },
  {
    id: "23",
    stage: "Group Stage",
    group: "J",
    date: "2026-06-27",
    time: "21:00",
    homeTeam: "Jordan",
    awayTeam: "Argentina",
    venue: "AT&T Stadium",
    city: "Dallas",
  },

  // Group L
  {
    id: "24",
    stage: "Group Stage",
    group: "L",
    date: "2026-06-17",
    time: "16:00",
    homeTeam: "England",
    awayTeam: "Croatia",
    venue: "AT&T Stadium",
    city: "Dallas",
  },
  {
    id: "25",
    stage: "Group Stage",
    group: "L",
    date: "2026-06-23",
    time: "21:00",
    homeTeam: "England",
    awayTeam: "Ghana",
    venue: "Lincoln Financial Field",
    city: "Philadelphia",
  },

  // ── KNOCKOUT STAGE (TBD teams) ────────────────────────────────────────────────
  {
    id: "73",
    stage: "Round of 32",
    group: null,
    date: "2026-06-28",
    time: "15:00",
    homeTeam: "Runner-up Group A",
    awayTeam: "Runner-up Group B",
    venue: "SoFi Stadium",
    city: "Los Angeles",
  },
  {
    id: "77",
    stage: "Round of 32",
    group: null,
    date: "2026-06-30",
    time: "17:00",
    homeTeam: "Winner Group I",
    awayTeam: "Best 3rd C/D/F/G/H",
    venue: "MetLife Stadium",
    city: "New York / New Jersey",
  },
  {
    id: "104",
    stage: "Final",
    group: null,
    date: "2026-07-19",
    time: "15:00",
    homeTeam: "TBD",
    awayTeam: "TBD",
    venue: "MetLife Stadium",
    city: "New York / New Jersey",
  },
];