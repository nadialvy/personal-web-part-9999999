import { useEffect, useRef } from 'react'

// ─── Canvas ──────────────────────────────────────────────────────────────
const CANVAS_WIDTH = 60
const CANVAS_HEIGHT = 28

// ─── Bell ────────────────────────────────────────────────────────────────
const BELL_BASE_WIDTH = 16
const BELL_BASE_HEIGHT = 7
const PULSE_PERIOD_MS = 3000

// ─── Tentacles ───────────────────────────────────────────────────────────
const TENTACLE_COUNT = 9
const TENTACLE_LENGTH = 13
const TENTACLE_WAVELENGTH = 9
const TENTACLE_WAVE_SPEED = 3
const TENTACLE_PHASE_GAP = 0.35
// Absolute half-spread of the tentacle cluster (in columns). Decoupled
// from the bell width so the bell can grow without taking the tentacles
// along with it.
const TENTACLE_HALF_SPREAD = 9

// ─── Ambience ────────────────────────────────────────────────────────────
const BUBBLE_COUNT = 7

// Soft density ramp — translucent, no solid blobs.
const DENSITY_RAMP = ['.', ':', ';', '*', 'o', 'O'] as const

function densityChar(d: number): string {
  if (d <= 0.08) return ' '
  const clamped = Math.min(0.999, d)
  return DENSITY_RAMP[Math.floor(clamped * DENSITY_RAMP.length)]
}

function tentacleChar(i: number): string {
  const d = i / TENTACLE_LENGTH
  if (d < 0.22) return '|'
  if (d < 0.5) return ':'
  if (d < 0.78) return '.'
  return "'"
}

// Smooth pulse:
//   0–30%   smoothstep contraction (no abrupt corners)
//   30–40%  brief plateau at peak
//   40–100% slow quadratic bloom back to expanded
function pulseAt(t: number): number {
  const p = ((t % PULSE_PERIOD_MS) + PULSE_PERIOD_MS) % PULSE_PERIOD_MS
  const phase = p / PULSE_PERIOD_MS
  if (phase < 0.3) {
    const x = phase / 0.3
    return x * x * (3 - 2 * x)
  }
  if (phase < 0.4) return 1
  const x = (phase - 0.4) / 0.6
  return 1 - x * x
}

interface Bubble {
  baseCol: number
  speed: number
  char: string
  spawnT: number
  wobblePhase: number
}

function spawnBubble(t: number): Bubble {
  return {
    baseCol: 2 + Math.random() * (CANVAS_WIDTH - 4),
    speed: 0.9 + Math.random() * 1.8,
    char: Math.random() < 0.4 ? 'o' : '.',
    spawnT: t,
    wobblePhase: Math.random() * Math.PI * 2,
  }
}

function renderJellyfish(t: number, bubbles: Bubble[]): string {
  const grid: string[][] = []
  for (let r = 0; r < CANVAS_HEIGHT; r++) {
    grid.push(new Array<string>(CANVAS_WIDTH).fill(' '))
  }

  const t_s = t / 1000
  const pulse = pulseAt(t)

  // ─── Position ───────────────────────────────────────────────────────────
  // Fully centered horizontally. Gentle vertical bob driven by the pulse.
  const cx = CANVAS_WIDTH / 2
  const ambientY = Math.sin(t_s * 0.25) * 0.5
  const propulsionY = -pulse * 1.5
  const cy = CANVAS_HEIGHT * 0.4 + ambientY + propulsionY

  // ─── Bell shape ─────────────────────────────────────────────────────────
  // Subtle morph: a touch narrower and taller when contracted, but never
  // a dramatic ratio flip. The body should *breathe*, not redraw itself.
  const bellW = BELL_BASE_WIDTH * (1 - pulse * 0.12)
  const bellH = BELL_BASE_HEIGHT * (1 + pulse * 0.18)

  // ─── Draw bell (smooth filled dome, no noise) ──────────────────────────
  const minR = Math.max(0, Math.floor(cy - bellH - 1))
  const maxR = Math.min(CANVAS_HEIGHT - 1, Math.ceil(cy + 0.5))
  const minC = Math.max(0, Math.floor(cx - bellW - 1))
  const maxC = Math.min(CANVAS_WIDTH - 1, Math.ceil(cx + bellW + 1))

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const dx = (c - cx) / bellW
      const dy = (r - cy) / bellH

      if (dy > 0) continue
      const dist2 = dx * dx + dy * dy
      if (dist2 > 1) continue

      const radial = 1 - Math.sqrt(dist2)
      const verticalBias = -dy
      const density = radial * 0.45 + verticalBias * 0.55
      grid[r][c] = densityChar(density)
    }
  }

  // ─── Soft rim arc ───────────────────────────────────────────────────────
  // Closes the underside of the bell with a clean arc, so the silhouette
  // doesn't dissolve into the background at the bottom.
  const rimRow = Math.round(cy)
  if (rimRow >= 0 && rimRow < CANVAS_HEIGHT) {
    const rimW = bellW * 0.92
    const left = Math.max(0, Math.floor(cx - rimW))
    const right = Math.min(CANVAS_WIDTH - 1, Math.ceil(cx + rimW))
    for (let c = left; c <= right; c++) {
      const dxNorm = Math.abs((c - cx) / rimW)
      if (dxNorm < 0.96) {
        const arc = Math.cos(dxNorm * Math.PI * 0.5)
        const cell = grid[rimRow][c]
        if (cell === ' ' || cell === '.' || cell === ':') {
          grid[rimRow][c] = arc > 0.8 ? ';' : arc > 0.5 ? ':' : '.'
        }
      }
    }
  }

  // ─── Tentacles ─────────────────────────────────────────────────────────
  // A graceful cluster: spread anchored to BASE bell so it doesn't breathe
  // with the bell, gentle inward convergence toward the tips, cascading
  // sine wave traveling top → tip with a small phase offset per strand.
  const k = (Math.PI * 2) / TENTACLE_WAVELENGTH
  const omega = k * TENTACLE_WAVE_SPEED

  // Tentacle cluster half-spread, set independently from the bell so the
  // bell can be resized without dragging the tentacles open.
  const tentSpread = TENTACLE_HALF_SPREAD

  for (let n = 0; n < TENTACLE_COUNT; n++) {
    const angle = (n - (TENTACLE_COUNT - 1) / 2) / ((TENTACLE_COUNT - 1) / 2)
    const baseCol = cx + angle * tentSpread
    const baseRow = cy + 0.4
    const tentaclePhase = n * TENTACLE_PHASE_GAP

    for (let i = 0; i < TENTACLE_LENGTH; i++) {
      const wavePhase = k * i - omega * t_s + tentaclePhase

      const amplitude = 0.3 + i * 0.07
      const xOffset = Math.sin(wavePhase) * amplitude

      const convergence = -angle * i * 0.08

      const col = Math.round(baseCol + xOffset + convergence)
      const row = Math.round(baseRow + i + 1)

      if (row < 0 || row >= CANVAS_HEIGHT) continue
      if (col < 0 || col >= CANVAS_WIDTH) continue

      if (grid[row][col] === ' ') grid[row][col] = tentacleChar(i)
    }
  }

  // ─── Bubbles ───────────────────────────────────────────────────────────
  for (const b of bubbles) {
    const elapsed = (t - b.spawnT) / 1000
    if (elapsed < 0) continue
    const row = Math.round(CANVAS_HEIGHT - elapsed * b.speed)
    if (row < 0 || row >= CANVAS_HEIGHT) continue
    const wobble = Math.sin(t_s * 1.8 + b.wobblePhase) * 0.6
    const col = Math.round(b.baseCol + wobble)
    if (col < 0 || col >= CANVAS_WIDTH) continue
    if (grid[row][col] === ' ') grid[row][col] = b.char
  }

  return grid.map((row) => row.join('')).join('\n')
}

function AsciiJellyfish() {
  const ref = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (ref.current) ref.current.textContent = renderJellyfish(900, [])
      return
    }

    let raf = 0
    const start = performance.now()
    let lastUpdate = 0

    const bubbles: Bubble[] = []
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      bubbles.push(spawnBubble(-Math.random() * 12000))
    }

    function loop(now: number) {
      if (now - lastUpdate >= 50) {
        const t = now - start

        for (let i = 0; i < bubbles.length; i++) {
          const b = bubbles[i]
          const elapsed = (t - b.spawnT) / 1000
          if (elapsed > 0 && CANVAS_HEIGHT - elapsed * b.speed < -1) {
            bubbles[i] = spawnBubble(t)
          }
        }

        if (ref.current) {
          ref.current.textContent = renderJellyfish(t, bubbles)
        }
        lastUpdate = now
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <pre
      ref={ref}
      className="ascii-jellyfish"
      role="img"
      aria-label="An ASCII jellyfish drifting in dark water."
    />
  )
}

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
        <AsciiJellyfish />
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
