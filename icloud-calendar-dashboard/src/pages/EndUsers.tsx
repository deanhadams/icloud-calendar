import { useEffect, useState } from 'react'
import type { EndUser } from '../api/types'
import { useApi } from '../api/useApi'
import { StatusBadge } from '../components/StatusBadge'

export function EndUsers() {
  const api = useApi()
  const [endUsers, setEndUsers] = useState<EndUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getEndUsers()
        if (!cancelled) setEndUsers(data)
      } catch {
        if (!cancelled) setError('Failed to load end users.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="overflow-hidden rounded-md border border-line bg-white">
      <div className="border-b border-line bg-cobalt-tint px-6 py-4">
        <h1 className="text-lg font-semibold text-ink">End Users</h1>
      </div>

      <div className="p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : endUsers.length === 0 ? (
            <p className="text-sm text-ink-muted">No end users yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="py-2 pr-4 text-xs font-medium">Email</th>
                  <th className="py-2 pr-4 text-xs font-medium">Calendar</th>
                  <th className="py-2 pr-4 text-xs font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {endUsers.map((user) => (
                  <tr key={user.userId} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 font-mono text-ink">{user.icloudEmail}</td>
                    <td className="py-3 pr-4 font-mono text-ink">{user.calendarName}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={user.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  )
}
