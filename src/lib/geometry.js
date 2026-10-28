// Figurens mål i "tern" (1 enhed = 1 tern på papiret). SVG: x mod højre, y nedad.
// Kateterne er forskellige, så eleven skal holde styr på, hvilken vej trekanten vender.
export const A = 2 // katete a (lodret i trekant ABC)
export const B = 3 // katete b (grundlinjen i trekant ABC)
export const S = A + B // det store kvadrats side

// Trekant ABC i grundstilling: ret vinkel i C, grundlinjen b går mod venstre til A,
// kateten a går op til B. Koordinater i forhold til C.
const C0 = [0, 0]
const A0 = [-B, 0]
const B0 = [0, -A]

// Tyngdepunktet er rotationspunkt
export const G = [(C0[0] + A0[0] + B0[0]) / 3, (C0[1] + A0[1] + B0[1]) / 3]
const rel = ([x, y]) => [x - G[0], y - G[1]]

// Hjørner relativt til tyngdepunktet
export const VERT = { C: rel(C0), A: rel(A0), B: rel(B0) }
export const LOCAL = [VERT.C, VERT.A, VERT.B]

export function rot([x, y], deg) {
  const t = (deg * Math.PI) / 180
  const c = Math.round(Math.cos(t) * 1e9) / 1e9
  const s = Math.round(Math.sin(t) * 1e9) / 1e9
  return [x * c - y * s, x * s + y * c]
}

export const norm = (deg) => ((deg % 360) + 360) % 360

// De fire pladser: trekanten i plads k er drejet k·90° med uret.
// Plads 0 er trekant ABC nederst til højre, som ligger der fra start.
const CORNERS = [
  [S, S],
  [0, S],
  [0, 0],
  [S, 0],
]
export const SLOTS = CORNERS.map((c, k) => {
  const g = rot([-G[0], -G[1]], 90 * k)
  return { rot: 90 * k, cx: c[0] - g[0], cy: c[1] - g[1] }
})

// Det lille kvadrat (dannes af hypotenuserne)
export const INNER = [
  [B, 0],
  [S, B],
  [A, S],
  [0, A],
]
