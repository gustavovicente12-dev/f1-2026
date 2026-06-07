const express = require('express')
const router  = express.Router()
const { apiFetch, fetchSchedule, normTeam } = require('../utils/f1api')

router.get('/', async (req, res) => {
  try {
    const schedule = await fetchSchedule()
    const done = schedule.filter(r => r.status === 'done' || r.status === 'next')

    const sessions = await Promise.all(done.map(async r => {
      const [qualJson, sprintJson] = await Promise.all([
        apiFetch(`/current/${r.round}/qualifying.json`),
        r.has_sprint ? apiFetch(`/current/${r.round}/sprint.json`) : Promise.resolve(null),
      ])

      const race = qualJson?.MRData?.RaceTable?.Races?.[0]
      if (!race) return null

      const results = (race.QualifyingResults || []).map(q => ({
        pos:         +q.position,
        driver_name: `${q.Driver.givenName} ${q.Driver.familyName}`,
        driver_code: q.Driver.code || q.Driver.familyName.slice(0,3).toUpperCase(),
        team:        normTeam(q.Constructor.name),
        q1:          q.Q1 || '—',
        q2:          q.Q2 || '—',
        q3:          q.Q3 || '—',
      }))

      // Sprint qualifying grid reconstructed from grid positions in sprint results
      let sprint_grid = null
      if (r.has_sprint && sprintJson) {
        const sprintRace = sprintJson?.MRData?.RaceTable?.Races?.[0]
        const sprintResults = sprintRace?.SprintResults || []
        if (sprintResults.length) {
          sprint_grid = [...sprintResults]
            .sort((a, b) => +a.grid - +b.grid)
            .map(s => ({
              sq_pos:      +s.grid,
              race_pos:    s.positionText === 'R' ? 'DNF' : +s.position,
              driver_name: `${s.Driver.givenName} ${s.Driver.familyName}`,
              driver_code: s.Driver.code || s.Driver.familyName.slice(0,3).toUpperCase(),
              team:        normTeam(s.Constructor.name),
              fastest_lap: s.FastestLap?.Time?.time || '—',
            }))
        }
      }

      return {
        round: r.round,
        name: r.name,
        flag: r.flag,
        date_str: r.date_str,
        has_sprint: r.has_sprint,
        results,
        sprint_grid,
      }
    }))

    res.json(sessions.filter(Boolean).sort((a, b) => a.round - b.round))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
