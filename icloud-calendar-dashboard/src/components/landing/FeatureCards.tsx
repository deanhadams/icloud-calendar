import { BookOpen, KeyRound, PlayCircle, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Feature {
  icon: LucideIcon
  iconTint: string
  title: string
  description: string
  href: string
  linkLabel: string
}

const FEATURES: Feature[] = [
  {
    icon: KeyRound,
    iconTint: 'bg-cobalt/8',
    title: 'Set up your Apple app password',
    description:
      'Generate an app-specific password from your Apple ID so iSyncal can authenticate with your calendar securely, without your main password.',
    href: '/docs/apple-app-password',
    linkLabel: 'View guide',
  },
  {
    icon: BookOpen,
    iconTint: 'bg-cobalt/12',
    title: 'Setup documentation',
    description:
      'Everything you need to authenticate, list calendars, and start reading and writing events with the REST API.',
    href: '/docs',
    linkLabel: 'Read the docs',
  },
  {
    icon: PlayCircle,
    iconTint: 'bg-cobalt/16',
    title: 'Watch the walkthrough',
    description:
      'A ten-minute video covering account setup, your first API call, and handling recurring events.',
    href: '#',
    linkLabel: 'Watch on YouTube',
  },
]

export function FeatureCards() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-semibold text-ink">Everything you need to get started</h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, iconTint, title, description, href, linkLabel }) => (
            <div key={title} className="rounded-md border border-line bg-white p-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconTint}`}>
                <Icon className="h-5 w-5 text-cobalt" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{description}</p>
              {href.startsWith('/') ? (
                <Link
                  to={href}
                  className="mt-4 inline-block text-sm font-medium text-cobalt hover:text-cobalt-hover"
                >
                  {linkLabel}
                </Link>
              ) : (
                <a
                  href={href}
                  className="mt-4 inline-block text-sm font-medium text-cobalt hover:text-cobalt-hover"
                >
                  {linkLabel}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
