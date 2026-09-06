import { useEffect, useState } from 'react'
import type { ApiKeySummary } from '../api/types'
import { useApi } from '../api/useApi'
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

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold text-slate-900">Account</h1>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-500">Name</dt>
          <dd className="text-slate-900">{client?.name}</dd>
          <dt className="text-slate-500">Email</dt>
          <dd className="text-slate-900">{client?.email}</dd>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? 'Generating…' : 'Generate New Key'}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-slate-500">No API keys yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Tier</th>
                  <th className="py-2 pr-4 font-medium">Created</th>
                  <th className="py-2 pr-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4">
                      <StatusBadge status={k.status} />
                    </td>
                    <td className="py-2 pr-4 text-slate-900">{k.tier}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {k.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(k.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {newKey && <NewKeyModal apiKey={newKey} onDismiss={() => setNewKey(null)} />}
    </div>
  )
}
