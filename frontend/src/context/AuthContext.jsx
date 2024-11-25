import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post('/api/users/token/refresh/', {
        refresh: refreshToken
      });

      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        return response.data.access;
      }
      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  }, []);

  const login = useCallback(async (formData) => {
    try {
      // Get the token pair using email/password
      const response = await api.post('/api/users/token/', {
        email: formData.email,
        password: formData.password
      });
      
      const { access, refresh } = response.data;
      
      // Store tokens
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Set the default Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Get user details
      const userResponse = await api.get('/api/users/test-protected/');
      setUser(userResponse.data.user);
      setError(null);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    try {
      const response = await api.post('/api/users/register/', {
        email,
        password
      });
      
      if (response.data.tokens) {
        const { access, refresh } = response.data.tokens;
        localStorage.setItem('token', access);
        localStorage.setItem('refresh_token', refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        setUser(response.data.user);
        setError(null);
        return true;
      }
      throw new Error('Registration successful but no tokens received');
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.detail || error.message || 'Registration failed');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/users/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/users/test-protected/');
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            const response = await api.get('/api/users/test-protected/');
            setUser(response.data.user);
            return;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      logout();
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
