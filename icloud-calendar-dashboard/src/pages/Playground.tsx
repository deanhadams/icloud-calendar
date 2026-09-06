import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import type { CalendarEvent, EndUser } from '../api/types'
import { useApi } from '../api/useApi'
import { Button } from '../components/Button'

const inputClassName =
  'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none'

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

type ErrorState = { kind: 'reconnect' | 'generic'; message: string }

export function Playground() {
  const api = useApi()

  const [endUsers, setEndUsers] = useState<EndUser[]>([])
  const [loadingEndUsers, setLoadingEndUsers] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')

  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()))
  const [endDate, setEndDate] = useState(() =>
    toDateInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  )

  const [submitting, setSubmitting] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[] | null>(null)
  const [errorState, setErrorState] = useState<ErrorState | null>(null)
  const [lastRequest, setLastRequest] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadEndUsers() {
      setLoadingEndUsers(true)
      try {
        const data = await api.getEndUsers()
        if (cancelled) return
        setEndUsers(data)
        if (data.length > 0) setSelectedUserId(data[0].userId)
      } finally {
        if (!cancelled) setLoadingEndUsers(false)
      }
    }

    loadEndUsers()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedUserId) return

    setSubmitting(true)
    setErrorState(null)
    setEvents(null)
    setLastRequest(`GET /v1/users/${selectedUserId}/events?start=${startDate}&end=${endDate}`)

    try {
      const data = await api.getEndUserEvents(selectedUserId, startDate, endDate)
      setEvents(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrorState({
          kind: 'reconnect',
          message:
            'This calendar needs to be reconnected to iCloud. Generate a fresh app-specific password and update it before retrying.',
        })
      } else {
        setErrorState({
          kind: 'generic',
          message: err instanceof ApiError ? err.message : 'Failed to fetch events. Please try again.',
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h1 className="text-lg font-semibold text-ink">Fetch Events</h1>
        </div>

        <div className="p-6">
          {loadingEndUsers ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : endUsers.length === 0 ? (
            <p className="text-sm text-ink-muted">
              You don't have any calendars yet.{' '}
              <Link to="/dashboard/end-users" className="font-medium text-cobalt hover:text-cobalt-hover">
                Add one first
              </Link>{' '}
              to try the playground.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="endUser" className="text-sm font-medium text-ink">
                  Select a calendar
                </label>
                <select
                  id="endUser"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  className={`mt-1.5 ${inputClassName}`}
                >
                  {endUsers.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.icloudEmail} — {user.calendarName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="text-sm font-medium text-ink">
                    Start date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    required
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className={`mt-1.5 ${inputClassName}`}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="text-sm font-medium text-ink">
                    End date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    required
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className={`mt-1.5 ${inputClassName}`}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Fetching…' : 'Get Events'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Results</h2>
        </div>

        <div className="p-6">
          {lastRequest && (
            <code className="mb-4 block rounded-md bg-cobalt-tint px-3 py-2 font-mono text-xs text-ink">
              {lastRequest}
            </code>
          )}

          {errorState ? (
            <p
              className={
                errorState.kind === 'reconnect'
                  ? 'rounded-md bg-signal-amber-bg px-3 py-2 text-sm text-signal-amber'
                  : 'text-sm text-red-600'
              }
            >
              {errorState.message}
            </p>
          ) : events === null ? (
            <p className="text-sm text-ink-muted">Run a request to see results here.</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-ink-muted">No events found in this date range.</p>
          ) : (
            <div>
              {events.map((event) => (
                <div key={event.eventId} className="border-b border-line py-3 last:border-0">
                  <p className="font-semibold text-ink">{event.title}</p>
                  <p className="font-mono text-sm text-ink-muted">
                    {formatEventTime(event.start)} – {formatEventTime(event.end)}
                  </p>
                  {event.location && <p className="mt-1 text-xs text-ink-muted">{event.location}</p>}
                  {event.notes && <p className="mt-0.5 text-xs text-ink-muted">{event.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
