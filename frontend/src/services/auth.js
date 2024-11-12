import { api } from './api' 

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/users/register/', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  login: async (credentials) => {
    try {
        const response = await api.post('/users/login/', {
            email: credentials.email,
            password: credentials.password
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
  }
} 