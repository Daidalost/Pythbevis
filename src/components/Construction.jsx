import { useEffect, useRef, useState } from 'react'
import { A, B, S, LOCAL, SLOTS, INNER, norm } from '../lib/geometry.js'

// Startpladser (tyngdepunkter): til højre for skabelonen – eller under den på smalle skærme
const LAYOUTS = {
  wide: {
    tray: [[7.3, 1.1], [11.0, 1.1], [7.3, 4.8], [11.0, 4.8]],
    vb: [-1, -1.3, 14.4, 8.5],
  },
  tall: {
    tray: [[0.9, 7.9], [4.7, 7.9], [0.9, 11.5], [4.7, 11.5]],
    vb: [-1.3, -1.3, 8.1, 15.1],
  },
}
const pickLayout = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(max-width: 560px)').matches ? LAYOUTS.tall : LAYOUTS.wide
const VB_DONE = [-1.2, -1.2, 7.4, 7.4]
const SNAP = 1.6 // så tæt skal tyngdepunktet være på pladsen (når trekanten vender rigtigt)
const WARN = 1.4 // tæt på en plad, men vender forkert

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Højst to forskellige startvinkler – så skal mindst to trekanter drejes
function randomRots() {
  let r
  do r = Array.from({ length: 4 }, () => 90 * Math.floor(Math.random() * 4))
  while (new Set(r).size > 2)
  return r
}
function makePieces(layout) {
  const r = randomRots()
  return layout.tray.map(([cx, cy], i) => ({ id: i, cx, cy, rot: r[i], slot: null }))
}

function snap(pieces, id) {
  const p = pieces.find((q) => q.id === id)
  if (!p || p.slot !== null) return { pieces, result: 'none' }
  const taken = new Set(pieces.filter((q) => q.slot !== null).map((q) => q.slot))
  let best = null
  SLOTS.forEach((s, k) => {
    if (taken.has(k)) return
    const d = Math.hypot(p.cx - s.cx, p.cy - s.cy)
    if (norm(p.rot) === s.rot && d < SNAP && (!best || d < best.d)) best = { k, d }
  })
  if (best) {
    const s = SLOTS[best.k]
    return {
      pieces: pieces.map((q) => (q.id === id ? { ...q, cx: s.cx, cy: s.cy, slot: best.k } : q)),
      result: 'snap',
    }
  }
  const near = SLOTS.some((s, k) => !taken.has(k) && Math.hypot(p.cx - s.cx, p.cy - s.cy) < WARN)
  return { pieces, result: near ? 'turn' : 'none' }
}

// Sidebetegnelser i trekantens eget koordinatsystem
const OFF = 0.36
const [V0, V1, V2] = LOCAL
const C = Math.hypot(A, B)
const LABELS = [
  { t: 'a', x: (V0[0] + V1[0]) / 2, y: V0[1] - OFF },
  { t: 'b', x: V0[0] - OFF, y: (V0[1] + V2[1]) / 2 },
  { t: 'c', x: (V1[0] + V2[0]) / 2 + (B / C) * OFF, y: (V1[1] + V2[1]) / 2 + (A / C) * OFF },
]
const RA = 0.3 // den rette vinkels markering
const RIGHT_ANGLE = `M${V0[0] + RA} ${V0[1]} V${V0[1] + RA} H${V0[0]}`
const POINTS = LOCAL.map((p) => p.join(',')).join(' ')

export default function Construction({ step, onComplete }) {
  const [layout] = useState(pickLayout)
  const VB_START = layout.vb
  const [pieces, setPieces] = useState(() => makePieces(layout))
  const [sel, setSel] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [msg, setMsg] = useState(null)
  const [vb, setVb] = useState(VB_START)

  const svgRef = useRef(null)
  const dragRef = useRef(null)
  const tapRef = useRef({ id: null, t: 0 })
  const piecesRef = useRef(pieces)
  piecesRef.current = pieces
  const vbRef = useRef(vb)
  vbRef.current = vb

  const placed = pieces.filter((p) => p.slot !== null).length
  const complete = placed === 4

  // Når figuren er samlet: zoom ind på kvadratet og gå videre til trin 2
  useEffect(() => {
    if (!complete) return
    setSel(null)
    setMsg(null)
    onComplete?.()
    const from = [...vbRef.current]
    if (reduceMotion()) {
      setVb(VB_DONE)
      return
    }
    const t0 = performance.now() + 350
    const dur = 900
    let raf
    const tick = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0) / dur))
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      setVb(from.map((f, i) => f + (VB_DONE[i] - f) * e))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete])

  function toSvg(e) {
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    if (!m) return [0, 0]
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const r = pt.matrixTransform(m.inverse())
    return [r.x, r.y]
  }

  const clampX = (x) => Math.min(VB_START[0] + VB_START[2] - 0.4, Math.max(VB_START[0] + 0.4, x))
  const clampY = (y) => Math.min(VB_START[1] + VB_START[3] - 0.4, Math.max(VB_START[1] + 0.4, y))

  function rotate(id, delta) {
    if (id === null) return
    const ps = piecesRef.current.map((q) => (q.id === id && q.slot === null ? { ...q, rot: q.rot + delta } : q))
    const r = snap(ps, id)
    setPieces(r.pieces)
    if (r.result === 'snap') setSel(null)
    setMsg(null)
  }

  function tryPlace(id) {
    const r = snap(piecesRef.current, id)
    if (r.result === 'snap') {
      setPieces(r.pieces)
      setSel(null)
      setMsg(null)
    } else if (r.result === 'turn') {
      setMsg('Trekanten vender forkert her. Drej den, og prøv igen.')
    }
  }

  function onPieceDown(e, p) {
    if (p.slot !== null || complete) return
    e.preventDefault()
    e.stopPropagation()
    const [x, y] = toSvg(e)
    dragRef.current = { id: p.id, dx: x - p.cx, dy: y - p.cy, sx: x, sy: y, moved: false, pid: e.pointerId }
    svgRef.current?.setPointerCapture?.(e.pointerId)
    setSel(p.id)
    setMsg(null)
  }

  function onMove(e) {
    const d = dragRef.current
    if (!d || e.pointerId !== d.pid) return
    const [x, y] = toSvg(e)
    if (!d.moved && Math.hypot(x - d.sx, y - d.sy) > 0.08) {
      d.moved = true
      setDraggingId(d.id)
    }
    if (!d.moved) return
    const cx = clampX(x - d.dx)
    const cy = clampY(y - d.dy)
    setPieces((ps) => ps.map((q) => (q.id === d.id ? { ...q, cx, cy } : q)))
  }

  function onUp(e) {
    const d = dragRef.current
    if (!d || e.pointerId !== d.pid) return
    dragRef.current = null
    setDraggingId(null)
    if (!d.moved) {
      // Dobbelttryk drejer trekanten
      const now = performance.now()
      if (tapRef.current.id === d.id && now - tapRef.current.t < 400) {
        tapRef.current = { id: null, t: 0 }
        rotate(d.id, 90)
      } else {
        tapRef.current = { id: d.id, t: now }
      }
      return
    }
    tryPlace(d.id)
  }

  function onKey(e, p) {
    if (p.slot !== null) return
    const stepLen = e.shiftKey ? 1 : 0.25
    let dx = 0
    let dy = 0
    switch (e.key) {
      case 'ArrowLeft': dx = -stepLen; break
      case 'ArrowRight': dx = stepLen; break
      case 'ArrowUp': dy = -stepLen; break
      case 'ArrowDown': dy = stepLen; break
      case 'r':
      case 'R':
        e.preventDefault()
        rotate(p.id, e.shiftKey ? -90 : 90)
        return
      case 'Enter':
      case ' ':
        e.preventDefault()
        tryPlace(p.id)
        return
      default:
        return
    }
    e.preventDefault()
    setPieces((ps) => ps.map((q) => (q.id === p.id ? { ...q, cx: clampX(q.cx + dx), cy: clampY(q.cy + dy) } : q)))
  }

  function reshuffle() {
    setPieces(makePieces(layout))
    setSel(null)
    setMsg(null)
  }

  // Tegnerækkefølge: placerede nederst, den valgte/trukne øverst
  const ordered = [...pieces].sort((p, q) => {
    const rank = (x) => (x.slot !== null ? 0 : x.id === draggingId ? 3 : x.id === sel ? 2 : 1)
    return rank(p) - rank(q)
  })

  const selPiece = pieces.find((p) => p.id === sel)
  const canRotate = !!selPiece && selPiece.slot === null
  const innerLit = complete && (step === 2 || step >= 5)
  const showC2 = step > 2
  const showTri = step > 4

  return (
    <div className="construction">
      <svg
        ref={svgRef}
        className={`figure${draggingId !== null ? ' is-dragging' : ''}${complete ? ' is-complete' : ''}`}
        viewBox={vb.join(' ')}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerDown={(e) => {
          if (e.target === svgRef.current || e.target.dataset.bg) setSel(null)
        }}
        role="group"
        aria-label="Figur: fire retvinklede trekanter og en skabelon med to kvadrater"
      >
        <defs>
          <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M1 0H0V1" fill="none" className="grid-line" />
          </pattern>
          <filter id="lift" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0.05" dy="0.12" stdDeviation="0.08" floodColor="#1F2D3D" floodOpacity="0.28" />
          </filter>
        </defs>
        <rect data-bg="1" x="-20" y="-20" width="60" height="60" fill="url(#grid)" />

        {/* Skabelonen: det store og det lille kvadrat */}
        <polygon className={`inner${innerLit ? ' is-lit' : ''}`} points={INNER.map((p) => p.join(',')).join(' ')} />
        <rect className="outer" x="0" y="0" width={S} height={S} />

        {ordered.map((p) => {
          const cls = [
            'piece',
            p.slot !== null && 'is-placed',
            p.id === sel && 'is-selected',
            p.id === draggingId && 'is-lifted',
            step === 4 && complete && (p.slot === 0 ? 'is-focus' : 'is-dim'),
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <g
              key={p.id}
              className={cls}
              style={{ transform: `translate(${p.cx}px, ${p.cy}px) rotate(${p.rot}deg)` }}
              filter={p.id === draggingId ? 'url(#lift)' : undefined}
              tabIndex={p.slot === null && !complete ? 0 : -1}
              role={p.slot === null ? 'button' : undefined}
              aria-label={
                p.slot === null
                  ? `Trekant ${p.id + 1}. Flyt med piletasterne, drej med R, placér med Enter.`
                  : `Trekant ${p.id + 1}, på plads`
              }
              onPointerDown={(e) => onPieceDown(e, p)}
              onKeyDown={(e) => onKey(e, p)}
              onFocus={() => p.slot === null && setSel(p.id)}
            >
              <polygon className="tri" points={POINTS} />
              <path className="right-angle" d={RIGHT_ANGLE} />
              {LABELS.map((l) => (
                <g key={l.t} style={{ transform: `translate(${l.x}px, ${l.y}px) rotate(${-p.rot}deg)` }}>
                  <text className={`side-label side-${l.t}`}>{l.t}</text>
                </g>
              ))}
            </g>
          )
        })}

        {step === 3 && complete && <rect className="outer-lit" x="0" y="0" width={S} height={S} />}

        {showC2 && (
          <text className="area-label" x={S / 2} y={S / 2}>
            <tspan className="m">c</tspan>
            <tspan className="sup" dy="-0.2">2</tspan>
          </text>
        )}
        {showTri &&
          SLOTS.map((s, k) => (
            <text key={k} className="area-label small" x={s.cx} y={s.cy}>
              ½<tspan className="m">ab</tspan>
            </text>
          ))}
      </svg>

      {!complete && (
        <>
          <div className="toolbar">
            <button type="button" onClick={() => rotate(sel, -90)} disabled={!canRotate}>
              <span aria-hidden="true">↺</span> Drej mod uret
            </button>
            <button type="button" onClick={() => rotate(sel, 90)} disabled={!canRotate}>
              <span aria-hidden="true">↻</span> Drej med uret
            </button>
            <span className="count">{placed} af 4 på plads</span>
            <button type="button" className="quiet" onClick={reshuffle}>
              Bland trekanterne
            </button>
          </div>
          <p className="fig-msg" role="status" aria-live="polite">
            {msg || (canRotate ? 'Trekanten er markeret.' : 'Markér en trekant for at dreje den.')}
          </p>
        </>
      )}
    </div>
  )
}
