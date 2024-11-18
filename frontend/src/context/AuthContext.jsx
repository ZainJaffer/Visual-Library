// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('=== AuthContext Debug ===');
    const token = localStorage.getItem('token')
    console.log('Token found:', token ? 'Yes' : 'No');
    
    if (token) {
      console.log('Setting user with token');
      setUser({ token })
    } else {
      console.log('No token found - user remains null');
    }
    
    setLoading(false)
    console.log('======================');
  }, [])

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials)
      localStorage.setItem('token', data.access)
      setUser({ token: data.access })
      return data
    } catch (error) {
      throw error
    }
  }

  const register = async (credentials) => {
    try {
      const response = await authService.register(credentials)
      localStorage.setItem('token', response.access)
      setUser({ token: response.access })
      return response
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
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
