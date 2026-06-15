const express  = require('express')
const router   = express.Router()
const Parser   = require('rss-parser')
const path     = require('path')
const fs       = require('fs')

const rsParser  = new Parser({ timeout: 10000 })
const DATA_FILE = path.join(__dirname, '../data/declarations.json')

// ── Driver master list ────────────────────────────────────────────
const DRIVERS = {
  'Hamilton':   { code: 'HAM', team: 'Ferrari',       full: 'Lewis Hamilton' },
  'Leclerc':    { code: 'LEC', team: 'Ferrari',       full: 'Charles Leclerc' },
  'Russell':    { code: 'RUS', team: 'Mercedes',      full: 'George Russell' },
  'Antonelli':  { code: 'ANT', team: 'Mercedes',      full: 'Andrea Kimi Antonelli' },
  'Norris':     { code: 'NOR', team: 'McLaren',       full: 'Lando Norris' },
  'Piastri':    { code: 'PIA', team: 'McLaren',       full: 'Oscar Piastri' },
  'Verstappen': { code: 'VER', team: 'Red Bull',      full: 'Max Verstappen' },
  'Hadjar':     { code: 'HAD', team: 'Red Bull',      full: 'Isack Hadjar' },
  'Alonso':     { code: 'ALO', team: 'Aston Martin',  full: 'Fernando Alonso' },
  'Stroll':     { code: 'STR', team: 'Aston Martin',  full: 'Lance Stroll' },
  'Sainz':      { code: 'SAI', team: 'Williams',      full: 'Carlos Sainz' },
  'Albon':      { code: 'ALB', team: 'Williams',      full: 'Alexander Albon' },
  'Gasly':      { code: 'GAS', team: 'Alpine',        full: 'Pierre Gasly' },
  'Colapinto':  { code: 'COL', team: 'Alpine',        full: 'Franco Colapinto' },
  'Bearman':    { code: 'BEA', team: 'Haas',          full: 'Oliver Bearman' },
  'Ocon':       { code: 'OCO', team: 'Haas',          full: 'Esteban Ocon' },
  'Tsunoda':    { code: 'TSU', team: 'Racing Bulls',  full: 'Yuki Tsunoda' },
  'Lawson':     { code: 'LAW', team: 'Racing Bulls',  full: 'Liam Lawson' },
  'Bortoleto':  { code: 'BOR', team: 'Audi',          full: 'Gabriel Bortoleto' },
  'Hülkenberg': { code: 'HUL', team: 'Audi',          full: 'Nico Hülkenberg' },
  'Hulkenberg': { code: 'HUL', team: 'Audi',          full: 'Nico Hülkenberg' },
  'Doohan':     { code: 'DOO', team: 'Cadillac',      full: 'Jack Doohan' },
  'Lindblad':   { code: 'LIN', team: 'Racing Bulls',  full: 'Arvid Lindblad' },
}

// ── Race identification ───────────────────────────────────────────
const RACES = {
  1:  { name: 'Australia',    kw: ['australia', 'albert park', 'melbourne'] },
  2:  { name: 'China',        kw: ['china', 'shangh'] },
  3:  { name: 'Japón',        kw: ['japón', 'japon', 'suzuka'] },
  4:  { name: 'Miami',        kw: ['miami'] },
  5:  { name: 'Canadá',       kw: ['canadá', 'canada', 'montreal'] },
  6:  { name: 'Mónaco',       kw: ['mónaco', 'monaco'] },
  7:  { name: 'España',       kw: ['barcelona', 'españa', 'espana', 'cataluña', 'catalun'] },
  8:  { name: 'Austria',      kw: ['austria', 'spielberg', 'red bull ring'] },
  9:  { name: 'Gran Bretaña', kw: ['gran bretaña', 'silverstone', 'británi'] },
  10: { name: 'Bélgica',      kw: ['bélgica', 'belgica', 'spa-franc'] },
  11: { name: 'Hungría',      kw: ['hungría', 'hungria', 'hungaroring'] },
  12: { name: 'Países Bajos', kw: ['países bajos', 'zandvoort', 'holanda'] },
  13: { name: 'Italia',       kw: ['italia', 'monza'] },
  14: { name: 'Madrid',       kw: ['madrid', 'madring'] },
  15: { name: 'Azerbaiyán',   kw: ['azerbaiyán', 'azerbaiyan', 'baku'] },
  16: { name: 'Singapur',     kw: ['singapur', 'singapore'] },
  17: { name: 'EE.UU.',       kw: ['estados unidos', 'austin', 'cota'] },
  18: { name: 'México',       kw: ['méxico', 'mexico', 'hermanos rodríguez'] },
  19: { name: 'Brasil',       kw: ['brasil', 'sao paulo', 'são paulo', 'interlagos'] },
  20: { name: 'Las Vegas',    kw: ['las vegas'] },
  21: { name: 'Qatar',        kw: ['qatar', 'lusail'] },
  22: { name: 'Abu Dhabi',    kw: ['abu dhabi', 'yas marina'] },
}

function detectRound(text) {
  const lower = text.toLowerCase()
  for (const [round, { kw }] of Object.entries(RACES)) {
    if (kw.some(k => lower.includes(k))) return parseInt(round)
  }
  return null
}

function detectDriver(title) {
  for (const [surname, info] of Object.entries(DRIVERS)) {
    if (title.includes(surname)) return { surname, ...info }
  }
  return null
}

function detectContext(text) {
  const lower = text.toLowerCase()
  if (/sprint/.test(lower)) return 'Sprint'
  if (/clasificaci|sábado|sabado|qualif|qualy/.test(lower)) return 'Clasificación'
  return 'Carrera'
}

function extractQuote(title) {
  // "Driver [verb]: 'Quote'" — Spanish single-quote style
  const m = title.match(/:\s*['"'«](.*?)['"'»]\s*$/)
          || title.match(/['"'«](.*?)['"'»]/)
  if (m && m[1].length >= 10) return m[1].trim()
  return null
}

// ── Live RSS fetch ────────────────────────────────────────────────
const LIVE_CACHE = { data: null, ts: 0 }
const TTL = 15 * 60 * 1000

async function fetchLive() {
  const now = Date.now()
  if (LIVE_CACHE.data && now - LIVE_CACHE.ts < TTL) return LIVE_CACHE.data

  const results = []
  let id = 50000

  try {
    const feed = await rsParser.parseURL('https://es.motorsport.com/rss/f1/news/')
    const items = (feed.items || []).slice(0, 50)

    for (const item of items) {
      const title = item.title || ''

      // Must have a driver name
      const driver = detectDriver(title)
      if (!driver) continue

      // Must have a quote (colon + quote mark in title)
      const quote = extractQuote(title)
      if (!quote) continue

      // Must be about a known race
      const round = detectRound(title + ' ' + (item.contentSnippet || ''))
      if (!round) continue

      const context = detectContext(title + ' ' + (item.contentSnippet || ''))
      const date = item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : ''

      results.push({
        id: id++,
        race:    RACES[round].name,
        round,
        date,
        context,
        driver:  driver.full,
        code:    driver.code,
        team:    driver.team,
        quote,
        _live:   true,
      })
    }
  } catch (e) {
    console.error('[declarations] RSS error:', e.message)
  }

  LIVE_CACHE.data = results
  LIVE_CACHE.ts   = now
  return results
}

// ── Route ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Historical curated quotes
    let historical = []
    try {
      historical = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    } catch { /* ok */ }

    // Live quotes from motorsport.com RSS
    const live = await fetchLive()

    // Deduplicate: skip live entries that duplicate historical (same driver + round + first 20 chars)
    const seen = new Set(historical.map(d => `${d.code}-${d.round}-${d.quote.slice(0, 20).toLowerCase()}`))
    const fresh = live.filter(d => !seen.has(`${d.code}-${d.round}-${d.quote.slice(0, 20).toLowerCase()}`))

    const combined = [...historical, ...fresh]
    combined.sort((a, b) => (b.round - a.round) || (b.date || '').localeCompare(a.date || ''))

    res.json(combined)
  } catch (e) {
    // Fallback: static file only
    try {
      res.json([...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))].reverse())
    } catch {
      res.json([])
    }
  }
})

module.exports = router
