export type StatusSeverity = 'success' | 'warning' | 'error'

export function severityOfStatus(status: string): StatusSeverity {
  const code = parseInt(status, 10)
  if (Number.isNaN(code) || code >= 500) return 'error'
  if (code >= 400) return 'warning'
  return 'success'
}

export const SEVERITY_BORDER_CLASSES: Record<StatusSeverity, string> = {
  success: 'border-l-signal-green',
  warning: 'border-l-signal-amber',
  error: 'border-l-signal-red',
}
