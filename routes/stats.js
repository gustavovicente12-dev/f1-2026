const express = require('express')
const router  = express.Router()
const {
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchSchedule,
  fetchAllResults,
  fetchRaceResults,
  buildRacePoints,
} = require('../utils/f1api')

router.get('/', async (req, res) => {
  try {
    const [drivers, schedule] = await Promise.all([
      fetchDriverStandings(),
      fetchSchedule(),
    ])
    const [constructors, allResults] = await Promise.all([
      fetchConstructorStandings(drivers),
      fetchAllResults(schedule),
    ])

    const { racePoints, completedRaces } = buildRacePoints(allResults, schedule)

    const leader    = drivers[0] || null
    const topTeam   = constructors[0] || null
    const nextRace  = schedule.find(r => r.status === 'next') || null
    const lastRaceBase = [...schedule].reverse().find(r => r.status === 'done') || null

    let lastRace = lastRaceBase
    if (lastRaceBase) {
      const results = await fetchRaceResults(lastRaceBase.round, lastRaceBase.name)
      const podium = results.slice(0, 3).map(r => ({
        pos:  r.pos,
        name: r.driver_name,
        team: r.team,
      }))
      lastRace = { ...lastRaceBase, podium }
    }

    res.json({
      leader,
      topTeam,
      nextRace,
      lastRace,
      top5Drivers: drivers.slice(0, 5),
      racePoints,
      completedRaces,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
