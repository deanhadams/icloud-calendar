import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useSignInModal } from '../context/useSignInModal'
import { ApiError, createApiKey, getApiKeys, getEndUsers, getMe, revokeApiKey } from './client'

export function useApi() {
  const { token, signOut } = useAuth()
  const { open: openSignInModal } = useSignInModal()
  const navigate = useNavigate()

  const withAuth = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
      if (!token) {
        throw new ApiError(401, 'Not authenticated')
      }
      try {
        return await fn(token)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          signOut()
          navigate('/', { replace: true })
          openSignInModal()
        }
        throw error
      }
    },
    [token, signOut, navigate, openSignInModal],
  )

  return useMemo(
    () => ({
      getMe: () => withAuth(getMe),
      getApiKeys: () => withAuth(getApiKeys),
      createApiKey: () => withAuth(createApiKey),
      revokeApiKey: (id: string) => withAuth((token) => revokeApiKey(token, id)),
      getEndUsers: () => withAuth(getEndUsers),
    }),
    [withAuth],
  )
}
