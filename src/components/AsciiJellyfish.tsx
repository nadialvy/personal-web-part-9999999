import { useEffect, useRef } from 'react'

// ─── Canvas ──────────────────────────────────────────────────────────────
const CANVAS_WIDTH = 60
const CANVAS_HEIGHT = 28

// ─── Bell ────────────────────────────────────────────────────────────────
const BELL_BASE_WIDTH = 16
const BELL_BASE_HEIGHT = 7
const PULSE_PERIOD_MS = 4500

// ─── Tentacles ───────────────────────────────────────────────────────────
const TENTACLE_COUNT = 9
const TENTACLE_LENGTH = 13
const TENTACLE_WAVELENGTH = 9
const TENTACLE_WAVE_SPEED = 1.8
const TENTACLE_PHASE_GAP = 0.35
const TENTACLE_HALF_SPREAD = 9

// ─── Ambience ────────────────────────────────────────────────────────────
const BUBBLE_COUNT = 7

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

interface Fish {
  x: number
  y: number
  direction: 1 | -1
  speed: number
  wobblePhase: number
}

function spawnFish(): Fish[] {
  return [
    { x: -3, y: 4, direction: 1, speed: 3.6, wobblePhase: 0 },
    { x: CANVAS_WIDTH + 3, y: 14, direction: -1, speed: 2.7, wobblePhase: 1.7 },
    { x: -3, y: 24, direction: 1, speed: 4.2, wobblePhase: 3.4 },
  ]
}

function updateFish(fish: Fish[], dt: number) {
  for (const f of fish) {
    f.x += f.direction * f.speed * dt
    if (f.direction > 0 && f.x > CANVAS_WIDTH + 4) f.x = -4
    if (f.direction < 0 && f.x < -4) f.x = CANVAS_WIDTH + 4
  }
}

function renderJellyfish(t: number, bubbles: Bubble[], fish: Fish[]): string {
  const grid: string[][] = []
  for (let r = 0; r < CANVAS_HEIGHT; r++) {
    grid.push(new Array<string>(CANVAS_WIDTH).fill(' '))
  }

  const t_s = t / 1000
  const pulse = pulseAt(t)

  const cx = CANVAS_WIDTH / 2
  const ambientY = Math.sin(t_s * 0.25) * 0.5
  const propulsionY = -pulse * 1.5
  const cy = CANVAS_HEIGHT * 0.4 + ambientY + propulsionY

  const bellW = BELL_BASE_WIDTH * (1 - pulse * 0.12)
  const bellH = BELL_BASE_HEIGHT * (1 + pulse * 0.18)

  // Bell
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

  // Rim arc
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

  // Tentacles
  const k = (Math.PI * 2) / TENTACLE_WAVELENGTH
  const omega = k * TENTACLE_WAVE_SPEED
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

  // Fish (behind jellyfish via the empty-cell guard).
  // Characters fade based on distance from the canvas edge: invisible for
  // the first 2 cols, dim `.` for the next 3, then the full `>` / `<`.
  // This makes the fish glide smoothly into and out of view at both edges
  // rather than popping in/out at full visibility.
  for (const f of fish) {
    const wobble = Math.sin(t_s * 1.6 + f.wobblePhase) * 0.5
    const dy = Math.round(f.y + wobble)
    if (dy < 0 || dy >= CANVAS_HEIGHT) continue
    const dx = Math.round(f.x)
    const chars = f.direction > 0 ? '><>' : '<><'
    for (let i = 0; i < chars.length; i++) {
      const c = dx + i
      if (c < 0 || c >= CANVAS_WIDTH) continue
      const edgeDist = Math.min(c, CANVAS_WIDTH - 1 - c)
      if (edgeDist < 2) continue
      const char = edgeDist < 5 ? '.' : chars[i]
      if (grid[dy][c] === ' ') grid[dy][c] = char
    }
  }

  // Bubbles
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

interface AsciiJellyfishProps {
  className?: string
  ariaLabel?: string
}

export default function AsciiJellyfish({
  className,
  ariaLabel = 'A drifting ASCII jellyfish, with fish swimming nearby.',
}: AsciiJellyfishProps) {
  const ref = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (ref.current) {
        ref.current.textContent = renderJellyfish(900, [], spawnFish())
      }
      return
    }

    let raf = 0
    const start = performance.now()
    let lastFishTick = performance.now()

    const bubbles: Bubble[] = []
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      bubbles.push(spawnBubble(-Math.random() * 12000))
    }

    const fish = spawnFish()

    function loop(now: number) {
      const t = now - start

      const dt = Math.min(0.05, (now - lastFishTick) / 1000)
      lastFishTick = now
      updateFish(fish, dt)

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i]
        const elapsed = (t - b.spawnT) / 1000
        if (elapsed > 0 && CANVAS_HEIGHT - elapsed * b.speed < -1) {
          bubbles[i] = spawnBubble(t)
        }
      }

      if (ref.current) {
        ref.current.textContent = renderJellyfish(t, bubbles, fish)
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <pre
      ref={ref}
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  )
}
