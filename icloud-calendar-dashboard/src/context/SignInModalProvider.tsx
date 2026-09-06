import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { SignInModalContext } from './SignInModalContext'

export function SignInModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close])

  return <SignInModalContext.Provider value={value}>{children}</SignInModalContext.Provider>
}
