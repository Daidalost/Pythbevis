import { Tex } from './Tex.jsx'

// Trekant ABC – samme stilling som i figuren: ret vinkel i C, grundlinjen b
function TriangleFigure() {
  return (
    <svg className="start-figure" viewBox="-0.2 0.9 6.2 4.5" aria-hidden="true">
      <defs>
        <pattern id="grid-start" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M1 0H0V1" fill="none" className="grid-line" />
        </pattern>
      </defs>
      <rect x="-5" y="-5" width="20" height="20" fill="url(#grid-start)" />
      <polygon className="tri" points="1,4 4,4 4,2" />
      <path className="right-angle" d="M3.7 4V3.7H4" />
      <text className="side-label" x="2.5" y="4.38">b</text>
      <text className="side-label" x="4.38" y="3">a</text>
      <text className="side-label" x="2.32" y="2.72">c</text>
      <text className="vertex-label" x="0.68" y="4.12">A</text>
      <text className="vertex-label" x="4" y="1.66">B</text>
      <text className="vertex-label" x="4.32" y="4.34">C</text>
      <text className="start-note" x="2.5" y="4.85">katete</text>
      <text className="start-note" x="5.15" y="3.08">katete</text>
      <text className="start-note" x="1.62" y="2.4">hypotenuse</text>
    </svg>
  )
}

export default function StartScreen({ onStart }) {
  return (
    <main className="start">
      <div className="start-inner">
        <TriangleFigure />
        <div className="start-text">
          <h1>Pythagoras’ sætning</h1>
          <p className="lede">
            Læg trekant ABC sammen med tre kongruente trekanter til et kvadrat, og brug arealerne til at bevise, at{' '}
            <Tex>{'a^2 + b^2 = c^2'}</Tex>.
          </p>
          <div className="choices">
            <button type="button" className="choice" onClick={() => onStart('guide')}>
              <strong>Med sproglig guide</strong>
              <span>Hvert trin forklares med fagbegreber, og du får et hint, når et svar ikke er rigtigt.</span>
            </button>
            <button type="button" className="choice" onClick={() => onStart('plain')}>
              <strong>Uden guide</strong>
              <span>Kun trinenes overskrifter. Du kan hente et hint, hvis du sidder fast.</span>
            </button>
          </div>
          <p className="note">Guiden kan slås til og fra undervejs.</p>
        </div>
      </div>
    </main>
  )
}
