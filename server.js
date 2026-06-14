require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Rutas API
app.use('/api/drivers',      require('./routes/drivers'))
app.use('/api/constructors', require('./routes/constructors'))
app.use('/api/calendar',     require('./routes/calendar'))
app.use('/api/results',      require('./routes/results'))
app.use('/api/news',         require('./routes/news'))
app.use('/api/stats',        require('./routes/stats'))
app.use('/api/history',      require('./routes/history'))
app.use('/api/qualifying',   require('./routes/qualifying'))
app.use('/api/highlights',   require('./routes/highlights'))
app.use('/api/declarations', require('./routes/declarations'))
app.use('/api/postracing',  require('./routes/postracing'))
// teamradio temporalmente desactivado para diagnóstico
// app.use('/api/teamradio',    require('./routes/teamradio'))

// Health check
app.get('/api/health', async (req, res) => {
  const { supabase } = require('./db/supabase')
  const { error } = await supabase.from('drivers').select('id').limit(1)
  res.json({ ok: !error, error: error?.message || null, ts: new Date().toISOString() })
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Error handler global — evita que un crash en una ruta tire el servidor
app.use((err, req, res, next) => {
  console.error('[error]', err.message)
  res.status(500).json({ error: 'Error interno' })
})

process.on('uncaughtException', err => console.error('[uncaughtException]', err.message))
process.on('unhandledRejection', err => console.error('[unhandledRejection]', err?.message))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`F1 2026 Dashboard → http://localhost:${PORT}`))
