import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import './index.css'

// Prerendered pages (see scripts/prerender.mjs) exist purely so crawlers and
// no-JS clients see real markup in the initial response — the goal is
// indexability, not hydration performance. Once React mounts here it just
// re-renders the route fresh; there's no hydrateRoot/mismatch handling to
// worry about, which also means a route with no prerendered file (anything
// under /dashboard) behaves exactly as it did before this all existed.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
