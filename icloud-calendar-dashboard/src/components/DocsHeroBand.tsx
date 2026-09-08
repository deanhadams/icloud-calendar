import { Link } from 'react-router-dom'

interface DocsHeroBandProps {
  title: string
  subtitle: string
  backTo?: string
  backLabel?: string
}

// Compact hero band for /docs pages — same ink background + blurred
// cobalt/violet glow as the landing page hero, scaled down to a band rather
// than a full-viewport section.
export function DocsHeroBand({ title, subtitle, backTo, backLabel = '← Back to docs' }: DocsHeroBandProps) {
  return (
    <div className="bg-grid-dark relative overflow-hidden bg-ink">
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute top-[-140px] right-[-100px] h-[420px] w-[420px] rounded-full"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        {backTo && (
          <Link to={backTo} className="text-sm font-medium text-paper/70 hover:text-paper">
            {backLabel}
          </Link>
        )}
        <h1 className={`text-3xl font-bold text-white sm:text-4xl ${backTo ? 'mt-3' : ''}`}>{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-paper/60 sm:text-base">{subtitle}</p>
      </div>
    </div>
  )
}
