// Læser og regner med elevernes udtryk i a, b og c.
// Udtryk omsættes til et syntakstræ (til visning og formkontrol) og til et
// polynomium med brøk-koefficienter (til eksakt kontrol af ækvivalens).

export class ParseError extends Error {
  constructor(msg) {
    super(msg)
    this.name = 'ParseError'
  }
}

// ---------- Brøker ----------
function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

export class Q {
  constructor(n, d = 1) {
    if (d === 0) throw new ParseError('Der må ikke divideres med 0.')
    if (d < 0) {
      n = -n
      d = -d
    }
    const g = gcd(n, d)
    this.n = n / g + 0
    this.d = d / g
  }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d) }
  mul(o) { return new Q(this.n * o.n, this.d * o.d) }
  inv() { return new Q(this.d, this.n) }
  get zero() { return this.n === 0 }
}

// ---------- Tokens ----------
const MINUS = new Set(['-', '−', '–', '—'])
const TIMES = new Set(['*', '·', '×', '⋅', '•'])
const DIVIDE = new Set(['/', '÷', ':'])
const FRAC = { '½': [1, 2], '¼': [1, 4], '¾': [3, 4], '⅓': [1, 3], '⅔': [2, 3] }
const SUP = { '²': 2, '³': 3 }

export function tokenize(src) {
  const out = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) { i++; continue }
    const m = /^\d+(?:[.,]\d+)?/.exec(src.slice(i))
    if (m) {
      const raw = m[0]
      const [ip, fp = ''] = raw.split(/[.,]/)
      out.push({ t: 'num', raw, q: new Q(parseInt(ip + fp, 10), 10 ** fp.length) })
      i += raw.length
      continue
    }
    if (FRAC[ch]) {
      const [n, d] = FRAC[ch]
      out.push({ t: 'num', raw: ch, q: new Q(n, d) })
    } else if (ch === 'a' || ch === 'b' || ch === 'c') {
      out.push({ t: 'var', name: ch })
    } else if (SUP[ch]) {
      out.push({ t: 'sup', exp: SUP[ch] })
    } else if (ch === '+') {
      out.push({ t: 'op', v: '+' })
    } else if (MINUS.has(ch)) {
      out.push({ t: 'op', v: '-' })
    } else if (TIMES.has(ch)) {
      out.push({ t: 'op', v: '*' })
    } else if (DIVIDE.has(ch)) {
      out.push({ t: 'op', v: '/' })
    } else if (ch === '^') {
      out.push({ t: 'op', v: '^' })
    } else if (ch === '(' || ch === '[') {
      out.push({ t: '(' })
    } else if (ch === ')' || ch === ']') {
      out.push({ t: ')' })
    } else if (ch === '=') {
      out.push({ t: '=' })
    } else if (/\p{L}/u.test(ch)) {
      throw new ParseError(`»${ch}« kendes ikke her. Brug kun bogstaverne a, b og c.`)
    } else {
      throw new ParseError(`Tegnet »${ch}« kan ikke bruges her.`)
    }
    i++
  }
  return out
}

// ---------- Parser ----------
// Præcedens: potens (^ og ²) > fortegn > gange/divider (også usynligt gangetegn) > plus/minus
class Parser {
  constructor(tokens) {
    this.ts = tokens
    this.i = 0
  }
  peek() { return this.ts[this.i] }
  next() { return this.ts[this.i++] }
  isOp(v) {
    const t = this.peek()
    return !!t && t.t === 'op' && t.v === v
  }
  startsPrimary() {
    const t = this.peek()
    return !!t && (t.t === 'num' || t.t === 'var' || t.t === '(')
  }
  parseExpr() {
    let left = this.parseTerm()
    while (this.isOp('+') || this.isOp('-')) {
      const op = this.next().v
      const right = this.parseTerm()
      left = { type: op === '+' ? 'add' : 'sub', left, right }
    }
    return left
  }
  parseTerm() {
    let left = this.parseUnary()
    for (;;) {
      if (this.isOp('*') || this.isOp('/')) {
        const op = this.next().v
        const right = this.parseUnary()
        left = op === '*' ? { type: 'mul', left, right, explicit: true } : { type: 'div', left, right }
      } else if (this.startsPrimary()) {
        const right = this.parsePower()
        left = { type: 'mul', left, right, explicit: false }
      } else break
    }
    return left
  }
  parseUnary() {
    if (this.isOp('-')) {
      this.next()
      return { type: 'neg', arg: this.parseUnary() }
    }
    if (this.isOp('+')) {
      this.next()
      return this.parseUnary()
    }
    return this.parsePower()
  }
  parsePower() {
    let base = this.parsePrimary()
    for (;;) {
      const t = this.peek()
      if (t && t.t === 'sup') {
        this.next()
        base = { type: 'pow', base, exp: t.exp }
      } else if (this.isOp('^')) {
        this.next()
        let paren = false
        if (this.peek()?.t === '(') { paren = true; this.next() }
        const e = this.next()
        if (!e || e.t !== 'num' || e.q.d !== 1) throw new ParseError('Eksponenten skal være et helt tal, fx a^2.')
        if (paren) {
          if (this.peek()?.t !== ')') throw new ParseError('Der mangler en slutparentes.')
          this.next()
        }
        if (e.q.n > 12) throw new ParseError('Eksponenten er for stor.')
        base = { type: 'pow', base, exp: e.q.n }
      } else break
    }
    return base
  }
  parsePrimary() {
    const t = this.next()
    if (!t) throw new ParseError('Udtrykket er ikke færdigt.')
    if (t.t === 'num') return { type: 'num', q: t.q, raw: t.raw }
    if (t.t === 'var') return { type: 'var', name: t.name }
    if (t.t === '(') {
      if (this.peek()?.t === ')') throw new ParseError('Der står en tom parentes.')
      const arg = this.parseExpr()
      if (this.peek()?.t !== ')') throw new ParseError('Der mangler en slutparentes.')
      this.next()
      return { type: 'group', arg }
    }
    if (t.t === ')') throw new ParseError('Der er en slutparentes for meget.')
    if (t.t === '=') throw new ParseError('Der mangler noget før lighedstegnet.')
    if (t.t === 'sup') throw new ParseError('Potensen mangler et grundtal.')
    const sym = t.v === '*' ? '·' : t.v
    throw new ParseError(`»${sym}« står et sted, hvor der mangler et tal eller et bogstav.`)
  }
}

/** Læs et udtryk eller en ligning. Returnerer { lhs, rhs } (rhs er null uden lighedstegn). */
export function parseInput(src) {
  const ts = tokenize(src)
  if (!ts.length) throw new ParseError('Skriv et udtryk.')
  const p = new Parser(ts)
  const lhs = p.parseExpr()
  let rhs = null
  if (p.peek()?.t === '=') {
    p.next()
    if (!p.peek()) throw new ParseError('Der mangler noget efter lighedstegnet.')
    rhs = p.parseExpr()
  }
  const rest = p.peek()
  if (rest) {
    if (rest.t === '=') throw new ParseError('Brug kun ét lighedstegn.')
    if (rest.t === ')') throw new ParseError('Der er en slutparentes for meget.')
    throw new ParseError('Udtrykket kan ikke læses – tjek tegnene.')
  }
  return { lhs, rhs }
}

// ---------- Polynomier ----------
const ONE = '0,0,0'
const VAR_KEY = { a: '1,0,0', b: '0,1,0', c: '0,0,1' }
export const AB_KEY = '1,1,0'

function clean(m) {
  for (const [k, v] of m) if (v.zero) m.delete(k)
  return m
}
export function pAdd(p, q) {
  const r = new Map(p)
  for (const [k, v] of q) r.set(k, r.has(k) ? r.get(k).add(v) : v)
  return clean(r)
}
export function pScale(p, s) {
  const r = new Map()
  for (const [k, v] of p) r.set(k, v.mul(s))
  return clean(r)
}
function pMul(p, q) {
  let r = new Map()
  for (const [k1, v1] of p) {
    const e1 = k1.split(',').map(Number)
    for (const [k2, v2] of q) {
      const e2 = k2.split(',').map(Number)
      const k = e1.map((e, i) => e + e2[i]).join(',')
      r = pAdd(r, new Map([[k, v1.mul(v2)]]))
    }
  }
  return r
}

export function toPoly(n) {
  switch (n.type) {
    case 'num': return clean(new Map([[ONE, n.q]]))
    case 'var': return new Map([[VAR_KEY[n.name], new Q(1)]])
    case 'group': return toPoly(n.arg)
    case 'neg': return pScale(toPoly(n.arg), new Q(-1))
    case 'add': return pAdd(toPoly(n.left), toPoly(n.right))
    case 'sub': return pAdd(toPoly(n.left), pScale(toPoly(n.right), new Q(-1)))
    case 'mul': return pMul(toPoly(n.left), toPoly(n.right))
    case 'div': {
      const d = toPoly(n.right)
      if (d.size === 0) throw new ParseError('Der må ikke divideres med 0.')
      if (d.size !== 1 || !d.has(ONE)) throw new ParseError('Der må kun divideres med tal i dette bevis.')
      return pScale(toPoly(n.left), d.get(ONE).inv())
    }
    case 'pow': {
      let r = new Map([[ONE, new Q(1)]])
      const b = toPoly(n.base)
      for (let i = 0; i < n.exp; i++) r = pMul(r, b)
      return r
    }
    default: throw new ParseError('Udtrykket kan ikke læses.')
  }
}

export function polyEqual(p, q) {
  return pAdd(p, pScale(q, new Q(-1))).size === 0
}

/** Polynomium for et fast udtryk (bruges til facitter). */
export const poly = (src) => toPoly(parseInput(src).lhs)

// ---------- LaTeX til visning ----------
const FRAC_TEX = { '½': '\\tfrac{1}{2}', '¼': '\\tfrac{1}{4}', '¾': '\\tfrac{3}{4}', '⅓': '\\tfrac{1}{3}', '⅔': '\\tfrac{2}{3}' }

function leftmost(n) {
  while (n.left || n.arg || n.base) {
    if (n.type === 'group') return n
    n = n.left || n.base || n.arg
  }
  return n
}
const unwrap = (n) => (n.type === 'group' ? n.arg : n)

export function toLatex(n) {
  switch (n.type) {
    case 'num': return FRAC_TEX[n.raw] || n.raw.replace(',', '{,}')
    case 'var': return n.name
    case 'group': return `\\left(${toLatex(n.arg)}\\right)`
    case 'neg': return `-${toLatex(n.arg)}`
    case 'add': return `${toLatex(n.left)}+${toLatex(n.right)}`
    case 'sub': return `${toLatex(n.left)}-${toLatex(n.right)}`
    case 'mul': {
      const dot = n.explicit || leftmost(n.right).type === 'num' || n.right.type === 'neg'
      return dot ? `${toLatex(n.left)}\\cdot ${toLatex(n.right)}` : `${toLatex(n.left)}${toLatex(n.right)}`
    }
    case 'div': {
      // 4*1/2 læses som (4·1)/2, men vises som 4·½ (samme værdi, sådan som eleven mener det)
      const L = n.left
      if (L.type === 'mul' && L.right.type === 'num' && n.right.type === 'num') {
        const sep = L.explicit ? '\\cdot ' : ''
        return `${toLatex(L.left)}${sep}\\frac{${toLatex(L.right)}}{${toLatex(n.right)}}`
      }
      return `\\frac{${toLatex(unwrap(L))}}{${toLatex(unwrap(n.right))}}`
    }
    case 'pow': {
      const b = n.base
      const base = b.type === 'var' || b.type === 'num' || b.type === 'group' ? toLatex(b) : `{${toLatex(b)}}`
      return `${base}^{${n.exp}}`
    }
    default: return ''
  }
}

export function inputToLatex(parsed) {
  return parsed.rhs ? `${toLatex(parsed.lhs)} = ${toLatex(parsed.rhs)}` : toLatex(parsed.lhs)
}
