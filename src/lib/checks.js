// Kontrol af elevsvar i trin 2–8.
// Hvert tjek returnerer et af:
//   { status: 'correct' }
//   { status: 'form',  msg }   – matematisk rigtigt, men ikke på den form trinnet beder om
//   { status: 'wrong', hint }  – forkert; hint vises med guide (eller når eleven beder om det)
//   { status: 'error', msg }   – udtrykket kunne ikke læses
import { parseInput, toPoly, polyEqual, poly, ParseError, AB_KEY } from './expr.js'

const C2 = poly('c^2')
const BIG = poly('(a+b)^2')
const TRI = poly('ab/2')
const RHS = poly('a^2+b^2') // = (a+b)^2 - 4·½ab

const KIDS = ['left', 'right', 'arg', 'base']

/** Del et udtryk op i led med fortegn (parenteser på ledniveau foldes ud). */
function terms(node, sign = 1, out = []) {
  if (node.type === 'add') {
    terms(node.left, sign, out)
    terms(node.right, sign, out)
  } else if (node.type === 'sub') {
    terms(node.left, sign, out)
    terms(node.right, -sign, out)
  } else if (node.type === 'neg') {
    terms(node.arg, -sign, out)
  } else if (node.type === 'group') {
    terms(node.arg, sign, out)
  } else {
    out.push({ sign, node })
  }
  return out
}

function containsSum(n) {
  if (n.type === 'add' || n.type === 'sub') return true
  return KIDS.some((k) => n[k] && containsSum(n[k]))
}

/** Står der en sum inde i et produkt/potens/brøk – altså en parentes, der ikke er ganget ud? */
function hasUnexpanded(n, inside = false) {
  if ((n.type === 'add' || n.type === 'sub') && inside) return true
  const deeper = inside || n.type === 'mul' || n.type === 'pow' || n.type === 'div'
  return KIDS.some((k) => n[k] && hasUnexpanded(n[k], deeper))
}

/** Et led er "udregnet", hvis det højst har ét tal og ingen brøkstreg, fx 2ab. */
function isSimplified(n) {
  let nums = 0
  let divs = 0
  ;(function walk(x) {
    if (x.type === 'num') nums++
    if (x.type === 'div') divs++
    KIDS.forEach((k) => x[k] && walk(x[k]))
  })(n)
  return nums <= 1 && divs === 0
}

/** Led, der er et rent ab-led (fx 2ab, −4·½ab), med deres samlede fortegn. */
function abTerms(ts) {
  const out = []
  for (const t of ts) {
    const p = toPoly(t.node)
    if (p.size === 1 && p.has(AB_KEY)) {
      const coef = p.get(AB_KEY).n * t.sign
      out.push({ ...t, positive: coef > 0 })
    }
  }
  return out
}

function firstHint(p, list, fallback) {
  for (const [src, hint] of list) if (polyEqual(p, poly(src))) return hint
  return fallback
}

function guard(fn) {
  return (src) => {
    try {
      return fn(src)
    } catch (e) {
      if (e instanceof ParseError) return { status: 'error', msg: e.message }
      throw e
    }
  }
}

function expression(src) {
  if (src.includes('=')) {
    return { early: { status: 'form', msg: 'Skriv kun selve udtrykket for arealet – uden lighedstegn.' } }
  }
  const parsed = parseInput(src)
  return { node: parsed.lhs, p: toPoly(parsed.lhs) }
}

/** Find den side af ligningen, der ikke er c². */
function equation(src) {
  const parsed = parseInput(src)
  if (!parsed.rhs) {
    return { early: { status: 'form', msg: 'Skriv en hel ligning med lighedstegn, fx $c^2 = \\ldots$' } }
  }
  const L = toPoly(parsed.lhs)
  const R = toPoly(parsed.rhs)
  if (polyEqual(L, C2)) return { other: parsed.rhs, p: R }
  if (polyEqual(R, C2)) return { other: parsed.lhs, p: L }
  return {
    early: { status: 'wrong', hint: 'Den ene side af ligningen skal være arealet af det lille kvadrat, $c^2$.' },
  }
}

export const checks = {
  2: guard((src) => {
    const { early, p } = expression(src)
    if (early) return early
    if (polyEqual(p, C2)) return { status: 'correct' }
    return {
      status: 'wrong',
      hint: firstHint(
        p,
        [
          ['c', 'Det er sidelængden. Arealet af et kvadrat er sidelængden ganget med sig selv.'],
          ['4c', 'Det er kvadratets omkreds. Her skal du bruge arealet.'],
          ['2c', 'Arealet af et kvadrat er ikke $2\\cdot c$, men $c\\cdot c$.'],
          ['a^2+b^2', 'Det er netop det, vi vil bevise. Udtryk arealet ved hjælp af sidelængden $c$.'],
          ['(a+b)^2', 'Det er det store kvadrat. Her skal du bruge det lille kvadrat i midten.'],
        ],
        'Det lille kvadrat har sidelængden $c$ – trekanternes hypotenuse.',
      ),
    }
  }),

  3: guard((src) => {
    const { early, p, node } = expression(src)
    if (early) return early
    if (polyEqual(p, BIG)) {
      if (hasUnexpanded(node)) return { status: 'correct' }
      return {
        status: 'form',
        msg: 'Rigtigt udregnet, men skriv arealet som sidelængden i anden, fx $(a+b)^2$. Parentesen ganges ud i trin 6.',
      }
    }
    return {
      status: 'wrong',
      hint: firstHint(
        p,
        [
          ['a+b', 'Det er sidelængden. Arealet af et kvadrat er sidelængden i anden.'],
          ['4(a+b)', 'Det er kvadratets omkreds. Her skal du bruge arealet.'],
          ['a^2+b^2', '$(a+b)^2$ er ikke det samme som $a^2+b^2$. Skriv arealet som sidelængden i anden – med parentes.'],
          ['ab', 'Sidelængden er ikke $a$ eller $b$ alene, men $a+b$.'],
          ['c^2', 'Det er det lille kvadrat. Her skal du bruge hele det store kvadrat.'],
        ],
        'Hver side i det store kvadrat består af en katete $a$ og en katete $b$, så sidelængden er $a+b$.',
      ),
    }
  }),

  4: guard((src) => {
    const { early, p } = expression(src)
    if (early) return early
    if (polyEqual(p, TRI)) return { status: 'correct' }
    const legs = 'Brug de to kateter $a$ og $b$ som grundlinje og højde – de står vinkelret på hinanden.'
    return {
      status: 'wrong',
      hint: firstHint(
        p,
        [
          ['ab', '$ab$ er arealet af et rektangel med siderne $a$ og $b$. Trekanten er halvdelen af rektanglet.'],
          ['2ab', 'Trekanten er halvdelen af et rektangel med siderne $a$ og $b$.'],
          ['ac/2', legs],
          ['bc/2', legs],
          ['ac', legs],
          ['bc', legs],
        ],
        'Arealet af en trekant er $\\tfrac12\\cdot h\\cdot g$. I en retvinklet trekant kan kateterne bruges som højde og grundlinje.',
      ),
    }
  }),

  5: guard((src) => {
    const { early, other, p } = equation(src)
    if (early) return early
    if (!polyEqual(p, RHS)) {
      return {
        status: 'wrong',
        hint: firstHint(
          p,
          [
            ['(a+b)^2-ab/2', 'Husk, at der er fire trekanter.'],
            ['(a+b)^2-4ab', 'Husk, at arealet af én trekant er $\\tfrac12ab$.'],
            ['(a+b)^2+2ab', 'Trekanterne skal trækkes fra det store kvadrat – ikke lægges til.'],
            ['(a+b)^2', 'Husk at trække de fire trekanter fra det store kvadrat.'],
          ],
          'Den anden side skal være arealet af det store kvadrat minus arealet af de fire trekanter.',
        ),
      }
    }
    const ts = terms(other)
    if (!ts.some((t) => hasUnexpanded(t.node))) {
      return {
        status: 'form',
        msg: 'Rigtigt, men lad arealet af det store kvadrat stå som $(a+b)^2$. Parentesen ganges ud i trin 6.',
      }
    }
    const neg = abTerms(ts).filter((t) => !t.positive)
    if (neg.length && neg.every((t) => isSimplified(t.node))) {
      return {
        status: 'form',
        msg: 'Rigtigt, men skriv trekanterne som $4$ gange trekantens areal, fx $4\\cdot\\tfrac12ab$. Det regnes ud i trin 7.',
      }
    }
    return { status: 'correct' }
  }),

  6: guard((src) => {
    const { early, other, p } = equation(src)
    if (early) return early
    if (!polyEqual(p, RHS)) {
      return {
        status: 'wrong',
        hint: firstHint(
          p,
          [
            ['a^2+b^2-2ab', 'Husk det dobbelte produkt: $(a+b)^2 = a^2+b^2+2ab$.'],
            ['a^2+b^2+ab-2ab', 'Det dobbelte produkt er $2ab$, ikke $ab$.'],
          ],
          'Brug 1. kvadratsætning: $(a+b)^2 = a^2+b^2+2ab$. Resten af ligningen skrives af.',
        ),
      }
    }
    const ts = terms(other)
    if (ts.some((t) => containsSum(t.node))) {
      return { status: 'form', msg: 'Parentesen er ikke ganget helt ud endnu.' }
    }
    const ab = abTerms(ts)
    if (!(ab.some((t) => t.positive) && ab.some((t) => !t.positive))) {
      return {
        status: 'form',
        msg: 'Rigtigt, men du er gået for hurtigt frem. Skriv alle leddene efter udgangningen, så både $2ab$ og $4\\cdot\\tfrac12ab$ står der.',
      }
    }
    return { status: 'correct' }
  }),

  7: guard((src) => {
    const { early, other, p } = equation(src)
    if (early) return early
    if (!polyEqual(p, RHS)) {
      return {
        status: 'wrong',
        hint: firstHint(
          p,
          [['a^2+b^2-2ab', '$4\\cdot\\tfrac12 = 2$, så leddet bliver $2ab$.']],
          'Gang talfaktorerne sammen: $4\\cdot\\tfrac12ab = 2ab$. Resten af ligningen skrives af.',
        ),
      }
    }
    const ts = terms(other)
    if (ts.some((t) => containsSum(t.node))) {
      return { status: 'form', msg: 'Parentesen skal være ganget ud – tag udgangspunkt i din ligning fra trin 6.' }
    }
    const ab = abTerms(ts)
    if (!(ab.some((t) => t.positive) && ab.some((t) => !t.positive))) {
      return {
        status: 'form',
        msg: 'Rigtigt, men lad $2ab$ og $-2ab$ stå lidt endnu – de forsvinder i trin 8.',
      }
    }
    if (!ab.filter((t) => !t.positive).every((t) => isSimplified(t.node))) {
      return { status: 'form', msg: 'Udregn $4\\cdot\\tfrac12$, så leddet står som ét tal gange $ab$.' }
    }
    return { status: 'correct' }
  }),

  8: guard((src) => {
    const { early, other, p } = equation(src)
    if (early) return early
    if (!polyEqual(p, RHS)) {
      return {
        status: 'wrong',
        hint: '$2ab - 2ab = 0$, så de to led forsvinder. Resten af ligningen skrives af.',
      }
    }
    const ts = terms(other)
    if (ts.some((t) => containsSum(t.node))) {
      return { status: 'form', msg: 'Skriv den anden side uden parenteser.' }
    }
    if (abTerms(ts).length) {
      return { status: 'form', msg: 'Reducér: $2ab - 2ab = 0$, så de to led skal ikke stå der længere.' }
    }
    return { status: 'correct' }
  }),
}
