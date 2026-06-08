const express = require('express')
const router  = express.Router()
const path    = require('path')
const fs      = require('fs')

const DATA_FILE = path.join(__dirname, '../data/declarations.json')

router.get('/', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    const data = JSON.parse(raw)
    // Newest first
    res.json([...data].reverse())
  } catch (e) {
    res.json([])
  }
})

module.exports = router
