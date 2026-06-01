/* ── F1 2026 — App ───────────────────────────────────────────────── */

const TEAM_COLORS = {
  'Mercedes':     '#00D2BE',
  'Ferrari':      '#E8002D',
  'McLaren':      '#FF8000',
  'Red Bull':     '#3671C6',
  'Alpine':       '#0093CC',
  'Haas':         '#B6BABD',
  'Racing Bulls': '#6692FF',
  'Williams':     '#00A3E0',
  'Audi':         '#BB86FC',
  'Aston Martin': '#358C75',
  'Cadillac':     '#9E9E9E',
}

const TEAM_LOGOS = {
  'Mercedes':     '/img/teams/mercedes.webp',
  'Ferrari':      '/img/teams/ferrari.webp',
  'McLaren':      '/img/teams/mclaren.webp',
  'Red Bull':     '/img/teams/redbull.webp',
  'Alpine':       '/img/teams/alpine.webp',
  'Racing Bulls': '/img/teams/racingbulls.webp',
  'Haas':         '/img/teams/haas.webp',
  'Williams':     '/img/teams/williams.webp',
  'Audi':         '/img/teams/audi.webp',
  'Aston Martin': '/img/teams/astonmartin.webp',
  'Cadillac':     '/img/teams/cadillac.webp',
}

const _F1CDN = 'https://media.formula1.com/image/upload/c_lfill,w_200/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026'
const DRIVER_PHOTOS = {
  'ANT': `${_F1CDN}/mercedes/andant01/2026mercedesandant01right.webp`,
  'RUS': `${_F1CDN}/mercedes/georus01/2026mercedesgeorus01right.webp`,
  'LEC': `${_F1CDN}/ferrari/chalec01/2026ferrarichalec01right.webp`,
  'HAM': `${_F1CDN}/ferrari/lewham01/2026ferrarilewham01right.webp`,
  'NOR': `${_F1CDN}/mclaren/lannor01/2026mclarenlannor01right.webp`,
  'PIA': `${_F1CDN}/mclaren/oscpia01/2026mclarenoscpia01right.webp`,
  'VER': `${_F1CDN}/redbullracing/maxver01/2026redbullracingmaxver01right.webp`,
  'HAD': `${_F1CDN}/redbullracing/isahad01/2026redbullracingisahad01right.webp`,
  'GAS': `${_F1CDN}/alpine/piegas01/2026alpinepiegas01right.webp`,
  'COL': `${_F1CDN}/alpine/fracol01/2026alpinefracol01right.webp`,
  'LAW': `${_F1CDN}/racingbulls/lialaw01/2026racingbullslialaw01right.webp`,
  'LIN': `${_F1CDN}/racingbulls/arvlin01/2026racingbullsarvlin01right.webp`,
  'BEA': `${_F1CDN}/haasf1team/olibea01/2026haasf1teamolibea01right.webp`,
  'OCO': `${_F1CDN}/haasf1team/estoco01/2026haasf1teamestoco01right.webp`,
  'SAI': `${_F1CDN}/williams/carsai01/2026williamscarsai01right.webp`,
  'ALB': `${_F1CDN}/williams/alealb01/2026williamsalealb01right.webp`,
  'HUL': `${_F1CDN}/audi/nichul01/2026audinichul01right.webp`,
  'BOR': `${_F1CDN}/audi/gabbor01/2026audigabbor01right.webp`,
  'BOT': `${_F1CDN}/cadillac/valbot01/2026cadillacvalbot01right.webp`,
  'PER': `${_F1CDN}/cadillac/serper01/2026cadillacserper01right.webp`,
  'ALO': `${_F1CDN}/astonmartin/feralo01/2026astonmartinferalo01right.webp`,
  'STR': `${_F1CDN}/astonmartin/lanstr01/2026astonmartinlanstr01right.webp`,
}


function tl(team, h = 20) {
  const src = TEAM_LOGOS[team]
  if (!src) return ''
  return `<img src="${src}" alt="${team}" class="team-logo" style="height:${h}px">`
}

const TAG_ICONS = {
  breaking:  '🔴',
  technical: '⚙️',
  paddock:   '🎙️',
  upcoming:  '📅',
  transfer:  '🔄',
}

let appData = {}
let currentTab = 'resumen'
let chartMode = 'per-race'

// ── Fetch ──────────────────────────────────────────────────────────

function safeArr(val) { return Array.isArray(val) ? val : [] }

async function fetchAll() {
  const [stats, drivers, constructors, calendar, results, news, history, qualifying] = await Promise.all([
    fetch('/api/stats').then(r => r.json()).catch(() => ({})),
    fetch('/api/drivers').then(r => r.json()).catch(() => []),
    fetch('/api/constructors').then(r => r.json()).catch(() => []),
    fetch('/api/calendar').then(r => r.json()).catch(() => []),
    fetch('/api/results').then(r => r.json()).catch(() => []),
    fetch('/api/news').then(r => r.json()).catch(() => []),
    fetch('/api/history').then(r => r.json()).catch(() => []),
    fetch('/api/qualifying').then(r => r.json()).catch(() => []),
  ])
  appData = {
    stats:        (stats && !stats.error) ? stats : {},
    drivers:      safeArr(drivers),
    constructors: safeArr(constructors),
    calendar:     safeArr(calendar),
    results:      safeArr(results),
    news:         safeArr(news),
    history:      safeArr(history),
    qualifying:   safeArr(qualifying),
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function tc(team) { return TEAM_COLORS[team] || '#666680' }

function posClass(p) {
  if (p === 1) return 'p1'
  if (p === 2) return 'p2'
  if (p === 3) return 'p3'
  return ''
}

function set(html) {
  document.getElementById('main').innerHTML = `<div class="container">${html}</div>`
}

// ── Header info ────────────────────────────────────────────────────

function renderHeaderInfo() {
  const { stats } = appData
  if (!stats || !stats.leader) return
  const next = stats.nextRace
  document.getElementById('header-info').innerHTML = `
    <div class="header-pill">
      <span class="dot-live"></span>
      <span>Líder: <strong>${stats.leader.short || stats.leader.name}</strong> ${stats.leader.pts} pts</span>
    </div>
    ${next ? `<div class="header-pill">Próxima: <strong>${flagImg(next.flag, 16)} ${next.name}</strong> · ${fmtDate(next.date_str)}</div>` : ''}
  `
}

// ── Tab router ─────────────────────────────────────────────────────

function renderTab(tab) {
  currentTab = tab
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab))
  switch (tab) {
    case 'resumen':      renderResumen(); break
    case 'resultados':      renderResultados(); break
    case 'clasificaciones': renderClasificaciones(); break
    case 'pilotos':      renderPilotos(); break
    case 'constructores':renderConstructores(); break
    case 'evolucion':    renderEvolucion(); break
    case 'noticias':     renderNoticias(); break
    case 'calendario':   renderCalendario(); break
    case 'circuitos':    renderCircuitos(); break
    case 'reglamento':   renderReglamento(); break
    case 'historia':     renderHistoria(); break
  }
}

function setupTabs() {
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab')
    if (btn) renderTab(btn.dataset.tab)
  })
}

// ── RESUMEN ────────────────────────────────────────────────────────

function renderResumen() {
  const { stats } = appData
  const { leader, topTeam, nextRace, lastRace, top5Drivers } = stats || {}

  const heroCards = `
    <div class="hero-card leader">
      <div class="hero-label">🏆 Líder del campeonato</div>
      <div class="hero-value">${flagImg(leader?.flag, 20)} ${leader?.name || '—'}</div>
      <div class="hero-sub" style="color:${tc(leader?.team)}">${leader?.team || ''}</div>
      <div class="hero-pts" style="color:var(--gold)">${leader?.pts || 0} PTS</div>
    </div>
    <div class="hero-card team">
      <div class="hero-label">🏗️ Líder constructores</div>
      <div class="hero-value">${tl(topTeam?.name, 28)} ${topTeam?.name || '—'}</div>
      <div class="hero-sub">${topTeam?.driver1 || ''} · ${topTeam?.driver2 || ''}</div>
      <div class="hero-pts" style="color:${tc(topTeam?.name)}">${topTeam?.pts || 0} PTS</div>
    </div>
    <div class="hero-card last">
      <div class="hero-label">🏁 Última carrera</div>
      <div class="hero-value">${flagImg(lastRace?.flag, 20)} ${lastRace?.name || '—'}</div>
      <div class="podium-list">
        ${(lastRace?.podium || []).map(p => {
          const medals = ['🥇','🥈','🥉']
          const parts  = (p.name || '').trim().split(/\s+/)
          const short  = parts.length > 1 ? parts[0][0] + '. ' + parts[parts.length - 1] : p.name
          return `<div class="podium-row driver-clickable" data-driver="${p.name}" style="cursor:pointer">
            <span class="podium-medal">${medals[p.pos - 1] || p.pos}</span>
            <span class="podium-name" style="color:${tc(p.team)}">${short}</span>
            <span class="podium-team">${p.team}</span>
          </div>`
        }).join('')}
      </div>
    </div>
    <div class="hero-card next">
      <div class="hero-label">📍 Próxima carrera</div>
      <div class="hero-value">${flagImg(nextRace?.flag, 20)} ${nextRace?.name || '—'}</div>
      <div class="hero-sub">${nextRace?.circuit || ''}</div>
      <div class="hero-pts" style="color:var(--cyan)">${fmtDate(nextRace?.date_str)}</div>
    </div>
  `

  const miniRows = (top5Drivers || []).map(d => `
    <div class="mini-row driver-clickable" data-driver="${d.name}" style="cursor:pointer">
      <div class="pos-num ${posClass(d.pos)}">${d.pos}</div>
      <div class="driver-flag">${flagImg(d.flag, 16)}</div>
      <div>
        <div class="driver-name-mini">${d.name}</div>
        <div class="driver-team-mini" style="color:${tc(d.team)}">${d.team}</div>
      </div>
      <div class="pts-badge">${d.pts}</div>
    </div>
  `).join('')

  set(`
    <div class="hero-grid">${heroCards}</div>
    <div class="resumen-grid">
      <div class="mini-standings">
        <div class="mini-standings-header">🏎️ Top 5 Pilotos</div>
        ${miniRows}
      </div>
      <div class="mini-standings">
        <div class="mini-standings-header">🏗️ Top 5 Constructores</div>
        ${(appData.constructors || []).slice(0, 5).map(c => `
          <div class="mini-row driver-clickable" data-team="${c.name}" style="cursor:pointer">
            <div class="pos-num ${posClass(c.pos)}">${c.pos}</div>
            ${tl(c.name, 32)}
            <div>
              <div class="driver-name-mini">${c.name}</div>
              <div class="driver-team-mini">${c.driver1} · ${c.driver2}</div>
            </div>
            <div class="pts-badge">${c.pts}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `)
}

// ── RESULTADOS ─────────────────────────────────────────────────────

function renderResultados(activeRace, activeType) {
  const doneRaces = (appData.calendar || []).filter(r => r.status === 'done')
  if (!doneRaces.length) { set('<p style="color:var(--muted);padding:40px">Sin carreras disputadas.</p>'); return }

  const race     = doneRaces.find(r => r.name === activeRace) || doneRaces[doneRaces.length - 1]
  const type     = activeType || 'race'
  const hasSprint = race.has_sprint

  const driverFlagMap = {}
  ;(appData.drivers || []).forEach(d => { driverFlagMap[d.name] = d.flag })

  const sidebarItems = doneRaces.map(r => `
    <div class="qual-race-item ${r.name === race.name ? 'active' : ''}" data-res-race="${r.name}">
      <span class="qual-race-round">R${r.round}</span>
      <span class="qual-race-flag">${flagImg(r.flag, 16)}</span>
      <span class="qual-race-name">${r.name}</span>
      ${r.has_sprint ? '<span class="sprint-badge">S</span>' : ''}
    </div>
  `).join('')

  const typeTabs = hasSprint ? `
    <div class="res-type-tabs">
      <button class="res-type-tab ${type === 'race' ? 'active' : ''}" data-type="race">Carrera</button>
      <button class="res-type-tab ${type === 'sprint' ? 'active' : ''}" data-type="sprint">Sprint</button>
    </div>
  ` : ''

  const raceResults = (appData.results || [])
    .filter(r => r.race_name === race.name && r.race_type === type)
    .sort((a, b) => a.pos - b.pos)

  const rows = raceResults.length
    ? raceResults.map(r => {
        const color  = tc(r.team)
        const pClass = posClass(r.pos)
        return `
          <div class="qual-row ${pClass} ${r.dnf ? 'result-dnf' : ''}" data-driver="${r.driver_name}" style="cursor:pointer">
            <div class="qual-pos ${pClass}">${r.pos}</div>
            <div class="qual-driver" style="border-left:3px solid ${color}">
              ${flagImg(driverFlagMap[r.driver_name] || '', 16)}
              <span class="qual-code">${r.driver_code || ''}</span>
              <span class="qual-name">${r.driver_name}</span>
              ${r.fastest_lap ? '<span class="fastest-icon" title="Vuelta rápida">⚡</span>' : ''}
            </div>
            <div class="qual-team res-team" data-team="${r.team}" style="color:${color};cursor:pointer">${tl(r.team,18)} ${r.team}</div>
            <div class="res-pts">${r.dnf ? '<span class="dnf-badge">DNF</span>' : r.pts + ' pts'}</div>
          </div>
        `
      }).join('')
    : `<div class="qual-row"><div style="grid-column:1/-1;color:var(--muted);padding:16px">Sin resultados registrados.</div></div>`

  set(`
    <div class="section-title">RESULTADOS</div>
    <div class="section-sub">Carreras disputadas — Temporada 2026</div>
    <div class="qual-layout">
      <div class="qual-sidebar">${sidebarItems}</div>
      <div class="qual-main">
        <div class="qual-race-header">
          ${flagImg(race.flag, 18)}
          <span class="qual-race-title">${race.name}</span>
          <span class="qual-race-date">${fmtDate(race.date_str)}</span>
        </div>
        ${typeTabs}
        <div class="qual-table res-table">
          <div class="qual-header">
            <div class="qual-pos">P</div>
            <div class="qual-driver">Piloto</div>
            <div class="qual-team res-team">Escudería</div>
            <div class="res-pts">Puntos</div>
          </div>
          ${rows}
        </div>
      </div>
    </div>
  `)

  document.querySelectorAll('[data-res-race]').forEach(btn => {
    btn.addEventListener('click', () => renderResultados(btn.dataset.resRace, 'race'))
  })
  document.querySelectorAll('.res-type-tab').forEach(btn => {
    btn.addEventListener('click', () => renderResultados(race.name, btn.dataset.type))
  })
}

// ── CLASIFICACIONES ────────────────────────────────────────────────

function renderClasificaciones(activeRound, activeType) {
  const sessions = appData.qualifying || []
  if (!sessions.length) {
    set(`<div class="section-title">CLASIFICACIONES</div><p style="color:var(--muted);text-align:center;margin-top:40px">No hay datos de clasificación disponibles aún.</p>`)
    return
  }

  const selected = sessions.find(s => s.round === activeRound) || sessions[sessions.length - 1]
  const type = (activeType === 'sprint' && selected.has_sprint) ? 'sprint' : 'race'

  const driverFlagMap = {}
  ;(appData.drivers || []).forEach(d => { driverFlagMap[d.name] = d.flag })

  const sidebarItems = sessions.map(s => `
    <div class="qual-race-item ${s.round === selected.round ? 'active' : ''}" data-qual-round="${s.round}">
      <span class="qual-race-round">R${s.round}</span>
      <span class="qual-race-flag">${flagImg(s.flag, 16)}</span>
      <span class="qual-race-name">${s.name}</span>
      ${s.has_sprint ? '<span class="sprint-badge">S</span>' : ''}
    </div>
  `).join('')

  const typeTabs = selected.has_sprint ? `
    <div class="res-type-tabs">
      <button class="res-type-tab ${type === 'race' ? 'active' : ''}" data-qual-type="race">Carrera</button>
      <button class="res-type-tab ${type === 'sprint' ? 'active' : ''}" data-qual-type="sprint">Sprint</button>
    </div>
  ` : ''

  let tableContent
  if (type === 'sprint' && selected.sprint_grid) {
    const sprintRows = selected.sprint_grid.map(s => {
      const color  = tc(s.team)
      const pClass = posClass(s.sq_pos)
      const raceResult = s.race_pos === 'DNF'
        ? '<span class="dnf-badge">DNF</span>'
        : `P${s.race_pos}`
      return `
        <div class="qual-row ${pClass}" data-driver="${s.driver_name}" style="cursor:pointer">
          <div class="qual-pos ${pClass}">${s.sq_pos}</div>
          <div class="qual-driver" style="border-left:3px solid ${color}">
            ${flagImg(driverFlagMap[s.driver_name] || '', 16)}
            <span class="qual-code">${s.driver_code}</span>
            <span class="qual-name">${s.driver_name}</span>
          </div>
          <div class="qual-team" data-team="${s.team}" style="color:${color};cursor:pointer">${s.team}</div>
          <div class="qual-time qual-best">${s.fastest_lap}</div>
        </div>
      `
    }).join('')
    tableContent = `
      <div class="qual-table sq-table">
        <div class="qual-header">
          <div class="qual-pos">SQ</div>
          <div class="qual-driver">Piloto</div>
          <div class="qual-team">Escudería</div>
          <div class="qual-time qual-best">Vuelta rápida</div>
        </div>
        ${sprintRows}
      </div>
    `
  } else {
    const gpRows = selected.results.map(q => {
      const color  = tc(q.team)
      const pClass = posClass(q.pos)
      const isQ3   = q.q3 !== '—'
      const isQ2   = q.q2 !== '—'
      return `
        <div class="qual-row ${pClass}" data-driver="${q.driver_name}" style="cursor:pointer">
          <div class="qual-pos ${pClass}">${q.pos}</div>
          <div class="qual-driver" style="border-left:3px solid ${color}">
            ${flagImg(driverFlagMap[q.driver_name] || '', 16)}
            <span class="qual-code">${q.driver_code}</span>
            <span class="qual-name">${q.driver_name}</span>
          </div>
          <div class="qual-team" data-team="${q.team}" style="color:${color};cursor:pointer">${q.team}</div>
          <div class="qual-time ${!isQ2 ? 'qual-out' : ''}">${q.q1}</div>
          <div class="qual-time ${!isQ3 ? 'qual-out' : ''}">${q.q2}</div>
          <div class="qual-time qual-best">${isQ3 ? q.q3 : ''}</div>
        </div>
      `
    }).join('')
    tableContent = `
      <div class="qual-table">
        <div class="qual-header">
          <div class="qual-pos">P</div>
          <div class="qual-driver">Piloto</div>
          <div class="qual-team">Escudería</div>
          <div class="qual-time">Q1</div>
          <div class="qual-time">Q2</div>
          <div class="qual-time qual-best">Q3</div>
        </div>
        ${gpRows}
      </div>
    `
  }

  set(`
    <div class="section-title">CLASIFICACIONES</div>
    <div class="section-sub">Grilla de largada — Temporada 2026</div>
    <div class="qual-layout">
      <div class="qual-sidebar">${sidebarItems}</div>
      <div class="qual-main">
        <div class="qual-race-header">
          ${flagImg(selected.flag, 18)}
          <span class="qual-race-title">${selected.name}</span>
          <span class="qual-race-date">${fmtDate(selected.date_str)}</span>
        </div>
        ${typeTabs}
        ${tableContent}
      </div>
    </div>
  `)

  document.querySelectorAll('.qual-race-item').forEach(btn => {
    btn.addEventListener('click', () => renderClasificaciones(+btn.dataset.qualRound, 'race'))
  })
  document.querySelectorAll('[data-qual-type]').forEach(btn => {
    btn.addEventListener('click', () => renderClasificaciones(selected.round, btn.dataset.qualType))
  })
}

// ── PILOTOS ────────────────────────────────────────────────────────

function renderPilotos() {
  const drivers = appData.drivers || []

  const tableRows = drivers.map(d => `
    <tr class="driver-clickable" data-driver="${d.name}" style="cursor:pointer">
      <td class="pos ${posClass(d.pos)}">${d.pos}</td>
      <td class="flag">${flagImg(d.flag, 16)}</td>
      <td>
        <strong>${d.name}</strong>
        <span class="driver-num">#${d.number}</span>
      </td>
      <td><span class="team-cell" data-team="${d.team}" style="cursor:pointer">${tl(d.team, 18)}<span style="color:${tc(d.team)}">${d.team}</span></span></td>
      <td class="pts">${d.pts}</td>
    </tr>
  `).join('')

  const cards = drivers.map(d => {
    const photoUrl = DRIVER_PHOTOS[d.short] || ''
    const photoHtml = photoUrl
      ? `<img src="${photoUrl}" alt="${d.name}" class="driver-card-photo" onerror="this.style.display='none'">`
      : ''
    return `
    <div class="driver-card driver-clickable" data-driver="${d.name}" style="--team-color:${tc(d.team)}">
      <div class="driver-card-num">${d.number}</div>
      <div style="border-left: 3px solid ${tc(d.team)}; padding-left:10px; position:relative; z-index:1; flex:1; min-width:0">
        <div class="driver-card-emoji">${d.emoji}</div>
        <div class="driver-card-name">${d.name}</div>
        <div class="driver-card-team" data-team="${d.team}" style="color:${tc(d.team)};cursor:pointer">${tl(d.team, 22)} ${d.team}</div>
        <div class="driver-card-pts">${d.pts}</div>
        <div class="driver-card-pts-label">PTS · P${d.pos}</div>
        ${d.bio ? `<div class="driver-bio">${d.bio}</div>` : ''}
        <div class="driver-meta">
          <span>${flagImg(d.flag, 16)} <strong>${natES(d.nat)}</strong></span>
          <span>Edad <strong>${d.age}</strong></span>
          <span>Nac. <strong>${d.born}</strong></span>
        </div>
      </div>
      ${photoHtml}
    </div>`
  }).join('')

  set(`
    <div class="section-title">PILOTOS</div>
    <div class="section-sub">Campeonato de Pilotos 2026 — ${drivers.length} pilotos</div>
    <div class="drivers-layout">
      <table class="standings-table">
        <thead>
          <tr><th>POS</th><th></th><th>PILOTO</th><th>EQUIPO</th><th>PTS</th></tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
    <div class="driver-cards-grid" style="margin-top:24px">${cards}</div>
  `)
}

// ── CONSTRUCTORES ──────────────────────────────────────────────────

function renderConstructores() {
  const cons = appData.constructors || []
  const maxPts = Math.max(...cons.map(c => c.pts), 1)

  const rows = cons.map(c => `
    <div class="constructor-row driver-clickable" data-team="${c.name}" style="cursor:pointer">
      <div class="constructor-header">
        <div class="constructor-left">
          <div class="constructor-pos ${posClass(c.pos)}">${c.pos}</div>
          <div class="constructor-color-bar" style="background:${tc(c.name)}"></div>
          <div class="constructor-logo-wrap">${tl(c.name, 30)}</div>
          <div>
            <div class="constructor-drivers">${c.driver1} · ${c.driver2}</div>
          </div>
          <div class="constructor-engine">${c.engine}</div>
        </div>
        <div class="constructor-right">
          <div class="constructor-pts">${c.pts}</div>
          <div class="constructor-pts-label">PUNTOS</div>
        </div>
      </div>
      <div class="constructor-bar-wrap">
        <div class="constructor-bar" style="width:${(c.pts / maxPts) * 100}%; background:${tc(c.name)}"></div>
      </div>
      ${c.note ? `<div class="constructor-note">${c.note}</div>` : ''}
    </div>
  `).join('')

  set(`
    <div class="section-title">CONSTRUCTORES</div>
    <div class="section-sub">Campeonato de Constructores 2026 — ${cons.length} equipos</div>
    <div class="constructor-list">${rows}</div>
  `)
}

// ── EVOLUCIÓN ──────────────────────────────────────────────────────

let selectedDrivers = null  // persiste entre cambios de tab

function renderEvolucion() {
  const racePoints     = appData.stats?.racePoints     || []
  const completedRaces = appData.stats?.completedRaces || []
  const racesLabel     = completedRaces.map(r => r.name).join(' · ')

  // Todos los pilotos ordenados por total de puntos
  const topDrivers = [...racePoints]
    .map(row => {
      const total = completedRaces.reduce((s, r) => s + (row[r.key] || 0), 0)
      const info  = (appData.drivers || []).find(d => d.name === row.driver_name)
      return { name: row.driver_name, total, team: info?.team || '' }
    })
    .sort((a, b) => b.total - a.total)

  // Selección inicial vacía — el usuario elige qué comparar
  if (!selectedDrivers) selectedDrivers = new Set()

  set(`
    <div class="section-title">EVOLUCIÓN DE PUNTAJE</div>
    <div class="chart-controls">
      <div></div>
      <div class="toggle-btns" id="chart-toggle">
        <button class="toggle-btn ${chartMode === 'cumulative' ? 'active' : ''}" data-mode="cumulative">Acumulado</button>
        <button class="toggle-btn ${chartMode === 'per-race' ? 'active' : ''}" data-mode="per-race">Por carrera</button>
      </div>
    </div>
    <div class="driver-selector-header">
      <span class="driver-selector-label">Pilotos</span>
      <div class="driver-selector-actions">
        <button class="ds-action" id="ds-all">Todos</button>
        <button class="ds-action" id="ds-none">Limpiar</button>
      </div>
    </div>
    <div class="driver-selector" id="driver-selector"></div>
    <div class="chart-container" id="chart-wrap"></div>
  `)

  // Renderiza pills
  const selectorEl = document.getElementById('driver-selector')
  topDrivers.forEach(d => {
    const color = tc(d.team)
    const pill  = document.createElement('button')
    pill.className = 'driver-pill' + (selectedDrivers.has(d.name) ? ' active' : '')
    pill.dataset.driver = d.name
    pill.style.setProperty('--tc', color)
    pill.innerHTML = `<span class="pill-dot"></span>${pillName(d.name)}`
    selectorEl.appendChild(pill)
  })

  const redraw = () => {
    const wrap = document.getElementById('chart-wrap')
    const filtered = racePoints.filter(r => selectedDrivers.has(r.driver_name))
    if (!filtered.length) {
      wrap.innerHTML = '<p style="color:var(--muted);padding:48px;text-align:center;font-size:13px">Seleccioná pilotos arriba para ver la evolución</p>'
      return
    }
    buildChart(wrap, filtered, appData.drivers, chartMode, completedRaces)
  }

  redraw()

  // Acumulado / Por carrera
  document.getElementById('chart-toggle').addEventListener('click', e => {
    const btn = e.target.closest('.toggle-btn')
    if (!btn) return
    chartMode = btn.dataset.mode
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === chartMode))
    redraw()
  })

  // Toggle individual piloto
  selectorEl.addEventListener('click', e => {
    const pill = e.target.closest('.driver-pill')
    if (!pill) return
    const name = pill.dataset.driver
    if (selectedDrivers.has(name)) {
      selectedDrivers.delete(name); pill.classList.remove('active')
    } else {
      selectedDrivers.add(name); pill.classList.add('active')
    }
    redraw()
  })

  // Todos
  document.getElementById('ds-all').addEventListener('click', () => {
    topDrivers.forEach(d => selectedDrivers.add(d.name))
    document.querySelectorAll('.driver-pill').forEach(p => p.classList.add('active'))
    redraw()
  })

  // Limpiar — vacía toda la selección
  document.getElementById('ds-none').addEventListener('click', () => {
    selectedDrivers.clear()
    document.querySelectorAll('.driver-pill').forEach(p => p.classList.remove('active'))
    redraw()
  })
}

function pillName(fullName) {
  const parts = fullName.trim().split(/\s+/)
  return parts[parts.length - 1]
}

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

function flagImg(code, h = 16) {
  if (!code) return ''
  return `<img src="https://flagcdn.com/w40/${code}.png" class="flag-img" style="height:${h}px" alt="${code}">`
}

const NAT_ES = {
  'Australian':    'Australiano',
  'Austrian':      'Austriaco',
  'Argentine':     'Argentino',
  'Bahraini':      'Bareiní',
  'Belgian':       'Belga',
  'Brazilian':     'Brasileño',
  'British':       'Británico',
  'Canadian':      'Canadiense',
  'Chinese':       'Chino',
  'Danish':        'Danés',
  'Dutch':         'Neerlandés',
  'Finnish':       'Finlandés',
  'French':        'Francés',
  'German':        'Alemán',
  'Hungarian':     'Húngaro',
  'Italian':       'Italiano',
  'Japanese':      'Japonés',
  'Mexican':       'Mexicano',
  'Monegasque':    'Monegasco',
  'Monégasque':    'Monegasco',
  'New Zealander': 'Neozelandés',
  'Polish':        'Polaco',
  'Russian':       'Ruso',
  'South Korean':  'Surcoreano',
  'Spanish':       'Español',
  'Swedish':       'Sueco',
  'Swiss':         'Suizo',
  'Thai':          'Tailandés',
  'American':      'Estadounidense',
}

function natES(nat) { return NAT_ES[nat] || nat }

// ── NOTICIAS ───────────────────────────────────────────────────────

function renderNoticias() {
  const news = appData.news || []

  const cards = news.map(n => `
    <div class="news-card" ${n.link ? `onclick="window.open('${n.link}','_blank')" style="cursor:pointer"` : ''}>
      <span class="news-tag ${n.tag_type}">${TAG_ICONS[n.tag_type] || ''} ${n.tag_type}</span>
      <div class="news-title">${n.title}</div>
      <div class="news-summary">${n.summary}</div>
      <div class="news-footer">
        <span>${n.source || ''}</span>
        <span>${fmtDate(n.published_date)}</span>
      </div>
    </div>
  `).join('')

  set(`
    <div class="section-title">NOTICIAS</div>
    <div class="section-sub">Últimas novedades de la parrilla — Temporada 2026</div>
    <div class="news-grid">${cards}</div>
  `)
}

// ── CALENDARIO ─────────────────────────────────────────────────────

function renderCalendario() {
  const cal = appData.calendar || []

  const CAL_TO_KEY = {
    'Australia':'australia','China':'china','Japón':'japan','Miami':'miami',
    'Canadá':'canada','Mónaco':'monaco','España':'spain','Austria':'austria',
    'Gran Bretaña':'britain','Bélgica':'belgium','Hungría':'hungary',
    'Países Bajos':'netherlands','Italia':'italy','Madrid':'madrid',
    'Azerbaiyán':'azerbaijan','Singapur':'singapore','EE.UU.':'usa',
    'México':'mexico','Brasil':'brazil','Las Vegas':'lasvegas',
    'Qatar':'qatar','Abu Dhabi':'abudhabi','Arabia Saudita':'saudi',
    'Bahrain':'bahrain',
  }

  const rows = cal.map(r => {
    const circuitKey = CAL_TO_KEY[r.name] || ''
    const winnerHtml = r.winner ? `<span class="cal-winner">🏆 <strong>${r.winner}</strong></span>` : ''
    return `
      <div class="cal-row status-${r.status}${circuitKey ? ' cal-row-clickable' : ''}" ${circuitKey ? `data-circuit-key="${circuitKey}"` : ''}>
        <div class="cal-round">${r.round || '✕'}</div>
        <div class="cal-flag">${flagImg(r.flag, 18)}</div>
        <div>
          <div class="cal-name">${r.name}</div>
          <div class="cal-circuit">${r.circuit}</div>
          <div class="cal-date-mobile">${fmtDate(r.date_str)}</div>
        </div>
        <div class="cal-date">${fmtDate(r.date_str)}</div>
        <div>${r.has_sprint ? '<span class="cal-sprint">SPRINT</span>' : ''}</div>
        <div class="cal-status">
          ${winnerHtml}
          <span class="status-badge ${r.status}">${r.status === 'done' ? '✓ Disputada' : r.status === 'next' ? '▶ Próxima' : r.status === 'cancelled' ? '✕ Cancelada' : 'Pendiente'}</span>
        </div>
      </div>
    `
  }).join('')

  set(`
    <div class="section-title">CALENDARIO</div>
    <div class="section-sub">${cal.filter(r => r.status === 'done').length} carreras disputadas · ${cal.filter(r => r.status === 'upcoming' || r.status === 'next').length} pendientes</div>
    <div class="calendar-list">${rows}</div>
  `)
}

// ── REGLAMENTO ─────────────────────────────────────────────────────

// ── CIRCUITOS ──────────────────────────────────────────────────────

const _CDN_TRACK = 'https://media.formula1.com/image/upload/c_lfill,w_500/v1740000001/common/f1/2026/track'
const CIRCUITS = [
  { key:'australia', gp:'Gran Premio de Australia',   city:'Melbourne',      flag:'au', laps:58, length:5.278, distance:306.1, record:{time:'1:20.235',driver:'C. Leclerc',year:2022},    firstGP:1996, slug:'melbourne' },
  { key:'china',     gp:'Gran Premio de China',       city:'Shanghái',       flag:'cn', laps:56, length:5.451, distance:305.1, record:{time:'1:32.238',driver:'M. Schumacher',year:2004}, firstGP:2004, slug:'shanghai' },
  { key:'japan',     gp:'Gran Premio de Japón',       city:'Suzuka',         flag:'jp', laps:53, length:5.807, distance:307.5, record:{time:'1:30.983',driver:'L. Hamilton',year:2019},   firstGP:1987, slug:'suzuka' },
  { key:'miami',     gp:'Gran Premio de Miami',       city:'Miami',          flag:'us', laps:57, length:5.412, distance:308.3, record:{time:'1:29.708',driver:'M. Verstappen',year:2023},  firstGP:2022, slug:'miami' },
  { key:'monaco',    gp:'Gran Premio de Mónaco',      city:'Monte Carlo',    flag:'mc', laps:78, length:3.337, distance:260.3, record:{time:'1:12.909',driver:'L. Hamilton',year:2021},   firstGP:1950, slug:'montecarlo' },
  { key:'canada',    gp:'Gran Premio de Canadá',      city:'Montreal',       flag:'ca', laps:70, length:4.361, distance:305.3, record:{time:'1:13.078',driver:'V. Bottas',year:2019},      firstGP:1978, slug:'montreal' },
  { key:'spain',     gp:'Gran Premio de España',      city:'Barcelona',      flag:'es', laps:66, length:4.675, distance:308.4, record:{time:'1:16.330',driver:'M. Verstappen',year:2023},  firstGP:1991, slug:'catalunya' },
  { key:'madrid',    gp:'Gran Premio de Madrid',      city:'Madrid',         flag:'es', laps:55, length:5.47,  distance:300.9, record:{time:'—',driver:'Nuevo circuito',year:2026},        firstGP:2026, slug:'madring' },
  { key:'austria',   gp:'Gran Premio de Austria',     city:'Spielberg',      flag:'at', laps:71, length:4.318, distance:306.5, record:{time:'1:05.619',driver:'C. Sainz',year:2020},       firstGP:1970, slug:'spielberg' },
  { key:'britain',   gp:'Gran Premio de Gran Bretaña',city:'Silverstone',    flag:'gb', laps:52, length:5.891, distance:306.2, record:{time:'1:27.097',driver:'M. Verstappen',year:2020},  firstGP:1950, slug:'silverstone' },
  { key:'belgium',   gp:'Gran Premio de Bélgica',     city:'Spa',            flag:'be', laps:44, length:7.004, distance:308.1, record:{time:'1:46.286',driver:'V. Bottas',year:2018},      firstGP:1950, slug:'spafrancorchamps' },
  { key:'hungary',   gp:'Gran Premio de Hungría',     city:'Budapest',       flag:'hu', laps:70, length:4.381, distance:306.6, record:{time:'1:16.627',driver:'L. Hamilton',year:2020},   firstGP:1986, slug:'hungaroring' },
  { key:'netherlands',gp:'Gran Premio de Países Bajos',city:'Zandvoort',    flag:'nl', laps:72, length:4.259, distance:306.6, record:{time:'1:11.097',driver:'M. Verstappen',year:2021},  firstGP:1952, slug:'zandvoort' },
  { key:'italy',     gp:'Gran Premio de Italia',      city:'Monza',          flag:'it', laps:53, length:5.793, distance:306.7, record:{time:'1:21.046',driver:'R. Barrichello',year:2004}, firstGP:1950, slug:'monza' },
  { key:'azerbaijan',gp:'Gran Premio de Azerbaiyán',  city:'Bakú',           flag:'az', laps:51, length:6.003, distance:306.0, record:{time:'1:43.009',driver:'C. Leclerc',year:2019},    firstGP:2016, slug:'baku' },
  { key:'singapore', gp:'Gran Premio de Singapur',    city:'Marina Bay',     flag:'sg', laps:62, length:4.940, distance:306.1, record:{time:'1:35.867',driver:'K. Magnussen',year:2023},  firstGP:2008, slug:'singapore' },
  { key:'usa',       gp:'Gran Premio de EEUU',        city:'Austin',         flag:'us', laps:56, length:5.513, distance:308.4, record:{time:'1:36.169',driver:'C. Leclerc',year:2019},    firstGP:2012, slug:'austin' },
  { key:'mexico',    gp:'Gran Premio de México',      city:'Ciudad de México',flag:'mx', laps:71, length:4.304, distance:305.4, record:{time:'1:17.774',driver:'V. Bottas',year:2021},     firstGP:1963, slug:'mexicocity' },
  { key:'brazil',    gp:'Gran Premio de Brasil',      city:'São Paulo',      flag:'br', laps:71, length:4.309, distance:305.9, record:{time:'1:10.540',driver:'R. Barrichello',year:2004}, firstGP:1973, slug:'interlagos' },
  { key:'lasvegas',  gp:'Gran Premio de Las Vegas',   city:'Las Vegas',      flag:'us', laps:50, length:6.201, distance:310.0, record:{time:'1:35.490',driver:'O. Piastri',year:2024},     firstGP:2023, slug:'lasvegas' },
  { key:'qatar',     gp:'Gran Premio de Qatar',       city:'Losail',         flag:'qa', laps:57, length:5.380, distance:306.6, record:{time:'1:24.319',driver:'M. Verstappen',year:2023},  firstGP:2021, slug:'lusail' },
  { key:'abudhabi',  gp:'Gran Premio de Abu Dhabi',   city:'Yas Marina',     flag:'ae', laps:58, length:5.281, distance:306.2, record:{time:'1:26.103',driver:'M. Verstappen',year:2021},  firstGP:2009, slug:'yasmarinacircuit' },
  { key:'saudi',     gp:'Gran Premio de Arabia Saudita',city:'Yeda',         flag:'sa', laps:50, length:6.174, distance:308.5, record:{time:'1:30.734',driver:'L. Hamilton',year:2021},   firstGP:2021, slug:'jeddah' },
  { key:'bahrain',   gp:'Gran Premio de Bahréin',     city:'Sakhir',         flag:'bh', laps:57, length:5.412, distance:308.2, record:{time:'1:31.447',driver:'P. de la Rosa',year:2005}, firstGP:2004, slug:'sakhir' },
]

function renderCircuitos() {
  // Map race short name → round number from the live calendar
  const NAME_TO_KEY = {
    'Australia':'australia','China':'china','Japón':'japan','Miami':'miami',
    'Canadá':'canada','Mónaco':'monaco','España':'spain','Austria':'austria',
    'Gran Bretaña':'britain','Bélgica':'belgium','Hungría':'hungary',
    'Países Bajos':'netherlands','Italia':'italy','Madrid':'madrid',
    'Azerbaiyán':'azerbaijan','Singapur':'singapore','EE.UU.':'usa',
    'México':'mexico','Brasil':'brazil','Las Vegas':'lasvegas',
    'Qatar':'qatar','Abu Dhabi':'abudhabi','Arabia Saudita':'saudi',
    'Bahrain':'bahrain',
  }
  const roundByKey = {}
  ;(appData.calendar || []).forEach(r => {
    const key = NAME_TO_KEY[r.name]
    if (key) roundByKey[key] = r.round
  })
  const sorted = [...CIRCUITS].sort((a, b) =>
    (roundByKey[a.key] ?? 999) - (roundByKey[b.key] ?? 999)
  )

  const cards = sorted.map(c => {
    const trackUrl = `${_CDN_TRACK}/2026track${c.slug}blackoutline.svg`
    const isNew  = c.firstGP === 2026
    const round  = roundByKey[c.key]
    return `
    <div class="circuit-card">
      <div class="circuit-card-header">
        ${round ? `<span class="circuit-round">R${round}</span>` : ''}
        ${flagImg(c.flag, 16)}
        <span class="circuit-card-gp">${c.gp}</span>
        ${isNew ? '<span class="circuit-new-badge">NUEVO</span>' : ''}
      </div>
      <div class="circuit-city">${c.city}</div>
      <div class="circuit-track-wrap">
        <img src="${trackUrl}" alt="${c.gp}" class="circuit-track-img" onerror="this.style.opacity='0'">
      </div>
      <div class="circuit-stats">
        <div class="circuit-stat">
          <span class="circuit-stat-label">Vueltas</span>
          <span class="circuit-stat-val">${c.laps}</span>
        </div>
        <div class="circuit-stat">
          <span class="circuit-stat-label">Longitud</span>
          <span class="circuit-stat-val">${c.length} km</span>
        </div>
        <div class="circuit-stat">
          <span class="circuit-stat-label">Distancia</span>
          <span class="circuit-stat-val">${c.distance} km</span>
        </div>
        <div class="circuit-stat">
          <span class="circuit-stat-label">1° GP</span>
          <span class="circuit-stat-val">${c.firstGP}</span>
        </div>
      </div>
      <div class="circuit-record">
        <span class="circuit-record-label">⏱ Récord de vuelta</span>
        <span class="circuit-record-time">${c.record.time}</span>
        <span class="circuit-record-driver">${c.record.driver} · ${c.record.year}</span>
      </div>
    </div>`
  }).join('')

  set(`
    <div class="section-title">CIRCUITOS</div>
    <div class="section-sub">Temporada 2026 — ${CIRCUITS.length} circuitos</div>
    <div class="circuits-grid">${cards}</div>
  `)
}

function renderReglamento() {
  const cards = [
    {
      icon: '⚡',
      title: 'Nueva Unidad de Potencia',
      body: 'El reglamento 2026 exige una división <strong>50/50</strong> entre motor de combustión interna (ICE) y motor eléctrico. La potencia total supera los <strong>1.000 CV</strong>. Mercedes es acusada de un sistema de compresión 18:1 bajo investigación de la FIA.',
      tag: 'Art. 5.2 — Power Unit',
    },
    {
      icon: '🛩️',
      title: 'Aerodinámica Activa',
      body: 'Las alas delanteras y traseras ahora son <strong>móviles y automáticas</strong>: modo "Z" (baja resistencia en recta) y modo "X" (máxima carga en curva). El piloto no controla la transición — la gestiona el propio auto.',
      tag: 'Art. 3.10 — Active Aero',
    },
    {
      icon: '🔩',
      title: 'Efecto Suelo Simplificado',
      body: 'Reducción del difusor trasero para bajar la dependencia del suelo. El objetivo es permitir más adelantamientos. Las cajas de cambios son <strong>homologadas</strong> y compartidas entre equipos del mismo proveedor.',
      tag: 'Art. 3.8 — Floor & Diffuser',
    },
    {
      icon: '🏎️',
      title: 'Nuevos Equipos 2026',
      body: '<strong>Audi</strong> (antiguo Sauber) debuta con motor propio tras adquirir la escudería. <strong>Cadillac</strong> entra como 11.º equipo en la parrilla con motor Ferrari. Ambos partieron desde cero en el nuevo reglamento.',
      tag: 'FIA Entry List 2026',
    },
    {
      icon: '💰',
      title: 'Techo de Gasto',
      body: 'El budget cap se fija en <strong>$140M USD</strong> para la temporada completa. Se excluyen los sueldos de los tres pilotos mejor pagados y gastos de marketing. La FIA añadió nuevos auditores independientes tras el caso Red Bull 2022.',
      tag: 'Financial Regulations',
    },
    {
      icon: '🏁',
      title: 'Formato Sprint 2026',
      body: 'Se mantienen <strong>6 fines de semana sprint</strong> en la temporada. El formato incluye calificación corta el viernes para definir la grilla del sprint. Los puntos del sprint van del 8 al 1 para los primeros 8 clasificados.',
      tag: 'Sporting Regulations Art. 17',
    },
  ]

  const html = cards.map(c => `
    <div class="reg-card">
      <div class="reg-icon">${c.icon}</div>
      <div class="reg-title">${c.title}</div>
      <div class="reg-body">${c.body}</div>
      <span class="reg-highlight">${c.tag}</span>
    </div>
  `).join('')

  const TYRES = [
    { code:'C1', name:'Hard',         color:'#FFFFFF', textColor:'#111', description:'El compuesto más duro. Mayor duración, menor agarre. Ideal para circuitos de alto desgaste como Silverstone o Barcelona.',       use:'Carreras de larga distancia sin paradas' },
    { code:'C2', name:'Hard',         color:'#FFFFFF', textColor:'#111', description:'Variante dura con rendimiento ligeramente superior al C1. Equilibrio entre degradación mínima y tiempos competitivos.',          use:'Estrategias de 1 stop en circuitos exigentes' },
    { code:'C3', name:'Medium',       color:'#FFD700', textColor:'#111', description:'Compuesto intermedio y el más versátil. Punto de equilibrio entre velocidad de vuelta y duración. Presente en todos los GPs.',   use:'Estrategias mixtas, stint de transición' },
    { code:'C4', name:'Soft',         color:'#E8002D', textColor:'#fff', description:'Alta temperatura de trabajo, máximo agarre. Se degrada rápido pero aporta el mayor rendimiento por vuelta en condiciones ideales.', use:'Clasificación y stints cortos de ataque' },
    { code:'C5', name:'Soft',         color:'#E8002D', textColor:'#fff', description:'El compuesto más blando. Máxima adherencia al asfalto, mínima durabilidad. Exclusivo para circuitos de baja exigencia.',          use:'Mónaco, calles, circuitos de baja abrasión' },
    { code:'INT', name:'Intermedio',  color:'#39B54A', textColor:'#fff', description:'La cubierta de lluvia ligera. Evacúa agua con surcos superficiales. Funciona en pista mojada pero sin charcos profundos.',        use:'Lluvia ligera o pista mixta húmeda/seca' },
    { code:'WET', name:'Lluvia',      color:'#0067FF', textColor:'#fff', description:'La cubierta de lluvia extrema (Full Wet). Evacuación de hasta 85 litros/seg a 300 km/h. Solo para condiciones de bandera roja.',   use:'Lluvia intensa, charcos, visibilidad reducida' },
  ]

  function tyreSVG(t) {
    const isLight = t.color === '#FFFFFF'
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="tyre-svg">
      <circle cx="60" cy="60" r="58" fill="#1c1c24" stroke="#2a2a38" stroke-width="1.5"/>
      <circle cx="60" cy="60" r="44" fill="${t.color}" opacity="${isLight ? '0.92' : '1'}"/>
      <circle cx="60" cy="60" r="30" fill="#111118"/>
      <circle cx="60" cy="60" r="28" fill="#0d0d14"/>
      ${isLight ? `<circle cx="60" cy="60" r="44" fill="none" stroke="#ccc" stroke-width="1"/>` : ''}
      <text x="60" y="54" text-anchor="middle" fill="${t.textColor}" font-size="${t.code.length > 2 ? '13' : '16'}" font-weight="900" font-family="JetBrains Mono,monospace">${t.code}</text>
      <text x="60" y="70" text-anchor="middle" fill="${t.textColor}" font-size="9" font-weight="700" font-family="Inter,sans-serif" opacity="0.8">${t.name.toUpperCase()}</text>
    </svg>`
  }

  const tyreCards = TYRES.map(t => `
    <div class="tyre-card">
      <div class="tyre-visual">${tyreSVG(t)}</div>
      <div class="tyre-info">
        <div class="tyre-name" style="color:${t.color === '#FFFFFF' ? '#e8e8e8' : t.color}">${t.name} ${t.code !== 'INT' && t.code !== 'WET' ? `<span class="tyre-code">${t.code}</span>` : ''}</div>
        <div class="tyre-desc">${t.description}</div>
        <div class="tyre-use">⚡ ${t.use}</div>
      </div>
    </div>
  `).join('')

  set(`
    <div class="section-title">REGLAMENTO 2026</div>
    <div class="section-sub">Principales cambios del nuevo reglamento técnico y deportivo</div>
    <div class="reg-grid">${html}</div>

    <div class="section-title" style="margin-top:40px">CUBIERTAS</div>
    <div class="section-sub">Compuestos Pirelli P Zero — Temporada 2026</div>
    <div class="tyre-grid">${tyreCards}</div>
  `)
}

// ── HISTORIA ──────────────────────────────────────────────────────

function renderHistoria() {
  const champions = appData.history || []
  if (!champions.length) {
    set(`<div class="section-title">HISTORIA</div><p style="color:var(--muted);text-align:center;margin-top:40px">No hay datos disponibles.</p>`)
    return
  }

  // Summary stats
  const titleCount = {}
  champions.forEach(c => { titleCount[c.name] = (titleCount[c.name] || 0) + 1 })
  const topDrivers = Object.entries(titleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const statCards = topDrivers.map(([name, titles]) => `
    <div class="hist-stat-card">
      <div class="hist-stat-num">${titles}</div>
      <div class="hist-stat-name">${name}</div>
      <div class="hist-stat-label">título${titles > 1 ? 's' : ''}</div>
    </div>
  `).join('')

  // Group by decade
  const byDecade = {}
  champions.forEach(c => {
    const decade = Math.floor(c.year / 10) * 10
    if (!byDecade[decade]) byDecade[decade] = []
    byDecade[decade].push(c)
  })

  const decadesHtml = Object.keys(byDecade)
    .sort((a, b) => b - a)
    .map(decade => {
      const rows = byDecade[decade].map(c => {
        const flagImg = c.flag
          ? `<img src="https://flagcdn.com/24x18/${c.flag}.png" alt="${c.nat}" class="hist-flag">`
          : `<span class="hist-flag-ph"></span>`
        return `
          <div class="hist-row">
            <div class="hist-year">${c.year}</div>
            <div class="hist-driver">
              ${flagImg}
              <span class="hist-name">${c.name}</span>
              <span class="hist-code">${c.code}</span>
            </div>
            <div class="hist-team">${c.team}</div>
            <div class="hist-pts">${c.pts} <span class="hist-pts-label">pts</span></div>
            <div class="hist-wins">${c.wins} <span class="hist-pts-label">vic</span></div>
          </div>
        `
      }).join('')
      return `
        <div class="hist-decade">
          <div class="hist-decade-label">${decade}s</div>
          <div class="hist-table">
            <div class="hist-header">
              <div class="hist-year">Año</div>
              <div class="hist-driver">Piloto</div>
              <div class="hist-team">Escudería</div>
              <div class="hist-pts">Puntos</div>
              <div class="hist-wins">Victorias</div>
            </div>
            ${rows}
          </div>
        </div>
      `
    }).join('')

  set(`
    <div class="section-title">HISTORIA</div>
    <div class="section-sub">Todos los campeones mundiales de Fórmula 1 — 1950 a 2025</div>

    <div class="hist-stats-row">
      <div class="hist-top-label">Más títulos</div>
      <div class="hist-stat-cards">${statCards}</div>
    </div>

    ${decadesHtml}
  `)
}

// ── Init ───────────────────────────────────────────────────────────

async function init() {
  try {
    await fetchAll()
    setupTabs()
    renderHeaderInfo()
    renderTab('resumen')
  } catch (err) {
    document.getElementById('main').innerHTML = `
      <div class="container">
        <div class="loading-state">
          <p style="color:var(--red)">Error al cargar datos: ${err.message}</p>
          <p style="color:var(--muted);font-size:12px">¿Está el servidor corriendo y la base de datos conectada?</p>
        </div>
      </div>
    `
  }
}

init()

// ── Team Modal ──────────────────────────────────────────────────────

const _CDN_CAR = 'https://media.formula1.com/image/upload/c_lfill,w_900/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000001/common/f1/2026'

const TEAM_DATA = {
  'Mercedes':     { slug:'mercedes',     founded:1954,  base:'Brackley, Reino Unido',       motor:'Mercedes-AMG',          titulos:8,  director:'Toto Wolff' },
  'Ferrari':      { slug:'ferrari',      founded:1950,  base:'Maranello, Italia',            motor:'Ferrari',               titulos:16, director:'Frédéric Vasseur' },
  'McLaren':      { slug:'mclaren',      founded:1966,  base:'Woking, Reino Unido',          motor:'Mercedes (cliente)',    titulos:8,  director:'Andrea Stella' },
  'Red Bull':     { slug:'redbullracing',founded:2005,  base:'Milton Keynes, Reino Unido',   motor:'Red Bull Powertrains',  titulos:6,  director:'Christian Horner' },
  'Alpine':       { slug:'alpine',       founded:2021,  base:'Enstone, Reino Unido',         motor:'Mercedes (cliente)',    titulos:2,  director:'Flavio Briatore' },
  'Haas':         { slug:'haasf1team',   founded:2016,  base:'Kannapolis, EEUU',             motor:'Ferrari (cliente)',     titulos:0,  director:'Ayao Komatsu' },
  'Racing Bulls': { slug:'racingbulls',  founded:2006,  base:'Faenza, Italia',               motor:'Red Bull Powertrains',  titulos:0,  director:'Laurent Mekies' },
  'Williams':     { slug:'williams',     founded:1977,  base:'Grove, Reino Unido',           motor:'Mercedes (cliente)',    titulos:7,  director:'James Vowles' },
  'Audi':         { slug:'audi',         founded:2026,  base:'Hinwil, Suiza',                motor:'Audi',                  titulos:0,  director:'Mattia Binotto' },
  'Aston Martin': { slug:'astonmartin',  founded:2021,  base:'Silverstone, Reino Unido',     motor:'Honda',                 titulos:0,  director:'Mike Krack' },
  'Cadillac':     { slug:'cadillac',     founded:2026,  base:'Concord, EEUU',                motor:'GM / Cadillac',         titulos:0,  director:'Por confirmar' },
}

function openTeamModal(teamName) {
  const td = TEAM_DATA[teamName]
  if (!td) return
  const color    = tc(teamName)
  const carUrl   = `${_CDN_CAR}/${td.slug}/2026${td.slug}carright.webp`
  const cons     = (appData.constructors || []).find(c => c.name === teamName)
  const pts      = cons?.pts  ?? '—'
  const pos      = cons?.pos  ?? '—'
  const wins     = cons?.wins ?? 0
  const d1       = cons?.driver1 || ''
  const d2       = cons?.driver2 || ''
  const isNew    = td.founded >= 2021

  document.getElementById('tmodal-body').innerHTML = `
    <div class="tmodal-inner">
      <div class="tmodal-car-wrap" style="border-top: 3px solid ${color}">
        <div class="tmodal-car-bg" style="background:radial-gradient(ellipse at center, ${color}18 0%, transparent 70%)"></div>
        <img src="${carUrl}" class="tmodal-car-img" alt="${teamName}" onerror="this.style.opacity='0.2'">
      </div>
      <div class="tmodal-info">
        <div class="tmodal-header">
          ${tl(teamName, 36)}
          <div>
            <div class="tmodal-name" style="color:${color}">${teamName}</div>
            ${isNew ? `<span class="tmodal-new-badge">NUEVA ESCUDERÍA ${td.founded}</span>` : ''}
          </div>
        </div>
        <div class="tmodal-stats">
          <div class="tmodal-stat">
            <span class="tmodal-stat-val" style="color:var(--gold)">${pts}</span>
            <span class="tmodal-stat-lbl">Puntos 2026</span>
          </div>
          <div class="tmodal-stat">
            <span class="tmodal-stat-val" style="color:var(--cyan)">P${pos}</span>
            <span class="tmodal-stat-lbl">Posición</span>
          </div>
          <div class="tmodal-stat">
            <span class="tmodal-stat-val">${wins}</span>
            <span class="tmodal-stat-lbl">Victorias</span>
          </div>
          <div class="tmodal-stat">
            <span class="tmodal-stat-val">${td.titulos}</span>
            <span class="tmodal-stat-lbl">Títulos históricos</span>
          </div>
        </div>
        <div class="tmodal-meta">
          <div class="tmodal-meta-row">
            <span class="tmodal-meta-lbl">Fundación</span>
            <span class="tmodal-meta-val">${td.founded}</span>
          </div>
          <div class="tmodal-meta-row">
            <span class="tmodal-meta-lbl">Sede</span>
            <span class="tmodal-meta-val">${td.base}</span>
          </div>
          <div class="tmodal-meta-row">
            <span class="tmodal-meta-lbl">Motor</span>
            <span class="tmodal-meta-val">${td.motor}</span>
          </div>
          <div class="tmodal-meta-row">
            <span class="tmodal-meta-lbl">Director</span>
            <span class="tmodal-meta-val">${td.director}</span>
          </div>
          ${d1 || d2 ? `<div class="tmodal-meta-row">
            <span class="tmodal-meta-lbl">Pilotos 2026</span>
            <span class="tmodal-meta-val">${[d1,d2].filter(Boolean).join(' · ')}</span>
          </div>` : ''}
        </div>
      </div>
    </div>
  `
  const modal = document.getElementById('team-modal')
  modal.style.display = 'flex'
  requestAnimationFrame(() => modal.classList.add('tmodal-open'))
}

function closeTeamModal(e) {
  if (e && e.target !== document.getElementById('team-modal')) return
  const modal = document.getElementById('team-modal')
  modal.classList.remove('tmodal-open')
  setTimeout(() => { modal.style.display = 'none' }, 220)
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDriverModal(); closeTeamModal() } })

// ── Driver Modal ────────────────────────────────────────────────────

const _CDN_LARGE = 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026'
const DRIVER_PHOTOS_LARGE = {
  'ANT': `${_CDN_LARGE}/mercedes/andant01/2026mercedesandant01right.webp`,
  'RUS': `${_CDN_LARGE}/mercedes/georus01/2026mercedesgeorus01right.webp`,
  'LEC': `${_CDN_LARGE}/ferrari/chalec01/2026ferrarichalec01right.webp`,
  'HAM': `${_CDN_LARGE}/ferrari/lewham01/2026ferrarilewham01right.webp`,
  'NOR': `${_CDN_LARGE}/mclaren/lannor01/2026mclarenlannor01right.webp`,
  'PIA': `${_CDN_LARGE}/mclaren/oscpia01/2026mclarenoscpia01right.webp`,
  'VER': `${_CDN_LARGE}/redbullracing/maxver01/2026redbullracingmaxver01right.webp`,
  'HAD': `${_CDN_LARGE}/redbullracing/isahad01/2026redbullracingisahad01right.webp`,
  'GAS': `${_CDN_LARGE}/alpine/piegas01/2026alpinepiegas01right.webp`,
  'COL': `${_CDN_LARGE}/alpine/fracol01/2026alpinefracol01right.webp`,
  'LAW': `${_CDN_LARGE}/racingbulls/lialaw01/2026racingbullslialaw01right.webp`,
  'LIN': `${_CDN_LARGE}/racingbulls/arvlin01/2026racingbullsarvlin01right.webp`,
  'BEA': `${_CDN_LARGE}/haasf1team/olibea01/2026haasf1teamolibea01right.webp`,
  'OCO': `${_CDN_LARGE}/haasf1team/estoco01/2026haasf1teamestoco01right.webp`,
  'SAI': `${_CDN_LARGE}/williams/carsai01/2026williamscarsai01right.webp`,
  'ALB': `${_CDN_LARGE}/williams/alealb01/2026williamsalealb01right.webp`,
  'HUL': `${_CDN_LARGE}/audi/nichul01/2026audinichul01right.webp`,
  'BOR': `${_CDN_LARGE}/audi/gabbor01/2026audigabbor01right.webp`,
  'BOT': `${_CDN_LARGE}/cadillac/valbot01/2026cadillacvalbot01right.webp`,
  'PER': `${_CDN_LARGE}/cadillac/serper01/2026cadillacserper01right.webp`,
  'ALO': `${_CDN_LARGE}/astonmartin/feralo01/2026astonmartinferalo01right.webp`,
  'STR': `${_CDN_LARGE}/astonmartin/lanstr01/2026astonmartinlanstr01right.webp`,
}

function openDriverModal(name) {
  const d = (appData.drivers || []).find(x => x.name === name)
  if (!d) return
  const color    = tc(d.team)
  const photo    = DRIVER_PHOTOS_LARGE[d.short] || ''
  const results  = appData.results || []
  const winsRace = results.filter(r => r.driver_name === d.name && r.race_type === 'race'   && r.pos === 1).length
  const winsSprint = results.filter(r => r.driver_name === d.name && r.race_type === 'sprint' && r.pos === 1).length
  const winsTotal  = winsRace + winsSprint
  const winsDetail = winsTotal === 0 ? '0'
    : winsSprint > 0 ? `${winsTotal} <span class="dmodal-wins-detail">(${winsRace} carr. + ${winsSprint} sprint)</span>`
    : `${winsTotal} <span class="dmodal-wins-detail">(${winsRace} carreras)</span>`

  document.getElementById('dmodal-body').innerHTML = `
    <div class="dmodal-inner" style="--dcolor:${color}">
      <div class="dmodal-photo-col">
        ${photo
          ? `<img src="${photo}" class="dmodal-photo" onerror="this.style.display='none'" alt="${d.name}">`
          : '<div class="dmodal-no-photo">🏎️</div>'}
        <div class="dmodal-num" style="color:${color}">#${d.number}</div>
      </div>
      <div class="dmodal-info">
        <div class="dmodal-team" style="color:${color}">${tl(d.team, 24)} ${d.team}</div>
        <div class="dmodal-name">${d.name}</div>
        <div class="dmodal-nat">${flagImg(d.flag, 18)} ${natES(d.nat)}</div>
        <div class="dmodal-stats">
          <div class="dmodal-stat">
            <span class="dmodal-stat-val" style="color:var(--gold)">${d.pts}</span>
            <span class="dmodal-stat-lbl">Puntos</span>
          </div>
          <div class="dmodal-stat">
            <span class="dmodal-stat-val" style="color:var(--cyan)">P${d.pos}</span>
            <span class="dmodal-stat-lbl">Posición</span>
          </div>
          <div class="dmodal-stat">
            <span class="dmodal-stat-val">${winsDetail}</span>
            <span class="dmodal-stat-lbl">Victorias 2026</span>
          </div>
        </div>
        <div class="dmodal-meta">
          <div class="dmodal-meta-row">
            <span class="dmodal-meta-lbl">Fecha de nacimiento</span>
            <span class="dmodal-meta-val">${d.born || '—'}</span>
          </div>
          <div class="dmodal-meta-row">
            <span class="dmodal-meta-lbl">Edad</span>
            <span class="dmodal-meta-val">${d.age || '—'} años</span>
          </div>
          <div class="dmodal-meta-row">
            <span class="dmodal-meta-lbl">Número</span>
            <span class="dmodal-meta-val">#${d.number}</span>
          </div>
          <div class="dmodal-meta-row">
            <span class="dmodal-meta-lbl">Código</span>
            <span class="dmodal-meta-val">${d.short}</span>
          </div>
        </div>
      </div>
    </div>
  `
  const modal = document.getElementById('driver-modal')
  modal.style.display = 'flex'
  requestAnimationFrame(() => modal.classList.add('dmodal-open'))
}

function closeDriverModal(e) {
  if (e && e.target !== document.getElementById('driver-modal')) return
  const modal = document.getElementById('driver-modal')
  modal.classList.remove('dmodal-open')
  setTimeout(() => { modal.style.display = 'none' }, 220)
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDriverModal() })

// ── Circuit modal ──────────────────────────────────────────────────

const KEY_TO_CAL_NAME = {
  'australia':'Australia','china':'China','japan':'Japón','miami':'Miami',
  'canada':'Canadá','monaco':'Mónaco','spain':'España','austria':'Austria',
  'britain':'Gran Bretaña','belgium':'Bélgica','hungary':'Hungría',
  'netherlands':'Países Bajos','italy':'Italia','madrid':'Madrid',
  'azerbaijan':'Azerbaiyán','singapore':'Singapur','usa':'EE.UU.',
  'mexico':'México','brazil':'Brasil','lasvegas':'Las Vegas',
  'qatar':'Qatar','abudhabi':'Abu Dhabi','saudi':'Arabia Saudita',
  'bahrain':'Bahrain',
}

function openCircuitModal(key) {
  const c = CIRCUITS.find(x => x.key === key)
  if (!c) return
  const trackUrl = `${_CDN_TRACK}/2026track${c.slug}blackoutline.svg`
  const isNew = c.firstGP === 2026
  const calName  = KEY_TO_CAL_NAME[key]
  const roundInfo = (appData.calendar || []).find(r => r.name === calName)
  const round  = roundInfo?.round
  const status = roundInfo?.status
  const winner = roundInfo?.winner

  document.getElementById('cmodal-body').innerHTML = `
    <div class="cmodal-inner">
      <div class="cmodal-header">
        <div class="cmodal-header-top">
          ${round ? `<span class="cmodal-round">R${round}</span>` : ''}
          ${flagImg(c.flag, 20)}
          ${isNew ? '<span class="circuit-new-badge">NUEVO</span>' : ''}
          ${status === 'done' && winner ? `<span class="cmodal-winner">🏆 ${winner}</span>` : ''}
          ${status === 'next' ? `<span class="cmodal-next">▶ Próxima</span>` : ''}
        </div>
        <div class="cmodal-gp">${c.gp}</div>
        <div class="cmodal-city">${c.city}${roundInfo?.date_str ? ` · <span class="cmodal-date">${fmtDate(roundInfo.date_str)}</span>` : ''}</div>
      </div>
      <div class="cmodal-track-wrap">
        <img src="${trackUrl}" alt="${c.gp}" class="cmodal-track-img" onerror="this.style.opacity='0'">
      </div>
      <div class="cmodal-stats">
        <div class="cmodal-stat">
          <div class="cmodal-stat-val">${c.laps}</div>
          <div class="cmodal-stat-label">Vueltas</div>
        </div>
        <div class="cmodal-stat">
          <div class="cmodal-stat-val">${c.length}</div>
          <div class="cmodal-stat-label">km / vuelta</div>
        </div>
        <div class="cmodal-stat">
          <div class="cmodal-stat-val">${c.distance}</div>
          <div class="cmodal-stat-label">km totales</div>
        </div>
        <div class="cmodal-stat">
          <div class="cmodal-stat-val">${c.firstGP}</div>
          <div class="cmodal-stat-label">1° GP</div>
        </div>
      </div>
      <div class="cmodal-record">
        <span class="cmodal-record-label">⏱ Récord de vuelta</span>
        <span class="cmodal-record-time">${c.record.time}</span>
        <span class="cmodal-record-driver">${c.record.driver} · ${c.record.year}</span>
      </div>
    </div>
  `
  document.getElementById('circuit-modal').style.display = 'flex'
  document.body.style.overflow = 'hidden'
}

function closeCircuitModal(e) {
  if (e && e.target !== document.getElementById('circuit-modal')) return
  document.getElementById('circuit-modal').style.display = 'none'
  document.body.style.overflow = ''
}

document.addEventListener('click', e => {
  const circuitEl = e.target.closest('[data-circuit-key]')
  if (circuitEl) { openCircuitModal(circuitEl.dataset.circuitKey); return }
  const teamEl = e.target.closest('[data-team]')
  if (teamEl) { openTeamModal(teamEl.dataset.team); return }
  const activeTab = document.querySelector('.tab.active')?.dataset.tab
  if (activeTab === 'evolucion') return
  const driverEl = e.target.closest('[data-driver]')
  if (driverEl) openDriverModal(driverEl.dataset.driver)
})
