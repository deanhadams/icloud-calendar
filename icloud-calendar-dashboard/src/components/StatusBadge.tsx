const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  connected: 'bg-green-100 text-green-800',
  revoked: 'bg-slate-200 text-slate-600',
  needs_reconnect: 'bg-orange-100 text-orange-800',
}

const DEFAULT_STYLE = 'bg-slate-100 text-slate-700'

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STYLE
  const label = status.replace(/_/g, ' ')

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  )
}
