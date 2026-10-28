import { useEffect, useState } from 'react'
import { Tex, Rich } from './Tex.jsx'
import ExprInput from './ExprInput.jsx'

function Feedback({ result, guide, attempts }) {
  const [showHint, setShowHint] = useState(false)
  useEffect(() => setShowHint(false), [result])
  if (!result) return null
  if (result.status === 'error') return <p className="fb fb-error">{result.msg}</p>
  if (result.status === 'form') {
    return (
      <p className="fb fb-form">
        <Rich text={result.msg} />
      </p>
    )
  }
  if (guide || showHint) {
    return (
      <p className="fb fb-wrong">
        <strong>Ikke korrekt. </strong>
        <Rich text={result.hint} />
      </p>
    )
  }
  return (
    <p className="fb fb-wrong">
      <strong>Ikke korrekt.</strong> Prøv igen.
      {attempts >= 2 && (
        <button type="button" className="link" onClick={() => setShowHint(true)}>
          Vis hint
        </button>
      )}
    </p>
  )
}

/** Det aktive trin: overskrift, guide og svarfelt. Nøgles på trinnummer, så alt nulstilles ved nyt trin. */
function CurrentStep({ s, guide, prevRaw, onAnswer, onDraft }) {
  const [result, setResult] = useState(null)
  const [attempts, setAttempts] = useState(0)

  function submit(src) {
    const r = s.check(src)
    if (r.status === 'correct') {
      onAnswer(s.n, src)
      return
    }
    setResult({ ...r }) // ny reference, så samme fejl vises igen
    if (r.status === 'wrong') setAttempts((a) => a + 1)
  }

  return (
    <>
      <h2 className="work-title">
        <Rich text={s.title} />
      </h2>
      {guide && s.guide && (
        <p className="guide">
          <Rich text={s.guide} />
        </p>
      )}
      {s.instr && (
        <p className="instr">
          <Rich text={s.instr} />
        </p>
      )}
      {s.kind !== 'build' && (
        <>
          <ExprInput
            inputId={`svar-${s.n}`}
            prefix={s.lhs ? `${s.lhs} =` : undefined}
            initial={s.prefill ? prevRaw || '' : ''}
            placeholder={s.kind === 'eq' ? 'c^2 = …' : undefined}
            onSubmit={submit}
            onDraft={onDraft}
          />
          <Feedback result={result} guide={guide} attempts={attempts} />
        </>
      )}
    </>
  )
}

export default function StepWork({ steps, step, guide, answers, onAnswer, onDraft, onRestart }) {
  const finished = step > steps.length

  if (finished) {
    return (
      <section className="work finale">
        <h2 className="work-title">Beviset er færdigt</h2>
        <Tex display>{'a^2 + b^2 = c^2'}</Tex>
        <p>I en retvinklet trekant er summen af kvadraterne på kateterne lig med kvadratet på hypotenusen.</p>
        <button type="button" className="primary" onClick={onRestart}>
          Start forfra
        </button>
      </section>
    )
  }

  const s = steps[step - 1]
  return (
    <section className="work" aria-label={`Trin ${s.n} af ${steps.length}`}>
      <div className="work-head">
        <span className="work-count">
          Trin {s.n} af {steps.length}
        </span>
        <ol className="progress" aria-hidden="true">
          {steps.map((x) => (
            <li key={x.n} className={x.n < step ? 'is-done' : x.n === step ? 'is-active' : ''} />
          ))}
        </ol>
      </div>
      <CurrentStep
        key={s.n}
        s={s}
        guide={guide}
        prevRaw={answers[s.n - 1]?.raw}
        onAnswer={onAnswer}
        onDraft={onDraft}
      />
    </section>
  )
}
