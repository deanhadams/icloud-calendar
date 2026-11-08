import { GoogleLogin } from '@react-oauth/google'
import { LockKeyhole } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../context/useAuth'
import { useSignInModal } from '../context/useSignInModal'
import { Modal } from './Modal'

// Google's rendered button accepts a pixel width between 200 and 400.
const clampButtonWidth = (px: number) => Math.round(Math.min(400, Math.max(200, px)))

function signInErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 401) {
    return 'No account found for this email. Contact us to get set up.'
  }
  return 'Something went wrong signing you in. Please try again.'
}

export function SignInModal() {
  const { isOpen, close } = useSignInModal()
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  // Bumped on every new error so the role="alert" node remounts and is re-announced, even when
  // the same message repeats on a retry.
  const [errorKey, setErrorKey] = useState(0)
  const [isSigningIn, setIsSigningIn] = useState(false)

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

  const showError = (message: string) => {
    setError(message)
    setErrorKey((k) => k + 1)
  }

  const handleClose = () => {
    if (isSigningIn) return
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
    if (isSigningIn) return
    if (!credential) {
      showError('Google sign-in did not return a credential. Please try again.')
      return
    }
    // Show the loading state before the API call starts. Any previous error stays in the DOM but
    // invisible (see below), so the modal doesn't change height mid-switch.
    setIsSigningIn(true)
    try {
      await signIn(credential)
      setIsSigningIn(false)
      setError(null)
      close()
      navigate('/dashboard')
    } catch (err) {
      setIsSigningIn(false)
      showError(signInErrorMessage(err))
    }
  }

  return (
    <Modal
      open={isOpen}
      dismissible={!isSigningIn}
      title="Sign in to manage your API access"
      description="We only use your email to match you to your account — no data is shared with Google beyond standard sign-in."
      icon={LockKeyhole}
      onClose={handleClose}
    >
      {/*
        Fixed-height slot shared by Google's button and the loading state, so swapping between them
        never changes the modal's size.

        Google's own rendered button, fully visible and unclipped. Don't hide it behind a styled
        look-alike (opacity 0 / transforms / overflow clipping): Google's iframe silently ignores
        clicks when it's obscured, which is what broke sign-in in production. While signing in it's
        hidden with visibility: hidden — never unmounted — so it isn't re-created (one
        google.accounts.id.initialize() per page load).

        Button flow only — no One Tap / auto_select. FedCM is explicitly disabled for the button so
        a user who has dismissed a FedCM prompt (which Chrome then blocks) can still sign in through
        the classic Google popup.
      */}
      <div ref={measureButtonSlot} className="relative h-11 w-full" aria-busy={isSigningIn}>
        <div className={`flex h-full w-full items-center justify-center ${isSigningIn ? 'invisible' : ''}`}>
          {buttonWidth !== null && (
            <GoogleLogin
              onSuccess={(response) => handleSuccess(response.credential)}
              onError={() => showError('Google sign-in failed. Please try again.')}
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

        {/* Always rendered so the polite live region exists before its content changes. */}
        <div
          aria-live="polite"
          className={`absolute inset-0 flex items-center justify-center gap-3 ${isSigningIn ? '' : 'pointer-events-none'}`}
        >
          {isSigningIn && (
            <>
              <span
                aria-hidden="true"
                className="h-7 w-7 shrink-0 animate-spin rounded-full border-[3px] border-cobalt-tint-strong border-t-cobalt motion-reduce:animate-pulse motion-reduce:border-cobalt"
              />
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-medium text-ink">Signing you in</span>
                <span className="text-xs text-ink-muted">This can take a few seconds.</span>
              </span>
            </>
          )}
        </div>
      </div>

      {error && (
        <p
          key={errorKey}
          role="alert"
          aria-hidden={isSigningIn}
          className={`mt-4 text-sm text-pretty text-signal-red ${isSigningIn ? 'invisible' : ''}`}
        >
          {error}
        </p>
      )}
    </Modal>
  )
}
