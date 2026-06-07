const router = require('express').Router()
const { YoutubeTranscript } = require('youtube-transcript')

// Radio Rewind oficiales por carrera
const RADIO_REWIND_SEED = {
  1: { race: 'Gran Premio de Australia', flag: 'au', id: 'gYbhMrqpawI' },
  2: { race: 'Gran Premio de China',     flag: 'cn', id: 'FPPeChcgytU' },
  3: { race: 'Gran Premio de Japón',     flag: 'jp', id: '12zxTQJXfGw' },
  4: { race: 'Gran Premio de Miami',     flag: 'us', id: 'rXbpZSTBefI' },
  5: { race: 'Gran Premio de Canadá',    flag: 'ca', id: '0xjdAwKzRtk' },
  // Mónaco: se agregará automáticamente desde el RSS cuando F1 lo suba
}

// Caché de transcripts traducidos (viven mientras el servidor esté corriendo)
const _cache = new Map()

// ── RSS del canal oficial F1 (para detectar nuevos Radio Rewind) ──────
const F1_CHANNEL = 'UCB_qr75-ydFVKSF9Dmo6izg'
let _rssCache = null, _rssCacheTs = 0
const RSS_TTL = 30 * 60 * 1000

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
    return _rssCache || []
  }
}

// Detecta nuevos Radio Rewind desde RSS y los agrega al seed en memoria
const RACE_INFO_RADIO = {
  'australian': { round: 1,  race: 'Gran Premio de Australia', flag: 'au' },
  'chinese':    { round: 2,  race: 'Gran Premio de China',     flag: 'cn' },
  'japanese':   { round: 3,  race: 'Gran Premio de Japón',     flag: 'jp' },
  'miami':      { round: 4,  race: 'Gran Premio de Miami',     flag: 'us' },
  'canadian':   { round: 5,  race: 'Gran Premio de Canadá',    flag: 'ca' },
  'monaco':     { round: 6,  race: 'Gran Premio de Mónaco',    flag: 'mc' },
  'spanish':    { round: 7,  race: 'Gran Premio de España',    flag: 'es' },
  'austrian':   { round: 8,  race: 'Gran Premio de Austria',   flag: 'at' },
  'british':    { round: 9,  race: 'Gran Premio de Gran Bretaña', flag: 'gb' },
  'belgian':    { round: 10, race: 'Gran Premio de Bélgica',   flag: 'be' },
  'hungarian':  { round: 11, race: 'Gran Premio de Hungría',   flag: 'hu' },
  'dutch':      { round: 12, race: 'Gran Premio de Países Bajos', flag: 'nl' },
  'italian':    { round: 13, race: 'Gran Premio de Italia',    flag: 'it' },
  'madrid':     { round: 14, race: 'Gran Premio de Madrid',    flag: 'es' },
  'azerbaijan': { round: 15, race: 'Gran Premio de Azerbaiyán', flag: 'az' },
  'singapore':  { round: 16, race: 'Gran Premio de Singapur',  flag: 'sg' },
  'united states': { round: 17, race: 'Gran Premio de EE.UU.', flag: 'us' },
  'mexico city':   { round: 18, race: 'Gran Premio de México', flag: 'mx' },
  'são paulo':     { round: 19, race: 'Gran Premio de Brasil', flag: 'br' },
  'las vegas':     { round: 20, race: 'Gran Premio de Las Vegas', flag: 'us' },
  'qatar':         { round: 21, race: 'Gran Premio de Qatar',  flag: 'qa' },
  'abu dhabi':     { round: 22, race: 'Gran Premio de Abu Dhabi', flag: 'ae' },
  'saudi arabian': { round: 23, race: 'Gran Premio de Arabia Saudita', flag: 'sa' },
  'bahrain':       { round: 24, race: 'Gran Premio de Bahrain', flag: 'bh' },
}

function parseRadioRewind(title) {
  if (!/radio rewind/i.test(title)) return null
  const m = title.match(/2026\s+(.+?)\s+Grand Prix/i)
              || title.match(/(.+?)\s+Grand Prix.*2026/i)
  if (!m) return null
  return RACE_INFO_RADIO[m[1].trim().toLowerCase()] || null
}

// ── Traducción unofficial Google Translate ────────────────────────────

function chunkText(text, max = 800) {
  const chunks = []
  let current = ''
  for (const word of text.split(' ')) {
    if (current.length + word.length + 1 > max) {
      if (current) chunks.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) chunks.push(current)
  return chunks
}

async function translateToSpanish(text) {
  if (!text.trim()) return ''
  const chunks = chunkText(text)
  const results = []
  for (const chunk of chunks) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(chunk)}`
      const res = await fetch(url)
      const data = await res.json()
      results.push(data[0].map(c => c[0]).join(''))
      await new Promise(r => setTimeout(r, 150)) // pausa entre requests
    } catch {
      results.push(chunk) // si falla, deja original
    }
  }
  return results.join(' ')
}

// ── Procesa el transcript: agrupa entradas por pausas ────────────────

function buildMessages(entries) {
  const messages = []
  let current = []
  let prevEnd = 0

  for (const e of entries) {
    const gap = e.offset - prevEnd
    if (gap > 3000 && current.length) { // pausa >3s = nuevo mensaje
      messages.push(current.join(' ').replace(/\s+/g, ' ').trim())
      current = []
    }
    current.push(e.text.replace(/\n/g, ' '))
    prevEnd = e.offset + (e.duration || 0)
  }
  if (current.length) messages.push(current.join(' ').replace(/\s+/g, ' ').trim())
  return messages.filter(m => m.length > 2)
}

// ── Carga y traduce el transcript de un video ────────────────────────

async function loadTranscript(videoId) {
  if (_cache.has(videoId)) return _cache.get(videoId)

  try {
    const entries = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
    const messages = buildMessages(entries)
    const fullText = messages.join('\n')
    const translated = await translateToSpanish(fullText)
    const translatedMessages = translated.split('\n').filter(Boolean)

    // Emparejar original con traducido
    const result = messages.map((orig, i) => ({
      en: orig,
      es: translatedMessages[i] || orig,
    }))

    _cache.set(videoId, result)
    return result
  } catch (e) {
    console.error(`[teamradio] Error con ${videoId}:`, e.message)
    return null
  }
}

// ── Route ─────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    // Detectar nuevos Radio Rewind desde RSS
    const rssVideos = await fetchRSS()
    const dynamic = {}
    for (const v of rssVideos) {
      const info = parseRadioRewind(v.title)
      if (info) dynamic[info.round] = { ...info, id: v.id }
    }

    // Combinar seed + RSS (RSS tiene prioridad para rounds nuevos)
    const combined = { ...RADIO_REWIND_SEED }
    for (const [round, info] of Object.entries(dynamic)) {
      combined[round] = info
    }

    // Devolver metadata sin cargar transcripts (la carga es bajo demanda)
    const list = Object.entries(combined)
      .map(([round, info]) => ({ round: +round, race: info.race, flag: info.flag, videoId: info.id }))
      .sort((a, b) => a.round - b.round)

    res.json(list)
  } catch (e) {
    console.error('[teamradio]', e.message)
    res.status(500).json([])
  }
})

// Endpoint bajo demanda: carga y traduce el transcript de un GP
router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params
    const messages = await loadTranscript(videoId)
    if (!messages) return res.status(404).json({ error: 'Transcript no disponible' })
    res.json(messages)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
