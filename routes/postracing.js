const router = require('express').Router()
const { fetchSchedule } = require('../utils/f1api')

const F1_CHANNEL = 'UCB_qr75-ydFVKSF9Dmo6izg'
let _rssCache = null, _rssCacheTs = 0
const RSS_TTL = 5 * 60 * 1000

// "Drivers React After/To The Race" — serie oficial del canal de F1
const SEED = [
  { race: 'Gran Premio de Australia',  flag: 'au', round: 1,  id: 'F3ZGnYQGnFI' },
  { race: 'Gran Premio de China',      flag: 'cn', round: 2,  id: 'SsJ45omwkaY' },
  { race: 'Gran Premio de Japón',      flag: 'jp', round: 3,  id: 'ufI5ldkQu9w' },
  { race: 'Gran Premio de Miami',      flag: 'us', round: 4,  id: '0QyBQJWsQk4' },
  { race: 'Gran Premio de Canadá',     flag: 'ca', round: 5,  id: 'SW_ROPQPxMw' },
  { race: 'Gran Premio de Mónaco',     flag: 'mc', round: 6,  id: '5jLDJ4dL5yE' },
  { race: 'Gran Premio de España',     flag: 'es', round: 7,  id: 'AwyzwUDPZjo' },
]

const RACE_INFO = {
  'australian':          { flag: 'au', round: 1,  display: 'Gran Premio de Australia' },
  'chinese':             { flag: 'cn', round: 2,  display: 'Gran Premio de China' },
  'japanese':            { flag: 'jp', round: 3,  display: 'Gran Premio de Japón' },
  'miami':               { flag: 'us', round: 4,  display: 'Gran Premio de Miami' },
  'canadian':            { flag: 'ca', round: 5,  display: 'Gran Premio de Canadá' },
  'monaco':              { flag: 'mc', round: 6,  display: 'Gran Premio de Mónaco' },
  'barcelona-catalunya': { flag: 'es', round: 7,  display: 'Gran Premio de España' },
  'spanish':             { flag: 'es', round: 7,  display: 'Gran Premio de España' },
  'austrian':            { flag: 'at', round: 8,  display: 'Gran Premio de Austria' },
  'british':             { flag: 'gb', round: 9,  display: 'Gran Premio de Gran Bretaña' },
  'belgian':             { flag: 'be', round: 10, display: 'Gran Premio de Bélgica' },
  'hungarian':           { flag: 'hu', round: 11, display: 'Gran Premio de Hungría' },
  'dutch':               { flag: 'nl', round: 12, display: 'Gran Premio de Países Bajos' },
  'italian':             { flag: 'it', round: 13, display: 'Gran Premio de Italia' },
  'madrid':              { flag: 'es', round: 14, display: 'Gran Premio de Madrid' },
  'azerbaijan':          { flag: 'az', round: 15, display: 'Gran Premio de Azerbaiyán' },
  'singapore':           { flag: 'sg', round: 16, display: 'Gran Premio de Singapur' },
  'united states':       { flag: 'us', round: 17, display: 'Gran Premio de EE.UU.' },
  'mexico city':         { flag: 'mx', round: 18, display: 'Gran Premio de México' },
  'são paulo':           { flag: 'br', round: 19, display: 'Gran Premio de Brasil' },
  'las vegas':           { flag: 'us', round: 20, display: 'Gran Premio de Las Vegas' },
  'qatar':               { flag: 'qa', round: 21, display: 'Gran Premio de Qatar' },
  'abu dhabi':           { flag: 'ae', round: 22, display: 'Gran Premio de Abu Dhabi' },
  'saudi arabian':       { flag: 'sa', round: 23, display: 'Gran Premio de Arabia Saudita' },
  'bahrain':             { flag: 'bh', round: 24, display: 'Gran Premio de Bahrain' },
}

function parseTitle(title) {
  if (!title.includes('2026')) return null
  if (!/drivers react/i.test(title)) return null

  const m = title.match(/2026\s+(.+?)\s+Grand Prix/i)
          || title.match(/(.+?)\s+Grand Prix[^a-z]*2026/i)
  if (!m) return null

  const key = m[1].trim().toLowerCase()
  return RACE_INFO[key] || null
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
      const idM = blk.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
      const ttM = blk.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
      if (idM && ttM) videos.push({ id: idM[1].trim(), title: ttM[1].trim() })
    }

    _rssCache = videos
    _rssCacheTs = now
    return videos
  } catch (e) {
    console.error('[postracing] RSS error:', e.message)
    return _rssCache || []
  }
}

router.get('/', async (req, res) => {
  try {
    const [rssVideos, schedule] = await Promise.all([
      fetchRSS(),
      fetchSchedule().catch(() => []),
    ])

    const schedMap = {}
    for (const r of schedule) schedMap[r.round] = r

    const merged = {}
    for (const s of SEED) merged[s.round] = { ...s }

    for (const v of rssVideos) {
      const info = parseTitle(v.title)
      if (!info) continue
      const { round, flag, display } = info

      const sched = schedMap[round]
      if (sched?.sessions?.race?.utc && Date.now() < sched.sessions.race.utc) continue

      merged[round] = { race: display, flag, round, id: v.id }
    }

    res.json(Object.values(merged).sort((a, b) => a.round - b.round))
  } catch (e) {
    console.error('[postracing] error:', e.message)
    res.json(SEED)
  }
})

module.exports = router
