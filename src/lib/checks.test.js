// Kør med: npm test
import { checks } from './checks.js'
import { parseInput, inputToLatex } from './expr.js'

const cases = [
  // [trin, input, forventet status]
  [2, 'c^2', 'correct'], [2, 'c²', 'correct'], [2, 'c*c', 'correct'], [2, 'c·c', 'correct'],
  [2, 'c', 'wrong'], [2, '4c', 'wrong'], [2, 'A=c^2', 'form'], [2, 'c^', 'error'], [2, 'x^2', 'error'],
  [3, '(a+b)^2', 'correct'], [3, '(a+b)²', 'correct'], [3, '(a+b)(a+b)', 'correct'], [3, '(a+b)*(a+b)', 'correct'],
  [3, 'a^2+2ab+b^2', 'form'], [3, 'a^2+b^2', 'wrong'], [3, 'a+b', 'wrong'], [3, '(a+b', 'error'],
  [4, '1/2*a*b', 'correct'], [4, '½ab', 'correct'], [4, 'ab/2', 'correct'], [4, '0,5ab', 'correct'],
  [4, '0.5*a*b', 'correct'], [4, '1/2ab', 'correct'], [4, 'a*b/2', 'correct'], [4, 'ab', 'wrong'],
  [5, 'c^2=(a+b)^2-4*1/2*a*b', 'correct'], [5, 'c²=(a+b)²−4·½ab', 'correct'], [5, 'c^2 = (a+b)(a+b) - 4(ab/2)', 'correct'],
  [5, '(a+b)^2-4*½ab=c^2', 'correct'], [5, 'c^2=(a+b)^2-2ab', 'form'], [5, 'c^2=a^2+2ab+b^2-4*½ab', 'form'],
  [5, 'c^2=(a+b)^2-½ab', 'wrong'], [5, 'c^2=(a+b)^2', 'wrong'], [5, '(a+b)^2-4*½ab', 'form'], [5, 'a^2=(a+b)^2', 'wrong'],
  [6, 'c^2=a^2+2ab+b^2-4*1/2*a*b', 'correct'], [6, 'c^2=a^2+b^2+2ab-4·½ab', 'correct'], [6, 'c^2=a^2+2ab+b^2-2ab', 'correct'],
  [6, 'c^2=(a^2+2ab+b^2)-4·½ab', 'correct'], [6, 'c^2=(a+b)^2-4·½ab', 'form'], [6, 'c^2=a^2+b^2', 'form'],
  [6, 'c^2=a^2+b^2-4·½ab', 'wrong'],
  [7, 'c^2=a^2+2ab+b^2-2ab', 'correct'], [7, 'c^2=a^2+2ab+b^2-2*a*b', 'correct'], [7, 'c^2=a^2+2ab+b^2-4*1/2*a*b', 'form'],
  [7, 'c^2=a^2+b^2', 'form'], [7, 'c^2=a^2+2ab+b^2-4ab', 'wrong'],
  [8, 'c^2=a^2+b^2', 'correct'], [8, 'a²+b²=c²', 'correct'], [8, 'c^2=b^2+a^2', 'correct'],
  [8, 'c^2=a^2+2ab+b^2-2ab', 'form'], [8, 'c^2=a^2+b^2+2ab', 'wrong'],
]

let fail = 0
for (const [n, src, want] of cases) {
  const r = checks[n](src)
  const ok = r.status === want
  if (!ok) fail++
  console.log(`${ok ? '✓' : '✗'} trin ${n}  ${src.padEnd(34)} → ${r.status}${ok ? '' : `  (forventet ${want})`}  ${r.msg || r.hint || ''}`)
}

for (const src of ['c^2=(a+b)^2-4*1/2*a*b', '½ab', '(a+b)(a+b)', '0,5ab', 'a*b/2', '-2ab', '1/2ab']) {
  console.log('latex', src.padEnd(26), inputToLatex(parseInput(src)))
}

console.log(fail ? `\n${fail} fejl` : '\nAlle tjek bestået')
process.exit(fail ? 1 : 0)
