import { useContext } from 'react'
import { SignInModalContext, type SignInModalContextValue } from './SignInModalContext'

export function useSignInModal(): SignInModalContextValue {
  const context = useContext(SignInModalContext)
  if (!context) {
    throw new Error('useSignInModal must be used within a SignInModalProvider')
  }
  return context
}
