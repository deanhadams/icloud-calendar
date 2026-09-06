import { useEffect, useState } from 'react'
import type { EndUser } from '../api/types'
import { useApi } from '../api/useApi'
import { AddEndUserModal } from '../components/AddEndUserModal'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'

export function EndUsers() {
  const api = useApi()
  const [endUsers, setEndUsers] = useState<EndUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
  }, [refreshToken])

  const handleAddSuccess = () => {
    setIsAddOpen(false)
    setSuccessMessage('End user added — you can now create calendar events for them via the API')
    setRefreshToken((n) => n + 1)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const connectedCount = endUsers.filter((user) => user.status === 'connected').length

  return (
    <section className="overflow-hidden rounded-md border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line bg-cobalt-tint px-6 py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-ink">End Users</h1>
          {!loading && (
            <span className="inline-flex items-center gap-1 rounded-full border border-cobalt/20 bg-cobalt-tint px-2.5 py-0.5 text-xs font-medium text-cobalt">
              <span className="font-mono">{connectedCount}</span> connected
            </span>
          )}
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          Add End User
        </Button>
      </div>

      <div className="p-6">
        {successMessage && (
          <p className="mb-3 rounded-md bg-signal-green-bg px-3 py-2 text-sm text-signal-green">
            {successMessage}
          </p>
        )}
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : endUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-ink-muted">
                Add your first end user to start syncing their iCloud calendar.
              </p>
              <Button variant="primary" onClick={() => setIsAddOpen(true)}>
                Add End User
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="py-2 pr-4 text-xs font-medium">Email</th>
                  <th className="py-2 pr-4 text-xs font-medium">Calendar</th>
                  <th className="py-2 pr-4 text-xs font-medium">User ID</th>
                  <th className="py-2 pr-4 text-xs font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {endUsers.map((user) => (
                  <tr key={user.userId} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 font-mono text-ink">{user.icloudEmail}</td>
                    <td className="py-3 pr-4 font-mono text-ink">{user.calendarName}</td>
                    <td className="py-3 pr-4 font-mono text-ink">{user.userId}</td>
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

      {isAddOpen && (
        <AddEndUserModal onClose={() => setIsAddOpen(false)} onSuccess={handleAddSuccess} />
      )}
    </section>
  )
}
