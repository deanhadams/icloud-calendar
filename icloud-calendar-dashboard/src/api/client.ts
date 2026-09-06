import type {
  ApiKeyCreated,
  ApiKeySummary,
  CreateEndUserRequest,
  DashboardMe,
  EndUser,
  GoogleAuthResponse,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.clone().json()
    if (typeof body?.message === 'string') return body.message

    // ASP.NET Core's ValidationProblemDetails puts the useful per-field
    // messages in `errors`, with `title` left as a generic
    // "One or more validation errors occurred." — prefer the former.
    if (body?.errors && typeof body.errors === 'object') {
      const firstMessage = Object.values(body.errors).flat().find((m) => typeof m === 'string')
      if (firstMessage) return firstMessage
    }

    if (typeof body?.title === 'string') return body.title
  } catch {
    // response body wasn't JSON; fall through to status text
  }
  return response.statusText || `Request failed with status ${response.status}`
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function authenticateWithGoogle(idToken: string): Promise<GoogleAuthResponse> {
  return request<GoogleAuthResponse>('/v1/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
}

export function getMe(token: string): Promise<DashboardMe> {
  return request<DashboardMe>('/v1/dashboard/me', { token })
}

export function getApiKeys(token: string): Promise<ApiKeySummary[]> {
  return request<ApiKeySummary[]>('/v1/dashboard/api-keys', { token })
}

export function createApiKey(token: string): Promise<ApiKeyCreated> {
  return request<ApiKeyCreated>('/v1/dashboard/api-keys', {
    method: 'POST',
    token,
  })
}

export function revokeApiKey(token: string, id: string): Promise<void> {
  return request<void>(`/v1/dashboard/api-keys/${id}/revoke`, {
    method: 'PATCH',
    token,
  })
}

export function getEndUsers(token: string): Promise<EndUser[]> {
  return request<EndUser[]>('/v1/dashboard/end-users', { token })
}

export function createEndUser(token: string, payload: CreateEndUserRequest): Promise<EndUser> {
  return request<EndUser>('/v1/dashboard/end-users', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}
