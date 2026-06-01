const express = require('express')
const router  = express.Router()
const { fetchDriverStandings, fetchConstructorStandings } = require('../utils/f1api')

router.get('/', async (req, res) => {
  try {
    const drivers = await fetchDriverStandings()
    res.json(await fetchConstructorStandings(drivers))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
