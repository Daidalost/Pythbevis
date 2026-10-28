import { useEffect, useRef, useState } from 'react'
import { parseInput, inputToLatex } from '../lib/expr.js'
import { Tex, Rich } from './Tex.jsx'
import ExprInput from './ExprInput.jsx'

function Feedback({ result, guide, attempts }) {
  const [showHint, setShowHint] = useState(false)
  useEffect(() => setShowHint(false), [result])
  if (!result) return null
  if (result.status === 'error') {
    return <p className="fb fb-error">{result.msg}</p>
  }
  if (result.status === 'form') {
    return (
      <p className="fb fb-form">
        <Rich text={result.msg} />
      </p>
    )
  }
  // forkert svar
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

function StepItem({ s, status, guide, answer, prevRaw, onAnswer }) {
  const [result, setResult] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (status === 'active' && s.n > 1) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [status, s.n])

  function submit(src) {
    const r = s.check(src)
    if (r.status === 'correct') {
      const latex = inputToLatex(parseInput(src))
      onAnswer(s.n, src, s.prefix ? `${s.prefix} ${latex}` : latex)
      return
    }
    // Ny reference hver gang, så feedback opdateres ved samme fejl igen
    setResult({ ...r })
    if (r.status === 'wrong') setAttempts((a) => a + 1)
  }

  return (
    <li ref={ref} className={`step step-${status}`} aria-current={status === 'active' ? 'step' : undefined}>
      <div className="step-head">
        <span className="step-num" aria-hidden="true">
          {status === 'done' ? '✓' : s.n}
        </span>
        <span className="step-title">
          <span className="sr-only">Trin {s.n}: </span>
          <Rich text={s.title} />
        </span>
      </div>

      {status === 'active' && (
        <div className="step-body">
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
                key={s.n}
                inputId={`svar-${s.n}`}
                prefix={s.prefix}
                initial={s.prefill ? prevRaw || '' : ''}
                placeholder={s.kind === 'eq' ? 'c^2 = …' : undefined}
                onSubmit={submit}
              />
              <Feedback result={result} guide={guide} attempts={attempts} />
            </>
          )}
        </div>
      )}

      {status === 'done' && s.kind === 'build' && (
        <p className="step-done-text">
          <Rich text={s.doneText} />
        </p>
      )}
      {status === 'done' && answer && (
        <div className="step-answer">
          <Tex>{answer.latex}</Tex>
        </div>
      )}
    </li>
  )
}

export default function StepPanel({ steps, step, answers, guide, onAnswer, onRestart }) {
  const finished = step > steps.length
  const endRef = useRef(null)
  useEffect(() => {
    if (finished) endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [finished])

  return (
    <div className="steps-wrap">
      <ol className="steps">
        {steps.map((s) => (
          <StepItem
            key={s.n}
            s={s}
            status={s.n < step ? 'done' : s.n === step ? 'active' : 'todo'}
            guide={guide}
            answer={answers[s.n]}
            prevRaw={answers[s.n - 1]?.raw}
            onAnswer={onAnswer}
          />
        ))}
      </ol>

      {finished && (
        <div className="finale" ref={endRef}>
          <h2>Beviset er færdigt</h2>
          <Tex display>{'c^2 = a^2 + b^2'}</Tex>
          <p>
            I en retvinklet trekant er kvadratet på hypotenusen lig med summen af kvadraterne på kateterne.
          </p>
          <button type="button" className="primary" onClick={onRestart}>
            Start forfra
          </button>
        </div>
      )}
    </div>
  )
}
