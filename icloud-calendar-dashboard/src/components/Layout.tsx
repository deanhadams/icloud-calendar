import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block border-l-2 px-4 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'border-cobalt text-paper' : 'border-transparent text-paper/50 hover:text-paper/80'
  }`

export function Layout({ children }: { children: ReactNode }) {
  const { client, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 shrink-0 flex-col bg-ink px-5 py-6">
        <p className="truncate text-base font-semibold text-paper">{client?.name ?? 'Dashboard'}</p>

        <nav className="mt-8 flex flex-col gap-1">
          <NavLink to="/dashboard" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/end-users" className={navLinkClass}>
            End Users
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="truncate font-mono text-xs text-paper/50">{client?.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 text-xs font-medium text-paper/60 transition-colors hover:text-paper"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="bg-grid flex-1 px-10 py-10">
        <div className="max-w-3xl">{children}</div>
      </main>
    </div>
  )
}
