import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000',  // Updated to use the main URL since we're not using /api prefix anymore
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

    // Don't override content-type if it's multipart/form-data
    if (config.headers['Content-Type'] !== 'multipart/form-data') {
      config.headers['Content-Type'] = 'application/json';
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
    console.log('API Interceptor caught error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (!error.response) {
      errorMessage = 'Unable to connect to server. Please check your connection.';
    } else {
      console.log('Error status:', error.response.status);
      console.log('Error data:', error.response.data);
      
      // Use the standardized error format from our new endpoint
      if (error.response.data?.status === 'error') {
        errorMessage = error.response.data.message || error.response.data.detail || 'An error occurred';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.detail) {
        errorMessage = error.response.data.detail;
      } else {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Your session has expired. Please log in again.';
            localStorage.removeItem('token');
            setTimeout(() => window.location.href = '/login', 2000);
            break;
          case 400:
            errorMessage = error.response.data?.message || error.response.data?.detail || 'Invalid request. Please check your input.';
            break;
          case 404:
            errorMessage = error.response.data?.message || 'The requested resource was not found.';
            break;
          case 500:
            errorMessage = error.response.data?.message || 'Server error. Please try again later.';
            break;
        }
      }
    }

    console.log('Returning error with message:', errorMessage);
    
    return Promise.reject({
      message: errorMessage,
      originalError: error,
      status: error.response?.status
    });
  }
)

export default api