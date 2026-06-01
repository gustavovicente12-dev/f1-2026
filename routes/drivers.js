const express = require('express')
const router  = express.Router()
const { fetchDriverStandings } = require('../utils/f1api')

router.get('/', async (req, res) => {
  try {
    res.json(await fetchDriverStandings())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
