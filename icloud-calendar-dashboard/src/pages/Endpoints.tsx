import { Link } from 'react-router-dom'
import { CopyButton } from '../components/CopyButton'
import { EndpointRow, type EndpointDoc } from '../components/EndpointRow'

const API_BASE_URL = 'https://icloud-calendar-production.up.railway.app'

const EXAMPLE_USER_ID = '3f2e1a9b-7c4d-4e2a-9b1f-6a8c0d2e4f61'
const EXAMPLE_EVENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const END_USER_ENDPOINTS: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/v1/users',
    description: "Register a new end-user (connects their iCloud account).",
    requestBody: [
      { name: 'icloudEmail', type: 'string', required: true },
      { name: 'appSpecificPassword', type: 'string', required: true },
      { name: 'calendarName', type: 'string', required: true },
    ],
    response: JSON.stringify({ userId: EXAMPLE_USER_ID, status: 'connected' }, null, 2),
  },
  {
    method: 'GET',
    path: '/v1/users/{userId}',
    description: "Get an end-user's connection status.",
    response: JSON.stringify(
      {
        userId: EXAMPLE_USER_ID,
        status: 'connected',
        calendarName: 'Work',
        icloudEmail: 'alice@icloud.com',
      },
      null,
      2,
    ),
  },
  {
    method: 'PATCH',
    path: '/v1/users/{userId}/credentials',
    description: "Update an end-user's app-specific password (e.g. after reconnecting).",
    requestBody: [{ name: 'appSpecificPassword', type: 'string', required: true }],
    response: JSON.stringify({ userId: EXAMPLE_USER_ID, status: 'connected' }, null, 2),
  },
]

const EVENT_ENDPOINTS: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/v1/users/{userId}/events',
    description: 'List events in a date range.',
    queryParams: [
      { name: 'start', type: 'string (ISO date)', required: true },
      { name: 'end', type: 'string (ISO date)', required: true },
    ],
    responseNote: 'Returns a plain array of events — not wrapped in an object.',
    response: JSON.stringify(
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
  {
    method: 'POST',
    path: '/v1/users/{userId}/events',
    description: 'Create a new event.',
    requestBody: [
      { name: 'title', type: 'string', required: true },
      { name: 'start', type: 'string (ISO date-time)', required: true },
      { name: 'end', type: 'string (ISO date-time)', required: true },
      { name: 'location', type: 'string', required: false },
      { name: 'notes', type: 'string', required: false },
    ],
    response: JSON.stringify({ eventId: EXAMPLE_EVENT_ID }, null, 2),
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
    responseNote:
      'This replaces title, start, and end in full — it is not a partial update despite being a PATCH. Only location and notes stay optional.',
    response: '204 No Content — no response body.',
  },
  {
    method: 'DELETE',
    path: '/v1/users/{userId}/events/{eventId}',
    description: 'Delete an event.',
    response: '204 No Content — no response body.',
  },
]

export function Endpoints() {
  return (
    <div className="space-y-6">
      <div className="text-sm text-ink-muted">
        <p>
          All endpoints require an{' '}
          <code className="font-mono text-ink">Authorization: Bearer &lt;your_api_key&gt;</code>{' '}
          header.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-md bg-cobalt-tint px-3 py-2 font-mono text-sm text-ink">
            {API_BASE_URL}
          </code>
          <CopyButton value={API_BASE_URL} label="Copy base URL" />
        </div>
        <p className="mt-3">
          Want a full worked example instead?{' '}
          <Link to="/dashboard/how-to" className="font-medium text-cobalt hover:text-cobalt-hover">
            See the How To guide
          </Link>
          .
        </p>
      </div>

      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h1 className="text-lg font-semibold text-ink">End Users</h1>
        </div>
        <div>
          {END_USER_ENDPOINTS.map((endpoint) => (
            <EndpointRow key={`${endpoint.method} ${endpoint.path}`} endpoint={endpoint} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-white">
        <div className="border-b border-line bg-cobalt-tint px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Events</h2>
        </div>
        <div>
          {EVENT_ENDPOINTS.map((endpoint) => (
            <EndpointRow key={`${endpoint.method} ${endpoint.path}`} endpoint={endpoint} />
          ))}
        </div>
      </section>
    </div>
  )
}
