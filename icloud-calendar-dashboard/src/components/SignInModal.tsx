import { GoogleLogin } from '@react-oauth/google'
import { LockKeyhole } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useSignInModal } from '../context/useSignInModal'
import { Modal } from './Modal'

// Google's rendered button accepts a pixel width between 200 and 400.
const clampButtonWidth = (px: number) => Math.round(Math.min(400, Math.max(200, px)))

export function SignInModal() {
  const { isOpen, close } = useSignInModal()
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  // Mount on first open, then keep mounted and just hide it. That way <GoogleLogin> — and
  // google.accounts.id.initialize() — runs once per page load instead of on every open, and the
  // Google iframe isn't loaded at all for visitors who never open sign-in (nor is the hidden
  // modal baked into the prerendered HTML).
  const [hasOpened, setHasOpened] = useState(false)
  if (isOpen && !hasOpened) setHasOpened(true)

  // Fit Google's button to the modal's content width. Measured once, because <GoogleLogin>
  // re-initializes whenever its `width` prop changes.
  const [buttonWidth, setButtonWidth] = useState<number | null>(null)
  const measureButtonSlot = useCallback((el: HTMLDivElement | null) => {
    if (el && el.clientWidth > 0) setButtonWidth((w) => w ?? clampButtonWidth(el.clientWidth))
  }, [])

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

  if (!hasOpened) return null

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
      open={isOpen}
      title="Sign in to manage your API access"
      description="We only use your email to match you to your account — no data is shared with Google beyond standard sign-in."
      icon={LockKeyhole}
      onClose={handleClose}
    >
      {/*
        Google's own rendered button, fully visible and unclipped. Don't hide it behind a styled
        look-alike (opacity 0 / transforms / overflow clipping): Google's iframe silently ignores
        clicks when it's obscured, which is what broke sign-in in production. The button can't be
        restyled beyond these options; it's the only client-side way to get the ID-token
        credential that POST /v1/auth/google verifies.

        Button flow only — no One Tap / auto_select. FedCM is explicitly disabled for the button so
        a user who has dismissed a FedCM prompt (which Chrome then blocks) can still sign in through
        the classic Google popup.
      */}
      <div ref={measureButtonSlot} className="flex min-h-10 w-full justify-center">
        {buttonWidth !== null && (
          <GoogleLogin
            onSuccess={(response) => handleSuccess(response.credential)}
            onError={() => setError('Google sign-in failed. Please try again.')}
            use_fedcm_for_button={false}
            theme="outline"
            size="large"
            shape="rectangular"
            text="signin_with"
            logo_alignment="center"
            width={String(buttonWidth)}
          />
        )}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-signal-red">
          {error}
        </p>
      )}
    </Modal>
  )
}
