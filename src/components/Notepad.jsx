import { Tex, Rich } from './Tex.jsx'
import { displayParts } from '../lib/display.js'

// Blokken: udledningen skrives ind linje for linje, med lighedstegnene under hinanden.
// Trin 2–4 (arealer) og trin 5–8 (ligningen) er to afsnit, der hver justeres for sig.
const GROUPS = [
  [2, 3, 4],
  [5, 6, 7, 8],
]

function EqRow({ n, parts, state, result }) {
  return (
    <div className={`eq-row is-${state}${result ? ' is-result' : ''}`}>
      <span className="margin-num">{n}</span>
      {parts ? (
        <>
          <span className="cell lhs">
            <Tex>{parts.lhs}</Tex>
          </span>
          <span className="cell eq">
            <Tex>{'='}</Tex>
          </span>
          <span className="cell rhs">
            <Tex>{parts.rhs}</Tex>
          </span>
        </>
      ) : (
        <span className="cell blank" aria-hidden="true" />
      )}
    </div>
  )
}

export default function Notepad({ steps, step, answers, draft }) {
  const finished = step > steps.length
  const active = steps[step - 1]

  function rowFor(n) {
    if (answers[n]) return <EqRow key={n} n={n} parts={answers[n]} state="done" result={n === 8} />
    if (n !== step) return null
    // Det aktive trin: kladden skrives svagt, ellers en tom linje
    let parts = displayParts(active, draft)
    if (!parts && active.kind === 'expr') parts = { lhs: active.lhs, rhs: '\\phantom{x}' }
    return <EqRow key={n} n={n} parts={parts} state="draft" />
  }

  return (
    <div className="notepad">
      <div className="spiral" aria-hidden="true" />
      <div className="sheet">
        <h2 className="sheet-title">Pythagoras’ sætning</h2>
        <p className="sheet-line">
          <Rich text="Trekant $ABC$ er retvinklet i $C$. Vis, at $a^2+b^2=c^2$." />
        </p>
        <p className="sheet-line sheet-proof">Bevis:</p>

        <div className={`note-row ${step > 1 ? 'is-done' : 'is-draft'}`}>
          <span className="margin-num">1</span>
          {step > 1 ? (
            <span className="cell text">
              <Rich text={steps[0].note} />
            </span>
          ) : (
            <span className="cell blank" aria-hidden="true" />
          )}
        </div>

        {GROUPS.map((ns, i) => {
          const rows = ns.map(rowFor).filter(Boolean)
          return rows.length ? (
            <div key={i} className="eq-group">
              {rows}
            </div>
          ) : null
        })}

        {finished && (
          <p className="sheet-line qed is-done">
            <span className="cell">
              <Rich text="Altså er $a^2+b^2=c^2$, og sætningen er bevist." />
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
