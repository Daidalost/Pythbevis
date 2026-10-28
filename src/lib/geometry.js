// Figurens mål i "ruder" (1 enhed = 1 tern på papiret).
// Kateterne er forskellige, så eleven skal holde styr på, hvilken vej trekanten vender.
export const A = 2 // katete a
export const B = 3 // katete b
export const S = A + B // det store kvadrats side

// Trekantens tyngdepunkt (rotationspunkt) i forhold til den rette vinkel
export const G = [A / 3, B / 3]

// Hjørner relativt til tyngdepunktet: ret vinkel, ende af a, ende af b
export const LOCAL = [
  [0, 0],
  [A, 0],
  [0, B],
].map(([x, y]) => [x - G[0], y - G[1]])

export function rot([x, y], deg) {
  const t = (deg * Math.PI) / 180
  const c = Math.round(Math.cos(t) * 1e9) / 1e9
  const s = Math.round(Math.sin(t) * 1e9) / 1e9
  return [x * c - y * s, x * s + y * c]
}

export const norm = (deg) => ((deg % 360) + 360) % 360

// De fire pladser i skabelonen: trekanten i hjørne k er drejet k·90°
const CORNERS = [
  [0, 0],
  [S, 0],
  [S, S],
  [0, S],
]
export const SLOTS = CORNERS.map((c, k) => {
  const g = rot(G, 90 * k)
  return { rot: 90 * k, cx: c[0] + g[0], cy: c[1] + g[1] }
})

// Det lille kvadrat (dannes af hypotenuserne)
export const INNER = [
  [A, 0],
  [S, A],
  [S - A, S],
  [0, S - A],
]
