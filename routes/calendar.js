const express = require('express')
const router  = express.Router()
const { fetchSchedule } = require('../utils/f1api')

router.get('/', async (req, res) => {
  try {
    res.json(await fetchSchedule())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
