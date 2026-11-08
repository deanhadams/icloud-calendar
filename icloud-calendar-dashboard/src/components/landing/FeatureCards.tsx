import { BookOpen, Code, KeyRound, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Per-card accent classes. Written out in full (not interpolated) so Tailwind
 * can detect every class at build time.
 */
interface Accent {
  /** Icon circle background + icon color. */
  iconCircle: string
  icon: string
  /** 3px top border at rest; full border + keyboard focus ring in the accent on hover/focus. */
  card: string
  /** Link color at rest and while the card is hovered. */
  link: string
}

const ACCENTS = {
  cobalt: {
    iconCircle: 'bg-cobalt-tint',
    icon: 'text-cobalt',
    card: 'border-t-cobalt hover:border-cobalt has-[a:focus-visible]:border-cobalt has-[a:focus-visible]:outline-cobalt',
    link: 'text-cobalt group-hover:text-cobalt-hover',
  },
  violet: {
    iconCircle: 'bg-violet-tint',
    icon: 'text-violet',
    card: 'border-t-violet hover:border-violet has-[a:focus-visible]:border-violet has-[a:focus-visible]:outline-violet',
    link: 'text-violet-strong group-hover:text-violet-deep',
  },
  green: {
    iconCircle: 'bg-signal-green-bg',
    icon: 'text-signal-green-strong',
    card: 'border-t-signal-green hover:border-signal-green has-[a:focus-visible]:border-signal-green has-[a:focus-visible]:outline-signal-green',
    link: 'text-signal-green-strong group-hover:text-signal-green-deep',
  },
} satisfies Record<string, Accent>

interface Feature {
  icon: LucideIcon
  accent: Accent
  title: string
  description: string
  href: string
  linkLabel: string
}

const FEATURES: Feature[] = [
  {
    icon: KeyRound,
    accent: ACCENTS.cobalt,
    title: 'Set up your Apple app password',
    description:
      'Generate an app-specific password from your Apple ID so iCalSync can authenticate with your calendar securely, without your main password.',
    href: '/docs/apple-app-password',
    linkLabel: 'View guide',
  },
  {
    icon: BookOpen,
    accent: ACCENTS.violet,
    title: 'Setup documentation',
    description:
      'Everything you need to authenticate, list calendars, and start reading and writing events with the REST API.',
    href: '/docs',
    linkLabel: 'Read the docs',
  },
  {
    icon: Code,
    accent: ACCENTS.green,
    title: "See how it's built",
    description:
      'A step-by-step code walkthrough covering account setup, your first API call, and handling recurring events.',
    href: '/docs/quickstart-walkthrough',
    linkLabel: 'View the walkthrough',
  },
]

// - ring-8 ring-paper: a solid band in the section's own background colour around each card, so the
//   bg-grid lines never run into a card's edges or rounded corners. Invisible against the paper
//   background; it is not a shadow.
// - The whole card is the click target: the link's ::after stretches over the card (`relative` here).
// - Keyboard focus (focus-visible on the link) gets the same lift + accent border as hover, plus a
//   2px accent outline so focus is unmistakable. Mouse clicks don't trigger the outline.
// - Only translate and border-color animate; reduced-motion users get the colour change without the lift.
const CARD_BASE = [
  'group relative flex flex-col rounded-md border border-line border-t-[3px] bg-white p-6 ring-8 ring-paper',
  'transition-[translate,border-color] duration-200 ease-out',
  'hover:-translate-y-1 active:-translate-y-0.5',
  'outline-offset-4 has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:outline-2',
  // `!` is required: the :hover / :has() translate rules out-specify a plain media-query class.
  'motion-reduce:translate-none!',
].join(' ')

const LINK_BASE = [
  'mt-auto inline-block self-start pt-4 text-sm font-medium underline-offset-4 transition-colors duration-200',
  'group-hover:underline focus-visible:underline focus-visible:outline-none',
  "after:absolute after:inset-0 after:rounded-md after:content-['']",
].join(' ')

export function FeatureCards() {
  return (
    <section className="bg-grid bg-paper" aria-labelledby="feature-cards-heading">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 id="feature-cards-heading" className="text-3xl font-semibold text-balance text-ink">
          Everything you need to get started
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, accent, title, description, href, linkLabel }) => (
            <div key={title} className={`${CARD_BASE} ${accent.card}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${accent.iconCircle}`}>
                <Icon className={`h-5 w-5 ${accent.icon}`} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-balance text-ink">{title}</h3>
              <p className="mt-2 text-sm text-pretty text-ink-muted">{description}</p>
              {href.startsWith('/') ? (
                <Link to={href} className={`${LINK_BASE} ${accent.link}`}>
                  {linkLabel}
                  <span className="sr-only"> — {title}</span>
                </Link>
              ) : (
                <a href={href} className={`${LINK_BASE} ${accent.link}`}>
                  {linkLabel}
                  <span className="sr-only"> — {title}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
