import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { DocsHeader } from '../components/DocsHeader'
import { PathTemplate, Placeholder } from '../components/PathTemplate'
import { useSignInModal } from '../context/useSignInModal'

const BASE_URL = 'https://icloud-calendar-production.up.railway.app'
const HOST = 'icloud-calendar-production.up.railway.app'

const EXAMPLE_USER_ID = '3f2e1a9b-7c4d-4e2a-9b1f-6a8c0d2e4f61'
const EXAMPLE_EVENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

const METHOD_STYLES: Record<Method, string> = {
  GET: 'bg-signal-green-bg text-signal-green',
  POST: 'bg-cobalt-tint text-cobalt',
  PATCH: 'bg-signal-amber-bg text-signal-amber',
  DELETE: 'bg-red-100 text-red-700',
}

interface FieldDoc {
  name: string
  type: string
  required: boolean
}

interface ErrorExampleDoc {
  caption: string
  status: string
  contentType?: string
  body: string
}

interface EndpointReferenceDoc {
  method: Method
  path: string
  description: string
  queryParams?: FieldDoc[]
  requestBody?: FieldDoc[]
  note?: string
  request: string
  response: { status: string; body: string }
  errors: ErrorExampleDoc[]
}

function buildRequestBlock(method: Method, pathWithQuery: string, headers: [string, string][], body?: unknown): string {
  const headerLines = [`Host: ${HOST}`, ...headers.map(([key, value]) => `${key}: ${value}`)]
  const bodyBlock = body !== undefined ? `\n\n${JSON.stringify(body, null, 2)}` : ''
  return `${method} ${pathWithQuery} HTTP/1.1\n${headerLines.join('\n')}${bodyBlock}`
}

const AUTH_HEADER: [string, string] = ['Authorization', 'Bearer <your_api_key>']
const JSON_HEADER: [string, string] = ['Content-Type', 'application/json']

const END_USER_ENDPOINTS: EndpointReferenceDoc[] = [
  {
    method: 'POST',
    path: '/v1/users',
    description: 'Register a new end-user by connecting one iCloud account and calendar to your client account.',
    requestBody: [
      { name: 'icloudEmail', type: 'string', required: true },
      { name: 'appSpecificPassword', type: 'string', required: true },
      { name: 'calendarName', type: 'string', required: true },
    ],
    note: 'All three fields must be non-empty. icloudEmail is not validated as a syntactically well-formed email address by this endpoint.',
    request: buildRequestBlock('POST', '/v1/users', [AUTH_HEADER, JSON_HEADER], {
      icloudEmail: 'alice@icloud.com',
      appSpecificPassword: 'abcd-efgh-ijkl-mnop',
      calendarName: 'Work',
    }),
    response: {
      status: '201 Created',
      body: JSON.stringify({ userId: EXAMPLE_USER_ID, status: 'connected' }, null, 2),
    },
    errors: [
      {
        caption: 'A required field is missing or empty',
        status: '400 Bad Request',
        contentType: 'text/plain',
        body: 'icloudEmail, appSpecificPassword, and calendarName are required.',
      },
      {
        caption: 'Missing or invalid API key',
        status: '401 Unauthorized',
        body: '(no response body)',
      },
    ],
  },
  {
    method: 'GET',
    path: '/v1/users/{userId}',
    description: "Get an end-user's connection status and calendar details.",
    request: buildRequestBlock('GET', `/v1/users/${EXAMPLE_USER_ID}`, [AUTH_HEADER]),
    response: {
      status: '200 OK',
      body: JSON.stringify(
        { userId: EXAMPLE_USER_ID, status: 'connected', calendarName: 'Work', icloudEmail: 'alice@icloud.com' },
        null,
        2,
      ),
    },
    errors: [
      {
        caption: 'userId does not exist, or belongs to a different client',
        status: '404 Not Found',
        body: JSON.stringify(
          { type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5', title: 'Not Found', status: 404, traceId: '00-3f8a…-01' },
          null,
          2,
        ),
      },
      {
        caption: 'Missing or invalid API key',
        status: '401 Unauthorized',
        body: '(no response body)',
      },
    ],
  },
  {
    method: 'PATCH',
    path: '/v1/users/{userId}/credentials',
    description:
      "Update an end-user's stored app-specific password — for example after generating a new one following a needs_reconnect status. On success this always resets status back to connected.",
    requestBody: [{ name: 'appSpecificPassword', type: 'string', required: true }],
    request: buildRequestBlock('PATCH', `/v1/users/${EXAMPLE_USER_ID}/credentials`, [AUTH_HEADER, JSON_HEADER], {
      appSpecificPassword: 'wxyz-wxyz-wxyz-wxyz',
    }),
    response: {
      status: '200 OK',
      body: JSON.stringify({ userId: EXAMPLE_USER_ID, status: 'connected' }, null, 2),
    },
    errors: [
      {
        caption: 'appSpecificPassword is missing or empty',
        status: '400 Bad Request',
        contentType: 'text/plain',
        body: 'appSpecificPassword is required.',
      },
      {
        caption: 'userId does not exist, or belongs to a different client',
        status: '404 Not Found',
        body: JSON.stringify(
          { type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5', title: 'Not Found', status: 404, traceId: '00-3f8a…-01' },
          null,
          2,
        ),
      },
    ],
  },
]

const NOT_FOUND_BODY = JSON.stringify(
  { type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5', title: 'Not Found', status: 404, traceId: '00-3f8a…-01' },
  null,
  2,
)

const NEEDS_RECONNECT_BODY = JSON.stringify(
  {
    type: 'https://tools.ietf.org/html/rfc9110#section-15.5.10',
    title: 'iCloud reconnect required.',
    status: 409,
    detail: "This end user's iCloud credentials are no longer valid and must be reconnected.",
    traceId: '00-3f8a…-01',
  },
  null,
  2,
)

const NOT_FOUND_ERROR: ErrorExampleDoc = {
  caption: 'userId does not exist, or belongs to a different client',
  status: '404 Not Found',
  body: NOT_FOUND_BODY,
}

const NEEDS_RECONNECT_ERROR: ErrorExampleDoc = {
  caption: "The end user's iCloud credentials need to be reconnected",
  status: '409 Conflict',
  body: NEEDS_RECONNECT_BODY,
}

const EVENT_ENDPOINTS: EndpointReferenceDoc[] = [
  {
    method: 'GET',
    path: '/v1/users/{userId}/events',
    description: "List events on the end-user's connected calendar within a date range, fetched live from iCloud over CalDAV.",
    queryParams: [
      { name: 'start', type: 'string (ISO date)', required: true },
      { name: 'end', type: 'string (ISO date)', required: true },
    ],
    note:
      'Returns a plain array, not wrapped in an object. If start or end is omitted entirely, it silently binds to 0001-01-01 instead of returning an error — always pass both explicitly. Response timestamps that end in Z are UTC; a timestamp without a trailing Z is a floating (timezone-less) time as stored on the iCloud calendar.',
    request: buildRequestBlock('GET', `/v1/users/${EXAMPLE_USER_ID}/events?start=2026-09-06&end=2026-09-13`, [AUTH_HEADER]),
    response: {
      status: '200 OK',
      body: JSON.stringify(
        [
          {
            eventId: EXAMPLE_EVENT_ID,
            title: 'Team sync',
            start: '2026-09-08T09:00:00Z',
            end: '2026-09-08T09:30:00Z',
            location: '',
            notes: '',
          },
        ],
        null,
        2,
      ),
    },
    errors: [
      {
        caption: 'start or end could not be parsed as a date',
        status: '400 Bad Request',
        body: JSON.stringify(
          {
            type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
            title: 'One or more validation errors occurred.',
            status: 400,
            errors: { start: ["The value 'notadate' is not valid."] },
            traceId: '00-3f8a…-01',
          },
          null,
          2,
        ),
      },
      NOT_FOUND_ERROR,
      NEEDS_RECONNECT_ERROR,
      {
        caption: 'iCloud rejected the CalDAV request for a reason other than an auth failure (uncommon)',
        status: '502 Bad Gateway',
        body: JSON.stringify(
          {
            type: 'https://tools.ietf.org/html/rfc9110#section-15.6.3',
            title: 'iCloud calendar request failed.',
            status: 502,
            detail: 'Event retrieval failed: ServiceUnavailable',
            traceId: '00-3f8a…-01',
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    method: 'POST',
    path: '/v1/users/{userId}/events',
    description: "Create a new event on the end-user's connected calendar.",
    requestBody: [
      { name: 'title', type: 'string', required: true },
      { name: 'start', type: 'string (ISO date-time)', required: true },
      { name: 'end', type: 'string (ISO date-time)', required: true },
      { name: 'location', type: 'string', required: false },
      { name: 'notes', type: 'string', required: false },
    ],
    request: buildRequestBlock('POST', `/v1/users/${EXAMPLE_USER_ID}/events`, [AUTH_HEADER, JSON_HEADER], {
      title: 'Team sync',
      start: '2026-09-08T09:00:00Z',
      end: '2026-09-08T09:30:00Z',
      location: '',
      notes: '',
    }),
    response: {
      status: '201 Created',
      body: JSON.stringify({ eventId: EXAMPLE_EVENT_ID }, null, 2),
    },
    errors: [
      {
        caption: 'title is missing, or end is not after start',
        status: '400 Bad Request',
        contentType: 'text/plain',
        body: 'end must be after start.',
      },
      NOT_FOUND_ERROR,
      NEEDS_RECONNECT_ERROR,
    ],
  },
  {
    method: 'PATCH',
    path: '/v1/users/{userId}/events/{eventId}',
    description: 'Update an existing event.',
    requestBody: [
      { name: 'title', type: 'string', required: true },
      { name: 'start', type: 'string (ISO date-time)', required: true },
      { name: 'end', type: 'string (ISO date-time)', required: true },
      { name: 'location', type: 'string', required: false },
      { name: 'notes', type: 'string', required: false },
    ],
    note:
      'This replaces title, start, and end in full — it is not a partial update despite being a PATCH. There is also no check that eventId exists: events live only in iCloud, not in this API’s database, so an unknown eventId typically surfaces as a 502 rather than a 404.',
    request: buildRequestBlock('PATCH', `/v1/users/${EXAMPLE_USER_ID}/events/${EXAMPLE_EVENT_ID}`, [AUTH_HEADER, JSON_HEADER], {
      title: 'Team sync (moved)',
      start: '2026-09-08T10:00:00Z',
      end: '2026-09-08T10:30:00Z',
      location: '',
      notes: '',
    }),
    response: { status: '204 No Content', body: '(no response body)' },
    errors: [
      {
        caption: 'title is missing, or end is not after start',
        status: '400 Bad Request',
        contentType: 'text/plain',
        body: 'end must be after start.',
      },
      NOT_FOUND_ERROR,
      NEEDS_RECONNECT_ERROR,
    ],
  },
  {
    method: 'DELETE',
    path: '/v1/users/{userId}/events/{eventId}',
    description: 'Delete an event.',
    request: buildRequestBlock('DELETE', `/v1/users/${EXAMPLE_USER_ID}/events/${EXAMPLE_EVENT_ID}`, [AUTH_HEADER]),
    response: { status: '204 No Content', body: '(no response body)' },
    errors: [NOT_FOUND_ERROR, NEEDS_RECONNECT_ERROR],
  },
]

const TOC_SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'reference', label: 'Endpoint Reference' },
  { id: 'reference-calendars', label: 'Calendars', indent: true },
  { id: 'reference-events', label: 'Events', indent: true },
  { id: 'errors', label: 'Errors' },
  { id: 'rate-limits', label: 'Rate Limits' },
]

const TOC_IDS = TOC_SECTIONS.map((section) => section.id)

// A heading is "active" once it has scrolled up past a fixed line near the
// top of the viewport — the active section is the last one (in document
// order) that has crossed that line. Simpler and more robust across fast or
// programmatic scrolling than an IntersectionObserver, whose callback only
// reports elements whose intersection state just changed rather than the
// full current set.
const SCROLL_SPY_THRESHOLD_PX = 120

function useScrollSpy(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0])

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const updateActive = () => {
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (scrolledToBottom) {
        setActiveId(ids[ids.length - 1])
        return
      }

      let current = ids[0]
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= SCROLL_SPY_THRESHOLD_PX) {
          current = el.id
        } else {
          break
        }
      }
      setActiveId(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [ids])

  return activeId
}

function CodeStrip({ children }: { children: string }) {
  return (
    <code className="block overflow-x-auto whitespace-pre rounded-md bg-cobalt-tint px-3 py-2 font-mono text-xs text-ink">
      {children}
    </code>
  )
}

function ResponseBlock({ status, contentType, body }: { status: string; contentType?: string; body: string }) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono font-semibold text-ink">{status}</span>
        {contentType && <span className="font-mono text-ink-muted">{contentType}</span>}
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-cobalt-tint p-3 font-mono text-xs text-ink">
        {body}
      </pre>
    </div>
  )
}

function FieldTable({ title, fields }: { title: string; fields: FieldDoc[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink-muted">{title}</p>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-ink-muted">
            <th className="pb-1 pr-4 font-medium">Field</th>
            <th className="pb-1 pr-4 font-medium">Type</th>
            <th className="pb-1 font-medium">Required</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name} className="border-t border-line">
              <td className="py-1.5 pr-4 font-mono text-ink">{field.name}</td>
              <td className="py-1.5 pr-4 font-mono text-ink-muted">{field.type}</td>
              <td className="py-1.5 text-ink-muted">{field.required ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EndpointReference({ endpoint }: { endpoint: EndpointReferenceDoc }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-cobalt-tint px-6 py-4">
        <span
          className={`inline-flex w-16 shrink-0 justify-center rounded-md px-2 py-1 font-mono text-xs font-semibold ${METHOD_STYLES[endpoint.method]}`}
        >
          {endpoint.method}
        </span>
        <code className="font-mono text-sm text-ink">
          <PathTemplate path={endpoint.path} />
        </code>
      </div>

      <div className="space-y-5 p-6">
        <p className="text-sm text-ink-muted">{endpoint.description}</p>

        <p className="text-xs text-ink-muted">
          Auth: <code className="font-mono text-ink">Authorization: Bearer &lt;api_key&gt;</code> (API Key scheme)
        </p>

        {endpoint.queryParams && <FieldTable title="Query Parameters" fields={endpoint.queryParams} />}
        {endpoint.requestBody && <FieldTable title="Request Body" fields={endpoint.requestBody} />}

        {endpoint.note && (
          <p className="rounded-md border border-line bg-paper/60 p-3 text-xs text-ink-muted">{endpoint.note}</p>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-ink-muted">Example request</p>
          <pre className="overflow-x-auto rounded-md bg-cobalt-tint p-3 font-mono text-xs text-ink">
            {endpoint.request}
          </pre>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink-muted">Response</p>
          <ResponseBlock status={endpoint.response.status} body={endpoint.response.body} />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink-muted">Example errors</p>
          <div className="space-y-3">
            {endpoint.errors.map((error) => (
              <div key={`${error.status}-${error.caption}`}>
                <p className="mb-1 text-xs text-ink-muted">{error.caption}</p>
                <ResponseBlock status={error.status} contentType={error.contentType} body={error.body} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TocNav({ activeId }: { activeId: string }) {
  return (
    <nav className="hidden lg:sticky lg:top-10 lg:block lg:self-start">
      <ul className="space-y-1 border-l border-line">
        {TOC_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`block border-l-2 py-1.5 text-sm transition-colors ${
                section.indent ? 'pl-8' : 'pl-4'
              } -ml-px ${
                activeId === section.id
                  ? 'border-cobalt font-medium text-cobalt'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="mb-4 text-2xl font-bold text-ink">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      {title && (
        <div className="border-b border-line bg-cobalt-tint px-6 py-3">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
        </div>
      )}
      <div className="space-y-3 p-6 text-sm text-ink-muted">{children}</div>
    </div>
  )
}

export function Docs() {
  const { open } = useSignInModal()
  const activeId = useScrollSpy(TOC_IDS)

  return (
    <div className="min-h-screen bg-paper">
      <DocsHeader />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
          <TocNav activeId={activeId} />

          <main className="min-w-0 space-y-16 pb-24">
            <Section id="introduction" title="Introduction">
              <p className="text-sm text-ink-muted">
                The iSyncal API lets you connect a user's iCloud Calendar to your application and read or write
                events on it, without implementing CalDAV — iCloud's XML-based calendar protocol — yourself. It's
                built for developers who need to sync appointments, bookings, or schedules with a user's iCloud
                account from their own backend.
              </p>
              <Button variant="primary" onClick={open}>
                Get API Access
              </Button>
            </Section>

            <Section id="authentication" title="Authentication">
              <p className="text-sm text-ink-muted">
                Every request to the API is authenticated with an API key, sent as a Bearer token on the{' '}
                <code className="font-mono text-ink">Authorization</code> header:
              </p>
              <CodeStrip>Authorization: Bearer &lt;your_api_key&gt;</CodeStrip>
              <p className="text-sm text-ink-muted">
                To get a key: sign up, sign in to the dashboard, then generate a key from the{' '}
                <Link to="/dashboard" className="font-medium text-cobalt hover:text-cobalt-hover">
                  dashboard
                </Link>
                's API Keys section.
              </p>
              <p className="text-sm text-ink-muted">
                A raw key is only ever shown once, at the moment it's generated — store it securely on your own
                server. If you lose it, revoke it and generate a new one.
              </p>
            </Section>

            <Section id="quickstart" title="Quickstart">
              <Card>
                <div className="flex items-center gap-2">
                  <span className="inline-flex shrink-0 items-center rounded-md bg-signal-green-bg px-2 py-1 font-mono text-xs font-semibold text-signal-green">
                    GET
                  </span>
                  <code className="flex-1 overflow-x-auto rounded-md bg-cobalt-tint px-3 py-2 font-mono text-xs text-ink">
                    {BASE_URL}/v1/users/<Placeholder>{'{userId}'}</Placeholder>/events?start=2026-09-06&end=2026-09-13
                  </code>
                </div>
                <p className="text-xs text-ink-muted">
                  <Placeholder>{'{userId}'}</Placeholder> is the identifier returned when you registered the end-user
                  — see the endpoint reference below.{' '}
                  <code className="font-mono text-ink">start</code> and <code className="font-mono text-ink">end</code>{' '}
                  are ISO dates defining the range of events to fetch.
                </p>

                <div>
                  <p className="mb-2 text-xs font-medium text-ink">Headers</p>
                  <CodeStrip>Authorization: Bearer &lt;your_api_key&gt;</CodeStrip>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-ink">Response</p>
                  <pre className="overflow-x-auto rounded-md bg-cobalt-tint p-4 font-mono text-xs text-ink">
                    {JSON.stringify(
                      [
                        {
                          eventId: EXAMPLE_EVENT_ID,
                          title: 'Team sync',
                          start: '2026-09-08T09:00:00Z',
                          end: '2026-09-08T09:30:00Z',
                          location: '',
                          notes: '',
                        },
                        {
                          eventId: 'b7e2f6a1-9c3d-4a2e-8f1b-2d4c6e8a0f13',
                          title: 'Dentist appointment',
                          start: '2026-09-10T14:00:00',
                          end: '2026-09-10T15:00:00',
                          location: '123 Main St',
                          notes: 'Bring insurance card',
                        },
                      ],
                      null,
                      2,
                    )}
                  </pre>
                  <p className="mt-2 text-xs text-ink-muted">
                    Timestamps ending in <code className="font-mono text-ink">Z</code> are UTC; a timestamp without
                    one (like the second event above) is a floating local time, as stored on the iCloud calendar.
                  </p>
                </div>
              </Card>
            </Section>

            <Section id="concepts" title="Concepts">
              <Card title="End users">
                <p>
                  An <span className="font-medium text-ink">end user</span> represents one connected iCloud
                  account and calendar under your client account. You register one per person (or per
                  calendar) whose events you want to read or write — everything under{' '}
                  <code className="font-mono text-ink">/v1/users/&#123;userId&#125;</code> operates on a single
                  end user.
                </p>
              </Card>
              <Card title="App-specific passwords">
                <p>
                  iCloud does not allow third-party apps to authenticate with a user's regular Apple ID password.
                  Instead, the user generates an app-specific password — a one-time-shown credential scoped just
                  to CalDAV access — and that's what gets passed to this API as{' '}
                  <code className="font-mono text-ink">appSpecificPassword</code>.{' '}
                  <Link to="/docs/apple-app-password" className="font-medium text-cobalt hover:text-cobalt-hover">
                    How to generate one at appleid.apple.com
                  </Link>
                  .
                </p>
              </Card>
              <Card title="Connection status">
                <p>
                  An end user's <code className="font-mono text-ink">status</code> is either{' '}
                  <span className="inline-block rounded-full bg-signal-green-bg px-2 py-0.5 font-mono text-xs font-medium text-signal-green">
                    connected
                  </span>{' '}
                  or{' '}
                  <span className="inline-block rounded-full bg-signal-amber-bg px-2 py-0.5 font-mono text-xs font-medium text-signal-amber">
                    needs_reconnect
                  </span>
                  . It flips to needs_reconnect when iCloud rejects the stored credentials — typically because the
                  user changed their Apple ID password or revoked the app-specific password. Resolve it by
                  generating a new app-specific password and calling{' '}
                  <code className="font-mono text-ink">PATCH /v1/users/&#123;userId&#125;/credentials</code>.
                </p>
              </Card>
            </Section>

            <Section id="reference" title="Full Endpoint Reference">
              <p className="text-sm text-ink-muted">
                All endpoints below require an{' '}
                <code className="font-mono text-ink">Authorization: Bearer &lt;your_api_key&gt;</code> header.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-md bg-cobalt-tint px-3 py-2 font-mono text-sm text-ink">
                  {BASE_URL}
                </code>
              </div>

              <div id="reference-calendars" className="scroll-mt-8 space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-ink">Calendars</h3>
                {END_USER_ENDPOINTS.map((endpoint) => (
                  <EndpointReference key={`${endpoint.method} ${endpoint.path}`} endpoint={endpoint} />
                ))}
              </div>

              <div id="reference-events" className="scroll-mt-8 space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-ink">Events</h3>
                {EVENT_ENDPOINTS.map((endpoint) => (
                  <EndpointReference key={`${endpoint.method} ${endpoint.path}`} endpoint={endpoint} />
                ))}
              </div>
            </Section>

            <Section id="errors" title="Errors">
              <div className="overflow-hidden rounded-md border border-line bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-cobalt-tint text-ink-muted">
                      <th className="px-6 py-2 text-xs font-medium">Status</th>
                      <th className="px-6 py-2 text-xs font-medium">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['400', 'Validation failed — a required field is missing/empty, or a value could not be parsed.'],
                      ['401', 'The Authorization header is missing, malformed, or the API key is invalid or inactive.'],
                      ['404', 'The resource does not exist, or does not belong to your account.'],
                      ['409', "The end user's iCloud credentials need to be reconnected (status is needs_reconnect)."],
                      ['429', 'Rate limit exceeded for your tier.'],
                      ['502', 'iCloud rejected or failed a CalDAV request for a reason other than an auth failure.'],
                      ['500', 'An unexpected server error.'],
                    ].map(([status, meaning]) => (
                      <tr key={status} className="border-b border-line last:border-0">
                        <td className="px-6 py-3 font-mono text-ink">{status}</td>
                        <td className="px-6 py-3 text-ink-muted">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-muted">
                Note: 400 and 401 responses are not always JSON — some validation failures return a plain-text body,
                and a missing/invalid API key currently returns an empty body. Always check the status code first.
              </p>
            </Section>

            <Section id="rate-limits" title="Rate Limits">
              <p className="text-sm text-ink-muted">Each API key is rate-limited per minute, based on its tier:</p>
              <div className="overflow-hidden rounded-md border border-line bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-cobalt-tint text-ink-muted">
                      <th className="px-6 py-2 text-xs font-medium">Tier</th>
                      <th className="px-6 py-2 text-xs font-medium">Requests / minute</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-line">
                      <td className="px-6 py-3 font-mono text-ink">Free</td>
                      <td className="px-6 py-3 font-mono text-ink">10</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 font-mono text-ink">Paid</td>
                      <td className="px-6 py-3 font-mono text-ink">60</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-ink-muted">
                When you exceed your limit, the API returns <code className="font-mono text-ink">429 Too Many
                Requests</code> with a <code className="font-mono text-ink">Retry-After</code> header (seconds), and
                a JSON body:
              </p>
              <pre className="overflow-x-auto rounded-md bg-cobalt-tint p-3 font-mono text-xs text-ink">
                {JSON.stringify({ error: 'Rate limit exceeded', tier: 'Free', limit: 10, retryAfterSeconds: 37 }, null, 2)}
              </pre>
            </Section>
          </main>
        </div>
      </div>
    </div>
  )
}
