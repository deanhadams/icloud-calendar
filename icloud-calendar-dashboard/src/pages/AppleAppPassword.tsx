import { Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DocsHeader } from '../components/DocsHeader'
import { DocsHeroBand } from '../components/DocsHeroBand'
import { SetupSlideshow } from '../components/SetupSlideshow'
import { SETUP_STEPS } from '../components/setupSteps'

export function AppleAppPassword() {
  return (
    <div className="min-h-screen bg-paper">
      <DocsHeader />
      <DocsHeroBand
        title="Setting up your Apple app-specific password"
        subtitle="Syncal connects to iCloud Calendar using an app-specific password — a separate password Apple generates specifically for third-party apps, so your real Apple ID password is never shared with us or stored anywhere. You'll need to generate one before connecting a calendar."
        backTo="/docs"
      />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex gap-3 rounded-md border border-signal-amber/30 bg-signal-amber-bg p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-signal-amber" />
          <p className="text-sm text-signal-amber">
            Two-factor authentication must be enabled on your Apple ID before you can generate an
            app-specific password. If you're not sure, sign in at appleid.apple.com and check the
            Sign-In and Security section.
          </p>
        </div>

        <div className="mt-8">
          <SetupSlideshow />
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink">Quick reference</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink-muted">
            {SETUP_STEPS.map((step) => (
              <li key={step.title}>
                <span className="font-medium text-ink">{step.title}.</span> {step.description}
              </li>
            ))}
          </ol>
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
