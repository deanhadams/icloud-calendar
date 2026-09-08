/* eslint-disable react-refresh/only-export-components -- this file intentionally
   mixes the route config data, the root layout, and the AppRoutes component
   consumed by both src/main.tsx and src/entry-server.tsx; splitting it further
   for Fast Refresh eligibility isn't worth the indirection. */
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Navigate, Outlet, useRoutes, type RouteObject } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { SignInModal } from './components/SignInModal'
import { AuthProvider } from './context/AuthProvider'
import { SignInModalProvider } from './context/SignInModalProvider'
import { AppleAppPassword } from './pages/AppleAppPassword'
import { Dashboard } from './pages/Dashboard'
import { Docs } from './pages/Docs'
import { Endpoints } from './pages/Endpoints'
import { EndUsers } from './pages/EndUsers'
import { HowTo } from './pages/HowTo'
import { Landing } from './pages/Landing'
import { Playground } from './pages/Playground'
import { QuickstartWalkthrough } from './pages/QuickstartWalkthrough'

// Root layout carries everything that used to wrap <App/> in main.tsx (the
// providers) plus everything that used to sit alongside <Routes/> inside
// App.tsx (ScrollToTop, SignInModal). Both the client entry and the
// prerender script build a router from this same routes array, so there's
// no separate App component driving them anymore.
function RootLayout() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <SignInModalProvider>
          <ScrollToTop />
          <Outlet />
          <SignInModal />
        </SignInModalProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'docs', element: <Docs /> },
      { path: 'docs/apple-app-password', element: <AppleAppPassword /> },
      { path: 'docs/quickstart-walkthrough', element: <QuickstartWalkthrough /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/end-users',
        element: (
          <ProtectedRoute>
            <Layout>
              <EndUsers />
            </Layout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/playground',
        element: (
          <ProtectedRoute>
            <Layout>
              <Playground />
            </Layout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/how-to',
        element: (
          <ProtectedRoute>
            <Layout>
              <HowTo />
            </Layout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/endpoints',
        element: (
          <ProtectedRoute>
            <Layout>
              <Endpoints />
            </Layout>
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

// Shared by src/main.tsx (client) and src/entry-server.tsx (prerender) so
// both build a router from the exact same route tree.
export function AppRoutes() {
  return useRoutes(routes)
}
