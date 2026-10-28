import { useMemo, useRef, useState } from 'react'
import { parseInput, inputToLatex } from '../lib/expr.js'
import { Tex } from './Tex.jsx'

const KEYS = [
  { label: 'a', ins: 'a' },
  { label: 'b', ins: 'b' },
  { label: 'c', ins: 'c' },
  { label: 'x²', ins: '²', aria: 'i anden' },
  { label: '(', ins: '(' },
  { label: ')', ins: ')' },
  { label: '+', ins: '+' },
  { label: '−', ins: '-', aria: 'minus' },
  { label: '·', ins: '·', aria: 'gange' },
  { label: '/', ins: '/', aria: 'divideret med' },
  { label: '½', ins: '½', aria: 'en halv' },
  { label: '=', ins: '=' },
]

export default function ExprInput({ prefix, initial = '', placeholder, onSubmit, inputId }) {
  const [val, setVal] = useState(initial)
  const ref = useRef(null)

  const preview = useMemo(() => {
    if (!val.trim()) return null
    try {
      return { latex: inputToLatex(parseInput(val)) }
    } catch {
      return { error: true }
    }
  }, [val])

  function insert(text) {
    const el = ref.current
    const start = el?.selectionStart ?? val.length
    const end = el?.selectionEnd ?? val.length
    const next = val.slice(0, start) + text + val.slice(end)
    setVal(next)
    requestAnimationFrame(() => {
      el?.focus()
      const pos = start + text.length
      el?.setSelectionRange(pos, pos)
    })
  }

  function backspace() {
    const el = ref.current
    const start = el?.selectionStart ?? val.length
    const end = el?.selectionEnd ?? val.length
    if (start === end && start === 0) return
    const from = start === end ? start - 1 : start
    setVal(val.slice(0, from) + val.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(from, from)
    })
  }

  return (
    <form
      className="expr"
      onSubmit={(e) => {
        e.preventDefault()
        if (val.trim()) onSubmit(val)
      }}
    >
      <div className="expr-row">
        {prefix && (
          <label htmlFor={inputId} className="expr-prefix">
            <Tex>{prefix}</Tex>
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className="expr-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={prefix ? undefined : 'Dit svar'}
          autoFocus
        />
        <button type="submit" className="primary" disabled={!val.trim()}>
          Tjek
        </button>
      </div>

      <div className="preview" aria-live="polite">
        {preview?.latex ? (
          <>
            <span className="preview-label">Sådan læses dit svar:</span> <Tex>{preview.latex}</Tex>
          </>
        ) : preview?.error ? (
          <span className="preview-label">Udtrykket er ikke færdigt endnu …</span>
        ) : (
          <span className="preview-label">Potens skrives a^2 eller a². Gangetegn kan skrives med * eller udelades.</span>
        )}
      </div>

      <div className="keypad" role="group" aria-label="Symboler">
        {KEYS.map((k) => (
          <button
            key={k.label}
            type="button"
            className={`key${/^[abc]$/.test(k.label) ? ' key-var' : ''}`}
            aria-label={k.aria}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(k.ins)}
          >
            {k.label}
          </button>
        ))}
        <button
          type="button"
          className="key key-del"
          aria-label="Slet tegn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={backspace}
        >
          ⌫
        </button>
      </div>
    </form>
  )
}
