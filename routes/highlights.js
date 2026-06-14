const router = require('express').Router()
const { fetchSchedule } = require('../utils/f1api')

const F1_CHANNEL = 'UCB_qr75-ydFVKSF9Dmo6izg'
let _rssCache = null, _rssCacheTs = 0
const RSS_TTL = 5 * 60 * 1000

// Datos históricos (fallback para carreras que ya salieron del RSS)
const SEED = [
  { race: 'Gran Premio de Australia', flag: 'au', round: 1, videos: [
    { type: 'Clasificación', id: 'QztBs3IZBHk' },
    { type: 'Carrera',       id: 'lL_d84cN1UY' },
  ]},
  { race: 'Gran Premio de China', flag: 'cn', round: 2, videos: [
    { type: 'Sprint Quali',  id: '-LnHUI4DxRs' },
    { type: 'Sprint',        id: 'ynRZQ9EBfRI' },
    { type: 'Clasificación', id: '75-_kMm0mb8' },
    { type: 'Carrera',       id: 't8HpVlineX4' },
  ]},
  { race: 'Gran Premio de Japón', flag: 'jp', round: 3, videos: [
    { type: 'Clasificación', id: 'oZH_7pYJPTE' },
    { type: 'Carrera',       id: 'JfTnvMkBoKo' },
  ]},
  { race: 'Gran Premio de Miami', flag: 'us', round: 4, videos: [
    { type: 'Sprint Quali',  id: 'zV_UPEsZl-s' },
    { type: 'Sprint',        id: '0XlphgCNbwQ' },
    { type: 'Clasificación', id: '83GJM1S0FnE' },
    { type: 'Carrera',       id: '5gYys4GL7S0' },
  ]},
  { race: 'Gran Premio de Canadá', flag: 'ca', round: 5, videos: [
    { type: 'Sprint Quali',  id: 'd2urQDKqZhU' },
    { type: 'Sprint',        id: 'l3aB-W19bnc' },
    { type: 'Clasificación', id: 'rjLDgDc0td4' },
    { type: 'Carrera',       id: 'QrRh2vOJQbw' },
  ]},
  { race: 'Gran Premio de Mónaco', flag: 'mc', round: 6, videos: [
    { type: 'Clasificación', id: 'xmk0j-HdgwY' },
  ]},
]

// Mapea el nombre de la carrera del título de YouTube al info del GP
const RACE_INFO = {
  'australian':    { flag: 'au', round: 1,  display: 'Gran Premio de Australia' },
  'chinese':       { flag: 'cn', round: 2,  display: 'Gran Premio de China' },
  'japanese':      { flag: 'jp', round: 3,  display: 'Gran Premio de Japón' },
  'miami':         { flag: 'us', round: 4,  display: 'Gran Premio de Miami' },
  'canadian':      { flag: 'ca', round: 5,  display: 'Gran Premio de Canadá' },
  'monaco':        { flag: 'mc', round: 6,  display: 'Gran Premio de Mónaco' },
  'spanish':       { flag: 'es', round: 7,  display: 'Gran Premio de España' },
  'austrian':      { flag: 'at', round: 8,  display: 'Gran Premio de Austria' },
  'british':       { flag: 'gb', round: 9,  display: 'Gran Premio de Gran Bretaña' },
  'belgian':       { flag: 'be', round: 10, display: 'Gran Premio de Bélgica' },
  'hungarian':     { flag: 'hu', round: 11, display: 'Gran Premio de Hungría' },
  'dutch':         { flag: 'nl', round: 12, display: 'Gran Premio de Países Bajos' },
  'italian':       { flag: 'it', round: 13, display: 'Gran Premio de Italia' },
  'madrid':        { flag: 'es', round: 14, display: 'Gran Premio de Madrid' },
  'azerbaijan':    { flag: 'az', round: 15, display: 'Gran Premio de Azerbaiyán' },
  'singapore':     { flag: 'sg', round: 16, display: 'Gran Premio de Singapur' },
  'united states': { flag: 'us', round: 17, display: 'Gran Premio de EE.UU.' },
  'mexico city':   { flag: 'mx', round: 18, display: 'Gran Premio de México' },
  'são paulo':     { flag: 'br', round: 19, display: 'Gran Premio de Brasil' },
  'las vegas':     { flag: 'us', round: 20, display: 'Gran Premio de Las Vegas' },
  'qatar':         { flag: 'qa', round: 21, display: 'Gran Premio de Qatar' },
  'abu dhabi':     { flag: 'ae', round: 22, display: 'Gran Premio de Abu Dhabi' },
  'saudi arabian': { flag: 'sa', round: 23, display: 'Gran Premio de Arabia Saudita' },
  'bahrain':       { flag: 'bh', round: 24, display: 'Gran Premio de Bahrain' },
}

const TYPE_ORDER = ['Sprint Quali', 'Sprint', 'Clasificación', 'Carrera']

function parseTitle(title) {
  if (!title.includes('2026')) return null
  if (!/highlights/i.test(title)) return null

  let type
  if (/sprint qualifying highlights/i.test(title)) type = 'Sprint Quali'
  else if (/sprint highlights/i.test(title))        type = 'Sprint'
  else if (/qualifying highlights/i.test(title))    type = 'Clasificación'
  else if (/race highlights/i.test(title))          type = 'Carrera'
  else return null

  // "2026 Monaco Grand Prix" o "Monaco Grand Prix 2026"
  const m = title.match(/2026\s+(.+?)\s+Grand Prix/i)
          || title.match(/(.+?)\s+Grand Prix[^a-z]*2026/i)
  if (!m) return null

  const key = m[1].trim().toLowerCase()
  const info = RACE_INFO[key]
  if (!info) return null

  return { type, info }
}

async function fetchRSS() {
  const now = Date.now()
  if (_rssCache && now - _rssCacheTs < RSS_TTL) return _rssCache

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${F1_CHANNEL}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()

    const videos = []
    const re = /<entry>([\s\S]*?)<\/entry>/g
    let m
    while ((m = re.exec(xml)) !== null) {
      const blk = m[1]
      const idM  = blk.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
      const ttM  = blk.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
      const pbM  = blk.match(/<published>([^<]+)<\/published>/)
      if (idM && ttM) videos.push({
        id:        idM[1].trim(),
        title:     ttM[1].trim(),
        published: pbM ? new Date(pbM[1]).getTime() : 0,
      })
    }

    _rssCache = videos
    _rssCacheTs = now
    return videos
  } catch (e) {
    console.error('[highlights] RSS error:', e.message)
    return _rssCache || []
  }
}

router.get('/', async (req, res) => {
  try {
    const [rssVideos, schedule] = await Promise.all([
      fetchRSS(),
      fetchSchedule().catch(() => []),
    ])

    // Lookup de tiempos de sesión por round
    const schedMap = {}
    for (const r of schedule) schedMap[r.round] = r

    // Partimos del seed
    const merged = {}
    for (const s of SEED) merged[s.round] = { ...s, videos: [...s.videos] }

    // Procesamos RSS
    for (const v of rssVideos) {
      const parsed = parseTitle(v.title)
      if (!parsed) continue

      const { type, info } = parsed
      const { round, flag, display } = info

      // Solo mostrar si la sesión correspondiente ya empezó
      const sched = schedMap[round]
      if (sched) {
        const sessionUtc =
          type === 'Carrera'       ? sched.sessions?.race?.utc :
          type === 'Clasificación' ? sched.sessions?.qualifying?.utc :
          type === 'Sprint'        ? sched.sessions?.sprint?.utc :
          type === 'Sprint Quali'  ? sched.sessions?.sq?.utc : null
        if (sessionUtc && Date.now() < sessionUtc) continue  // sesión todavía no arrancó
      }

      if (!merged[round]) merged[round] = { race: display, flag, round, videos: [] }

      // RSS reemplaza seed si ya existe el mismo tipo
      const idx = merged[round].videos.findIndex(x => x.type === type)
      if (idx >= 0) merged[round].videos[idx] = { type, id: v.id }
      else merged[round].videos.push({ type, id: v.id })
    }

    // Orden de videos dentro de cada GP
    for (const gp of Object.values(merged)) {
      gp.videos.sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type))
    }

    res.json(Object.values(merged).sort((a, b) => a.round - b.round))
  } catch (e) {
    console.error('[highlights] error:', e.message)
    res.status(500).json(SEED)
  }
})

module.exports = router
