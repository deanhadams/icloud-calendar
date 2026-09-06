import { useEffect, useState } from 'react'
import type { ApiKeySummary } from '../api/types'
import { useApi } from '../api/useApi'
import { Button } from '../components/Button'
import { NewKeyModal } from '../components/NewKeyModal'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/useAuth'

export function Dashboard() {
  const { client } = useAuth()
  const api = useApi()

  const [keys, setKeys] = useState<ApiKeySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadKeys() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getApiKeys()
        if (!cancelled) setKeys(data)
      } catch {
        if (!cancelled) setError('Failed to load API keys.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadKeys()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const created = await api.createApiKey()
      setNewKey(created.key)
      setRefreshToken((n) => n + 1)
    } catch {
      setError('Failed to generate a new API key.')
    } finally {
      setGenerating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Revoke this API key? This cannot be undone.')) {
      return
    }
    setError(null)
    try {
      await api.revokeApiKey(id)
      setRefreshToken((n) => n + 1)
    } catch {
      setError('Failed to revoke the API key.')
    }
  }

  const activeCount = keys.filter((k) => k.status === 'active').length

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h1 className="text-lg font-semibold text-ink">Account</h1>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 p-6 text-sm">
          <dt className="text-ink-muted">Name</dt>
          <dd className="text-ink">{client?.name}</dd>
          <dt className="text-ink-muted">Email</dt>
          <dd className="font-mono text-ink">{client?.email}</dd>
        </dl>
      </section>

      <section className="overflow-hidden rounded-md border border-line border-l-[3px] border-l-cobalt bg-white">
        <div className="flex items-center justify-between border-b border-line bg-cobalt-tint px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-ink">API Keys</h2>
            {!loading && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cobalt/20 bg-cobalt-tint px-2.5 py-0.5 text-xs font-medium text-cobalt">
                <span className="font-mono">{activeCount}</span> active
              </span>
            )}
          </div>
          <Button variant="primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate New Key'}
          </Button>
        </div>

        <div className="p-6">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-sm text-ink-muted">Loading…</p>
            ) : keys.length === 0 ? (
              <p className="text-sm text-ink-muted">No API keys yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-ink-muted">
                    <th className="py-2 pr-4 text-xs font-medium">Status</th>
                    <th className="py-2 pr-4 text-xs font-medium">Tier</th>
                    <th className="py-2 pr-4 text-xs font-medium">Created</th>
                    <th className="py-2 pr-4 text-xs font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-b border-line last:border-0">
                      <td className="py-3 pr-4">
                        <StatusBadge status={k.status} />
                      </td>
                      <td className="py-3 pr-4 font-mono text-ink">{k.tier}</td>
                      <td className="py-3 pr-4 font-mono text-ink-muted">
                        {new Date(k.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {k.status === 'active' && (
                          <Button variant="destructive" size="sm" onClick={() => handleRevoke(k.id)}>
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {newKey && <NewKeyModal apiKey={newKey} onDismiss={() => setNewKey(null)} />}
    </div>
  )
}
