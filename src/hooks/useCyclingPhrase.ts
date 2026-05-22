import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'exiting' | 'entering'

interface UseCyclingPhraseOptions {
  initialDelay?: number
  hold?: number
  exit?: number
}

export function useCyclingPhrase(
  phrases: readonly string[],
  {
    initialDelay = 6500,
    hold = 4800,
    exit = 480,
  }: UseCyclingPhraseOptions = {},
) {
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const cancelled = useRef(false)

  useEffect(() => {
    if (phrases.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    cancelled.current = false

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms))

    const nextFrame = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

    async function run() {
      await sleep(initialDelay)
      if (cancelled.current) return

      for (let step = 1; step <= phrases.length; step++) {
        setPhase('exiting')
        await sleep(exit)
        if (cancelled.current) return

        setIdx(step % phrases.length)
        setPhase('entering')
        await nextFrame()
        if (cancelled.current) return

        setPhase('idle')
        await sleep(hold)
        if (cancelled.current) return
      }
    }

    run()

    return () => {
      cancelled.current = true
    }
  }, [phrases, initialDelay, hold, exit])

  return { phrase: phrases[idx], phase, index: idx }
}
