import { Button } from './Button'
import { CopyButton } from './CopyButton'

export function NewKeyModal({ apiKey, onDismiss }: { apiKey: string; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-ink/50 p-4">
      <div className="animate-key-reveal w-full max-w-md rounded-md border border-dashed border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-ink">New API key generated</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Copy this key now. For security, it won't be shown again.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-md bg-paper px-3 py-2 font-mono text-sm text-ink">
            {apiKey}
          </code>
          <CopyButton value={apiKey} label="Copy API key" />
        </div>
        <Button variant="secondary" onClick={onDismiss} className="mt-6 w-full">
          Done
        </Button>
      </div>
    </div>
  )
}
