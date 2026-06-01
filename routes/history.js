const express = require('express')
const router  = express.Router()
const { apiFetch, NAT_FLAGS } = require('../utils/f1api')

// Static champions 1950–2024 (stable historical data)
const STATIC_CHAMPIONS = [
  { year:1950, name:'Nino Farina',          code:'FAR', nat:'Italian',        flag:'it', team:'Alfa Romeo',   pts:30,    wins:3  },
  { year:1951, name:'Juan Manuel Fangio',   code:'FAN', nat:'Argentine',      flag:'ar', team:'Alfa Romeo',   pts:31,    wins:3  },
  { year:1952, name:'Alberto Ascari',       code:'ASC', nat:'Italian',        flag:'it', team:'Ferrari',      pts:36,    wins:6  },
  { year:1953, name:'Alberto Ascari',       code:'ASC', nat:'Italian',        flag:'it', team:'Ferrari',      pts:34.5,  wins:5  },
  { year:1954, name:'Juan Manuel Fangio',   code:'FAN', nat:'Argentine',      flag:'ar', team:'Mercedes',     pts:42,    wins:6  },
  { year:1955, name:'Juan Manuel Fangio',   code:'FAN', nat:'Argentine',      flag:'ar', team:'Mercedes',     pts:40,    wins:4  },
  { year:1956, name:'Juan Manuel Fangio',   code:'FAN', nat:'Argentine',      flag:'ar', team:'Ferrari',      pts:30,    wins:3  },
  { year:1957, name:'Juan Manuel Fangio',   code:'FAN', nat:'Argentine',      flag:'ar', team:'Maserati',     pts:40,    wins:4  },
  { year:1958, name:'Mike Hawthorn',        code:'HAW', nat:'British',        flag:'gb', team:'Ferrari',      pts:42,    wins:1  },
  { year:1959, name:'Jack Brabham',         code:'BRA', nat:'Australian',     flag:'au', team:'Cooper',       pts:31,    wins:2  },
  { year:1960, name:'Jack Brabham',         code:'BRA', nat:'Australian',     flag:'au', team:'Cooper',       pts:43,    wins:5  },
  { year:1961, name:'Phil Hill',            code:'HIL', nat:'American',       flag:'us', team:'Ferrari',      pts:34,    wins:2  },
  { year:1962, name:'Graham Hill',          code:'HIL', nat:'British',        flag:'gb', team:'BRM',          pts:42,    wins:4  },
  { year:1963, name:'Jim Clark',            code:'CLA', nat:'British',        flag:'gb', team:'Lotus',        pts:54,    wins:7  },
  { year:1964, name:'John Surtees',         code:'SUR', nat:'British',        flag:'gb', team:'Ferrari',      pts:40,    wins:2  },
  { year:1965, name:'Jim Clark',            code:'CLA', nat:'British',        flag:'gb', team:'Lotus',        pts:54,    wins:6  },
  { year:1966, name:'Jack Brabham',         code:'BRA', nat:'Australian',     flag:'au', team:'Brabham',      pts:42,    wins:4  },
  { year:1967, name:'Denny Hulme',          code:'HUL', nat:'New Zealander',  flag:'nz', team:'Brabham',      pts:51,    wins:2  },
  { year:1968, name:'Graham Hill',          code:'HIL', nat:'British',        flag:'gb', team:'Lotus',        pts:48,    wins:2  },
  { year:1969, name:'Jackie Stewart',       code:'STE', nat:'British',        flag:'gb', team:'Matra',        pts:63,    wins:6  },
  { year:1970, name:'Jochen Rindt',         code:'RIN', nat:'Austrian',       flag:'at', team:'Lotus',        pts:45,    wins:5  },
  { year:1971, name:'Jackie Stewart',       code:'STE', nat:'British',        flag:'gb', team:'Tyrrell',      pts:62,    wins:6  },
  { year:1972, name:'Emerson Fittipaldi',   code:'FIT', nat:'Brazilian',      flag:'br', team:'Lotus',        pts:61,    wins:5  },
  { year:1973, name:'Jackie Stewart',       code:'STE', nat:'British',        flag:'gb', team:'Tyrrell',      pts:71,    wins:5  },
  { year:1974, name:'Emerson Fittipaldi',   code:'FIT', nat:'Brazilian',      flag:'br', team:'McLaren',      pts:55,    wins:3  },
  { year:1975, name:'Niki Lauda',           code:'LAU', nat:'Austrian',       flag:'at', team:'Ferrari',      pts:64.5,  wins:5  },
  { year:1976, name:'James Hunt',           code:'HUN', nat:'British',        flag:'gb', team:'McLaren',      pts:69,    wins:6  },
  { year:1977, name:'Niki Lauda',           code:'LAU', nat:'Austrian',       flag:'at', team:'Ferrari',      pts:72,    wins:3  },
  { year:1978, name:'Mario Andretti',       code:'AND', nat:'American',       flag:'us', team:'Lotus',        pts:64,    wins:6  },
  { year:1979, name:'Jody Scheckter',       code:'SCH', nat:'South African',  flag:'za', team:'Ferrari',      pts:51,    wins:3  },
  { year:1980, name:'Alan Jones',           code:'JON', nat:'Australian',     flag:'au', team:'Williams',     pts:67,    wins:5  },
  { year:1981, name:'Nelson Piquet',        code:'PIQ', nat:'Brazilian',      flag:'br', team:'Brabham',      pts:50,    wins:3  },
  { year:1982, name:'Keke Rosberg',         code:'ROS', nat:'Finnish',        flag:'fi', team:'Williams',     pts:44,    wins:1  },
  { year:1983, name:'Nelson Piquet',        code:'PIQ', nat:'Brazilian',      flag:'br', team:'Brabham',      pts:59,    wins:3  },
  { year:1984, name:'Niki Lauda',           code:'LAU', nat:'Austrian',       flag:'at', team:'McLaren',      pts:72,    wins:5  },
  { year:1985, name:'Alain Prost',          code:'PRO', nat:'French',         flag:'fr', team:'McLaren',      pts:73,    wins:5  },
  { year:1986, name:'Alain Prost',          code:'PRO', nat:'French',         flag:'fr', team:'McLaren',      pts:72,    wins:4  },
  { year:1987, name:'Nelson Piquet',        code:'PIQ', nat:'Brazilian',      flag:'br', team:'Williams',     pts:73,    wins:3  },
  { year:1988, name:'Ayrton Senna',         code:'SEN', nat:'Brazilian',      flag:'br', team:'McLaren',      pts:90,    wins:8  },
  { year:1989, name:'Alain Prost',          code:'PRO', nat:'French',         flag:'fr', team:'McLaren',      pts:76,    wins:4  },
  { year:1990, name:'Ayrton Senna',         code:'SEN', nat:'Brazilian',      flag:'br', team:'McLaren',      pts:78,    wins:6  },
  { year:1991, name:'Ayrton Senna',         code:'SEN', nat:'Brazilian',      flag:'br', team:'McLaren',      pts:96,    wins:7  },
  { year:1992, name:'Nigel Mansell',        code:'MAN', nat:'British',        flag:'gb', team:'Williams',     pts:108,   wins:9  },
  { year:1993, name:'Alain Prost',          code:'PRO', nat:'French',         flag:'fr', team:'Williams',     pts:99,    wins:7  },
  { year:1994, name:'Michael Schumacher',   code:'MSC', nat:'German',         flag:'de', team:'Benetton',     pts:92,    wins:8  },
  { year:1995, name:'Michael Schumacher',   code:'MSC', nat:'German',         flag:'de', team:'Benetton',     pts:102,   wins:9  },
  { year:1996, name:'Damon Hill',           code:'HIL', nat:'British',        flag:'gb', team:'Williams',     pts:97,    wins:8  },
  { year:1997, name:'Jacques Villeneuve',   code:'VIL', nat:'Canadian',       flag:'ca', team:'Williams',     pts:81,    wins:7  },
  { year:1998, name:'Mika Häkkinen',        code:'HAK', nat:'Finnish',        flag:'fi', team:'McLaren',      pts:100,   wins:8  },
  { year:1999, name:'Mika Häkkinen',        code:'HAK', nat:'Finnish',        flag:'fi', team:'McLaren',      pts:76,    wins:5  },
  { year:2000, name:'Michael Schumacher',   code:'MSC', nat:'German',         flag:'de', team:'Ferrari',      pts:108,   wins:9  },
  { year:2001, name:'Michael Schumacher',   code:'MSC', nat:'German',         flag:'de', team:'Ferrari',      pts:123,   wins:9  },
  { year:2002, name:'Michael Schumacher',   code:'MSC', nat:'German',         flag:'de', team:'Ferrari',      pts:144,   wins:11 },
  { year:2003, name:'Michael Schumacher',   code:'MSC', nat:'German',         flag:'de', team:'Ferrari',      pts:93,    wins:6  },
  { year:2004, name:'Michael Schumacher',   code:'MSC', nat:'German',         flag:'de', team:'Ferrari',      pts:148,   wins:13 },
  { year:2005, name:'Fernando Alonso',      code:'ALO', nat:'Spanish',        flag:'es', team:'Renault',      pts:133,   wins:7  },
  { year:2006, name:'Fernando Alonso',      code:'ALO', nat:'Spanish',        flag:'es', team:'Renault',      pts:134,   wins:7  },
  { year:2007, name:'Kimi Räikkönen',       code:'RAI', nat:'Finnish',        flag:'fi', team:'Ferrari',      pts:110,   wins:6  },
  { year:2008, name:'Lewis Hamilton',       code:'HAM', nat:'British',        flag:'gb', team:'McLaren',      pts:98,    wins:5  },
  { year:2009, name:'Jenson Button',        code:'BUT', nat:'British',        flag:'gb', team:'Brawn',        pts:95,    wins:6  },
  { year:2010, name:'Sebastian Vettel',     code:'VET', nat:'German',         flag:'de', team:'Red Bull',     pts:256,   wins:5  },
  { year:2011, name:'Sebastian Vettel',     code:'VET', nat:'German',         flag:'de', team:'Red Bull',     pts:392,   wins:11 },
  { year:2012, name:'Sebastian Vettel',     code:'VET', nat:'German',         flag:'de', team:'Red Bull',     pts:281,   wins:5  },
  { year:2013, name:'Sebastian Vettel',     code:'VET', nat:'German',         flag:'de', team:'Red Bull',     pts:397,   wins:13 },
  { year:2014, name:'Lewis Hamilton',       code:'HAM', nat:'British',        flag:'gb', team:'Mercedes',     pts:384,   wins:11 },
  { year:2015, name:'Lewis Hamilton',       code:'HAM', nat:'British',        flag:'gb', team:'Mercedes',     pts:381,   wins:10 },
  { year:2016, name:'Nico Rosberg',         code:'ROS', nat:'German',         flag:'de', team:'Mercedes',     pts:385,   wins:9  },
  { year:2017, name:'Lewis Hamilton',       code:'HAM', nat:'British',        flag:'gb', team:'Mercedes',     pts:363,   wins:9  },
  { year:2018, name:'Lewis Hamilton',       code:'HAM', nat:'British',        flag:'gb', team:'Mercedes',     pts:408,   wins:11 },
  { year:2019, name:'Lewis Hamilton',       code:'HAM', nat:'British',        flag:'gb', team:'Mercedes',     pts:413,   wins:11 },
  { year:2020, name:'Lewis Hamilton',       code:'HAM', nat:'British',        flag:'gb', team:'Mercedes',     pts:347,   wins:11 },
  { year:2021, name:'Max Verstappen',       code:'VER', nat:'Dutch',          flag:'nl', team:'Red Bull',     pts:395.5, wins:10 },
  { year:2022, name:'Max Verstappen',       code:'VER', nat:'Dutch',          flag:'nl', team:'Red Bull',     pts:454,   wins:15 },
  { year:2023, name:'Max Verstappen',       code:'VER', nat:'Dutch',          flag:'nl', team:'Red Bull',     pts:575,   wins:19 },
  { year:2024, name:'Max Verstappen',       code:'VER', nat:'Dutch',          flag:'nl', team:'Red Bull',     pts:437,   wins:9  },
]

async function fetchChampion(year) {
  try {
    const json = await apiFetch(`/${year}/driverStandings/1.json`)
    const lists = json?.MRData?.StandingsTable?.StandingsLists || []
    if (!lists.length) return null
    const s  = lists[0]
    const d  = s.DriverStandings[0]
    const dr = d.Driver
    const co = d.Constructors[0]
    return {
      year:  +s.season,
      name:  `${dr.givenName} ${dr.familyName}`,
      code:  dr.code || dr.familyName.slice(0, 3).toUpperCase(),
      nat:   dr.nationality,
      flag:  NAT_FLAGS[dr.nationality] || '',
      team:  co?.name || '',
      pts:   +d.points,
      wins:  +d.wins,
    }
  } catch {
    return null
  }
}

router.get('/', async (req, res) => {
  try {
    // Try to get 2025 dynamically
    const champion2025 = await fetchChampion(2025)
    const all = champion2025
      ? [champion2025, ...STATIC_CHAMPIONS]
      : [...STATIC_CHAMPIONS]

    res.json(all.sort((a, b) => b.year - a.year))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
