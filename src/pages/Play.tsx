import { useEffect } from 'react'
import AsciiJellyfish from '../components/AsciiJellyfish'

export default function Play() {
  useEffect(() => {
    const prev = document.body.dataset.surface
    document.body.dataset.surface = 'play'
    return () => {
      if (prev) document.body.dataset.surface = prev
      else delete document.body.dataset.surface
    }
  }, [])

  return (
    <div className="play-page">
      <a href="/" className="play-back" aria-label="Back to nadia">
        <span aria-hidden="true">←</span>
        <span>back to nadia</span>
      </a>

      <div className="play-stage">
        <AsciiJellyfish
          className="ascii-jellyfish"
          ariaLabel="A drifting ASCII jellyfish, with two fish swimming nearby."
        />
      </div>


      <div className="play-caption">
        <div className="play-tag">
          <span className="play-bracket" aria-hidden="true">
            [
          </span>
          <span>/play</span>
          <span className="play-sep" aria-hidden="true">
            ·
          </span>
          <span>N1 drifter</span>
          <span className="play-bracket" aria-hidden="true">
            ]
          </span>
        </div>
        <p className="play-blurb">
          Made of characters. Pulses, drifts, breathes
          <br />
          through the dark. Mostly to see if I could.
        </p>
      </div>
    </div>
  )
}
