import { Link } from 'react-router-dom'
import { useSignInModal } from '../context/useSignInModal'

export function DocsHeader() {
  const { open } = useSignInModal()

  return (
    <header className="bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-bold text-white">
          iSyncal
        </Link>
        <nav className="flex items-center gap-6">
          <button type="button" onClick={open} className="text-sm font-medium text-paper/70 hover:text-paper">
            Sign in
          </button>
          <button
            type="button"
            onClick={open}
            className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cobalt-hover"
          >
            Get API Access
          </button>
        </nav>
      </div>
    </header>
  )
}
