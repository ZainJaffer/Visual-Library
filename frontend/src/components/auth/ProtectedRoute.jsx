import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return children;
}

export default ProtectedRoute