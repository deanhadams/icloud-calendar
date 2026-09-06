import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import type { EndUser } from '../api/types'
import { useApi } from '../api/useApi'
import { Button } from './Button'
import { Modal } from './Modal'

const inputClassName =
  'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none'

export function AddEndUserModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (endUser: EndUser) => void
}) {
  const api = useApi()
  const [icloudEmail, setIcloudEmail] = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [calendarName, setCalendarName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const created = await api.createEndUser({
        icloudEmail,
        appSpecificPassword: appPassword,
        calendarName,
      })
      onSuccess(created)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add end user. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add End User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="icloudEmail" className="text-sm font-medium text-ink">
            iCloud email
          </label>
          <input
            id="icloudEmail"
            type="email"
            required
            value={icloudEmail}
            onChange={(event) => setIcloudEmail(event.target.value)}
            className={`mt-1.5 ${inputClassName}`}
          />
          <p className="mt-1 text-xs text-ink-muted">The iCloud email your customer signed in with</p>
        </div>

        <div>
          <label htmlFor="appPassword" className="text-sm font-medium text-ink">
            App-specific password
          </label>
          <div className="relative mt-1.5">
            <input
              id="appPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={appPassword}
              onChange={(event) => setAppPassword(event.target.value)}
              className={`${inputClassName} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            An app-specific password generated at appleid.apple.com — not their regular Apple ID
            password
          </p>
        </div>

        <div>
          <label htmlFor="calendarName" className="text-sm font-medium text-ink">
            Calendar name
          </label>
          <input
            id="calendarName"
            type="text"
            required
            value={calendarName}
            onChange={(event) => setCalendarName(event.target.value)}
            className={`mt-1.5 ${inputClassName}`}
          />
          <p className="mt-1 text-xs text-ink-muted">Which calendar to sync (e.g. "Work", "Family")</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" variant="primary" disabled={submitting} className="w-full">
          {submitting ? 'Adding…' : 'Add End User'}
        </Button>
      </form>
    </Modal>
  )
}
