const express = require('express')
const router  = express.Router()
const Parser  = require('rss-parser')

const parser = new Parser({ timeout: 10000 })

const FEEDS = [
  { url: 'https://es.motorsport.com/rss/f1/news/',        source: 'Motorsport.com' },
  { url: 'https://www.marca.com/rss/motor/formula1.xml',  source: 'Marca' },
]

const CACHE = { data: null, ts: 0 }
const TTL   = 15 * 60 * 1000   // 15 minutos

function stripHtml(str) {
  return (str || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/&#\d+;/g,'')
    .replace(/\s+/g, ' ').trim()
}

function truncate(str, max = 180) {
  const s = stripHtml(str)
  return s.length > max ? s.slice(0, max).replace(/\s\S*$/, '') + '…' : s
}

function inferTag(title, summary) {
  const text = `${title} ${summary}`.toLowerCase()
  if (/breaking|exclusive|alert|urgent/.test(text))                                    return 'breaking'
  if (/technical|engine|aero|regulation|car |floor|wing|tyre|tire|upgrade/.test(text)) return 'technical'
  if (/signs|contract|transfer|move|join|replac|depart|seat/.test(text))               return 'transfer'
  if (/preview|next race|looking ahead|schedule|weekend guide/.test(text))             return 'upcoming'
  return 'paddock'
}

async function fetchNews() {
  if (CACHE.data && Date.now() - CACHE.ts < TTL) return CACHE.data

  const results = await Promise.allSettled(FEEDS.map(f => parser.parseURL(f.url)))

  const items = []
  results.forEach((result, i) => {
    if (result.status !== 'fulfilled') return
    const source = FEEDS[i].source
    ;(result.value.items || []).slice(0, 10).forEach(item => {
      const title   = stripHtml(item.title || '')
      const summary = truncate(item.contentSnippet || item.summary || item.content || '')
      if (!title) return
      items.push({
        title,
        summary,
        tag_type:       inferTag(title, summary),
        source,
        published_date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
        link:           item.link || '',
        _ts:            item.pubDate ? new Date(item.pubDate).getTime() : 0,
      })
    })
  })

  items.sort((a, b) => b._ts - a._ts)
  items.forEach(i => delete i._ts)

  CACHE.data = items.slice(0, 15)
  CACHE.ts   = Date.now()
  return CACHE.data
}

router.get('/', async (req, res) => {
  try {
    res.json(await fetchNews())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
