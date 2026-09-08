import { severityOfStatus, type StatusSeverity } from './httpStatus'

const BADGE_CLASSES: Record<StatusSeverity, string> = {
  success: 'bg-signal-green-bg text-signal-green',
  warning: 'bg-signal-amber-bg text-signal-amber',
  error: 'bg-signal-red-bg text-signal-red',
}

export function HttpStatusBadge({ status }: { status: string }) {
  const severity = severityOfStatus(status)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${BADGE_CLASSES[severity]}`}
    >
      {status}
    </span>
  )
}
