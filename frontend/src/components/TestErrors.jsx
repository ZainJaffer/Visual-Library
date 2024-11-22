import React, { useState } from 'react';
import { api } from '../services/api';
import { ErrorDisplay } from './ErrorDisplay';

const TestErrors = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testError = async (type) => {
        setLoading(true);
        try {
            console.log(`Testing ${type} error...`);
            await api.get(`/users/test-errors/?error=${type}`);
            console.log('Request completed without error');
            setError(null);
        } catch (err) {
            console.log('Error caught in TestErrors:', err);
            setError({
                message: err.message,
                onClose: () => {
                    console.log('Closing error modal');
                    setError(null);
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const testAuthError = () => {
        setError({
            message: 'Your session has expired. Please log in again.',
            onClose: () => {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        });
    };

    const testNetworkError = async () => {
        // Change API base URL temporarily to trigger network error
        const originalBaseURL = api.defaults.baseURL;
        api.defaults.baseURL = 'http://localhost:9999'; // Non-existent port
        
        try {
            await testError('network');
        } finally {
            // Restore original base URL
            api.defaults.baseURL = originalBaseURL;
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Test Error Handling</h2>
            
            <div className="space-x-4 mb-6">
                <button 
                    onClick={testNetworkError}
                    disabled={loading}
                    className={`px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Test Network Error
                </button>

                <button 
                    onClick={() => testError('bad_request')}
                    disabled={loading}
                    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Test 400 Error
                </button>
                
                <button 
                    onClick={() => testError('not_found')}
                    disabled={loading}
                    className={`px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Test 404 Error
                </button>
                
                <button 
                    onClick={() => testError('server_error')}
                    disabled={loading}
                    className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Test 500 Error
                </button>

                <button 
                    onClick={testAuthError}
                    disabled={loading}
                    className={`px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Test Auth Error
                </button>
            </div>

            {error && <ErrorDisplay error={error} />}

            <div className="mt-4 text-sm text-gray-600">
                <p>Click any button above to test error handling.</p>
                <p>The error modal should appear automatically.</p>
                {loading && <p className="text-blue-500">Loading...</p>}
            </div>
        </div>
    );
};

export default TestErrors;