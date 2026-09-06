import { useState } from 'react'

export function NewKeyModal({ apiKey, onDismiss }: { apiKey: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">New API key generated</h2>
        <p className="mt-2 text-sm font-medium text-red-600">
          Copy this key now. For security, it won't be shown again.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800">
            {apiKey}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Done
        </button>
      </div>
    </div>
  )
}
