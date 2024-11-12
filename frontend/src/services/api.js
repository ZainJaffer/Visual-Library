import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // Our Django API URL
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response)
    return Promise.reject(error)
  }
)

export default api