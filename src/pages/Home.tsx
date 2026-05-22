import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useReveal } from '../hooks/useReveal'
import { useCyclingPhrase } from '../hooks/useCyclingPhrase'
import AsciiJellyfish from '../components/AsciiJellyfish'

const WORK: ReadonlyArray<{
  n: string
  title: string
  context: string
  year: string
  href: string | null
}> = [
  {
    n: 'N1',
    title: 'Marinachain',
    context: 'Vessel management and emissions compliance for shipping fleets',
    year: '2025—',
    href: 'https://www.marinachain.io/',
  },
  {
    n: 'N2',
    title: 'Mie Sedaap × Come See Me',
    context: 'Brand campaign site, 3D and animation-heavy, with a Payload CMS underneath',
    year: '2025',
    href: null,
  },
  {
    n: 'N3',
    title: 'INI LHO ITS!',
    context: 'Tryout ticketing for 15k+ students; shipped 20+ features as PM',
    year: '2024',
    href: null,
  },
]

const ITALIC_PHRASES = [
  'the slow parts of',
  'the patient parts of',
  'the back-office of',
] as const

const ROW_BASE_DELAY = 220
const ROW_STAGGER = 100

function delay(ms: number): CSSProperties {
  return { '--delay': `${ms}ms` } as CSSProperties
}

function CompassRose({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M 12 0 L 13.3 10.7 L 23 12 L 13.3 13.3 L 12 24 L 10.7 13.3 L 1 12 L 10.7 10.7 Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Header() {
  const { ref, revealed } = useReveal<HTMLElement>({ immediate: true })
  return (
    <header
      ref={ref}
      className={`site-header ${revealed ? 'is-revealed' : ''}`}
    >
      <a href="/" className="brand-mark" aria-label="Home">
        <CompassRose className="brand-rose" />
        <span className="wordmark rise-mask">
          <span className="rise-inner" style={delay(380)}>
            nadia
          </span>
        </span>
      </a>
      <nav className="site-nav" aria-label="Primary">
        <a href="#work" className="hush" style={delay(440)}>
          work
        </a>
        <a href="/writing" className="hush" style={delay(495)}>
          writing
        </a>
        <a href="/play" className="hush" style={delay(550)}>
          play
        </a>
        <a href="#contact" className="hush" style={delay(605)}>
          contact
        </a>
      </nav>
    </header>
  )
}

function Hero() {
  const { ref, revealed } = useReveal<HTMLElement>({ immediate: true })
  const cycling = useCyclingPhrase(ITALIC_PHRASES)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let pmx = 0
    let pmy = 0
    let targetMx = 0
    let targetMy = 0

    function onPointerMove(e: PointerEvent) {
      const r = node!.getBoundingClientRect()
      targetMx = (e.clientX - r.left - r.width / 2) / r.width
      targetMy = (e.clientY - r.top - r.height / 2) / r.height
    }

    function onPointerLeave() {
      targetMx = 0
      targetMy = 0
    }

    function loop() {
      pmx += (targetMx - pmx) * 0.06
      pmy += (targetMy - pmy) * 0.06
      node!.style.setProperty('--pmx', pmx.toFixed(4))
      node!.style.setProperty('--pmy', pmy.toFixed(4))
      raf = requestAnimationFrame(loop)
    }

    node.addEventListener('pointermove', onPointerMove)
    node.addEventListener('pointerleave', onPointerLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      node.removeEventListener('pointermove', onPointerMove)
      node.removeEventListener('pointerleave', onPointerLeave)
      cancelAnimationFrame(raf)
    }
  }, [ref])

  return (
    <section
      ref={ref}
      className={`hero ${revealed ? 'is-revealed' : ''}`}
      aria-labelledby="hero-title"
    >
      <div className="hero-sea-backdrop" aria-hidden="true">
        <AsciiJellyfish className="hero-sea" ariaLabel="" />
      </div>
      <h1 id="hero-title" className="hero-display">
        <span className="hero-line rise-mask">
          <span className="rise-inner" style={delay(520)}>
            I build software for
          </span>
        </span>
        <span className="hero-line rise-mask">
          <span className="rise-inner" style={delay(660)}>
            <em
              className={`hero-italic phase-${cycling.phase}`}
              key={cycling.index}
            >
              {cycling.phrase}
            </em>
          </span>
        </span>
        <span className="hero-line rise-mask">
          <span className="rise-inner" style={delay(800)}>
            fast industries.
          </span>
        </span>
      </h1>
      <p className="hero-lead hush" style={delay(1080)}>
        Currently with Marinachain, building software for vessel management
        and maritime emissions compliance. Previously at Zero One Group and
        RevoU. Based in Indonesia.
      </p>
    </section>
  )
}

function SectionLabel({
  index,
  label,
  delay: delayMs = 0,
}: {
  index: string
  label: string
  delay?: number
}) {
  return (
    <div className="section-label-mask rise-mask">
      <div className="section-label rise-inner" style={delay(delayMs)}>
        <span className="bracket" aria-hidden="true">
          [
        </span>
        <span className="section-label-index">{index}</span>
        <span className="section-label-text">{label}</span>
        <span className="bracket" aria-hidden="true">
          ]
        </span>
      </div>
    </div>
  )
}

function WorkEntryContent({
  entry,
}: {
  entry: { n: string; title: string; context: string; year: string }
}) {
  return (
    <>
      <span className="work-index">{entry.n}</span>
      <span className="work-title">{entry.title}</span>
      <span className="work-context">{entry.context}</span>
      <span className="work-year">{entry.year}</span>
    </>
  )
}

function SelectedWork() {
  const { ref, revealed } = useReveal<HTMLElement>()
  return (
    <section
      ref={ref}
      id="work"
      className={`work ${revealed ? 'is-revealed' : ''}`}
      aria-labelledby="work-title"
    >
      <SectionLabel index="N1" label="SELECTED WORK" delay={0} />
      <h2 id="work-title" className="visually-hidden">
        Selected work
      </h2>
      <ol className="work-list">
        {WORK.map((entry, i) => {
          const rowDelay = ROW_BASE_DELAY + i * ROW_STAGGER
          const external = entry.href !== null
          const rowStyle = {
            '--row-delay': `${rowDelay}ms`,
            '--delay': `${rowDelay}ms`,
          } as CSSProperties
          return (
            <li key={entry.n} className="work-row" style={rowStyle}>
              {external ? (
                <a
                  href={entry.href ?? '#'}
                  className="work-link hush"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WorkEntryContent entry={entry} />
                </a>
              ) : (
                <div className="work-link hush is-static">
                  <WorkEntryContent entry={entry} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Footer() {
  const { ref, revealed } = useReveal<HTMLElement>()
  return (
    <footer
      ref={ref}
      id="contact"
      className={`site-footer ${revealed ? 'is-revealed' : ''}`}
      aria-label="Contact"
    >
      <div className="footer-inner">
        <CompassRose className="footer-rose hush" />
        <div className="footer-content">
          <p className="footer-eyebrow hush" style={delay(160)}>
            Get in touch
          </p>
          <div className="footer-email-mask rise-mask">
            <a
              href="mailto:nadia@marinachain.io"
              className="footer-email rise-inner"
              style={delay(260)}
            >
              nadia@marinachain.io
            </a>
          </div>
          <ul className="footer-links">
            <li className="hush" style={delay(440)}>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin
              </a>
            </li>
            <li className="hush" style={delay(500)}>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                github
              </a>
            </li>
            <li className="hush" style={delay(560)}>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                x
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-wordmark-mask rise-mask">
          <div
            className="footer-wordmark rise-inner"
            style={delay(720)}
            aria-hidden="true"
          >
            nadia
          </div>
        </div>
        <div className="footer-meta hush" style={delay(1040)}>
          <span>© {new Date().getFullYear()}</span>
          <span>Made in Indonesia</span>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SelectedWork />
      </main>
      <Footer />
    </>
  )
}
