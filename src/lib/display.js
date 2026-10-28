// Gør et svar klar til blokken: venstreside og højreside hver for sig,
// så lighedstegnene kan stå under hinanden. Ligninger vendes, så c² står til venstre.
import { parseInput, toLatex, toPoly, polyEqual, poly } from './expr.js'

const C2 = poly('c^2')

const isC2 = (node) => {
  try {
    return polyEqual(toPoly(node), C2)
  } catch {
    return false
  }
}

/** Returnerer { lhs, rhs } som LaTeX – eller null, hvis svaret (endnu) ikke kan læses. */
export function displayParts(step, src) {
  if (!src || !src.trim()) return null
  try {
    const p = parseInput(src)
    if (step.kind === 'expr') {
      return p.rhs ? null : { lhs: step.lhs, rhs: toLatex(p.lhs) }
    }
    if (!p.rhs) return null
    let [L, R] = [p.lhs, p.rhs]
    if (!isC2(L) && isC2(R)) [L, R] = [R, L]
    return { lhs: toLatex(L), rhs: toLatex(R) }
  } catch {
    return null
  }
}
