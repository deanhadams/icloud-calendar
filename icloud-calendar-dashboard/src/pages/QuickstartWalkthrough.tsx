import { Link } from 'react-router-dom'
import { CodeWalkthrough } from '../components/CodeWalkthrough'
import { DocsHeader } from '../components/DocsHeader'

export function QuickstartWalkthrough() {
  return (
    <div className="min-h-screen bg-paper">
      <DocsHeader />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link to="/docs" className="text-sm font-medium text-cobalt hover:text-cobalt-hover">
          ← Back to docs
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-ink">Building the integration</h1>

        <p className="mt-4 text-sm text-ink-muted">
          A five-step walkthrough of the exact calls you'll make to connect a customer's iCloud calendar and
          start reading and writing events.
        </p>

        <div className="mt-8">
          <CodeWalkthrough />
        </div>
      </div>
    </div>
  )
}
