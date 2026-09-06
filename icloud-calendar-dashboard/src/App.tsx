import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SignInModal } from './components/SignInModal'
import { Dashboard } from './pages/Dashboard'
import { Endpoints } from './pages/Endpoints'
import { EndUsers } from './pages/EndUsers'
import { HowTo } from './pages/HowTo'
import { Landing } from './pages/Landing'
import { Playground } from './pages/Playground'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/end-users"
          element={
            <ProtectedRoute>
              <Layout>
                <EndUsers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/playground"
          element={
            <ProtectedRoute>
              <Layout>
                <Playground />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/how-to"
          element={
            <ProtectedRoute>
              <Layout>
                <HowTo />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/endpoints"
          element={
            <ProtectedRoute>
              <Layout>
                <Endpoints />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SignInModal />
    </>
  )
}

export default App
