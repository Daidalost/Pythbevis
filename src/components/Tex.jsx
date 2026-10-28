import { useMemo } from 'react'
import katex from 'katex'

export function Tex({ children, display = false }) {
  const html = useMemo(
    () => katex.renderToString(String(children), { throwOnError: false, displayMode: display }),
    [children, display],
  )
  return <span className={display ? 'tex tex-display' : 'tex'} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Tekst med indlejret matematik i $…$ */
export function Rich({ text }) {
  const parts = text.split(/(\$[^$]+\$)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.length > 1 && p.startsWith('$') && p.endsWith('$') ? (
          <Tex key={i}>{p.slice(1, -1)}</Tex>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}
