const express = require('express')
const router  = express.Router()
const { fetchSchedule, fetchAllResults } = require('../utils/f1api')

router.get('/', async (req, res) => {
  try {
    const schedule = await fetchSchedule()
    res.json(await fetchAllResults(schedule))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
