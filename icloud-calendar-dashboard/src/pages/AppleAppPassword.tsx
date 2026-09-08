import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DocsHeader } from '../components/DocsHeader'

interface Step {
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    title: 'Go to appleid.apple.com and sign in',
    description:
      'Sign in with your Apple ID and password. Use Chrome, Firefox, or Edge rather than Safari, which some users report issues with during this flow.',
  },
  {
    title: 'Open Sign-In and Security',
    description: 'In the left sidebar (or main menu on mobile), select "Sign-In and Security."',
  },
  {
    title: 'Select App-Specific Passwords',
    description: 'Click "App-Specific Passwords" in that section.',
  },
  {
    title: 'Generate a new password',
    description: 'Click "Generate an app-specific password" or the "+" button.',
  },
  {
    title: 'Label it',
    description: 'Give it a name you\'ll recognize later, e.g. "Syncal" — this makes it easy to identify and revoke later if needed.',
  },
  {
    title: 'Copy the generated password',
    description: "Apple shows it once. Copy it immediately; you won't be able to view it again after leaving the page.",
  },
  {
    title: 'Paste it into Syncal',
    description: 'Use this password (not your regular Apple ID password) when adding a calendar in the Syncal dashboard.',
  },
]

function StepCard({ number, step }: { number: number; step: Step }) {
  return (
    <div className="flex gap-4 rounded-md border border-line bg-white p-5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cobalt-tint font-mono text-sm font-semibold text-cobalt">
        {number}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{step.description}</p>
      </div>
    </div>
  )
}

export function AppleAppPassword() {
  return (
    <div className="min-h-screen bg-paper">
      <DocsHeader />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/docs" className="text-sm font-medium text-cobalt hover:text-cobalt-hover">
          ← Back to docs
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-ink">Setting up your Apple app-specific password</h1>

        <p className="mt-4 text-sm text-ink-muted">
          Syncal connects to iCloud Calendar using an app-specific password — a separate password Apple
          generates specifically for third-party apps, so your real Apple ID password is never shared with
          us or stored anywhere. You'll need to generate one before connecting a calendar.
        </p>

        <div className="mt-6 flex gap-3 rounded-md border border-signal-amber/30 bg-signal-amber-bg p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-signal-amber" />
          <p className="text-sm text-signal-amber">
            Two-factor authentication must be enabled on your Apple ID before you can generate an
            app-specific password. If you're not sure, sign in at appleid.apple.com and check the
            Sign-In and Security section.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {STEPS.map((step, index) => (
            <StepCard key={step.title} number={index + 1} step={step} />
          ))}
        </div>

        <div className="mt-8 space-y-3 text-sm text-ink-muted">
          <p>
            Changing your Apple ID password automatically revokes all app-specific passwords. If a
            connected calendar shows "Needs reconnect," this is the most common cause — generate a new
            app-specific password and update it in your dashboard.
          </p>
          <p>
            You can have up to 25 active app-specific passwords, and revoke any of them individually from
            the same Apple ID page at any time.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-line pt-6">
          <Link to="/dashboard/end-users" className="text-sm font-medium text-cobalt hover:text-cobalt-hover">
            Add a calendar in your dashboard
          </Link>
          <Link to="/docs" className="text-sm font-medium text-cobalt hover:text-cobalt-hover">
            Back to docs
          </Link>
        </div>
      </div>
    </div>
  )
}
