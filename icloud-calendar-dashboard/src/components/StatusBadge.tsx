const STATUS_STYLES: Record<string, string> = {
  active: 'bg-signal-green-bg text-signal-green',
  connected: 'bg-signal-green-bg text-signal-green',
  revoked: 'bg-ink/5 text-ink-muted',
  needs_reconnect: 'bg-signal-amber-bg text-signal-amber',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  connected: 'Connected',
  revoked: 'Revoked',
  needs_reconnect: 'Needs reconnect',
}

const DEFAULT_STYLE = 'bg-ink/5 text-ink-muted'

function sentenceCase(status: string): string {
  const withSpaces = status.replace(/_/g, ' ')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STYLE
  const label = STATUS_LABELS[status] ?? sentenceCase(status)

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-xs font-medium ${style}`}
    >
      {label}
    </span>
  )
}
