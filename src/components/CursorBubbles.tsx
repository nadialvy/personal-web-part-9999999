import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

interface CursorBubble {
  id: number
  x: number
  y: number
  char: string
  dx: number
  rise: number
  duration: number
  size: number
}

const SPAWN_THROTTLE_MS = 55
const POOL_MAX = 36
const BUBBLE_CHARS = ['o', '·', '.', 'o', 'O'] as const

let bubbleId = 0

export default function CursorBubbles() {
  const [bubbles, setBubbles] = useState<CursorBubble[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let lastSpawn = 0

    function onPointerMove(e: PointerEvent) {
      // Pin the head bubble to the cursor position via CSS custom properties
      // (zero-latency, no React state churn).
      const root = document.documentElement
      root.style.setProperty('--cursor-x', `${e.clientX}px`)
      root.style.setProperty('--cursor-y', `${e.clientY}px`)

      const now = performance.now()
      if (now - lastSpawn < SPAWN_THROTTLE_MS) return
      lastSpawn = now

      const id = ++bubbleId
      const x = e.clientX
      const y = e.clientY
      const char = BUBBLE_CHARS[Math.floor(Math.random() * BUBBLE_CHARS.length)]
      const dx = (Math.random() - 0.5) * 32
      const rise = 70 + Math.random() * 80
      const duration = 1500 + Math.random() * 1300
      const size = 0.65 + Math.random() * 0.55

      setBubbles((prev) => {
        const next = [...prev, { id, x, y, char, dx, rise, duration, size }]
        return next.length > POOL_MAX ? next.slice(next.length - POOL_MAX) : next
      })

      window.setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id))
      }, duration + 120)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  return (
    <div className="cursor-bubbles" aria-hidden="true">
      <span className="cursor-head">o</span>
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="cursor-bubble"
          style={
            {
              left: `${b.x}px`,
              top: `${b.y}px`,
              fontSize: `${b.size}rem`,
              '--cb-dx': `${b.dx}px`,
              '--cb-rise': `${b.rise}px`,
              '--cb-dur': `${b.duration}ms`,
            } as CSSProperties
          }
        >
          {b.char}
        </span>
      ))}
    </div>
  )
}
