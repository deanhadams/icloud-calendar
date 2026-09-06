import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { authenticateWithGoogle, getMe } from '../api/client'
import { AuthContext, type AuthClient, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [client, setClient] = useState<AuthClient | null>(null)

  const signIn = useCallback(async (idToken: string) => {
    const { token: dashboardToken } = await authenticateWithGoogle(idToken)
    const me = await getMe(dashboardToken)
    setToken(dashboardToken)
    setClient({ name: me.name, email: me.email })
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setClient(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      client,
      isAuthenticated: token !== null,
      signIn,
      signOut,
    }),
    [token, client, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
