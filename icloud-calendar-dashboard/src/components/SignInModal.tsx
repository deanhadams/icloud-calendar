import { GoogleLogin } from '@react-oauth/google'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useSignInModal } from '../context/useSignInModal'

export function SignInModal() {
  const { isOpen, close } = useSignInModal()
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setError(null)
    close()
  }

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Reactively close on successful sign-in rather than relying on the
  // success handler's close()-then-navigate() ordering, which can race
  // against ProtectedRoute reading auth state on the new route.
  useEffect(() => {
    if (isOpen && isAuthenticated) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated])

  if (!isOpen) return null

  const handleSuccess = async (credential: string | undefined) => {
    if (!credential) {
      setError('Google sign-in did not return a credential. Please try again.')
      return
    }
    setError(null)
    try {
      await signIn(credential)
      close()
      navigate('/dashboard')
    } catch {
      setError('Sign-in failed. Please try again.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[400px] rounded-md border border-line bg-paper p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">Sign in to manage your API access</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="shrink-0 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          <GoogleLogin
            onSuccess={(response) => handleSuccess(response.credential)}
            onError={() => setError('Google sign-in failed. Please try again.')}
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
