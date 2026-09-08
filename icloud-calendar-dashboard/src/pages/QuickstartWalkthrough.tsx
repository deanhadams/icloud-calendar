import { CodeWalkthrough } from '../components/CodeWalkthrough'
import { DocsHeader } from '../components/DocsHeader'
import { DocsHeroBand } from '../components/DocsHeroBand'

export function QuickstartWalkthrough() {
  return (
    <div className="min-h-screen bg-paper">
      <DocsHeader />
      <DocsHeroBand
        title="Building the integration"
        subtitle="A five-step walkthrough of the exact calls you'll make to connect a customer's iCloud calendar and start reading and writing events."
        backTo="/docs"
      />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <CodeWalkthrough />
      </div>
    </div>
  )
}
