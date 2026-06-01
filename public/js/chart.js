/* ── F1 2026 — SVG Line Chart ─────────────────────────────────── */

function buildChart(container, racePoints, drivers, mode, completedRaces) {
  const RACES_KEYS   = (completedRaces || []).map(r => r.key)
  const RACES_LABEL  = (completedRaces || []).map(r => r.label)
  const RACES_FLAG   = (completedRaces || []).map(r => r.flag || '')
  const RACES_SPRINT = (completedRaces || []).map(r => r.has_sprint || false)
  if (!RACES_KEYS.length) {
    container.innerHTML = '<p style="color:var(--muted);padding:20px">Sin carreras completadas aún.</p>'
    return
  }
  container.innerHTML = ''

  const driverTeamMap = {}
  if (drivers) drivers.forEach(d => { driverTeamMap[d.name] = d.team })

  const sorted = [...racePoints].sort((a, b) => {
    const ta = RACES_KEYS.reduce((s, k) => s + (a[k] || 0), 0)
    const tb = RACES_KEYS.reduce((s, k) => s + (b[k] || 0), 0)
    return tb - ta
  })

  const series = sorted.map(row => {
    const perRace   = RACES_KEYS.map(k => row[k] || 0)
    const perRaceR  = RACES_KEYS.map(k => row[k + '_r'] || 0)
    const perRaceS  = RACES_KEYS.map(k => row[k + '_s'] || 0)
    let pts
    if (mode === 'cumulative') {
      let cum = 0
      pts = perRace.map(p => (cum += p))
    } else {
      pts = perRace
    }
    const team = driverTeamMap[row.driver_name] || ''
    return { driver: row.driver_name, pts, ptsR: perRaceR, ptsS: perRaceS, team, color: teamColor(team) }
  })

  const allPts = series.flatMap(s => s.pts)
  const maxVal = Math.max(...allPts, 1)
  const minVal = 0

  const W = 800, H = 360
  const padL = 48, padR = 130, padT = 24, padB = 60
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const xScale = i => {
    if (RACES_KEYS.length <= 1) return padL + innerW / 2
    return padL + (i / (RACES_KEYS.length - 1)) * innerW
  }
  const yScale = v => padT + innerH - ((v - minVal) / (maxVal - minVal || 1)) * innerH

  // Custom HTML tooltip (replaces native <title> so it can be styled)
  let tip = container.querySelector('#chart-tip')
  if (!tip) {
    tip = document.createElement('div')
    tip.id = 'chart-tip'
    container.appendChild(tip)
  }
  const hideTip = () => { tip.style.display = 'none' }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.setAttribute('id', 'chart-svg')
  svg.style.width = '100%'
  svg.style.maxWidth = `${W}px`
  svg.style.height = 'auto'

  // Sprint background bands — dibujadas primero, detrás de todo
  RACES_SPRINT.forEach((isSprint, i) => {
    if (!isSprint) return
    const x = xScale(i)
    const band = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    band.setAttribute('x', x - 14); band.setAttribute('y', padT)
    band.setAttribute('width', 28); band.setAttribute('height', innerH)
    band.setAttribute('fill', 'rgba(255,215,0,0.07)')
    svg.appendChild(band)
  })

  // Grid lines + Y labels
  const gridSteps = 5
  for (let i = 0; i <= gridSteps; i++) {
    const v = minVal + (i / gridSteps) * maxVal
    const y = yScale(v)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', padL); line.setAttribute('x2', W - padR)
    line.setAttribute('y1', y);   line.setAttribute('y2', y)
    line.setAttribute('stroke', '#2a2a38'); line.setAttribute('stroke-width', '1')
    svg.appendChild(line)
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    lbl.setAttribute('x', padL - 6); lbl.setAttribute('y', y + 4)
    lbl.setAttribute('text-anchor', 'end')
    lbl.setAttribute('fill', '#666680'); lbl.setAttribute('font-size', '10')
    lbl.setAttribute('font-family', 'JetBrains Mono, monospace')
    lbl.textContent = Math.round(v)
    svg.appendChild(lbl)
  }

  // X axis labels + vertical guides + flags
  RACES_LABEL.forEach((lbl, i) => {
    const x = xScale(i)
    const guide = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    guide.setAttribute('x1', x); guide.setAttribute('x2', x)
    guide.setAttribute('y1', padT); guide.setAttribute('y2', padT + innerH)
    guide.setAttribute('stroke', '#1a1a24'); guide.setAttribute('stroke-width', '1')
    svg.appendChild(guide)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', x); text.setAttribute('y', H - padB + 16)
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('fill', '#666680'); text.setAttribute('font-size', '11')
    text.setAttribute('font-family', 'JetBrains Mono, monospace')
    text.textContent = lbl
    svg.appendChild(text)

    const flagCode = RACES_FLAG[i]
    if (flagCode) {
      const fw = 26, fh = 16
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      img.setAttribute('href', `https://flagcdn.com/w40/${flagCode}.png`)
      img.setAttribute('x', x - fw / 2)
      img.setAttribute('y', H - padB + 22)
      img.setAttribute('width', fw)
      img.setAttribute('height', fh)
      img.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      svg.appendChild(img)
    }

    if (RACES_SPRINT[i]) {
      const bw = 26, bh = 11
      const pill = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      pill.setAttribute('x', x - bw / 2); pill.setAttribute('y', H - padB + 41)
      pill.setAttribute('width', bw); pill.setAttribute('height', bh)
      pill.setAttribute('rx', 3)
      pill.setAttribute('fill', 'rgba(255,215,0,0.18)')
      svg.appendChild(pill)
      const st = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      st.setAttribute('x', x); st.setAttribute('y', H - padB + 50)
      st.setAttribute('text-anchor', 'middle')
      st.setAttribute('fill', '#FFD700')
      st.setAttribute('font-size', '7.5')
      st.setAttribute('font-weight', '700')
      st.setAttribute('font-family', 'JetBrains Mono, monospace')
      st.setAttribute('letter-spacing', '0.5')
      st.textContent = 'SPRINT'
      svg.appendChild(st)
    }
  })

  // Lines + dots
  series.forEach(s => {
    const d = s.pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(v)}`).join(' ')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('stroke', s.color)
    path.setAttribute('stroke-width', '2.5')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    svg.appendChild(path)

    s.pts.forEach((v, i) => {
      const cx = xScale(i), cy = yScale(v)

      // Gold outer ring for sprint weekends where driver scored sprint points
      if (RACES_SPRINT[i] && s.ptsS[i] > 0) {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        ring.setAttribute('cx', cx); ring.setAttribute('cy', cy); ring.setAttribute('r', '7')
        ring.setAttribute('fill', 'none')
        ring.setAttribute('stroke', '#FFD700')
        ring.setAttribute('stroke-width', '1.5')
        ring.setAttribute('stroke-opacity', '0.7')
        svg.appendChild(ring)
      }

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.setAttribute('r', '4')
      dot.setAttribute('fill', s.color); dot.setAttribute('stroke', '#0a0a0f')
      dot.setAttribute('stroke-width', '2')
      dot.style.cursor = 'pointer'

      dot.addEventListener('mousemove', e => {
        const rect = container.getBoundingClientRect()
        const raceVal = mode === 'cumulative'
          ? s.pts[i] - (i > 0 ? s.pts[i - 1] : 0)
          : v

        let html = `<div class="tip-driver" style="color:${s.color}">${s.driver} — ${RACES_LABEL[i]}</div>`

        if (RACES_SPRINT[i] && (s.ptsR[i] > 0 || s.ptsS[i] > 0)) {
          html += `<div class="tip-row">
            <span class="tip-dot" style="background:${s.color}"></span>
            <span style="color:${s.color}">Carrera: <strong>${s.ptsR[i]} pts</strong></span>
          </div>`
          html += `<div class="tip-row">
            <span class="tip-dot" style="background:#FFD700"></span>
            <span style="color:#FFD700">Sprint: <strong>${s.ptsS[i]} pts</strong></span>
          </div>`
          html += `<div style="margin-top:5px;padding-top:5px;border-top:1px solid #2a2a38;color:#999;font-size:10px">
            Total: ${raceVal} pts${mode === 'cumulative' ? `  ·  acum. ${v}` : ''}
          </div>`
        } else {
          html += `<div class="tip-row">
            <span class="tip-dot" style="background:${s.color}"></span>
            <span style="color:${s.color}"><strong>${raceVal} pts</strong>${mode === 'cumulative' ? `<span style="color:#666680;font-size:10px">  ·  acum. ${v}</span>` : ''}</span>
          </div>`
        }

        tip.style.setProperty('--chart-tip-color', s.color)
        tip.innerHTML = html
        tip.style.display = 'block'

        let left = e.clientX - rect.left + 14
        let top  = e.clientY - rect.top  - 10
        // keep within container horizontally
        const tipW = tip.offsetWidth
        if (left + tipW > rect.width - 8) left = e.clientX - rect.left - tipW - 14
        tip.style.left = left + 'px'
        tip.style.top  = top  + 'px'
      })
      dot.addEventListener('mouseleave', hideTip)

      svg.appendChild(dot)
    })
  })

  // End labels — compute, de-overlap, render with connector
  const lastIdx = RACES_KEYS.length - 1
  const xEnd    = xScale(lastIdx)

  const labelData = series.map(s => ({
    color: s.color,
    text:  driverLabel(s.driver),
    dotY:  yScale(s.pts[lastIdx]),
    y:     yScale(s.pts[lastIdx]),
  }))

  // Iterative de-overlap: push overlapping labels apart
  labelData.sort((a, b) => a.y - b.y)
  const minGap = 14
  for (let iter = 0; iter < 30; iter++) {
    for (let i = 1; i < labelData.length; i++) {
      const gap = labelData[i].y - labelData[i - 1].y
      if (gap < minGap) {
        const push = (minGap - gap) / 2
        labelData[i - 1].y -= push
        labelData[i].y     += push
      }
    }
  }
  // Clamp within chart area
  labelData.forEach(lp => {
    lp.y = Math.max(padT + 6, Math.min(padT + innerH, lp.y))
  })

  labelData.forEach(lp => {
    // Connector line when label moved more than 3px from actual dot
    if (Math.abs(lp.y - lp.dotY) > 3) {
      const conn = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      conn.setAttribute('x1', xEnd + 5);  conn.setAttribute('y1', lp.dotY)
      conn.setAttribute('x2', xEnd + 11); conn.setAttribute('y2', lp.y)
      conn.setAttribute('stroke', lp.color)
      conn.setAttribute('stroke-width', '1')
      conn.setAttribute('stroke-opacity', '0.45')
      svg.appendChild(conn)
    }

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', xEnd + 13)
    text.setAttribute('y', lp.y + 4)
    text.setAttribute('fill', lp.color)
    text.setAttribute('font-size', '11')
    text.setAttribute('font-family', 'Inter, sans-serif')
    text.setAttribute('font-weight', '700')
    text.textContent = lp.text
    svg.appendChild(text)
  })

  svg.addEventListener('mouseleave', hideTip)

  // Touch support: deslizar el dedo muestra el tooltip del punto más cercano
  const showTipAt = (clientX, clientY) => {
    const svgRect = svg.getBoundingClientRect()
    const touchX  = (clientX - svgRect.left) / svgRect.width  * W
    const touchY  = (clientY - svgRect.top)  / svgRect.height * H

    let nearestI = 0, minDX = Infinity
    for (let i = 0; i < RACES_KEYS.length; i++) {
      const d = Math.abs(xScale(i) - touchX)
      if (d < minDX) { minDX = d; nearestI = i }
    }

    let nearestS = series[0], minDY = Infinity
    series.forEach(s => {
      const d = Math.abs(yScale(s.pts[nearestI]) - touchY)
      if (d < minDY) { minDY = d; nearestS = s }
    })

    const s = nearestS, i = nearestI, v = s.pts[i]
    const raceVal = mode === 'cumulative' ? s.pts[i] - (i > 0 ? s.pts[i - 1] : 0) : v

    let html = `<div class="tip-driver" style="color:${s.color}">${s.driver} — ${RACES_LABEL[i]}</div>`
    if (RACES_SPRINT[i] && (s.ptsR[i] > 0 || s.ptsS[i] > 0)) {
      html += `<div class="tip-row"><span class="tip-dot" style="background:${s.color}"></span><span style="color:${s.color}">Carrera: <strong>${s.ptsR[i]} pts</strong></span></div>`
      html += `<div class="tip-row"><span class="tip-dot" style="background:#FFD700"></span><span style="color:#FFD700">Sprint: <strong>${s.ptsS[i]} pts</strong></span></div>`
      html += `<div style="margin-top:5px;padding-top:5px;border-top:1px solid #2a2a38;color:#999;font-size:10px">Total: ${raceVal} pts${mode === 'cumulative' ? `  ·  acum. ${v}` : ''}</div>`
    } else {
      html += `<div class="tip-row"><span class="tip-dot" style="background:${s.color}"></span><span style="color:${s.color}"><strong>${raceVal} pts</strong>${mode === 'cumulative' ? `<span style="color:#666680;font-size:10px">  ·  acum. ${v}</span>` : ''}</span></div>`
    }

    const rect = container.getBoundingClientRect()
    tip.innerHTML = html
    tip.style.display = 'block'
    let left = clientX - rect.left + 14
    let top  = clientY - rect.top  - 10
    if (left + tip.offsetWidth > rect.width - 8) left = clientX - rect.left - tip.offsetWidth - 14
    tip.style.left = left + 'px'
    tip.style.top  = top  + 'px'
  }

  svg.addEventListener('touchmove', e => {
    e.preventDefault()
    showTipAt(e.touches[0].clientX, e.touches[0].clientY)
  }, { passive: false })
  svg.addEventListener('touchend', hideTip)

  container.appendChild(svg)

  // Legend below chart
  const legend = document.createElement('div')
  legend.className = 'chart-legend'
  series.forEach(s => {
    const item = document.createElement('div')
    item.className = 'legend-item'
    item.innerHTML = `<span class="legend-line" style="background:${s.color}"></span>${s.driver}`
    legend.appendChild(item)
  })
  container.appendChild(legend)
}

// "Andrea Kimi Antonelli" → "A. Antonelli", "George Russell" → "G. Russell"
function driverLabel(fullName) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  return parts[0][0] + '. ' + parts[parts.length - 1]
}

function teamColor(team) {
  const COLORS = {
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
  return COLORS[team] || '#666680'
}
