/* ── Jolpica / Ergast API wrapper con cache ──────────────────────── */

const BASE = 'https://api.jolpi.ca/ergast/f1'
const CACHE = new Map()
const TTL   = 5 * 60 * 1000   // 5 minutos

async function apiFetch(path) {
  const now = Date.now()
  const hit = CACHE.get(path)
  if (hit && now - hit.ts < TTL) return hit.data
  const res  = await fetch(`${BASE}${path}`)
  const data = await res.json()
  CACHE.set(path, { data, ts: now })
  return data
}

// ── Lookup tables ─────────────────────────────────────────────────

const NAT_FLAGS = {
  'Italian':'it','British':'gb','Monégasque':'mc','Dutch':'nl',
  'Australian':'au','German':'de','Spanish':'es','French':'fr',
  'Finnish':'fi','Mexican':'mx','Canadian':'ca','Thai':'th',
  'Argentine':'ar','Brazilian':'br','New Zealander':'nz','Swedish':'se',
  'American':'us','Japanese':'jp','Chinese':'cn','Russian':'ru',
  'Austrian':'at','Belgian':'be','Swiss':'ch','Danish':'dk',
  'Polish':'pl','South Korean':'kr','Bahraini':'bh',
  'Monegasque':'mc',
}

const COUNTRY_FLAGS = {
  'Australia':'au','China':'cn','Japan':'jp','USA':'us',
  'Canada':'ca','Monaco':'mc','Spain':'es','Austria':'at',
  'UK':'gb','Belgium':'be','Hungary':'hu','Netherlands':'nl',
  'Italy':'it','Azerbaijan':'az','Singapore':'sg','Mexico':'mx',
  'Brazil':'br','Qatar':'qa','UAE':'ae','Saudi Arabia':'sa',
  'Bahrain':'bh',
}

const RACE_SHORT = {
  'Australian Grand Prix':   'Australia',
  'Chinese Grand Prix':      'China',
  'Japanese Grand Prix':     'Japón',
  'Miami Grand Prix':        'Miami',
  'Canadian Grand Prix':     'Canadá',
  'Monaco Grand Prix':       'Mónaco',
  'Spanish Grand Prix':      'España',
  'Barcelona Grand Prix':    'España',
  'Austrian Grand Prix':     'Austria',
  'British Grand Prix':      'Gran Bretaña',
  'Belgian Grand Prix':      'Bélgica',
  'Hungarian Grand Prix':    'Hungría',
  'Dutch Grand Prix':        'Países Bajos',
  'Italian Grand Prix':      'Italia',
  'Madrid Grand Prix':       'Madrid',
  'Azerbaijan Grand Prix':   'Azerbaiyán',
  'Singapore Grand Prix':    'Singapur',
  'United States Grand Prix':'EE.UU.',
  'Mexico City Grand Prix':  'México',
  'São Paulo Grand Prix':    'Brasil',
  'Brazilian Grand Prix':    'Brasil',
  'Las Vegas Grand Prix':    'Las Vegas',
  'Qatar Grand Prix':        'Qatar',
  'Abu Dhabi Grand Prix':    'Abu Dhabi',
  'Saudi Arabian Grand Prix':'Arabia Saudita',
  'Bahrain Grand Prix':      'Bahrain',
}

const RACE_KEY = {
  'Australian Grand Prix':   'australia',
  'Chinese Grand Prix':      'china',
  'Japanese Grand Prix':     'japan',
  'Miami Grand Prix':        'miami',
  'Canadian Grand Prix':     'canada',
  'Monaco Grand Prix':       'monaco',
  'Spanish Grand Prix':      'spain',
  'Barcelona Grand Prix':    'spain',
  'Austrian Grand Prix':     'austria',
  'British Grand Prix':      'britain',
  'Belgian Grand Prix':      'belgium',
  'Hungarian Grand Prix':    'hungary',
  'Dutch Grand Prix':        'netherlands',
  'Italian Grand Prix':      'italy',
  'Madrid Grand Prix':       'madrid',
  'Azerbaijan Grand Prix':   'azerbaijan',
  'Singapore Grand Prix':    'singapore',
  'United States Grand Prix':'usa',
  'Mexico City Grand Prix':  'mexico',
  'São Paulo Grand Prix':    'brazil',
  'Las Vegas Grand Prix':    'lasvegas',
  'Qatar Grand Prix':        'qatar',
  'Abu Dhabi Grand Prix':    'abudhabi',
  'Saudi Arabian Grand Prix':'saudi',
  'Bahrain Grand Prix':      'bahrain',
  // short Spanish names (used internally after raceShort())
  'Australia':'australia','China':'china','Japón':'japan','Miami':'miami',
  'Canadá':'canada','Mónaco':'monaco','España':'spain','Austria':'austria',
  'Gran Bretaña':'britain','Bélgica':'belgium','Hungría':'hungary',
  'Países Bajos':'netherlands','Italia':'italy','Madrid':'madrid',
  'Azerbaiyán':'azerbaijan','Singapur':'singapore','EE.UU.':'usa',
  'México':'mexico','Brasil':'brazil','Las Vegas':'lasvegas',
  'Qatar':'qatar','Abu Dhabi':'abudhabi','Arabia Saudita':'saudi',
  'Bahrain':'bahrain',
}

const RACE_LABEL = {
  australia:'AUS', china:'CHN', japan:'JPN', miami:'MIA', canada:'CAN',
  monaco:'MON', spain:'ESP', austria:'AUT', britain:'GBR', belgium:'BEL',
  hungary:'HUN', netherlands:'NDL', italy:'ITA', madrid:'MAD',
  azerbaijan:'AZE', singapore:'SGP', usa:'USA', mexico:'MEX',
  brazil:'BRA', lasvegas:'LAS', qatar:'QAT', abudhabi:'ABU',
  saudi:'SAU', bahrain:'BAH',
}

const TEAM_COLORS = {
  'Mercedes':'#00D2BE','Ferrari':'#E8002D','McLaren':'#FF8000',
  'Red Bull':'#3671C6','Alpine':'#0093CC','Haas':'#B6BABD',
  'Racing Bulls':'#6692FF','Williams':'#00A3E0','Audi':'#BB86FC',
  'Aston Martin':'#358C75','Cadillac':'#9E9E9E',
}

// Normaliza nombres de equipos que Jolpica puede devolver distintos
function normTeam(name) {
  const MAP = {
    'Red Bull Racing':'Red Bull','RB F1 Team':'Racing Bulls',
    'Visa Cash App RB':'Racing Bulls','VCARB':'Racing Bulls',
    'Haas F1 Team':'Haas','Alpine F1 Team':'Alpine',
    'Aston Martin':'Aston Martin','Cadillac F1 Team':'Cadillac',
  }
  return MAP[name] || name
}

function raceShort(raceName) {
  return RACE_SHORT[raceName] || raceName.replace(' Grand Prix','')
}
function raceKey(raceName) {
  return RACE_KEY[raceName] || raceName.replace(' Grand Prix','').toLowerCase().replace(/[^a-z]/g,'')
}

// ── Driver standings ──────────────────────────────────────────────

function calcAge(dob) {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function fmtDob(dob) {
  if (!dob) return ''
  const [y, m, d] = dob.split('-')
  return `${d}-${m}-${y}`
}

async function fetchDriverStandings() {
  const json = await apiFetch('/current/driverStandings.json')
  const list = json.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || []
  return list.map(e => ({
    pos:    +e.position,
    flag:   NAT_FLAGS[e.Driver.nationality] || '',
    name:   `${e.Driver.givenName} ${e.Driver.familyName}`,
    short:  e.Driver.code || e.Driver.familyName.slice(0,3).toUpperCase(),
    team:   normTeam(e.Constructors[0]?.name || ''),
    number: +e.Driver.permanentNumber || 0,
    pts:    +e.points,
    wins:   +e.wins,
    nat:    e.Driver.nationality,
    age:    calcAge(e.Driver.dateOfBirth),
    born:   fmtDob(e.Driver.dateOfBirth),
    emoji:  '🏎️',
  }))
}

// ── Constructor standings ─────────────────────────────────────────

async function fetchConstructorStandings(drivers) {
  const json = await apiFetch('/current/constructorStandings.json')
  const list = json.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || []
  return list.map(e => {
    const team = normTeam(e.Constructor.name)
    const teamDrivers = (drivers || []).filter(d => d.team === team)
    return {
      pos:       +e.position,
      name:      team,
      engine:    team,
      pts:       +e.points,
      wins:      +e.wins,
      color_hex: TEAM_COLORS[team] || '#666',
      driver1:   teamDrivers[0]?.short || '',
      driver2:   teamDrivers[1]?.short || '',
    }
  })
}

// ── Calendar ──────────────────────────────────────────────────────

async function fetchSchedule() {
  const [schedJson, resultsJson] = await Promise.all([
    apiFetch('/current.json'),
    apiFetch('/current/results.json?limit=500'),
  ])
  const races   = schedJson.MRData.RaceTable.Races || []
  const results = resultsJson.MRData.RaceTable.Races || []

  const winnerByRound = {}
  results.forEach(r => {
    winnerByRound[r.round] = r.Results?.[0]?.Driver?.familyName || null
  })

  const today = new Date().toISOString().slice(0, 10)
  let foundNext = false

  return races.map(r => {
    const isPast = r.date < today || !!winnerByRound[r.round]
    const isNext = !isPast && !foundNext
    if (isNext) foundNext = true
    const status = isPast ? 'done' : isNext ? 'next' : 'upcoming'
    const isMadrid = r.Circuit.circuitName === 'Madring'
    return {
      round:      +r.round,
      flag:       COUNTRY_FLAGS[r.Circuit.Location.country] || '🏁',
      name:       isMadrid ? 'Madrid' : raceShort(r.raceName),
      circuit:    isMadrid ? 'Circuito de Madrid' : r.Circuit.circuitName,
      date_str:   r.date,
      status,
      winner:     winnerByRound[r.round] || null,
      has_sprint: !!r.Sprint,
    }
  })
}

// ── Race results (single round) ───────────────────────────────────

async function fetchRaceResults(round, raceName) {
  const json = await apiFetch(`/current/${round}/results.json`)
  const race = json.MRData.RaceTable.Races[0]
  if (!race) return []
  return (race.Results || []).map(r => ({
    race_name:   raceName || raceShort(race.raceName),
    race_type:   'race',
    pos:         +r.position,
    driver_name: `${r.Driver.givenName} ${r.Driver.familyName}`,
    driver_code: r.Driver.code,
    team:        normTeam(r.Constructor.name),
    pts:         +r.points,
    fastest_lap: r.FastestLap?.rank === '1',
    dnf:         r.status !== 'Finished' && r.status !== 'Lapped' && !r.status.startsWith('+'),
  }))
}

// ── Sprint results (single round) ────────────────────────────────

async function fetchSprintResults(round, raceName) {
  const json = await apiFetch(`/current/${round}/sprint.json`)
  const race = json.MRData.RaceTable.Races[0]
  if (!race) return []
  return (race.SprintResults || []).map(r => ({
    race_name:   raceName || raceShort(race.raceName),
    race_type:   'sprint',
    pos:         +r.position,
    driver_name: `${r.Driver.givenName} ${r.Driver.familyName}`,
    driver_code: r.Driver.code,
    team:        normTeam(r.Constructor.name),
    pts:         +r.points,
    fastest_lap: false,
    dnf:         r.status !== 'Finished' && !r.status.startsWith('+'),
  }))
}

// ── All completed results (race + sprint) ─────────────────────────

async function fetchAllResults(schedule) {
  const done    = (schedule || []).filter(r => r.status === 'done')
  const sprints = done.filter(r => r.has_sprint)

  const allArrays = await Promise.all([
    ...done.map(r => fetchRaceResults(r.round, r.name)),
    ...sprints.map(r => fetchSprintResults(r.round, r.name)),
  ])

  return allArrays.flat()
}

// ── Race points for evolution chart ──────────────────────────────

function buildRacePoints(allResultsRaw, schedule) {
  const doneRaces = (schedule || []).filter(r => r.status === 'done')
  const raceOrder = doneRaces.map(r => ({ key: raceKey(r.name), label: RACE_LABEL[raceKey(r.name)] || r.name.slice(0,3).toUpperCase(), name: r.name, flag: r.flag || '', has_sprint: r.has_sprint || false }))

  const pointsMap = {}
  allResultsRaw.forEach(r => {
    const key = raceKey(r.race_name)
    if (!pointsMap[r.driver_name]) pointsMap[r.driver_name] = { driver_name: r.driver_name }
    pointsMap[r.driver_name][key] = (pointsMap[r.driver_name][key] || 0) + r.pts
    if (r.race_type === 'race') {
      pointsMap[r.driver_name][key + '_r'] = (pointsMap[r.driver_name][key + '_r'] || 0) + r.pts
    } else if (r.race_type === 'sprint') {
      pointsMap[r.driver_name][key + '_s'] = (pointsMap[r.driver_name][key + '_s'] || 0) + r.pts
    }
  })

  return {
    racePoints:     Object.values(pointsMap),
    completedRaces: raceOrder,
  }
}

module.exports = {
  apiFetch,
  NAT_FLAGS,
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchSchedule,
  fetchRaceResults,
  fetchSprintResults,
  fetchAllResults,
  buildRacePoints,
  normTeam,
  raceShort,
}
