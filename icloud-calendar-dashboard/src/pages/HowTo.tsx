import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { EndUser } from '../api/types'
import { useApi } from '../api/useApi'
import { CopyButton } from '../components/CopyButton'

const API_BASE_URL = 'https://icloud-calendar-production.up.railway.app'

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function HeaderRow({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
      <code className="rounded-md bg-cobalt-tint px-3 py-2 font-mono text-xs text-ink">{name}</code>
      <code className="rounded-md bg-cobalt-tint px-3 py-2 font-mono text-xs text-ink">{value}</code>
    </div>
  )
}

function AuthPlaceholder() {
  return <span className="text-ink-muted italic">&lt;your_api_key&gt;</span>
}

export function HowTo() {
  const api = useApi()
  const [endUsers, setEndUsers] = useState<EndUser[]>([])
  const [loadingEndUsers, setLoadingEndUsers] = useState(true)

  const [startDate] = useState(() => toDateInputValue(new Date()))
  const [endDate] = useState(() => toDateInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)))

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadingEndUsers(true)
      try {
        const data = await api.getEndUsers()
        if (!cancelled) setEndUsers(data)
      } finally {
        if (!cancelled) setLoadingEndUsers(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstEndUser = endUsers[0]
  const exampleUserId = firstEndUser?.userId ?? '{userId}'
  const exampleUrl = `${API_BASE_URL}/v1/users/${exampleUserId}/events?start=${startDate}&end=${endDate}`

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h1 className="text-lg font-semibold text-ink">Base URL</h1>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md bg-cobalt-tint px-3 py-2 font-mono text-sm text-ink">
              {API_BASE_URL}
            </code>
            <CopyButton value={API_BASE_URL} label="Copy base URL" />
          </div>
          <p className="mt-2 text-sm text-ink-muted">All requests are made to this base URL.</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Authentication</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-ink-muted">
            Requests are authenticated with an <code className="font-mono text-ink">Authorization</code>{' '}
            header:
          </p>
          <div className="mt-3">
            <HeaderRow
              name="Authorization"
              value={
                <>
                  Bearer <AuthPlaceholder />
                </>
              }
            />
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Generate or copy your API key from the{' '}
            <Link to="/dashboard" className="font-medium text-cobalt hover:text-cobalt-hover">
              API Keys tab
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Example — Get Events</h2>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex shrink-0 items-center rounded-md bg-signal-green-bg px-2 py-1 font-mono text-xs font-semibold text-signal-green">
                GET
              </span>
              <code className="flex-1 overflow-x-auto rounded-md bg-cobalt-tint px-3 py-2 font-mono text-xs text-ink">
                {exampleUrl}
              </code>
              <CopyButton value={exampleUrl} label="Copy request URL" />
            </div>

            {!loadingEndUsers && !firstEndUser && (
              <p className="mt-2 text-sm text-ink-muted">
                Add a calendar first to see this personalized with a real ID.{' '}
                <Link
                  to="/dashboard/end-users"
                  className="font-medium text-cobalt hover:text-cobalt-hover"
                >
                  Add a calendar
                </Link>
              </p>
            )}

            <p className="mt-2 text-sm text-ink-muted">
              <code className="font-mono text-ink">start</code> and{' '}
              <code className="font-mono text-ink">end</code> are ISO dates defining the range of
              events to fetch.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Headers</p>
            <HeaderRow
              name="Authorization"
              value={
                <>
                  Bearer <AuthPlaceholder />
                </>
              }
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Response</p>
            <pre className="overflow-x-auto rounded-md bg-cobalt-tint p-4 font-mono text-xs text-ink">
              {`[
  {
    "eventId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Team sync",
    "start": "2026-09-08T09:00:00Z",
    "end": "2026-09-08T09:30:00Z",
    "location": "",
    "notes": ""
  }
]`}
            </pre>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Next Steps</h2>
        </div>
        <div className="flex flex-col gap-2 p-6">
          <Link to="/dashboard/playground" className="text-sm font-medium text-cobalt hover:text-cobalt-hover">
            Try it live in the Playground
          </Link>
          <Link to="/dashboard/end-users" className="text-sm font-medium text-cobalt hover:text-cobalt-hover">
            See your Calendars
          </Link>
        </div>
      </section>
    </div>
  )
}
