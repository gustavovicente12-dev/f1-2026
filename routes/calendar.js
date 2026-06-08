const express  = require('express')
const router   = express.Router()
const { supabase } = require('../db/supabase')

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('calendar')
      .select('*')
      .order('round')
    if (error) throw new Error(error.message)
    res.json(data || [])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
