export class APIError extends Error {
    constructor(message, status, code) {
      super(message);
      this.status = status;
      this.code = code;
    }
  }
  
  export const handleAPIError = (error) => {
    console.error('API Error:', error);
  
    // Network errors
    if (!error.response) {
      return {
        message: 'Unable to connect to the server',
        type: 'network',
      };
    }
  
    // API errors
    const status = error.response.status;
    const data = error.response.data;
  
    switch (status) {
      case 401:
        return {
          message: 'Please log in to continue',
          type: 'auth',
        };
      case 403:
        return {
          message: 'You don\'t have permission to perform this action',
          type: 'auth',
        };
      case 404:
        return {
          message: 'The requested resource was not found',
          type: 'notFound',
        };
      case 503:
        return {
          message: 'Service temporarily unavailable',
          type: 'service',
        };
      default:
        return {
          message: data.error || 'An unexpected error occurred',
          type: 'unknown',
        };
    }
  };