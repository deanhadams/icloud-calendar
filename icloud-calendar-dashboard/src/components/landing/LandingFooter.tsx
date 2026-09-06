import { useSignInModal } from '../../context/useSignInModal'

export function LandingFooter() {
  const { open } = useSignInModal()

  return (
    <footer className="bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-white/10 px-6 py-10 sm:flex-row sm:items-center">
        <span className="text-base font-bold text-white">iSyncal</span>

        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm text-paper/60 hover:text-paper">
            Docs
          </a>
          <button type="button" onClick={open} className="text-sm text-paper/60 hover:text-paper">
            Sign in
          </button>
        </nav>

        <p className="text-sm text-paper/40">&copy; {new Date().getFullYear()} iSyncal.</p>
      </div>
    </footer>
  )
}
