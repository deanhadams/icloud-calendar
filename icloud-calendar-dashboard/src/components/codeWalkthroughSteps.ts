// Single source of truth for the code walkthrough copy, read by CodeWalkthrough
// and (for the closing links) QuickstartWalkthrough.

const BASE_URL = 'https://icloud-calendar-production.up.railway.app'

const AUTH_HEADER: [string, string] = ['Authorization', 'Bearer <your_api_key>']
const JSON_HEADER: [string, string] = ['Content-Type', 'application/json']

export interface RequestCodePanel {
  kind: 'request'
  method: 'GET' | 'POST'
  path: string
  headers: [string, string][]
  body?: Record<string, string>
}

export interface CredentialCodePanel {
  kind: 'credential'
}

export interface ChecklistCodePanel {
  kind: 'checklist'
  items: string[]
}

export type CodePanel = RequestCodePanel | CredentialCodePanel | ChecklistCodePanel

export interface WalkthroughLink {
  label: string
  to: string
}

export interface WalkthroughStep {
  title: string
  explanation: string
  code: CodePanel
  links?: WalkthroughLink[]
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    title: 'Get your API key',
    explanation:
      "Sign in to your dashboard and generate an API key from the API Keys tab. You'll only see the raw key once, so store it securely.",
    code: { kind: 'credential' },
  },
  {
    title: 'Register a calendar',
    explanation:
      "Connect your customer's iCloud account by registering it — this stores their app-specific password encrypted and returns a userId you'll use in every request after this.",
    code: {
      kind: 'request',
      method: 'POST',
      path: `${BASE_URL}/v1/users`,
      headers: [AUTH_HEADER, JSON_HEADER],
      body: {
        icloudEmail: 'customer@icloud.com',
        appSpecificPassword: 'xxxx-xxxx-xxxx-xxxx',
        calendarName: 'Work',
      },
    },
  },
  {
    title: 'Fetch their events',
    explanation: 'Use the userId returned from the previous step to pull events in any date range.',
    code: {
      kind: 'request',
      method: 'GET',
      path: `${BASE_URL}/v1/users/{userId}/events?start=2026-09-08&end=2026-09-15`,
      headers: [AUTH_HEADER],
    },
  },
  {
    title: 'Create an event',
    explanation: 'Write directly to their calendar — the event shows up on their device immediately.',
    code: {
      kind: 'request',
      method: 'POST',
      path: `${BASE_URL}/v1/users/{userId}/events`,
      headers: [AUTH_HEADER, JSON_HEADER],
      body: {
        title: 'Team sync',
        start: '2026-09-10T09:00:00Z',
        end: '2026-09-10T09:30:00Z',
      },
    },
  },
  {
    title: "That's it",
    explanation:
      "You've registered a calendar and can now read and write events. See the full endpoint reference for updating, deleting, and handling reconnection.",
    code: {
      kind: 'checklist',
      items: ['Registered a calendar', 'Fetched events in a date range', 'Created a new event'],
    },
    links: [
      { label: 'Full endpoint reference', to: '/docs' },
      { label: 'Setting up an app-specific password', to: '/docs/apple-app-password' },
    ],
  },
]
