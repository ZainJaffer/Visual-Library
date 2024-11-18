import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // Our Django API URL
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      console.log('Adding token to request:', token.substring(0, 20) + '...'); // Log token (partially)
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.log('No token found in localStorage');
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response)
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api