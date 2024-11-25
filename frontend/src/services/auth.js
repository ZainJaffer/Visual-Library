import api from './api' 

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/api/users/register/', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  login: async (credentials) => {
    try {
        const response = await api.post('/api/users/token/', {
            email: credentials.email,
            password: credentials.password
        })
        if (response.data.access) {
            localStorage.setItem('token', response.data.access)
            if (response.data.refresh) {
                localStorage.setItem('refresh_token', response.data.refresh)
            }
        }
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
  },

  testProtectedRoute: async () => {
    try {
        console.log('Token before request:', localStorage.getItem('token'));
        const response = await api.get('/api/users/test-protected/');
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error accessing protected route:', error);
        throw error.response?.data || error.message;
    }
  }
}