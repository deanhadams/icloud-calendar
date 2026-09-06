import { createContext } from 'react'

export interface SignInModalContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const SignInModalContext = createContext<SignInModalContextValue | undefined>(undefined)
