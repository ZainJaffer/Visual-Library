import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'

// Create the context
const AuthContext = createContext(null)

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // We'll add token validation later
      setUser({ token })
    }
    setLoading(false)
  }, [])

  // Auth methods
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials)
      localStorage.setItem('token', data.access)  // Store the JWT token
      setUser({ token: data.access })
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Custom hook for using auth context
export const useAuth = () => {
  return useContext(AuthContext)
}