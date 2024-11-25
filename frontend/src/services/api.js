import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/api/users/token/refresh/', {
          refresh: refreshToken
        });

        if (response.data.access) {
          const newToken = response.data.access;
          localStorage.setItem('token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          originalError: error
        });
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message ||
                        error.message ||
                        'An unexpected error occurred';

    return Promise.reject({
      message: errorMessage,
      originalError: error
    });
  }
);

// Book management methods
api.deleteBook = async (bookId) => {
  try {
    const response = await api.delete(`/api/users/books/${bookId}/delete/`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete book');
    }
    throw new Error('Network error while deleting book');
  }
};

api.toggleBookStatus = async (bookId, field) => {
  try {
    const response = await api.put(`/api/users/books/status/${bookId}/`, {
      [field]: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;