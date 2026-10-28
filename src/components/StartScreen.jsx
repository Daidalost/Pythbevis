import { Tex } from './Tex.jsx'

// Den retvinklede trekant med navngivne sider
function TriangleFigure() {
  return (
    <svg className="start-figure" viewBox="-1.6 -0.8 6.4 6" aria-hidden="true">
      <defs>
        <pattern id="grid-start" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M1 0H0V1" fill="none" className="grid-line" />
        </pattern>
      </defs>
      <rect x="-5" y="-5" width="20" height="20" fill="url(#grid-start)" />
      <polygon className="tri" points="0,4 3,4 0,0" />
      <path className="right-angle" d="M0.32 4V3.68H0" />
      <text className="side-label" x="1.5" y="4.42">a</text>
      <text className="side-label" x="-0.4" y="2">b</text>
      <text className="side-label" x="1.82" y="1.75">c</text>
      <text className="start-note" x="1.5" y="4.85">katete</text>
      <text className="start-note" x="-0.45" y="2.45">katete</text>
      <text className="start-note" x="2.55" y="1.45">hypotenuse</text>
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
            Læg fire ens retvinklede trekanter i et kvadrat, og brug arealerne til at bevise, at{' '}
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
