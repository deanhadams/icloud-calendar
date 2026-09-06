import { useState } from 'react'
import { Button } from './Button'

export function NewKeyModal({ apiKey, onDismiss }: { apiKey: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy API key"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
          >
            {copied ? (
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M4 10.5l3.5 3.5L16 5.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-7A1.5 1.5 0 0 0 3 5.5v7A1.5 1.5 0 0 0 4.5 14H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
        <Button variant="secondary" onClick={onDismiss} className="mt-6 w-full">
          Done
        </Button>
      </div>
    </div>
  )
}
