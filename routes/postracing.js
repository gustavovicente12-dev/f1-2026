const router = require('express').Router()

// "Drivers React After The Race" — serie oficial del canal de F1
const SEED = [
  { race: 'Gran Premio de Australia', flag: 'au', round: 1, id: 'F3ZGnYQGnFI' },
  { race: 'Gran Premio de China',     flag: 'cn', round: 2, id: 'SsJ45omwkaY' },
  { race: 'Gran Premio de Japón',     flag: 'jp', round: 3, id: 'ufI5ldkQu9w' },
  { race: 'Gran Premio de Miami',     flag: 'us', round: 4, id: '0QyBQJWsQk4' },
  { race: 'Gran Premio de Canadá',    flag: 'ca', round: 5, id: 'SW_ROPQPxMw' },
  { race: 'Gran Premio de Mónaco',    flag: 'mc', round: 6, id: '5jLDJ4dL5yE' },
]

router.get('/', (req, res) => {
  res.json(SEED)
})

module.exports = router
