import { GoogleLogin } from '@react-oauth/google'
import { LockKeyhole } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useSignInModal } from '../context/useSignInModal'
import { Modal } from './Modal'

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

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
    <Modal
      title="Sign in to manage your API access"
      description="We only use your email to match you to your account — no data is shared with Google beyond standard sign-in."
      icon={LockKeyhole}
      onClose={handleClose}
    >
      {/*
        Google Identity Services renders its button in a cross-origin iframe we can't style, and
        it's the only way to get an ID-token credential client-side. So the styled button below is
        purely visual, and the real GoogleLogin sits on top of it at opacity 0, receiving the
        click and keyboard focus. :hover / :focus-within on the wrapper drive the visual states.
      */}
      <div className="group relative h-11 w-full overflow-hidden rounded-md">
        <div
          className="pointer-events-none flex h-full w-full items-center justify-center gap-3 rounded-md border border-line bg-white text-[15px] font-medium text-ink transition-colors duration-150 group-hover:border-cobalt group-hover:bg-cobalt-tint group-focus-within:border-cobalt group-focus-within:bg-cobalt-tint"
          aria-hidden="true"
        >
          <GoogleG />
          Sign in with Google
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 [&>div]:scale-y-[1.1]">
          {/*
            useOneTap + auto_select: a returning user with exactly one consented Google session is
            signed in without the account chooser. The One Tap prompt fires when this component
            mounts, and SignInModal renders nothing while closed — so it only ever fires after the
            user has clicked to open the modal, never on page load. Keep One Tap here; don't move
            it to an always-mounted component. Explicit sign-out calls googleLogout() (Layout.tsx)
            so auto_select can't immediately sign the user back in.
          */}
          <GoogleLogin
            onSuccess={(response) => handleSuccess(response.credential)}
            onError={() => setError('Google sign-in failed. Please try again.')}
            useOneTap
            auto_select
            size="large"
            width="400"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-signal-red">
          {error}
        </p>
      )}
    </Modal>
  )
}
