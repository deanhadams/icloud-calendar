import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function Login() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSuccess = async (credential: string | undefined) => {
    if (!credential) {
      setError('Google sign-in did not return a credential. Please try again.')
      return
    }
    setError(null)
    try {
      await signIn(credential)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Sign-in failed. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-slate-900">Client Dashboard</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in to manage your account</p>
        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={(response) => handleSuccess(response.credential)}
            onError={() => setError('Google sign-in failed. Please try again.')}
          />
        </div>
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
