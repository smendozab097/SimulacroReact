import { RouterProvider } from 'react-router'
import './index.css'
import { AppRouter } from './router'
import { AuthProvider, useAuth } from './context/authContext'
import LoadingScreen from './components/LoadingScreen'
import ErrorBoundary from './components/ErrorBoundary'

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <RouterProvider router={AppRouter}/>;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
