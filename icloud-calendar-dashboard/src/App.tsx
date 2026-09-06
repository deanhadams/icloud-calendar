import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SignInModal } from './components/SignInModal'
import { Dashboard } from './pages/Dashboard'
import { EndUsers } from './pages/EndUsers'
import { Landing } from './pages/Landing'

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SignInModal />
    </>
  )
}

export default App
