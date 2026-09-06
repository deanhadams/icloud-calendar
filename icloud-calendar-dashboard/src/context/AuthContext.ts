import { createContext } from 'react'

export interface AuthClient {
  name: string
  email: string
}

export interface AuthContextValue {
  token: string | null
  client: AuthClient | null
  isAuthenticated: boolean
  signIn: (idToken: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
