import { GoogleLogin } from '@react-oauth/google'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useSignInModal } from '../context/useSignInModal'
import { Modal } from './Modal'

export function SignInModal() {
  const { isOpen, close } = useSignInModal()
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setError(null)
    close()
  }

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
    <Modal title="Sign in to manage your API access" onClose={handleClose}>
      <GoogleLogin
        onSuccess={(response) => handleSuccess(response.credential)}
        onError={() => setError('Google sign-in failed. Please try again.')}
      />
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </Modal>
  )
}
