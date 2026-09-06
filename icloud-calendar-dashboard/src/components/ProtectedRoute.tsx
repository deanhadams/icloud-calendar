import { useEffect, useRef, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useSignInModal } from '../context/useSignInModal'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { open } = useSignInModal()

  // Only prompt for sign-in when this route is first reached while already
  // signed out (a stale bookmark/direct link) — not when a user who was
  // authenticated here transitions to signed out (an active sign-out, or a
  // 401, which already opens the modal itself via useApi).
  const wasAuthenticated = useRef(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated && !wasAuthenticated.current) {
      open()
    }
    wasAuthenticated.current = isAuthenticated
  }, [isAuthenticated, open])

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
