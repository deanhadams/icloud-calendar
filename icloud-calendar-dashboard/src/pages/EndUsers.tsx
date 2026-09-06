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
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-lg font-semibold text-slate-900">End Users</h1>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : endUsers.length === 0 ? (
          <p className="text-sm text-slate-500">No end users yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Calendar</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {endUsers.map((user) => (
                <tr key={user.userId} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-4 text-slate-900">{user.icloudEmail}</td>
                  <td className="py-2 pr-4 text-slate-900">{user.calendarName}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={user.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
