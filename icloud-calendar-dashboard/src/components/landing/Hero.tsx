import { Link } from 'react-router-dom'
import { useSignInModal } from '../../context/useSignInModal'

// Headline options considered:
// 1. "iCloud Calendar, without the CalDAV headache"
// 2. "Read and write iCloud Calendar events. Skip the CalDAV grief."
// 3. "The REST API iCloud Calendar should have shipped with"
// Chosen: #1 — names the exact pain point a developer would search for, and
// "CalDAV headache" reads as specific rather than generic marketing copy.

export function Hero() {
  const { open } = useSignInModal()

  return (
    <section className="bg-grid-dark relative overflow-hidden bg-ink">
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute top-[-120px] right-[-80px] h-[700px] w-[700px] rounded-full"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-32 sm:py-40">
        <div className="max-w-2xl">
          <h1 className="text-5xl leading-tight font-bold text-white sm:text-6xl">
            iCloud Calendar, without the CalDAV headache
          </h1>
          <p className="mt-6 max-w-[500px] text-lg text-paper/60">
            A simple REST API for reading and writing iCloud Calendar events — no CalDAV protocol
            knowledge required.
          </p>

          <div className="mt-10 flex items-center gap-6">
            <button
              type="button"
              onClick={open}
              className="rounded-md bg-cobalt px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-cobalt-hover"
            >
              Get API Access
            </button>
            <Link to="/docs" className="text-sm font-medium text-paper/70 hover:text-paper">
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
