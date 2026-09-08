import { LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSignInModal } from '../../context/useSignInModal'

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const { open } = useSignInModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? 'border-b border-white/10 bg-ink/95 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-white">iSyncal</span>

        <nav className="flex items-center gap-6">
          <Link to="/docs" className="text-sm font-medium text-paper/70 hover:text-paper">
            Docs
          </Link>
          <button
            type="button"
            onClick={open}
            aria-label="Sign in"
            className="text-paper/70 transition-colors hover:text-paper"
          >
            <LogIn className="h-5 w-5" />
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
