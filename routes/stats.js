const express  = require('express')
const router   = express.Router()
const { supabase } = require('../db/supabase')

router.get('/', async (req, res) => {
  try {
    const [driversRes, constructorsRes, calendarRes, resultsRes, pointsRes] = await Promise.all([
      supabase.from('drivers').select('*').order('pos'),
      supabase.from('constructors').select('*').order('pos'),
      supabase.from('calendar').select('*').order('round'),
      supabase.from('race_results').select('*').order('pos'),
      supabase.from('race_points').select('*'),
    ])

    const drivers      = driversRes.data  || []
    const constructors = constructorsRes.data || []
    const calendar     = calendarRes.data  || []
    const allResults   = resultsRes.data   || []
    const rawPoints    = pointsRes.data    || []

    const leader   = drivers[0]      || null
    const topTeam  = constructors[0] || null
    const nextRace = calendar.find(r => r.status === 'next')     || null
    const lastRaceBase = [...calendar].reverse().find(r => r.status === 'done') || null

    let lastRace = lastRaceBase
    if (lastRaceBase) {
      const podiumResults = allResults
        .filter(r => r.race_name === lastRaceBase.name && r.race_type === 'race')
        .sort((a, b) => a.pos - b.pos)
        .slice(0, 3)
        .map(r => ({ pos: r.pos, name: r.driver_name, team: r.team }))
      lastRace = { ...lastRaceBase, podium: podiumResults }
    }

    // Build racePoints for evolution chart
    const doneRaces = calendar.filter(r => r.status === 'done')
    const RACE_KEY  = {
      'Australia':'australia','China':'china','Japón':'japan','Miami':'miami',
      'Canadá':'canada','Mónaco':'monaco','España':'spain','Austria':'austria',
      'Gran Bretaña':'britain','Bélgica':'belgium','Hungría':'hungary',
      'Países Bajos':'netherlands','Italia':'italy','Madrid':'madrid',
      'Azerbaiyán':'azerbaijan','Singapur':'singapore','COTA':'usa',
      'México':'mexico','Brasil':'brazil','Las Vegas':'lasvegas',
      'Qatar':'qatar','Abu Dhabi':'abudhabi',
    }
    const RACE_LABEL = {
      australia:'AUS', china:'CHN', japan:'JPN', miami:'MIA', canada:'CAN',
      monaco:'MON', spain:'ESP', austria:'AUT', britain:'GBR', belgium:'BEL',
      hungary:'HUN', netherlands:'NDL', italy:'ITA', madrid:'MAD',
      azerbaijan:'AZE', singapore:'SGP', usa:'USA', mexico:'MEX',
      brazil:'BRA', lasvegas:'LAS', qatar:'QAT', abudhabi:'ABU',
    }
    const completedRaces = doneRaces.map(r => {
      const key = RACE_KEY[r.name] || r.name.toLowerCase().replace(/[^a-z]/g, '')
      return { key, label: RACE_LABEL[key] || r.name.slice(0,3).toUpperCase(), name: r.name, flag: r.flag || '', has_sprint: r.has_sprint || false }
    })

    const racePoints = rawPoints.map(row => {
      const out = { driver_name: row.driver_name }
      completedRaces.forEach(r => { out[r.key] = row[r.key] || 0 })
      return out
    })

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
