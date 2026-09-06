export interface GoogleAuthResponse {
  token: string
  clientName: string
  expiresAt: string
}

export interface DashboardMe {
  clientId: string
  clientIdentifier: string
  name: string
  email: string
}

export type ApiKeyStatus = 'active' | 'revoked' | string

export interface ApiKeySummary {
  id: string
  status: ApiKeyStatus
  tier: string
  createdAt: string
}

export interface ApiKeyCreated extends ApiKeySummary {
  key: string
}

export type EndUserStatus = 'connected' | 'needs_reconnect' | string

export interface EndUser {
  userId: string
  icloudEmail: string
  calendarName: string
  status: EndUserStatus
}

export interface CreateEndUserRequest {
  icloudEmail: string
  appSpecificPassword: string
  calendarName: string
}

export interface CalendarEvent {
  eventId: string
  title: string
  start: string
  end: string
  location: string | null
  notes: string | null
}
